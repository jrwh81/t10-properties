module Api
  module V1
    class PropertiesController < BaseController
      before_action :set_property, only: [:show, :update, :destroy]

      def index
        scope = policy_scope(Property).recent
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope = scope.where(property_type: params[:property_type]) if params[:property_type].present?
        scope = scope.featured if params[:featured] == "true"

        render json: {
          properties: paginate(scope).map { |p| PropertySerializer.new(p).as_json },
          meta: current_page_meta(scope)
        }
      end

      def show
        authorize @property
        render json: { property: PropertySerializer.new(@property, detailed: true).as_json }
      end

      def create
        @property = Property.new(property_params)
        authorize @property

        @property.save!
        render json: { property: PropertySerializer.new(@property, detailed: true).as_json }, status: :created
      end

      def update
        authorize @property

        @property.update!(property_params)
        render json: { property: PropertySerializer.new(@property, detailed: true).as_json }
      end

      def destroy
        authorize @property
        @property.destroy
        head :no_content
      end

      private

      def set_property
        @property = Property.friendly.find(params[:slug])
      end

      def property_params
        params.require(:property).permit(
          :title, :description, :address, :city, :state, :zip_code, :price,
          :bedrooms, :bathrooms, :square_feet, :property_type, :status,
          :featured, :listed_at
        )
      end
    end
  end
end
