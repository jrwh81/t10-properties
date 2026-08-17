Devise.setup do |config|
  config.mailer_sender = "no-reply@t10properties.example"
  require "devise/orm/active_record"

  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = true
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 8..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete

  config.navigational_formats = []

  # NOTE: we deliberately do NOT manually configure `config.warden do |manager|
  # manager.default_strategies(scope: :user).unshift :jwt_authenticatable end`
  # here. Devise automatically wires up the correct Warden strategy for any
  # model that declares `devise :jwt_authenticatable, ...` (see app/models/user.rb).
  # Manually unshifting a strategy name is unnecessary and, if the name
  # doesn't match what devise-jwt actually registers, raises
  # `RuntimeError: Invalid strategy jwt_authenticatable` on every single
  # request that touches `current_user` -- which is effectively every request,
  # since Pundit's `policy_scope`/`authorize` call `current_user` internally.

  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key || ENV.fetch("DEVISE_JWT_SECRET_KEY", "development_only_insecure_secret_change_me")
    jwt.dispatch_requests = [
      ["POST", %r{^/api/v1/login$}],
      ["POST", %r{^/api/v1/signup$}],
      ["POST", %r{^/api/v1/admin_invitations/[^/]+/accept$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/api/v1/logout$}]
    ]
    jwt.expiration_time = 24.hours.to_i
  end
end
