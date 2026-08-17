FactoryBot.define do
  factory :comment do
    association :commentable, factory: :blog_post
    body { Faker::Lorem.paragraph(sentence_count: 2) }
    approved { true }
    guest_name { Faker::Name.name }
    guest_email { Faker::Internet.email }

    trait :guest do
      user { nil }
      guest_name { Faker::Name.name }
      guest_email { Faker::Internet.email }
    end

    trait :from_user do
      association :user
      guest_name { nil }
      guest_email { nil }
    end

    factory :guest_comment, traits: [:guest]
  end
end
