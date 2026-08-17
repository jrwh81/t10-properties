require "rails_helper"

RSpec.describe Destination, type: :model do
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_presence_of(:description) }
  it { is_expected.to validate_presence_of(:city) }
  it { is_expected.to validate_presence_of(:state) }

  it "requires the T10 rating to be between 1 and 10" do
    expect(build(:destination, t10_rating: 0)).not_to be_valid
    expect(build(:destination, t10_rating: 11)).not_to be_valid
    expect(build(:destination, t10_rating: 10)).to be_valid
  end

  it "rejects a non-integer rating" do
    expect(build(:destination, t10_rating: 7.5)).not_to be_valid
  end

  it "rejects an unknown category" do
    expect { build(:destination, category: "amusement_park") }.to raise_error(ArgumentError)
  end

  describe "#rating_label" do
    it "formats the rating as X/10" do
      destination = build(:destination, t10_rating: 9)
      expect(destination.rating_label).to eq("9/10")
    end
  end

  describe ".top_rated" do
    it "orders destinations by rating descending" do
      low = create(:destination, t10_rating: 3)
      high = create(:destination, t10_rating: 10)

      expect(Destination.top_rated).to eq([high, low])
    end
  end
end
