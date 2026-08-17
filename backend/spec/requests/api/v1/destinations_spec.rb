require "rails_helper"

RSpec.describe "Api::V1::Destinations", type: :request do
  let(:admin) { create(:user, :admin) }

  describe "GET /api/v1/destinations" do
    it "lists destinations ordered by T10 rating descending" do
      low = create(:destination, t10_rating: 4)
      high = create(:destination, t10_rating: 10)

      get "/api/v1/destinations"

      slugs = JSON.parse(response.body)["destinations"].map { |d| d["slug"] }
      expect(slugs).to eq([high.slug, low.slug])
    end

    it "filters by minimum rating" do
      create(:destination, t10_rating: 3)
      great = create(:destination, t10_rating: 9)

      get "/api/v1/destinations", params: { min_rating: 8 }

      slugs = JSON.parse(response.body)["destinations"].map { |d| d["slug"] }
      expect(slugs).to eq([great.slug])
    end
  end

  describe "GET /api/v1/destinations/:slug" do
    it "includes the rating label in the detailed response" do
      destination = create(:destination, t10_rating: 8)

      get "/api/v1/destinations/#{destination.slug}"

      body = JSON.parse(response.body)["destination"]
      expect(body["rating_label"]).to eq("8/10")
    end
  end

  describe "POST /api/v1/destinations" do
    it "rejects a rating outside 1-10 with a 422" do
      post "/api/v1/destinations",
        params: { destination: attributes_for(:destination, t10_rating: 15) },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "creates a destination for an admin" do
      expect {
        post "/api/v1/destinations",
          params: { destination: attributes_for(:destination, t10_rating: 9) },
          headers: auth_headers(admin)
      }.to change(Destination, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "is forbidden without authentication" do
      post "/api/v1/destinations", params: { destination: attributes_for(:destination) }
      expect(response).to have_http_status(:forbidden)
    end
  end
end
