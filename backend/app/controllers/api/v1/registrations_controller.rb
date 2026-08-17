module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      private

      def sign_up_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation)
      end

      def respond_with(resource, _opts = {})
        if resource.persisted?
          render json: { user: UserSerializer.new(resource).as_json }, status: :created
        else
          render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end
