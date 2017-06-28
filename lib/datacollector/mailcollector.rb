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

          sender_email = envelope.from[0].mailbox.to_s + "@" + envelope.from[0].host.to_s
          recipient_email = envelope.to[0].mailbox + "@" + envelope.to[0].host

          sender = Device.find_by email: sender_email
          recipient = User.find_by email: recipient_email
          if sender && recipient
            device_box = prepare_inbox_containers(recipient, sender)
            raw_message = imap.fetch(message_id, 'RFC822').first.attr['RFC822']
            message = Mail.read_from_string raw_message

            handle_new_mail(sender, recipient, message, device_box)
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
  def prepare_inbox_containers(user, device)
    if !user.container
      user.container = Container.create(name: "inbox", container_type: "root")
    end
    device_box_id = "device_box_" + device.id.to_s
    device_container = Container.where(container_type: device_box_id, parent_id: user.container.id).first
    if !device_container
      device_container = Container.create(name: device.first_name, container_type: device_box_id, parent: user.container)
    end
    device_container
  end

  def handle_new_mail(sender, recipient, message, device_box)
    begin
      if message.multipart?
        dataset = Container.create(name: message.subject, container_type: "dataset", parent: device_box)
        message.attachments.each do |attachment|
          a = Attachment.new(
            filename: attachment.filename,
            file_data: attachment.decoded,
            created_by: sender.id,
            created_for: recipient.id,
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
