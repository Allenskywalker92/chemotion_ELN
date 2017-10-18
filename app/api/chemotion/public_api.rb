module Chemotion
  class PublicAPI < Grape::API

    namespace :public do
      get 'ping' do
        status 200
      end
    end

    namespace :upload do
      before do
        error!('Unauthorized' , 401) unless TokenAuthentication.new(request, with_remote_addr: true).is_successful?
      end
      resource :attachments do
        desc "Upload files"
        params do
          requires :recipient_email, type: String
          requires :subject, type: String
        end
        post do
          recipient_email = params[:recipient_email]
          subject = params[:subject]
          params.delete(:subject)
          params.delete(:recipient_email)

          token = request.headers['Auth-Token'] || request.params['auth_token']
          key = AuthenticationKey.find_by(token: token)


          helper = CollectorHelper.new(key.user.email , recipient_email)

          if helper.sender_recipient_known?
            dataset = helper.prepare_dataset(subject)
            params.each do |file_id, file|
              if tempfile = file.tempfile
                a = Attachment.new(
                  filename: file.filename,
                  file_path: file.tempfile,
                  created_by: helper.sender.id,
                  created_for: helper.recipient.id,
                  content_type: file.type
                )
                begin
                  a.save!
                  a.update!(container_id: dataset.id)
                  primary_store = Rails.configuration.storage.primary_store
                  a.update!(storage: primary_store)
                ensure
                  tempfile.close
                  tempfile.unlink
                end
              end
            end
          end
          true
        end

      end
    end
  end
end
