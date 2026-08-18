module Api
  module V1
    class DestinationsController < BaseController
      before_action :set_destination, only: [:show, :update, :destroy]

      def index
        scope = policy_scope(Destination).top_rated
        scope = scope.where(category: params[:category]) if params[:category].present?
        scope = scope.where("t10_rating >= ?", params[:min_rating]) if params[:min_rating].present?
        scope = scope.featured if params[:featured] == "true"

        render json: {
          destinations: paginate(scope).map { |d| DestinationSerializer.new(d).as_json },
          meta: current_page_meta(scope)
        }
      end

      def show
        authorize @destination
        render json: { destination: DestinationSerializer.new(@destination, detailed: true).as_json }
      end

      def create
        @destination = Destination.new(destination_params)
        authorize @destination

        @destination.save!
        render json: { destination: DestinationSerializer.new(@destination, detailed: true).as_json }, status: :created
      end

      def update
        authorize @destination

        @destination.update!(destination_params)
        render json: { destination: DestinationSerializer.new(@destination, detailed: true).as_json }
      end

      def destroy
        authorize @destination
        @destination.destroy
        head :no_content
      end

      private

      def set_destination
        @destination = Destination.friendly.find(params[:slug])
      end

      def destination_params
        params.require(:destination).permit(
          :name, :description, :address, :city, :state, :category,
          :t10_rating, :featured
        )
      end
    end
  end
end
