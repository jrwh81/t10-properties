require "rails_helper"

RSpec.describe PropertySerializer do
  # Regression test: photo URLs must be absolute. The API and frontend
  # live on different origins (different Heroku apps in production,
  # different ports in dev), so a relative Active Storage URL resolves
  # against the wrong origin in the browser and 404s -- photos would
  # never actually render, even though the backend "worked" fine.
  it "returns absolute photo URLs, not relative paths" do
    property = create(:property)
    property.photos.attach(
      io: StringIO.new("fake-image-bytes"),
      filename: "photo.jpg",
      content_type: "image/jpeg"
    )

    json = described_class.new(property, detailed: true).as_json

    expect(json[:cover_photo_url]).to start_with("http://localhost:3000/")
    expect(json[:photo_urls].first).to start_with("http://localhost:3000/")
    expect(json[:photos].first[:url]).to start_with("http://localhost:3000/")
  end

  it "returns nil cover_photo_url when there are no photos" do
    property = create(:property)

    json = described_class.new(property).as_json

    expect(json[:cover_photo_url]).to be_nil
  end
end
