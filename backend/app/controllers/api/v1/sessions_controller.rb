module Api
  module V1
    # Devise::JWT's `dispatch_requests` middleware (configured in
    # config/initializers/devise.rb) attaches the `Authorization` header
    # automatically once `respond_with`/`sign_in` succeeds here -- we just
    # need to render the user instead of the default HTML redirect.
    class SessionsController < Devise::SessionsController
      respond_to :json

      private

      def respond_with(resource, _opts = {})
        render json: { user: UserSerializer.new(resource).as_json }, status: :ok
      end

      def respond_to_on_destroy
        if current_user
          render json: { message: "Logged out." }, status: :ok
        else
          render json: { error: "No active session." }, status: :unauthorized
        end
      end
    end
  end
end
