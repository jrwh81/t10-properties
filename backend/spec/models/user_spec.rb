require "rails_helper"

RSpec.describe User, type: :model do
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_presence_of(:email) }
  it { is_expected.to have_many(:blog_posts).with_foreign_key(:author_id) }
  it { is_expected.to have_many(:comments) }

  it "defaults role to member" do
    user = create(:user)
    expect(user.role).to eq("member")
    expect(user.admin?).to be false
  end

  it "is admin when role is admin" do
    user = create(:user, :admin)
    expect(user.admin?).to be true
  end

  it "requires a unique, case-insensitive email" do
    create(:user, email: "same@example.com")
    dup = build(:user, email: "SAME@example.com")

    expect(dup).not_to be_valid
    expect(dup.errors[:email]).to be_present
  end

  describe "#display_name" do
    it "returns the name when present" do
      user = build(:user, name: "Jamie Rivers")
      expect(user.display_name).to eq("Jamie Rivers")
    end

    it "falls back to the email local part when name is blank" do
      user = build(:user, name: nil, email: "jamie@example.com")
      expect(user.display_name).to eq("jamie")
    end
  end
end
