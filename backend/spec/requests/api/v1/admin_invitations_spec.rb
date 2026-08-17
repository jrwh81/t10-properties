require "rails_helper"

RSpec.describe "Api::V1::AdminInvitations", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:member) { create(:user) }

  describe "POST /api/v1/admin_invitations" do
    it "allows an admin to invite a new admin by email" do
      expect {
        post "/api/v1/admin_invitations", params: { email: "future-admin@example.com" }, headers: auth_headers(admin)
      }.to change(AdminInvitation, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "is forbidden for a non-admin member" do
      post "/api/v1/admin_invitations", params: { email: "nope@example.com" }, headers: auth_headers(member)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/admin_invitations/:token/accept" do
    it "creates a new admin account from a valid, pending invitation" do
      invitation = create(:admin_invitation, email: "future-admin@example.com")

      post "/api/v1/admin_invitations/#{invitation.token}/accept", params: {
        name: "Future Admin", password: "password123", password_confirmation: "password123"
      }

      expect(response).to have_http_status(:created)
      expect(response.headers["Authorization"]).to be_present
      new_user = User.find_by(email: "future-admin@example.com")
      expect(new_user).to be_admin
      expect(invitation.reload).to be_accepted
    end

    it "rejects an already-accepted invitation" do
      invitation = create(:admin_invitation, accepted_at: Time.current)

      post "/api/v1/admin_invitations/#{invitation.token}/accept", params: {
        name: "Future Admin", password: "password123", password_confirmation: "password123"
      }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "rejects an expired invitation" do
      invitation = create(:admin_invitation, expires_at: 1.hour.ago)

      post "/api/v1/admin_invitations/#{invitation.token}/accept", params: {
        name: "Future Admin", password: "password123", password_confirmation: "password123"
      }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
