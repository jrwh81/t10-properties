FactoryBot.define do
  factory :property do
    sequence(:title) { |n| "#{Faker::Address.street_address} ##{n}" }
    description { Faker::Lorem.paragraph(sentence_count: 5) }
    address { Faker::Address.street_address }
    city { "Pittsburgh" }
    state { "PA" }
    zip_code { Faker::Address.zip_code }
    price { Faker::Number.between(from: 90_000, to: 950_000) }
    bedrooms { Faker::Number.between(from: 1, to: 6) }
    bathrooms { Faker::Number.between(from: 1, to: 4) }
    square_feet { Faker::Number.between(from: 600, to: 5000) }
    property_type { "single_family" }
    status { "active" }
    featured { false }
    listed_at { Date.current }
  end
end
