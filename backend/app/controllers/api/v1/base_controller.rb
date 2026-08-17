module Api
  module V1
    # Shared behaviour for every API::V1 controller: JSON error handling
    # plus small authorization/pagination helpers.
    #
    # `current_user` is populated automatically on every request by the
    # `jwt_authenticatable` Warden strategy configured in
    # config/initializers/devise.rb whenever a valid `Authorization:
    # Bearer <token>` header is present -- no explicit before_action is
    # needed to "log the user in". Controllers call `require_authentication!`
    # or `require_admin!` only on the actions that need to enforce it.
    class BaseController < ApplicationController
      private

      def require_authentication!
        render json: { error: "You must be signed in." }, status: :unauthorized unless current_user
      end

      def require_admin!
        require_authentication!
        return if performed?

        render json: { error: "Admins only." }, status: :forbidden unless current_user&.admin?
      end

      def paginate(scope)
        page = [params.fetch(:page, 1).to_i, 1].max
        per_page = params.fetch(:per_page, 12).to_i.clamp(1, 100)
        scope.limit(per_page).offset((page - 1) * per_page)
      end

      def current_page_meta(scope, page: params.fetch(:page, 1).to_i, per_page: params.fetch(:per_page, 12).to_i.clamp(1, 100))
        {
          page: [page, 1].max,
          per_page: per_page,
          total_count: scope.count,
          total_pages: (scope.count / per_page.to_f).ceil
        }
      end
    end
  end
end
