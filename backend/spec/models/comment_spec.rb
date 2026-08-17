require "rails_helper"

RSpec.describe Comment, type: :model do
  it { is_expected.to validate_presence_of(:body) }
  it { is_expected.to belong_to(:commentable) }
  it { is_expected.to belong_to(:user).optional }

  it "is valid with a signed-in user and no guest info" do
    comment = build(:comment, :from_user)
    expect(comment).to be_valid
  end

  it "is valid as a guest with name and email" do
    comment = build(:comment, :guest)
    expect(comment).to be_valid
  end

  it "is invalid with neither a user nor guest name/email" do
    comment = build(:comment, user: nil, guest_name: nil, guest_email: nil)
    expect(comment).not_to be_valid
    expect(comment.errors[:base]).to include(a_string_matching(/must have either/))
  end

  it "is invalid with a malformed guest email" do
    comment = build(:comment, :guest, guest_email: "not-an-email")
    expect(comment).not_to be_valid
    expect(comment.errors[:guest_email]).to be_present
  end

  describe "#author_name" do
    it "prefers the user's display name over guest_name" do
      user = create(:user, name: "Real User")
      comment = build(:comment, :from_user, user: user, guest_name: "Ignored")
      expect(comment.author_name).to eq("Real User")
    end

    it "falls back to guest_name for guest comments" do
      comment = build(:comment, :guest, guest_name: "Visitor Vee")
      expect(comment.author_name).to eq("Visitor Vee")
    end
  end

  describe "threaded replies" do
    it "supports a parent/replies relationship" do
      parent = create(:comment, :guest)
      reply = create(:comment, :guest, parent: parent, commentable: parent.commentable)

      expect(parent.replies).to include(reply)
      expect(reply.parent).to eq(parent)
    end
  end

  describe ".approved" do
    it "only returns approved comments" do
      approved = create(:comment, :guest, approved: true)
      create(:comment, :guest, approved: false)

      expect(Comment.approved).to contain_exactly(approved)
    end
  end
end
