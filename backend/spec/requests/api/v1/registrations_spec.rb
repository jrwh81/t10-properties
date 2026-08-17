require "rails_helper"

RSpec.describe "Api::V1::Registrations", type: :request do
  it "creates a member-role account by default" do
    expect {
      post "/api/v1/signup", params: {
        user: { name: "New Person", email: "new@example.com", password: "password123", password_confirmation: "password123" }
      }
    }.to change(User, :count).by(1)

    expect(response).to have_http_status(:created)
    expect(User.last.role).to eq("member")
  end

  it "returns errors for a mismatched password confirmation" do
    post "/api/v1/signup", params: {
      user: { name: "New Person", email: "new@example.com", password: "password123", password_confirmation: "nope" }
    }

    expect(response).to have_http_status(:unprocessable_entity)
  end
end
