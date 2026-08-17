class ApplicationController < ActionController::API
  # ActionController::API doesn't include helper_method support by default,
  # but Devise::Controllers::Helpers calls helper_method as soon as it's
  # included -- without this, EVERY controller raises a NoMethodError the
  # moment it's first loaded.
  include ActionController::Helpers
  include Pundit::Authorization
  include Devise::Controllers::Helpers

  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable

  private

  def render_forbidden
    render json: { error: "You are not authorized to perform this action." }, status: :forbidden
  end

  def render_not_found
    render json: { error: "Resource not found." }, status: :not_found
  end

  def render_unprocessable(exception)
    render json: { errors: Array(exception.record&.errors&.full_messages) }, status: :unprocessable_entity
  end
end
