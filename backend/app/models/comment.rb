class Comment < ApplicationRecord
  belongs_to :commentable, polymorphic: true
  belongs_to :user, optional: true
  belongs_to :parent, class_name: "Comment", optional: true, inverse_of: :replies
  has_many :replies, class_name: "Comment", foreign_key: :parent_id, inverse_of: :parent, dependent: :destroy

  validates :body, presence: true, length: { maximum: 3000 }
  validates :guest_name, presence: true, length: { maximum: 80 }, if: :guest_comment?
  validates :guest_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }, if: :guest_comment?
  validate :must_have_author

  scope :top_level, -> { where(parent_id: nil) }
  scope :oldest_first, -> { order(created_at: :asc) }
  scope :approved, -> { where(approved: true) }

  def guest_comment?
    user.nil?
  end

  def author_name
    user&.display_name || guest_name
  end

  private

  def must_have_author
    return if user.present?
    return if guest_name.present? && guest_email.present?

    errors.add(:base, "must have either a signed-in user or a guest name and email")
  end
end
