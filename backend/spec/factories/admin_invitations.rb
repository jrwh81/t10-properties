FactoryBot.define do
  factory :admin_invitation do
    sequence(:email) { |n| "invitee#{n}@example.com" }
    association :invited_by, factory: [:user, :admin]
  end
end
