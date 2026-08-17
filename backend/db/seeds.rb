# Usage: bin/rails db:seed
# Creates an initial admin account plus a handful of properties,
# destinations, and a blog post so the frontend has something to render.

admin = User.find_or_create_by!(email: "admin@t10properties.com") do |u|
  u.name = "T10 Admin"
  u.password = "password123"
  u.password_confirmation = "password123"
  u.role = "admin"
end

puts "Admin login -> email: #{admin.email} / password: password123"

Property.find_or_create_by!(title: "Riverfront Loft") do |p|
  p.description = "Open-concept loft with floor-to-ceiling windows overlooking the Allegheny."
  p.address = "123 River Ave"
  p.city = "Pittsburgh"
  p.state = "PA"
  p.zip_code = "15222"
  p.price = 349_000
  p.bedrooms = 2
  p.bathrooms = 2
  p.square_feet = 1450
  p.property_type = "condo"
  p.status = "active"
  p.featured = true
  p.listed_at = Date.current
end

Destination.find_or_create_by!(name: "Point State Park") do |d|
  d.description = "Iconic fountain at the confluence of three rivers -- unbeatable skyline views."
  d.address = "601 Commonwealth Pl"
  d.city = "Pittsburgh"
  d.state = "PA"
  d.category = "outdoors"
  d.t10_rating = 10
  d.featured = true
end

BlogPost.find_or_create_by!(title: "Why the North Side Is Pittsburgh's Best-Kept Secret") do |b|
  b.author = admin
  b.excerpt = "A closer look at one of the city's most underrated neighborhoods."
  b.body = <<~BODY
    The North Side doesn't get the attention Lawrenceville or Shadyside does, but
    that's exactly what makes it worth a visit -- and a serious look if you're
    house hunting.
  BODY
  b.status = "published"
  b.published_at = Time.current
end

puts "Seeded #{Property.count} properties, #{Destination.count} destinations, #{BlogPost.count} blog posts."
