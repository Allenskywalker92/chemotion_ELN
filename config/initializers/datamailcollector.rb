datamailcollector_config = Rails.application.config_for :datamailcollector

Rails.application.configure do
  config.datamailcollector = ActiveSupport::OrderedOptions.new
  config.datamailcollector.server = datamailcollector_config[:server]
  config.datamailcollector.port = datamailcollector_config[:port]
  config.datamailcollector.ssl = datamailcollector_config[:ssl]
  config.datamailcollector.mail_address = datamailcollector_config[:mail_address]
  config.datamailcollector.password = datamailcollector_config[:password]
  config.datamailcollector.sender_mailbox = datamailcollector_config[:sender_mailbox]
  config.datamailcollector.sender_host = datamailcollector_config[:sender_host]
end
