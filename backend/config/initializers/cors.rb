Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # FRONTEND_ORIGIN supports a comma-separated list, since the same
    # site is legitimately reachable from more than one origin (the bare
    # and "www" versions of a custom domain, for example) -- browsers
    # send whichever one the visitor is actually on, and CORS must allow
    # that exact origin or the request is silently rejected.
    allowed_origins = ENV.fetch("FRONTEND_ORIGIN", "http://localhost:5173")
      .split(",")
      .map(&:strip)
      .reject(&:empty?)

    origins allowed_origins

    resource "*",
      headers: :any,
      expose: ["Authorization"],
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
