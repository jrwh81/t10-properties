Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false

  # Real, persistent photo storage via Cloudinary. Requires the
  # CLOUDINARY_URL env var (cloudinary://API_KEY:API_SECRET@CLOUD_NAME) to
  # be set -- see DEPLOYMENT.md. Falls back to :local (ephemeral, wiped on
  # every restart/redeploy) if that var is missing, so the app still boots
  # rather than crashing outright if someone forgets to set it.
  config.active_storage.service = ENV["CLOUDINARY_URL"].present? ? :cloudinary : :local

  config.log_level = :info
  config.log_tags = [:request_id]

  config.force_ssl = true

  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST", "example.com") }

  config.active_record.dump_schema_after_migration = false
end
