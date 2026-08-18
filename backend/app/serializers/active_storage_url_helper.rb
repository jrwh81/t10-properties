# Serializers are plain Ruby objects, not controllers/views, so they have
# no access to the current request and can't infer a host on their own.
# rails_blob_path(..., only_path: true) -- what we used before -- returns
# a RELATIVE path, which only works when the API and the frontend share
# one origin. They don't here (separate Heroku apps in production,
# separate ports in dev), so every photo URL silently 404'd against
# whichever origin the browser happened to be on. This builds a fully
# qualified absolute URL instead, using BACKEND_URL (see .env.example).
module ActiveStorageUrlHelper
  def blob_url(attachment)
    return nil unless attachment&.persisted?

    backend_url = ENV.fetch("BACKEND_URL", "http://localhost:3000").chomp("/")
    path = Rails.application.routes.url_helpers.rails_blob_path(attachment, only_path: true)
    "#{backend_url}#{path}"
  end
end
