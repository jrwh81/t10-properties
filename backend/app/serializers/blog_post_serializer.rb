class BlogPostSerializer
  def initialize(blog_post, detailed: false)
    @blog_post = blog_post
    @detailed = detailed
  end

  def as_json(*)
    base = {
      id: blog_post.id,
      slug: blog_post.slug,
      title: blog_post.title,
      excerpt: blog_post.excerpt,
      status: blog_post.status,
      published_at: blog_post.published_at,
      author_name: blog_post.author&.display_name,
      cover_image_url: cover_image_url,
      comments_count: blog_post.comments.approved.count
    }

    return base unless detailed

    base.merge(
      body: blog_post.body,
      created_at: blog_post.created_at,
      updated_at: blog_post.updated_at
    )
  end

  private

  attr_reader :blog_post, :detailed

  def cover_image_url
    return nil unless blog_post.cover_image&.persisted?

    Rails.application.routes.url_helpers.rails_blob_path(blog_post.cover_image, only_path: true)
  end
end
