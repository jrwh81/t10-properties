require "rails_helper"

RSpec.describe "Api::V1::Properties", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:member) { create(:user) }

  describe "GET /api/v1/properties" do
    it "returns active/pending/sold properties for anonymous visitors" do
      visible = create(:property, status: "active")
      create(:property, status: "off_market")

      get "/api/v1/properties"

      expect(response).to have_http_status(:ok)
      slugs = JSON.parse(response.body)["properties"].map { |p| p["slug"] }
      expect(slugs).to include(visible.slug)
    end

    it "supports filtering by featured" do
      featured = create(:property, featured: true)
      create(:property, featured: false)

      get "/api/v1/properties", params: { featured: "true" }

      slugs = JSON.parse(response.body)["properties"].map { |p| p["slug"] }
      expect(slugs).to eq([featured.slug])
    end
  end

  describe "GET /api/v1/properties/:slug" do
    it "returns the property detail" do
      property = create(:property)

      get "/api/v1/properties/#{property.slug}"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)["property"]
      expect(body["title"]).to eq(property.title)
      expect(body["full_address"]).to eq(property.full_address)
      expect(body["photos"]).to eq([])
    end
  end

  describe "POST /api/v1/properties" do
    let(:valid_params) do
      {
        property: {
          title: "Skyline View Condo",
          description: "A lovely condo with a view.",
          address: "100 Main St",
          city: "Pittsburgh",
          state: "PA",
          zip_code: "15222",
          price: 250_000,
          bedrooms: 2,
          bathrooms: 2,
          square_feet: 1100,
          property_type: "condo",
          status: "active"
        }
      }
    end

    it "is forbidden for anonymous visitors" do
      post "/api/v1/properties", params: valid_params
      expect(response).to have_http_status(:unauthorized).or have_http_status(:forbidden)
    end

    it "is forbidden for a non-admin member" do
      post "/api/v1/properties", params: valid_params, headers: auth_headers(member)
      expect(response).to have_http_status(:forbidden)
    end

    it "creates a property for an admin" do
      expect {
        post "/api/v1/properties", params: valid_params, headers: auth_headers(admin)
      }.to change(Property, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "returns validation errors for invalid params" do
      valid_params[:property][:price] = -5

      post "/api/v1/properties", params: valid_params, headers: auth_headers(admin)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end
  end

  describe "DELETE /api/v1/properties/:slug" do
    it "allows an admin to delete a property" do
      property = create(:property)

      delete "/api/v1/properties/#{property.slug}", headers: auth_headers(admin)

      expect(response).to have_http_status(:no_content)
      expect(Property.exists?(property.id)).to be false
    end
  end
end
