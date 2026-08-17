class Destination < ApplicationRecord
  include Sluggable

  CATEGORIES = %w[restaurant outdoors nightlife museum shopping lodging other].freeze
  MIN_RATING = 1
  MAX_RATING = 10

  enum category: CATEGORIES.index_by(&:itself), _prefix: :category

  has_many_attached :photos

  validates :name, presence: true, length: { maximum: 150 }
  validates :description, presence: true
  validates :city, :state, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :t10_rating, presence: true,
    numericality: { only_integer: true, greater_than_or_equal_to: MIN_RATING, less_than_or_equal_to: MAX_RATING }

  scope :featured, -> { where(featured: true) }
  scope :top_rated, -> { order(t10_rating: :desc) }

  def slug_candidate
    "#{name} #{city} #{state}"
  end

  def slug_source_column
    :name
  end

  def rating_label
    "#{t10_rating}/10"
  end
end
