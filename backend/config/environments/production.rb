Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false

  config.active_storage.service = :amazon

  config.log_level = :info
  config.log_tags = [:request_id]

  config.force_ssl = true

  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST", "example.com") }

  config.active_record.dump_schema_after_migration = false
end
