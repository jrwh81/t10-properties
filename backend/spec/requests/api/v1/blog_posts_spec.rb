require "rails_helper"

RSpec.describe "Api::V1::BlogPosts", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:member) { create(:user) }

  describe "GET /api/v1/blog_posts" do
    it "only returns published posts to anonymous visitors" do
      published = create(:blog_post, status: "published")
      create(:blog_post, :draft)

      get "/api/v1/blog_posts"

      slugs = JSON.parse(response.body)["blog_posts"].map { |p| p["slug"] }
      expect(slugs).to eq([published.slug])
    end

    it "returns drafts too when requested by an admin" do
      create(:blog_post, status: "published")
      create(:blog_post, :draft)

      get "/api/v1/blog_posts", headers: auth_headers(admin)

      expect(JSON.parse(response.body)["blog_posts"].size).to eq(2)
    end
  end

  describe "GET /api/v1/blog_posts/:slug" do
    it "404s a draft post for an anonymous visitor" do
      draft = create(:blog_post, :draft)

      get "/api/v1/blog_posts/#{draft.slug}"

      expect(response).to have_http_status(:forbidden).or have_http_status(:not_found)
    end

    it "shows a published post's full body" do
      post_record = create(:blog_post, status: "published", body: "Full story here.")

      get "/api/v1/blog_posts/#{post_record.slug}"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["blog_post"]["body"]).to eq("Full story here.")
    end
  end

  describe "POST /api/v1/blog_posts" do
    it "sets the author to the current admin user" do
      post "/api/v1/blog_posts",
        params: { blog_post: { title: "New Post", body: "Body text", status: "published" } },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:created)
      expect(BlogPost.last.author).to eq(admin)
    end

    it "is forbidden for a regular member" do
      post "/api/v1/blog_posts",
        params: { blog_post: { title: "New Post", body: "Body text" } },
        headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end
end
