Rails.application.routes.draw do
  # We hand-roll the session/registration paths below instead of relying
  # on devise_for's default resourceful routes, because those would put
  # POST /api/v1 (create) at the same URL as the collection root. skipping
  # session/registration/password route generation still gives us
  # `devise_mapping` inside the devise_scope block for the custom routes.
  devise_for :users,
    skip: [:sessions, :registrations, :passwords],
    controllers: {
      sessions: "api/v1/sessions",
      registrations: "api/v1/registrations"
    },
    defaults: { format: :json }

  devise_scope :user do
    post "api/v1/login", to: "api/v1/sessions#create"
    delete "api/v1/logout", to: "api/v1/sessions#destroy"
    post "api/v1/signup", to: "api/v1/registrations#create"
  end

  namespace :api do
    namespace :v1 do
      resource :me, only: [:show], controller: "me"

      resources :properties, param: :slug do
        resources :photos, only: [:create, :destroy], controller: "property_photos"
      end

      resources :destinations, param: :slug do
        resources :photos, only: [:create, :destroy], controller: "destination_photos"
      end

      resources :blog_posts, param: :slug do
        resources :comments, only: [:index, :create]
      end

      resources :comments, only: [:update, :destroy]

      resources :admin_invitations, only: [:index, :create, :destroy]
      post "admin_invitations/:token/accept", to: "admin_invitations#accept", as: :accept_admin_invitation
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
