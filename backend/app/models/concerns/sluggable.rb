# Shared FriendlyId configuration for the handful of models that are
# looked up by a human-readable slug (properties, destinations, posts).
module Sluggable
  extend ActiveSupport::Concern

  included do
    extend FriendlyId
    friendly_id :slug_candidate, use: :slugged
  end

  def should_generate_new_friendly_id?
    slug.blank? || attribute_changed?(slug_source_column)
  end
end
