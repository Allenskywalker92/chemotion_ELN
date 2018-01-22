require 'barby'
require 'barby/barcode/qr_code'
require 'barby/outputter/svg_outputter'
require 'digest'

module Chemotion
  class AttachmentAPI < Grape::API

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
          # unlinked_attachments = Attachment.where(container_id: nil, created_for: current_user.id)
          InboxSerializer.new(current_user.container)
        end
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
            if (element = container.root.containable)
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
        @attachment.container_id = nil
        @attachment.save!
      end

      desc "Upload attachments"
      post 'upload_dataset_attachments' do
        params.each do |file_id, file|
          if tempfile = file.tempfile
              a = Attachment.new(
                bucket: file.container_id,
                filename: file.filename,
                key: file.name,
                file_path: file.tempfile,
                created_by: current_user.id,
                created_for: current_user.id,
                content_type: file.type
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

      desc "Download the attachment file"
      get ':attachment_id' do
        content_type "application/octet-stream"
        header['Content-Disposition'] = "attachment; filename=" + @attachment.filename
        env['api.format'] = :binary
        @attachment.read_file
      end

      desc "Download the zip attachment file"
      get 'zip/:container_id' do
        @container.attachments.each do |att|
          #TODO
        end
      end

      desc 'Return Base64 encoded thumbnail'
      get 'thumbnail/:attachment_id' do
        if @attachment.thumb
          Base64.encode64(@attachment.read_thumbnail)
        else
          nil
        end
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
