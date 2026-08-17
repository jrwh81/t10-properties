class Property < ApplicationRecord
  include Sluggable

  PROPERTY_TYPES = %w[single_family multi_family condo townhouse land commercial].freeze
  STATUSES = %w[active pending sold off_market].freeze

  enum property_type: PROPERTY_TYPES.index_by(&:itself), _prefix: :type
  enum status: STATUSES.index_by(&:itself), _default: "active"

  has_many_attached :photos

  validates :title, presence: true, length: { maximum: 150 }
  validates :description, presence: true
  validates :address, :city, :state, :zip_code, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :bedrooms, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :bathrooms, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :square_feet, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :property_type, inclusion: { in: PROPERTY_TYPES }
  validates :status, inclusion: { in: STATUSES }

  scope :featured, -> { where(featured: true) }
  scope :recent, -> { order(listed_at: :desc, created_at: :desc) }

  def slug_candidate
    "#{title} #{city} #{state}"
  end

  def slug_source_column
    :title
  end

  def full_address
    "#{address}, #{city}, #{state} #{zip_code}"
  end
end
