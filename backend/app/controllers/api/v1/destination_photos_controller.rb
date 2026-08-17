module Api
  module V1
    class DestinationPhotosController < BaseController
      before_action :set_destination

      def create
        authorize @destination, :update?
        @destination.photos.attach(params[:photos])
        render json: { destination: DestinationSerializer.new(@destination, detailed: true).as_json }, status: :created
      end

      def destroy
        authorize @destination, :update?
        @destination.photos.find(params[:id]).purge
        head :no_content
      end

      private

      def set_destination
        @destination = Destination.friendly.find(params[:destination_slug])
      end
    end
  end
end
