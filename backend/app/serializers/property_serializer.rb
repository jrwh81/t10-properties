class PropertySerializer
  include ActiveStorageUrlHelper

  def initialize(property, detailed: false)
    @property = property
    @detailed = detailed
  end

  def as_json(*)
    base = {
      id: property.id,
      slug: property.slug,
      title: property.title,
      price: property.price.to_f,
      city: property.city,
      state: property.state,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms&.to_f,
      square_feet: property.square_feet,
      property_type: property.property_type,
      status: property.status,
      featured: property.featured,
      cover_photo_url: blob_url(property.photos.first)
    }

    return base unless detailed

    base.merge(
      description: property.description,
      address: property.address,
      zip_code: property.zip_code,
      full_address: property.full_address,
      listed_at: property.listed_at,
      photo_urls: property.photos.map { |photo| blob_url(photo) },
      photos: property.photos.map { |photo| { id: photo.id, url: blob_url(photo) } },
      created_at: property.created_at,
      updated_at: property.updated_at
    )
  end

  private

  attr_reader :property, :detailed
end
