class DestinationSerializer
  include ActiveStorageUrlHelper

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
      cover_photo_url: blob_url(destination.photos.first)
    }

    return base unless detailed

    base.merge(
      description: destination.description,
      address: destination.address,
      photo_urls: destination.photos.map { |photo| blob_url(photo) },
      photos: destination.photos.map { |photo| { id: photo.id, url: blob_url(photo) } },
      created_at: destination.created_at,
      updated_at: destination.updated_at
    )
  end

  private

  attr_reader :destination, :detailed
end
