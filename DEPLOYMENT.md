# Deploying T10 Properties

This covers: pushing the repo to GitHub, deploying the Rails API to Heroku
with a Postgres addon, deploying the built React app to Heroku as a static
site, and pointing your own domain at both.

**Cost note:** Heroku no longer has a free tier. You'll need at minimum an
Eco/Basic dyno on each app (~$5/mo each) and a Heroku Postgres Mini
(~$5/mo) -- roughly $15/mo total for a bare-bones setup. If you'd rather
not pay for a second Heroku app just to serve static files, Vercel or
Netlify are free, zero-config alternatives for the frontend (`vercel` /
`netlify deploy` from the `frontend/` directory) and both support custom
domains + SSL out of the box. Everything below still works if you only use
Heroku for the backend and Vercel/Netlify for the frontend -- just point
`VITE_API_BASE_URL` at your Heroku API and skip the "Frontend on Heroku"
section.

## 0. Prerequisites

- A GitHub account and the `git` CLI
- A Heroku account, the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed, and `heroku login` run once
- A domain you own, with access to its DNS settings

## 1. Push to GitHub

```bash
cd ~/t10-properties
git init
git add .
git commit -m "Initial commit: T10 Properties MVP"
```

Create an empty repo on GitHub (via the web UI, or `gh repo create` if you
have the GitHub CLI), then:

```bash
git remote add origin git@github.com:YOUR_USERNAME/t10-properties.git
git branch -M main
git push -u origin main
```

## 2. Backend: Rails API on Heroku

This is a monorepo (backend/ and frontend/ in one repo), so each Heroku
app is deployed with `git subtree push`, which pushes just one
subdirectory's contents as the root of that Heroku app's git history.

```bash
cd ~/t10-properties
heroku create t10-properties-api
heroku addons:create heroku-postgresql:mini --app t10-properties-api
```

