module Api
  module V1
    class MeController < BaseController
      def show
        require_authentication!
        return if performed?

        render json: { user: UserSerializer.new(current_user).as_json }
      end
    end
  end
end
