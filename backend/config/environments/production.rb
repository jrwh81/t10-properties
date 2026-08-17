Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false

  # NOTE: :local means uploaded files live on the dyno's ephemeral
  # filesystem and are LOST on every restart/redeploy. That's fine for
  # getting the app running, but before photo uploads are actually relied
  # on, switch this to a real object-storage service (S3, Cloudinary,
  # etc.) -- see DEPLOYMENT.md. The previous :amazon (S3) setting broke
  # every single request in production: Rails validates the configured
  # Active Storage service the moment a model with has_many_attached/
  # has_one_attached loads (not just when something is actually
  # uploaded), and the aws-sdk-s3 gem was never added to the Gemfile.
  config.active_storage.service = :local

  config.log_level = :info
  config.log_tags = [:request_id]

  config.force_ssl = true

  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST", "example.com") }

  config.active_record.dump_schema_after_migration = false
end
