FactoryBot.define do
  factory :blog_post do
    sequence(:title) { |n| "#{Faker::Lorem.sentence(word_count: 4)} #{n}" }
    excerpt { Faker::Lorem.sentence(word_count: 12) }
    body { Faker::Lorem.paragraphs(number: 5).join("\n\n") }
    status { "published" }
    published_at { Time.current }
    association :author, factory: [:user, :admin]

    trait :draft do
      status { "draft" }
      published_at { nil }
    end
  end
end
