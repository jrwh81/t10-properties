module Api
  module V1
    class PropertyPhotosController < BaseController
      before_action :set_property

      def create
        authorize @property, :update?
        @property.photos.attach(params[:photos])
        render json: { property: PropertySerializer.new(@property, detailed: true).as_json }, status: :created
      end

      def destroy
        authorize @property, :update?
        @property.photos.find(params[:id]).purge
        head :no_content
      end

      private

      def set_property
        @property = Property.friendly.find(params[:property_slug])
      end
    end
  end
end
