FactoryBot.define do
  factory :destination do
    sequence(:name) { |n| "#{Faker::Restaurant.name} #{n}" }
    description { Faker::Lorem.paragraph(sentence_count: 4) }
    address { Faker::Address.street_address }
    city { "Pittsburgh" }
    state { "PA" }
    category { "restaurant" }
    t10_rating { Faker::Number.between(from: 1, to: 10) }
    featured { false }
  end
end
