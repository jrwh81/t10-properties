module Api
  module V1
    class BlogPostsController < BaseController
      before_action :set_blog_post, only: [:show, :update, :destroy]

      def index
        scope = policy_scope(BlogPost).recent
        scope = scope.where(status: params[:status]) if params[:status].present? && current_user&.admin?

        render json: {
          blog_posts: paginate(scope).map { |p| BlogPostSerializer.new(p).as_json },
          meta: current_page_meta(scope)
        }
      end

      def show
        authorize @blog_post
        render json: { blog_post: BlogPostSerializer.new(@blog_post, detailed: true).as_json }
      end

      def create
        @blog_post = BlogPost.new(blog_post_params)
        @blog_post.author = current_user
        authorize @blog_post

        @blog_post.save!
        render json: { blog_post: BlogPostSerializer.new(@blog_post, detailed: true).as_json }, status: :created
      end

      def update
        authorize @blog_post

        @blog_post.update!(blog_post_params)
        render json: { blog_post: BlogPostSerializer.new(@blog_post, detailed: true).as_json }
      end

      def destroy
        authorize @blog_post
        @blog_post.destroy
        head :no_content
      end

      private

      def set_blog_post
        @blog_post = BlogPost.friendly.find(params[:slug])
      end

      def blog_post_params
        params.require(:blog_post).permit(:title, :excerpt, :body, :status, :published_at, :cover_image)
      end
    end
  end
end
