# Thin wrapper around JWT encode/decode used by Devise::JWT and any
# application code that needs to issue tokens outside the Warden hook
# (e.g. the admin-invitation acceptance flow).
class JsonWebToken
  ALGORITHM = "HS256".freeze

  def self.secret
    Rails.application.credentials.devise_jwt_secret_key || ENV.fetch("DEVISE_JWT_SECRET_KEY")
  end

  def self.encode(payload, exp: 24.hours.from_now)
    payload = payload.dup
    payload[:exp] = exp.to_i
    JWT.encode(payload, secret, ALGORITHM)
  end

  def self.decode(token)
    body = JWT.decode(token, secret, true, algorithm: ALGORITHM)[0]
    HashWithIndifferentAccess.new(body)
  rescue JWT::DecodeError
    nil
  end
end
