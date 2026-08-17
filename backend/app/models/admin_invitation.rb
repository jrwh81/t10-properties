class AdminInvitation < ApplicationRecord
  belongs_to :invited_by, class_name: "User"

  before_validation :generate_token, on: :create
  before_validation :set_expiration, on: :create

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :token, presence: true, uniqueness: true
  validate :email_not_already_an_admin, on: :create

  scope :pending, -> { where(accepted_at: nil).where("expires_at > ?", Time.current) }

  def accepted?
    accepted_at.present?
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def accept!
    accepted_at.present? ? false : update(accepted_at: Time.current)
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def set_expiration
    self.expires_at ||= 7.days.from_now
  end

  def email_not_already_an_admin
    return if email.blank?

    if User.where(email: email.downcase, role: "admin").exists?
      errors.add(:email, "is already an admin")
    end
  end
end
