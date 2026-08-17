class BlogPost < ApplicationRecord
  include Sluggable

  STATUSES = %w[draft published].freeze

  belongs_to :author, class_name: "User"
  has_one_attached :cover_image
  has_many :comments, as: :commentable, dependent: :destroy

  enum status: STATUSES.index_by(&:itself), _default: "draft"

  validates :title, presence: true, length: { maximum: 200 }
  validates :body, presence: true
  validates :excerpt, length: { maximum: 300 }
  validates :status, inclusion: { in: STATUSES }

  before_save :set_published_at

  scope :published, -> { where(status: "published").where("published_at <= ?", Time.current) }
  scope :recent, -> { order(published_at: :desc, created_at: :desc) }

  def slug_candidate
    title
  end

  def slug_source_column
    :title
  end

  def published?
    status == "published"
  end

  private

  def set_published_at
    self.published_at ||= Time.current if status == "published"
  end
end
