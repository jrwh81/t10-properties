require "rails_helper"

RSpec.describe "Api::V1::Sessions", type: :request do
  let!(:user) { create(:user, email: "login@example.com", password: "password123") }

  it "logs in with valid credentials and returns a JWT" do
    post "/api/v1/login", params: { user: { email: "login@example.com", password: "password123" } }

    expect(response).to have_http_status(:ok)
    expect(response.headers["Authorization"]).to be_present
    expect(JSON.parse(response.body)["user"]["email"]).to eq("login@example.com")
  end

  it "rejects invalid credentials" do
    post "/api/v1/login", params: { user: { email: "login@example.com", password: "wrong" } }

    expect(response).to have_http_status(:unauthorized)
  end
end
