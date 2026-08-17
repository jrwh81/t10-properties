class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable,
    :rememberable, :validatable, :jwt_authenticatable,
    jwt_revocation_strategy: self

  ROLES = %w[member admin].freeze

  enum role: { member: "member", admin: "admin" }, _default: "member"

  has_many :blog_posts, foreign_key: :author_id, inverse_of: :author, dependent: :nullify
  has_many :comments, dependent: :nullify
  has_many :sent_admin_invitations, class_name: "AdminInvitation", foreign_key: :invited_by_id, dependent: :nullify

  validates :name, presence: true, length: { maximum: 100 }

  # Required table for devise-jwt's :allowlist / denylist revocation
  # strategies is the same `users` table (we use the built-in
  # jti-based revocation via the `jti` column, so no extra table needed).
  include Devise::JWT::RevocationStrategies::JTIMatcher

  def admin?
    role == "admin"
  end

  def display_name
    name.presence || email.split("@").first
  end
end
