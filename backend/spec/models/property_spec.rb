require "rails_helper"

RSpec.describe Property, type: :model do
  it { is_expected.to validate_presence_of(:title) }
  it { is_expected.to validate_presence_of(:description) }
  it { is_expected.to validate_presence_of(:address) }
  it { is_expected.to validate_presence_of(:city) }
  it { is_expected.to validate_presence_of(:state) }
  it { is_expected.to validate_presence_of(:zip_code) }
  it { is_expected.to validate_numericality_of(:price).is_greater_than(0) }

  it "generates a friendly slug from the title/city/state" do
    property = create(:property, title: "Riverfront Loft", city: "Pittsburgh", state: "PA")
    expect(property.slug).to start_with("riverfront-loft")
  end

  it "rejects an invalid property_type" do
    expect { build(:property, property_type: "castle") }.to raise_error(ArgumentError)
  end

  it "rejects zero or negative square footage" do
    property = build(:property, square_feet: 0)
    expect(property).not_to be_valid
  end

  describe "scopes" do
    it ".featured returns only featured listings" do
      featured = create(:property, featured: true)
      create(:property, featured: false)

      expect(Property.featured).to contain_exactly(featured)
    end
  end

  describe "#full_address" do
    it "combines address fields into one string" do
      property = build(:property, address: "1 Market Sq", city: "Pittsburgh", state: "PA", zip_code: "15222")
      expect(property.full_address).to eq("1 Market Sq, Pittsburgh, PA 15222")
    end
  end
end
