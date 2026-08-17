require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)

module T10Properties
  class Application < Rails::Application
    config.load_defaults 7.1

    # API-only application, consumed by the separate React/MUI frontend.
    config.api_only = true

    config.autoload_paths += %W[#{config.root}/app/serializers #{config.root}/app/policies]

    config.active_job.queue_adapter = :async

    # config.api_only strips session/cookie middleware from the stack
    # entirely, but Devise's sign_in/sign_up flow unconditionally calls
    # warden.set_user, which tries to write to the session regardless of
    # whether JWT is also in play. Without a session store present, that
    # raises ActionDispatch::Request::Session::DisabledSessionError on every
    # login/signup. This app never reads anything back from the session --
    # auth state is carried entirely by the JWT -- but Devise still needs
    # somewhere to write to, so we put a minimal cookie-backed session store
    # back in the middleware stack.
    config.session_store :cookie_store, key: "_t10_properties_session"
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use config.session_store, config.session_options

    config.generators do |g|
      g.test_framework :rspec,
        fixtures: true,
        view_specs: false,
        helper_specs: false,
        routing_specs: false
      g.factory_bot dir: "spec/factories"
    end
  end
end