Set the required config vars (generate a real random secret for the JWT
key -- don't reuse the dev placeholder):

```bash
heroku config:set --app t10-properties-api \
  DEVISE_JWT_SECRET_KEY=$(openssl rand -hex 64) \
  RAILS_ENV=production \
  RACK_ENV=production
```

`FRONTEND_ORIGIN` needs to point at your live frontend URL for CORS to
work -- set it now to your Heroku frontend URL (step 3) or your final
custom domain, and update it later if it changes:

```bash
heroku config:set --app t10-properties-api FRONTEND_ORIGIN=https://your-frontend-domain.com
```

`BACKEND_URL` needs to be this API app's own real URL. Photo/cover-image
URLs are built as absolute URLs using this value -- without it, they'd
be relative paths that 404 in the browser, since the frontend and API
are on different origins:

```bash
heroku config:set --app t10-properties-api BACKEND_URL=https://t10-properties-api.herokuapp.com
```

(Use whatever your actual API app URL is -- check with `heroku apps:info
--app t10-properties-api` if you're not sure, since Heroku sometimes
assigns a random suffix rather than the plain app name. Update this again
if you later move to a custom domain for the API.)

Deploy:

```bash
git subtree push --prefix=backend https://git.heroku.com/t10-properties-api.git main
```

The `release` line in `backend/Procfile` runs `rails db:migrate`
automatically on every deploy. Seed demo data once:

```bash
heroku run --app t10-properties-api rails db:seed
```

Your API is now live at `https://t10-properties-api.herokuapp.com`.

**Photo storage: Cloudinary.** The app is already wired for it
(`activestorage-cloudinary-service` gem, `config/storage.yml`, and
`production.rb` all set up), it just needs one env var. Without it, photo
uploads fall back to Active Storage's `:local` service, which writes to
the dyno's ephemeral filesystem -- files are lost on every
restart/redeploy (Heroku recycles dynos at least once every ~24h even
without a deploy), so the app still runs fine but shouldn't be relied on
for real photo uploads until this is set:

1. Sign up for a free Cloudinary account: <https://cloudinary.com/users/register/free>
   (25 credits/month free forever, no card required -- 1 credit = 1GB
   storage/bandwidth/1,000 transformations, plenty for an MVP).
2. On the Cloudinary dashboard, find the **API Environment variable** --
   it's a ready-to-copy string that looks like
   `cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@your-cloud-name`.
3. Set it on Heroku:
   ```bash
   heroku config:set --app t10-properties-api CLOUDINARY_URL=cloudinary://your-copied-value
   ```
   That's it -- no code change or redeploy needed, since
   `production.rb` checks for this var at boot and switches to Cloudinary
   automatically once it's present. Existing photos already uploaded to
   `:local` storage are not migrated (they were ephemeral anyway); just
   re-upload them through the admin UI after this is set.

(If you'd rather use AWS S3 instead: add `gem "aws-sdk-s3", require:
false` to `backend/Gemfile`, run `bundle install`, commit
`Gemfile.lock`, create a bucket + IAM credentials, `heroku config:set
AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... AWS_REGION=...
AWS_BUCKET=...`, and change `config.active_storage.service` in
`production.rb` to explicitly use `:amazon` instead of the Cloudinary
check.)

## 3. Frontend: React app on Heroku (static)

```bash
cd ~/t10-properties
heroku create t10-properties-web
heroku buildpacks:add --app t10-properties-web heroku/nodejs
heroku buildpacks:add --app t10-properties-web heroku/heroku-buildpack-static
```

Set the build-time env vars (Heroku needs these as config vars so Vite
picks them up during the build step):

```bash
heroku config:set --app t10-properties-web \
  VITE_API_BASE_URL=https://t10-properties-api.herokuapp.com/api/v1 \
  VITE_SITE_URL=https://your-frontend-domain.com
```

Deploy:

```bash
git subtree push --prefix=frontend https://git.heroku.com/t10-properties-web.git main
```

Heroku's Node buildpack runs `npm install && npm run build` automatically
(the `build` script in `frontend/package.json` runs `vite build`), then
the static buildpack serves the resulting `frontend/dist` directory using
`frontend/static.json` for SPA routing (so React Router deep links and
refreshes work instead of 404ing).

Your frontend is now live at `https://t10-properties-web.herokuapp.com`.

If `FRONTEND_ORIGIN` on the backend doesn't already match this URL (or
your custom domain from step 4), update it:

```bash
heroku config:set --app t10-properties-api FRONTEND_ORIGIN=https://t10-properties-web.herokuapp.com
```

## 4. Point your own domain at it

Add the domain to whichever app(s) you want it on -- typically the apex/
`www` domain goes to the frontend, and something like `api.yourdomain.com`
goes to the backend:

```bash
heroku domains:add www.yourdomain.com --app t10-properties-web
heroku domains:add api.yourdomain.com --app t10-properties-api
```

Each command prints a DNS target (a `*.herokudns.com` value). In your
domain registrar's DNS settings, add:

- A `CNAME` record: `www` → the herokudns.com value for the frontend app
- A `CNAME` record: `api` → the herokudns.com value for the backend app
- If you want the bare apex domain (`yourdomain.com`, no `www`) to work
  too, most registrars support an `ALIAS` or `ANAME` record for that
  (plain `CNAME` isn't allowed on an apex domain) -- or just redirect
  apex → www at the registrar level, which is simpler if supported.

Enable Heroku's free automated SSL certificates for both:

```bash
heroku certs:auto:enable --app t10-properties-web
heroku certs:auto:enable --app t10-properties-api
```

DNS propagation can take anywhere from a few minutes to a few hours.

Once the domain resolves, update both apps' env vars to reflect the final
URLs and redeploy so the built frontend picks up the change:

```bash
heroku config:set --app t10-properties-api FRONTEND_ORIGIN=https://www.yourdomain.com
heroku config:set --app t10-properties-web \
  VITE_API_BASE_URL=https://api.yourdomain.com/api/v1 \
  VITE_SITE_URL=https://www.yourdomain.com
git subtree push --prefix=frontend https://git.heroku.com/t10-properties-web.git main --force
```

## 5. Smoke test

- Visit your live frontend URL, browse properties/destinations/blog
- Sign up a test account, log in, log out
- Log in as the seeded admin (`admin@t10properties.com` / `password123`
  -- **change this password immediately in production**, or better, seed
  a real admin and remove the default one)
- Create/edit/delete a property, destination, and blog post from `/admin`
- Post a comment as a guest and as a logged-in user

## Ongoing deploys

Any time you want to ship a change:

```bash
git add .
git commit -m "..."
git push origin main   # keeps GitHub up to date
git subtree push --prefix=backend https://git.heroku.com/t10-properties-api.git main
git subtree push --prefix=frontend https://git.heroku.com/t10-properties-web.git main
```
