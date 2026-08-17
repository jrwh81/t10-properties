class DestinationSerializer
  def initialize(destination, detailed: false)
    @destination = destination
    @detailed = detailed
  end

  def as_json(*)
    base = {
      id: destination.id,
      slug: destination.slug,
      name: destination.name,
      city: destination.city,
      state: destination.state,
      category: destination.category,
      t10_rating: destination.t10_rating,
      rating_label: destination.rating_label,
      featured: destination.featured,
      cover_photo_url: photo_url(destination.photos.first)
    }

    return base unless detailed

    base.merge(
      description: destination.description,
      address: destination.address,
      photo_urls: destination.photos.map { |photo| photo_url(photo) },
      created_at: destination.created_at,
      updated_at: destination.updated_at
    )
  end

  private

  attr_reader :destination, :detailed

  def photo_url(photo)
    return nil unless photo&.persisted?

    Rails.application.routes.url_helpers.rails_blob_path(photo, only_path: true)
  end
end
