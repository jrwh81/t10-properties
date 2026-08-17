# Small helper for request specs to authenticate as a given user by
# minting a real Devise::JWT token and attaching it as the Authorization
# header, the same way the React frontend does.
module RequestAuthHelpers
  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include RequestAuthHelpers, type: :request
end
