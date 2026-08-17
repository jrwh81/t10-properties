require "rails_helper"

RSpec.describe AdminInvitation, type: :model do
  it { is_expected.to belong_to(:invited_by).class_name("User") }
  it { is_expected.to validate_presence_of(:email) }

  it "generates a unique token on create" do
    invitation = create(:admin_invitation)
    expect(invitation.token).to be_present
  end

  it "sets a default 7-day expiration" do
    invitation = create(:admin_invitation)
    expect(invitation.expires_at).to be_within(1.minute).of(7.days.from_now)
  end

  it "rejects inviting an email that is already an admin" do
    existing_admin = create(:user, :admin, email: "already@example.com")
    invitation = build(:admin_invitation, email: existing_admin.email)

    expect(invitation).not_to be_valid
  end

  describe "#accept!" do
    it "marks the invitation accepted" do
      invitation = create(:admin_invitation)
      expect { invitation.accept! }.to change(invitation, :accepted?).from(false).to(true)
    end

    it "returns false if already accepted" do
      invitation = create(:admin_invitation, accepted_at: Time.current)
      expect(invitation.accept!).to be false
    end
  end

  describe "#expired?" do
    it "is true once expires_at has passed" do
      invitation = create(:admin_invitation, expires_at: 1.hour.ago)
      expect(invitation).to be_expired
    end
  end
end
