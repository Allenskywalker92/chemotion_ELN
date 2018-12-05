require 'barby'
require 'barby/barcode/qr_code'
require 'barby/outputter/svg_outputter'
require 'digest'

module Chemotion
  class AttachmentAPI < Grape::API
    helpers do
      def thumbnail(att)
        att.thumb ? Base64.encode64(att.read_thumbnail) : nil
      end

      def thumbnail_obj(att)
        { id: att.id, thumbnail: thumbnail(att) }
      end

      def raw_file(att)
        begin
          Base64.encode64(att.read_file)
        rescue
          nil
        end
      end

      def raw_file_obj(att)
        { id: att.id, file: raw_file(att) }
      end
    end

    rescue_from ActiveRecord::RecordNotFound do |error|
      message = "Could not find attachment"
      error!(message, 404)
    end

    resource :inbox do
      get do
        if current_user
          if !current_user.container
            current_user.container = Container.create(name: "inbox", container_type: "root")
          end
          # unlinked_attachments = Attachment.where(attachable_id: nil, attachable_type: 'Container', created_for: current_user.id)
          InboxSerializer.new(current_user.container)
        end
      end
    end

    resource :attachable do
      before do
        case params[:attachable_type]
        when 'ResearchPlan'
          error!('401 Unauthorized', 401) unless ElementPolicy.new(current_user, ResearchPlan.find_by(id: params[:attachable_id])).update?
        end
      end

      desc "Update attachable records"
      post "update_attachments_attachable" do
        attachable_type = params[:attachable_type]
        attachable_id = params[:attachable_id]
        if params[:files] && params[:files].length > 0
          attach_ary = Array.new
          params[:files].each do |file|
            if tempfile = file[:tempfile]
                a = Attachment.new(
                  bucket: file[:container_id],
                  filename: file[:filename],
                  file_path: file[:tempfile],
                  created_by: current_user.id,
                  created_for: current_user.id,
                  content_type: file[:type],
                  attachable_type: attachable_type,
                  attachable_id: attachable_id
                )
                begin
                  a.save!
                  attach_ary.push(a.id)
                ensure
                  tempfile.close
                  tempfile.unlink
                end
            end
          end
          if attach_ary.length > 0
            TransferFileFromTmpJob.set(queue: "transfer_file_from_tmp_#{current_user.id}")
                         .perform_later(attach_ary)
          end
        end
        if params[:del_files] && params[:del_files].length > 0
          Attachment.where('id IN (?) AND attachable_type = (?)', params[:del_files].map!(&:to_i), attachable_type).update_all(attachable_id: nil)
        end
        true
      end
    end

    resource :attachments do
      before do
        @attachment = Attachment.find_by(id: params[:attachment_id])
        case request.env['REQUEST_METHOD']
        when /delete/i
          error!('401 Unauthorized', 401) unless @attachment
          can_delete = @attachment.container_id.nil? && @attachment.created_for == current_user.id
          if !can_delete && (element = @attachment.container&.root&.containable)
            can_delete = element.is_a?(User) && (element == current_user) ||
                         ElementPolicy.new(current_user, element).update?
          end
          error!('401 Unauthorized', 401) unless can_delete
        # when /post/i
        when /get/i
          can_dwnld = false
          if request.url =~ /zip/
            @container = Container.find(params[:container_id])
            if (element = @container.root.containable)
              can_read = ElementPolicy.new(current_user, element).read?
              can_dwnld = can_read &&
                          ElementPermissionProxy.new(current_user, element, user_ids).read_dataset?
            end
          elsif @attachment
            can_dwnld = @attachment.container_id.nil? && @attachment.created_for == current_user.id
            if !can_dwnld && (element = @attachment.container&.root&.containable)
              can_dwnld = element.is_a?(User) && (element == current_user) ||
                          ElementPolicy.new(current_user, element).read? &&
                          ElementPermissionProxy.new(current_user, element, user_ids).read_dataset?
            end
          end
          error!('401 Unauthorized', 401) unless can_dwnld
        end
      end

      desc "Delete Attachment"
      delete ':attachment_id' do
        @attachment.delete
      end

      desc "Delete container id of attachment"
      delete 'link/:attachment_id' do
        @attachment.attachable_id = nil
        @attachment.attachable_type = 'Container'
        @attachment.save!
      end

      desc "Upload attachments"
      post 'upload_dataset_attachments' do
        params.each do |file_id, file|
          if tempfile = file[:tempfile]
              a = Attachment.new(
                bucket: file[:container_id],
                filename: file[:filename],
                key: file[:name],
                file_path: file[:tempfile],
                created_by: current_user.id,
                created_for: current_user.id,
                content_type: file[:type]
              )
            begin
              a.save!
            ensure
              tempfile.close
              tempfile.unlink
            end
          end
        end
        true
      end

      desc "Upload files to Inbox as unsorted"
      post 'upload_to_inbox' do
        attach_ary = Array.new
        params.each do |file_id, file|
          if tempfile = file[:tempfile]
              attach = Attachment.new(
                bucket: file[:container_id],
                filename: file[:filename],
                key: file[:name],
                file_path: file[:tempfile],
                created_by: current_user.id,
                created_for: current_user.id,
                content_type: file[:type],
                attachable_type: 'Container'
              )
            begin
              attach.save!
              attach_ary.push(attach.id)
            ensure
              tempfile.close
              tempfile.unlink
            end
          end
        end
        TransferFileFromTmpJob.set(queue: "transfer_file_from_tmp_#{current_user.id}")
                       .perform_later(attach_ary)

        true
      end

      desc "Download the attachment file"
      get ':attachment_id' do
        content_type "application/octet-stream"
        header['Content-Disposition'] = "attachment; filename=" + @attachment.filename
        env['api.format'] = :binary
        @attachment.read_file
      end

      desc "Download the zip attachment file"
      get 'zip/:container_id' do
        env['api.format'] = :binary
        content_type('application/zip, application/octet-stream')
        filename = URI.escape("#{@container.parent&.name.gsub(/\s+/, '_')}-#{@container.name.gsub(/\s+/, '_')}.zip")
        header('Content-Disposition', "attachment; filename=\"#{filename}\"")
        zip = Zip::OutputStream.write_buffer do |zip|
          @container.attachments.each do |att|
            zip.put_next_entry att.filename
            zip.write att.read_file
          end
          zip.put_next_entry "dataset_description.txt"
          zip.write <<~DESC
          instrument: #{@container.extended_metadata.fetch('instrument', nil)}

          #{@container.description}
          DESC
        end
        zip.rewind
        zip.read
      end

      desc 'Return Base64 encoded thumbnail'
      get 'thumbnail/:attachment_id' do
        if @attachment.thumb
          Base64.encode64(@attachment.read_thumbnail)
        else
          nil
        end
      end

      desc 'Return Base64 encoded thumbnails'
      params do
        requires :ids, type: Array[Integer]
      end
      post 'thumbnails' do
        thumbnails = params[:ids].map do |a_id|
          att = Attachment.find(a_id)
          can_dwnld = if att
            element = att.container.root.containable
            can_read = ElementPolicy.new(current_user, element).read?
            can_read && ElementPermissionProxy.new(current_user, element, user_ids).read_dataset?
          end
          can_dwnld ? thumbnail_obj(att) : nil
        end
        { thumbnails: thumbnails }
      end

      desc 'Return Base64 encoded files'
      params do
        requires :ids, type: Array[Integer]
      end
      post 'files' do
        files = params[:ids].map do |a_id|
          att = Attachment.find(a_id)
          can_dwnld = if att
            element = att.container.root.containable
            can_read = ElementPolicy.new(current_user, element).read?
            can_read && ElementPermissionProxy.new(current_user, element, user_ids).read_dataset?
          end
          can_dwnld ? raw_file_obj(att) : nil
        end
        { files: files }
      end

      desc 'Save spectra-peaks to file'
      params do
        requires :peaks, type: Array[Hash]
        requires :attachment_id, type: Integer
      end
      post 'save_peaks' do
        @attachment.edit_peaks_spectrum(params[:peaks])
      end

      namespace :svgs do
        desc "Get QR Code SVG for element"
        params do
          requires :element_id, type: Integer
          requires :element_type, type: String
        end
        get do
          code = CodeLog.where(source: params[:element_type],
            source_id: params[:element_id]).first
          if code
            qr_code = Barby::QrCode.new(code.value, size: 1, level: :l)
            outputter = Barby::SvgOutputter.new(qr_code)
            outputter.to_svg(margin: 0)
          else
            ""
          end
        end
      end
    end

  end
end
