Rails.application.configure do
  config.cache_classes = true
  config.eager_load = ENV["CI"].present?
  config.consider_all_requests_local = true

  config.active_storage.service = :test

  config.action_mailer.perform_caching = false
  config.action_mailer.delivery_method = :test
  config.action_mailer.default_url_options = { host: "localhost", port: 3000 }

  config.active_support.deprecation = :stderr
  config.action_controller.raise_on_missing_callback_actions = true
end
