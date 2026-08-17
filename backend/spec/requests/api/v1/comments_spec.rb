require "rails_helper"

RSpec.describe "Api::V1::Comments", type: :request do
  let(:blog_post) { create(:blog_post, status: "published") }
  let(:member) { create(:user) }
  let(:admin) { create(:user, :admin) }

  describe "GET /api/v1/blog_posts/:blog_post_slug/comments" do
    it "returns approved top-level comments with nested replies" do
      parent = create(:comment, :guest, commentable: blog_post, approved: true)
      create(:comment, :guest, commentable: blog_post, parent: parent, approved: true)
      create(:comment, :guest, commentable: blog_post, approved: false)

      get "/api/v1/blog_posts/#{blog_post.slug}/comments"

      body = JSON.parse(response.body)["comments"]
      expect(body.size).to eq(1)
      expect(body.first["replies"].size).to eq(1)
    end
  end

  describe "POST /api/v1/blog_posts/:blog_post_slug/comments" do
    it "allows a guest to comment with name and email" do
      expect {
        post "/api/v1/blog_posts/#{blog_post.slug}/comments",
          params: { comment: { body: "Great write-up!", guest_name: "Val", guest_email: "val@example.com" } }
      }.to change(blog_post.comments, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["comment"]["is_guest"]).to be true
    end

    it "rejects a guest comment missing an email" do
      post "/api/v1/blog_posts/#{blog_post.slug}/comments",
        params: { comment: { body: "Great write-up!", guest_name: "Val" } }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "attaches the signed-in user instead of requiring guest fields" do
      post "/api/v1/blog_posts/#{blog_post.slug}/comments",
        params: { comment: { body: "Nice piece." } },
        headers: auth_headers(member)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["comment"]["author_name"]).to eq(member.display_name)
    end

    it "ignores an attempt to self-approve on creation" do
      post "/api/v1/blog_posts/#{blog_post.slug}/comments",
        params: { comment: { body: "Sneaky", guest_name: "Val", guest_email: "val@example.com", approved: false } }

      expect(Comment.last.approved).to be true
    end
  end

  describe "DELETE /api/v1/comments/:id" do
    it "lets the comment's own author delete it" do
      comment = create(:comment, :from_user, user: member, commentable: blog_post)

      delete "/api/v1/comments/#{comment.id}", headers: auth_headers(member)

      expect(response).to have_http_status(:no_content)
    end

    it "forbids another member from deleting someone else's comment" do
      comment = create(:comment, :from_user, user: member, commentable: blog_post)
      other = create(:user)

      delete "/api/v1/comments/#{comment.id}", headers: auth_headers(other)

      expect(response).to have_http_status(:forbidden)
    end

    it "lets an admin delete any comment" do
      comment = create(:comment, :guest, commentable: blog_post)

      delete "/api/v1/comments/#{comment.id}", headers: auth_headers(admin)

      expect(response).to have_http_status(:no_content)
    end
  end
end
