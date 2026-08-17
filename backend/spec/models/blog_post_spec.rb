require "rails_helper"

RSpec.describe BlogPost, type: :model do
  it { is_expected.to validate_presence_of(:title) }
  it { is_expected.to validate_presence_of(:body) }
  it { is_expected.to belong_to(:author).class_name("User") }
  it { is_expected.to have_many(:comments) }

  it "generates a slug from the title" do
    post = create(:blog_post, title: "Five Hidden Gems Along the Riverfront Trail")
    expect(post.slug).to start_with("five-hidden-gems-along-the-riverfront-trail")
  end

  it "sets published_at automatically when status is published and it's blank" do
    post = create(:blog_post, status: "published", published_at: nil)
    expect(post.published_at).to be_present
  end

  it "does not set published_at for drafts" do
    post = create(:blog_post, :draft)
    expect(post.published_at).to be_nil
  end

  describe ".published" do
    it "only includes published posts whose published_at has passed" do
      published = create(:blog_post, status: "published")
      draft = create(:blog_post, :draft)
      future = create(:blog_post, status: "published", published_at: 1.day.from_now)

      expect(BlogPost.published).to include(published)
      expect(BlogPost.published).not_to include(draft, future)
    end
  end

  describe "#published?" do
    it "is true only for published posts" do
      expect(build(:blog_post, status: "published")).to be_published
      expect(build(:blog_post, status: "draft")).not_to be_published
    end
  end
end
