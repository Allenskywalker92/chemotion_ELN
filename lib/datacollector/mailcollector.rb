require 'net/imap'
require 'mail'

class Mailcollector < Collector

  def initialize
    @server = Rails.configuration.datamailcollector.server
    @port = Rails.configuration.datamailcollector.port
    @ssl = Rails.configuration.datamailcollector.ssl
    @mail_address = Rails.configuration.datamailcollector.mail_address
    @password = Rails.configuration.datamailcollector.password
  end

  def execute

    begin
      imap = Net::IMAP.new(@server, @port, @ssl)
      response = imap.login(@mail_address, @password)
      if response['name'] == "OK"
        imap.select('INBOX')

        imap.search(['NOT', 'SEEN']).each do |message_id|
          envelope = imap.fetch(message_id, "ENVELOPE")[0].attr["ENVELOPE"]

          device_to_recipient(envelope.from[0].mailbox.to_s + "@" + envelope.from[0].host.to_s,
            envelope.to[0].mailbox + "@" + envelope.to[0].host)

          if @device_recipient_known
            raw_message = imap.fetch(message_id, 'RFC822').first.attr['RFC822']
            message = Mail.read_from_string raw_message

            handle_new_mail(message)
          end
          imap.store(message_id, "+FLAGS", [:Deleted])
        end
        imap.close
      else
        puts "ERROR: Cannot login " + @server
        raise
      end
    rescue Exception => e
      puts "ERROR: Cannot handle new data mails " + e.message
      raise e.message
    ensure
      imap.logout
      imap.disconnect
    end

  end

private

  def handle_new_mail(message)
    begin
      if message.multipart?
        dataset = Container.create(name: message.subject, container_type: "dataset", parent: @device_container)
        message.attachments.each do |attachment|
          a = Attachment.new(
            filename: attachment.filename,
            file_data: attachment.decoded,
            created_by: @device.id,
            created_for: @recipient.id,
            content_type: attachment.mime_type
          )
          a.save!
          a.update!(container_id: dataset.id)
          primary_store = Rails.configuration.storage.primary_store
          a.update!(storage: primary_store)
        end
      end
    rescue Exception => e
      puts "ERROR: Cannot handle mail " + e.message
      raise e.message
    end
  end

end
