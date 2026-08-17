module Api
  module V1
    class CommentsController < BaseController
      before_action :set_blog_post, only: [:index, :create]
      before_action :set_comment, only: [:update, :destroy]

      # GET /api/v1/blog_posts/:blog_post_slug/comments
      def index
        scope = @blog_post.comments.approved.top_level.oldest_first.includes(:replies, :user)
        render json: { comments: scope.map { |c| CommentSerializer.new(c, with_replies: true).as_json } }
      end

      # POST /api/v1/blog_posts/:blog_post_slug/comments
      def create
        @comment = @blog_post.comments.new(comment_create_params)
        @comment.user = current_user if current_user
        authorize @comment

        @comment.save!
        render json: { comment: CommentSerializer.new(@comment).as_json }, status: :created
      end

      # PATCH /api/v1/comments/:id
      def update
        authorize @comment

        @comment.update!(comment_update_params)
        render json: { comment: CommentSerializer.new(@comment).as_json }
      end

      # DELETE /api/v1/comments/:id
      def destroy
        authorize @comment
        @comment.destroy
        head :no_content
      end

      private

      def set_blog_post
        @blog_post = BlogPost.friendly.find(params[:blog_post_slug])
      end

      def set_comment
        @comment = Comment.find(params[:id])
      end

      # Guests/members cannot set moderation state on creation -- new
      # comments always fall back to the model's default (`approved: true`,
      # i.e. no moderation queue out of the box).
      def comment_create_params
        params.require(:comment).permit(:body, :guest_name, :guest_email, :parent_id)
      end

      # Only admins can reach here (see CommentPolicy#update?), so it's
      # safe to allow flipping `approved` for moderation here.
      def comment_update_params
        params.require(:comment).permit(:body, :approved)
      end
    end
  end
end
