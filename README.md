# T10 Properties LLC

A full-stack site for T10 Properties: property listings, T10-rated destination
reviews (1-10 scale), and a blog with threaded, guest-or-member comments.

- **Backend:** Ruby on Rails 7 (API-only) + PostgreSQL, Devise + JWT auth, Pundit
  authorization, RSpec test suite.
- **Frontend:** React 18 + Vite + Material UI, themed from the T10 Properties
  logo palette (near-black `#0b0d0f`, gold `#c9a961`, white), React Query,
  React Router, Vitest + React Testing Library.

## About this build environment

This project was generated in a sandbox that has Node.js but **no Ruby,
Rails, PostgreSQL, or network access**. That means:

- Every file here (models, controllers, migrations, RSpec specs, React
  components, Vitest tests) was hand-written to be correct and idiomatic,
  but **none of it has been executed** in this environment — no
  `bundle install`, no `rails db:migrate`, no `rspec`, no `npm install`, no
  `vitest run`.
- You'll need to run the setup steps below locally (or in CI) to install
  dependencies and actually execute the test suites. I'd treat the first
  `bundle install` / `rspec` / `npm test` run as the real verification pass —
  flag anything that fails and I'll fix it in the next version.

## Quick start (Makefile)

Assumes you already have PostgreSQL running locally (no Docker required —
see the appendix at the bottom if you'd rather use `docker compose`).
`backend/config/database.yml` and the `.env` files it needs are handled
for you by `make setup`.

```bash
make setup     # bundle install, npm install, db:prepare, db:seed, both .env files
make test      # bundle exec rspec + npm test
make server    # starts the Rails API on :3000 (run in its own terminal tab)
make frontend-dev   # starts the Vite dev server on :5173 (separate terminal tab)
```

Seeded admin login: `admin@t10properties.com` / `password123`.

Individual targets, if you only need one side:

```bash
make backend-setup    # bundle install + db:prepare + db:seed
make backend-test     # bundle exec rspec
make frontend-setup   # npm install
make frontend-test    # npm test
make clean            # clears backend log/tmp/storage scratch files
```

## Manual setup (no Makefile)

If you'd rather run the underlying commands yourself instead of using
`make` (or need to use Docker for Postgres):

```bash
docker compose up -d          # optional: starts Postgres on localhost:5432
```

```bash
cd backend
cp .env.example .env
bundle install
bin/rails db:prepare
bin/rails db:seed             # optional demo data + an admin login
bundle exec rspec             # run the test suite
bin/rails server
```

```bash
cd frontend
cp .env.example .env
npm install
npm test                      # run the Vitest suite
npm run dev
```

## Changelog

**v26** — Force HTTP to HTTPS on the frontend. Heroku's free ACM
certificate makes HTTPS *available* on a custom domain, it doesn't force
HTTP requests to upgrade -- that's on the app. The Rails API already had
this (`config.force_ssl = true`), but swapping the frontend from `serve`
to a custom Express server (v24) dropped that enforcement without
anyone adding it back. Added redirect middleware (`shouldRedirectToHttps`
in `server/metaHtml.js`, unit tested) that checks Heroku's
`X-Forwarded-Proto` header -- Heroku terminates SSL at its router and
forwards to the dyno over plain HTTP internally, setting that header to
say what the original client connection actually was. Checking
specifically for `"http"` (not just "not https") makes this a no-op with
no proxy in front at all, e.g. running `node server.js` locally.

**v25** — Pinned `engines.node`/`engines.npm` in `frontend/package.json`
to match the versions in `.tool-versions` (Node 22.22.2, npm 10.9.7).
Heroku's build environment was running a newer npm (11.x) than local dev
(10.9.7); different npm major versions can interpret/validate
`package-lock.json` differently, which can make `npm ci` pass locally
while failing with "npm lockfile is not in sync" on Heroku even though
the lockfile genuinely is in sync. Pinning `engines` makes Heroku install
the exact same npm version used locally instead of whatever it defaults
to for a given Node version.

**v24** — Two additions. (1) Per-page social share previews: property,
destination, and blog post links now show that page's own photo and
title/description when shared, instead of the generic site-wide image.
Since this SPA has no server-side rendering and link-preview bots don't
run JavaScript, this needed an actual server: swapped `frontend`'s static
file serving (`npx serve` via `Procfile`) for a small Express server
(`frontend/server.js` + `frontend/server/metaHtml.js`, unit tested) that
detects known bot user agents (Slack, Twitter, iMessage, Discord, etc.),
fetches the relevant resource server-side, and swaps in page-specific
`og:title`/`og:description`/`og:image` before sending the HTML -- regular
visitors get the identical static app as before. Falls back to the
generic `/og-image.png` when a page has no photo. `DEPLOYMENT.md` updated
accordingly (it had drifted out of date after an earlier live fix
switched away from the `heroku-buildpack-static` buildpack mid-session).
(2) All four provided logo files now actually appear on the site (navbar,
footer, login/signup, 404 page) -- previously only a crop of one had been
used, for the favicon/share image, and none were visible in the live UI.
Each was cropped to its content and given a transparent background via
flood-fill from the image borders; a plain color-distance threshold
(the approach used for the original favicon/OG-image crop) incorrectly
punches holes into these particular logos, since they use black/near-black
as both the background *and* a real foreground color (character
silhouettes, a text banner) in places.

**v23** — Stopped fighting jsdom's Clipboard API for real. Two prior
attempts (`Object.defineProperty`, then `vi.spyOn`) to mock
`navigator.clipboard.writeText` directly proved unreliable in this test
environment -- likely because the real Clipboard API is gated behind
secure/HTTPS contexts, which the jsdom test origin isn't. Extracted the
actual clipboard call into `utils/clipboard.js` (`copyToClipboard`), used
by `InviteLinkDialog`, so tests can `vi.mock()` that small module instead
-- the same reliable pattern already used for every API call in this
project, sidestepping jsdom's Clipboard API entirely.

**v22** — Fixed `InviteLinkDialog`'s clipboard test for real this time.
`Object.defineProperty(navigator, "clipboard", { value: {...} })` was
still not being recognized as the active spy at assertion time in this
jsdom/Vitest setup (root cause not fully pinned down, likely userEvent or
jsdom internals re-reading `navigator.clipboard` in a way that bypassed
the replaced object). Switched to the standard, reliable pattern instead:
ensure `navigator.clipboard`/`writeText` exist, then `vi.spyOn` the
method directly and assert against that spy reference rather than
re-reading `navigator.clipboard.writeText` at assertion time.

**v21** — Fixed `InviteLinkDialog` test setup: `navigator.clipboard` is a
getter-only property in this jsdom/Vitest environment, so plain
`Object.assign(navigator, { clipboard: ... })` silently fails to actually
mock it. Switched to `Object.defineProperty(navigator, "clipboard", {
value: ..., configurable: true })`, which can override a getter-only
property.

**v20** — Added a themed `InviteLinkDialog` modal that pops up
immediately after sending an admin invite (email delivery still isn't
configured, so this is the actual "notify them" step) -- shows the
invitee's email and the full accept link with a one-click copy button.
The invitations table also now shows the link itself (truncated, click
to reopen the same modal) instead of only a bare copy icon with no
visible link text.

**v19** — Added a photo slideshow to the property and destination detail
pages (previously only the first photo ever showed). New
`PhotoSlideshow` component: arrow buttons, dot indicators, a "2 / 5"
counter, and left/right arrow-key navigation -- deliberately **not**
auto-advancing, since carousels that move on their own are a well-known
accessibility anti-pattern, which would be a strange thing to ship given
what this site is actually about. Falls back to a plain placeholder with
no controls when there are zero photos, and skips the controls entirely
for a single photo.

**v18** — Fixed photos never actually rendering, anywhere (admin or
public pages), even though uploads and deletes worked correctly on the
backend. `photo_url`/`cover_image_url` used `rails_blob_path(...,
only_path: true)`, which returns a *relative* URL -- fine only when the
frontend and API share one origin, which they never have here (separate
Heroku apps in production, separate ports in dev). A relative `<img src>`
resolves against the page's own origin, not the API's, so every photo
404'd silently. Added `ActiveStorageUrlHelper`, a shared module used by
`PropertySerializer`/`DestinationSerializer`/`BlogPostSerializer`, that
builds fully-qualified absolute URLs from a new `BACKEND_URL` env var
(defaults to `http://localhost:3000` for dev). **Requires setting
`BACKEND_URL` on the API's Heroku app** -- see `DEPLOYMENT.md`. Added a
regression spec asserting the returned URLs are absolute.

**v17** — Fixed uploaded photos disappearing on Save. Editing a
property/destination pre-filled form state by spreading the *entire*
record (`{ ...EMPTY_FORM, ...initialValues }`), which includes the
`photos` array from the API's detailed serializer. That stale array rode
along in the "Save changes" payload; strong params stripped its nested
`{id, url}` objects down to an empty array (they're not permitted
scalars); and `has_many_attached` treats assignment as a **replace, not
an append** -- so saving the form after uploading photos silently wiped
them. Fixed on both ends: the frontend now builds form state from only
the known editable fields (`PropertyFormDialog`, `DestinationFormDialog`,
`BlogPostFormDialog`), and `photos: []` was removed from the backend's
permitted params entirely (photo mutations already go through their own
dedicated endpoints, so it no longer needs to be reachable from the main
create/update action at all). Added regression tests on both sides.

**v16** — Fixed `cannot load such file -- cloudinary (LoadError)` on
boot. `activestorage-cloudinary-service`'s service file requires the base
`cloudinary` Ruby SDK gem, but doesn't declare it as a hard dependency --
it was missing from the Gemfile entirely. Added `gem "cloudinary"`
alongside it.

**v15** — Wired up Cloudinary for real, persistent photo storage (chosen
over S3: one env var instead of four, free tier that never expires, no
IAM setup). Added the `activestorage-cloudinary-service` gem, a
`cloudinary` entry in `storage.yml`, and `production.rb` now
auto-detects `CLOUDINARY_URL` -- uses Cloudinary if it's set, falls back
to the ephemeral `:local` service if not (so the app still boots either
way rather than crashing if someone forgets to set it). `DEPLOYMENT.md`
has the exact signup + config steps.

**v14** — Added photo upload UI to the admin CMS (previously the API
endpoints existed with no frontend to call them). Property and
destination forms now have a full photo manager: thumbnail grid, add
multiple photos, delete individually. Blog posts get a single cover-image
picker with preview. New properties/destinations stay open after creation
(switching into "edit" mode with the saved record) so photos can be added
right away instead of save-then-reopen. Backend: `PropertySerializer` and
`DestinationSerializer` now include `photos: [{id, url}]` in their
detailed view (previously only bare `photo_urls` strings, with no ID to
delete an individual photo by).

**v13** — Fixed a production boot failure discovered on the first real
Heroku deploy: `config.active_storage.service = :amazon` in
`production.rb` requires the `aws-sdk-s3` gem, which was never added to
the Gemfile, and Rails validates the configured Active Storage service
the moment any model with `has_many_attached`/`has_one_attached` loads --
not just when something is actually uploaded -- so this broke every
single request in production (`rails db:seed`, page loads, everything).
Switched to Active Storage's `:local` service so the app actually boots;
this is ephemeral on Heroku (files are lost on restart/redeploy), so
`DEPLOYMENT.md` now has concrete steps for migrating to S3 (or similar)
before photo uploads are something a real user should rely on.

**v12** — Added Heroku deployment support: `backend/Procfile` (web +
release-phase migration), pinned the Gemfile's Ruby version to an exact
`3.2.2` (matches `.tool-versions`; Heroku's buildpack wants one specific
version, not a range), `frontend/static.json` for Heroku's static
buildpack (with SPA routing so React Router deep links/refreshes don't
404), a root `.gitignore`, and a full `DEPLOYMENT.md` walkthrough covering
GitHub push, Heroku backend + Postgres, Heroku static frontend, and
pointing a custom domain at both with SSL.

**v11** — Added favicons and a social share (Open Graph) image, generated
from the T10 Properties logo. Cropped the icon mark (the white rounded-
square scene) out of the horizontal logo, built a full favicon set
(16/32/48px, apple-touch-icon, android-chrome 192/512px, multi-res
`.ico`), and composed a 1200x630 `og-image.png` with the mark plus the
wordmark and tagline on the brand's dark background. `index.html` now
links all of these plus a `site.webmanifest`, and has Open Graph/Twitter
card meta tags so shared links preview nicely in Slack/iMessage/Twitter/
etc. Those tags need an absolute image URL, so added `VITE_SITE_URL` to
`frontend/.env.example` (defaults to `localhost:5173`, which keeps dev
working but **must be updated to the real production domain before
deploying**, since social platforms can't fetch a localhost image).

**v10** — Merged in a homepage rewrite from a separate agent session
(`t10-properties-v7-homepage-copy.zip`, based on this project's v7). The
only real content change was `frontend/src/pages/HomePage.jsx` -- diffed
the two trees first to confirm nothing else had drifted. The new copy
reflects what the logo art was actually depicting: T10 Properties is
accessibility-focused, founded by Christopher Juba (who has lived as a
paraplegic), and the "T10" rating is a 1-10 scale for how navigable a
restaurant/hotel/venue actually is for wheelchair users -- not a generic
"best of" list. Added an "Our Story" section and rewrote the hero and
section copy accordingly. Note: `PropertiesPage`, `DestinationsPage`, and
the `index.html` meta description still use the original generic copy --
worth a follow-up pass if you want the accessibility framing consistent
site-wide.

**v9** — Fixed two frontend test failures from the admin CMS. (1)
`PropertyFormDialog`'s validation test hung indefinitely: MUI's `required`
prop also sets the native HTML `required` attribute, and since Save is a
real `type="submit"` button inside a `<form>`, a genuine click let the
browser/jsdom's native constraint validation block the submission before
our own `onSubmit` handler (and its validation/Alert) ever ran. Removed the
native `required` attribute from the three admin form dialogs (Property/
Destination/BlogPost) -- validation is handled entirely in JS already. (2)
`AdminInvitationsPage`'s invite test failed a strict `toHaveBeenCalledWith`
assertion because `mutationFn: createAdminInvitation` was passed as a raw
function reference, and React Query calls it with an extra internal
argument beyond the variable we passed in (harmless in production since JS
ignores extra params, but it broke the test and is a sloppy pattern
regardless). Wrapped every direct `mutationFn` reference across the admin
pages in an explicit single-argument arrow function.

**v8** — Added the admin CMS: `/admin` now has a tabbed dashboard
(Properties, Destinations, Blog Posts, Admins) with full create/edit/delete
for each resource via dialog forms, and an "Admins" tab for sending invites
and copying the accept link. Backend changes to support it: the invite
`accept` action now calls `sign_in(user)` and that path was added to
`jwt.dispatch_requests` so a newly-accepted admin gets a JWT and is signed
in immediately; `AdminInvitationSerializer` now includes a ready-to-copy
`accept_url` (no real email delivery configured yet); the `per_page` clamp
was bumped from 50 to 100 so admin list views can show everything at once
without pagination controls.

**v7** — Added a root-level `.tool-versions` (asdf) pinning `ruby 3.2.2`
and `nodejs 22.22.2` so it doesn't need to be recreated after every re-unzip.

**v6** — Fixed the real cause of the frontend `localStorage` failures:
jsdom's default document origin is `about:blank`, an *opaque origin*, and
storage APIs are unavailable entirely for opaque origins per spec --
`window.localStorage` was simply `undefined` in tests. Added
`environmentOptions.jsdom.url` to `vite.config.js` so jsdom gets a real
origin. Also added an in-memory fallback in `api/client.js` as a second
layer of defense, and added a root-level `Makefile` (`make setup`,
`make test`, `make server`, `make frontend-dev`, etc.) to cut down on
repeated multi-command copy/paste for setup and testing.

**v5** — Fixed a frontend test failure: `TypeError: Cannot read properties
of undefined (reading 'getItem')` in `src/api/client.js`. Vitest's jsdom
environment doesn't reliably alias the bare global `localStorage` from
`window.localStorage`, so `getStoredToken`/`setStoredToken` now reference
`window.localStorage` explicitly (equally valid in real browsers too).

**v4** — Fixed `ActionDispatch::Request::Session::DisabledSessionError` for
real this time. My v3 fix (adding `/api/v1/signup` to `jwt.dispatch_requests`)
was based on a wrong theory -- that config only controls where devise-jwt
*attaches an Authorization header to the response*; it does nothing to stop
Devise's `sign_in`/`sign_up` from calling `warden.set_user`, which always
tries to write to the session. `config.api_only = true` strips session/cookie
middleware from the stack entirely, so that write had nowhere to go. Added a
minimal cookie-backed session store back into `config/application.rb`
(unused for reads -- auth state is carried entirely by the JWT -- it exists
purely so Devise's internal session write doesn't raise).

**v3** — Added `/api/v1/signup` to `jwt.dispatch_requests` (harmless, kept,
but did not fix the underlying issue -- see v4).

**v2** — Fixed a boot-time bug where `config/initializers/devise.rb` manually
overrode Warden's default strategies with an incorrect strategy name,
causing `RuntimeError: Invalid strategy jwt_authenticatable` on essentially
every request (any code path touching `current_user`, including Pundit's
`policy_scope`/`authorize`). Also fixed `ApplicationController` missing
`ActionController::Helpers` (needed for Devise's `helper_method` calls under
`ActionController::API`), a `Comment` validation bug where an unsaved
`user` association wasn't recognized because it checked `user_id` instead
of the `user` object, and two model specs that expected Rails enums to fail
validation on an invalid value rather than raise `ArgumentError` (their
actual, correct behavior).

**v1** — Initial build: properties, T10-rated destinations, blog with
guest/member comments, JWT auth, admin-invite flow, full RSpec suite,
React + MUI frontend themed from the logo palette.

## What's implemented

- **Properties**: CRUD API, public listing/detail pages, filtering by type
  and featured status, photo uploads via Active Storage.
- **Destinations**: CRUD API with a required 1-10 T10 rating, category
  filtering, public listing/detail pages with the T10 rating badge.
- **Blog**: CRUD API (draft/published), public listing/detail pages.
- **Comments**: guests can comment with name + email, signed-in members
  get a profile-linked comment, threaded replies, admin moderation
  (delete/approve), all wired into the blog post detail page.
- **Auth**: signup/login/logout via JWT, member vs. admin roles, an
  admin-invitation flow (an existing admin invites a new admin by email;
  the invitee accepts via a tokenized link to create their account and is
  signed in immediately).
- **Admin CMS** (`/admin`, admin-only): tabbed dashboard for creating,
  editing, and deleting properties, destinations, and blog posts, plus an
  "Admins" tab for sending invites and copying the accept link (no email
  delivery is configured yet, so the link is copy/paste for now). Property
  and destination forms include full photo management (upload multiple,
  delete individually); blog posts have a single cover-image picker.
  New properties/destinations stay open after creation so photos can be
  added immediately instead of a save-then-reopen round trip.
- **Theme**: MUI dark theme built directly from colors sampled out of the
  provided logo files. All four provided logo variants are used across
  the live site (navbar, footer, login/signup, 404 page), each cropped
  and converted to a transparent PNG via flood-fill background removal
  (a plain color-distance threshold punches holes in the artwork itself,
  since it uses black/near-black as both background *and* a real
  foreground color in places -- flood-fill from the image borders only
  removes the connected exterior background).
- **Social share previews**: property/destination/blog-post links shared
  on Slack, Twitter, iMessage, Discord, etc. show that page's own photo
  and title/description, not just the generic site-wide image. Since
  this is a client-rendered SPA with no per-route meta tags and bots
  don't run JavaScript, this required swapping `frontend`'s static file
  server for a small Express server (`frontend/server.js`) that detects
  known bot user agents and serves them page-specific meta tags fetched
  server-side from the API -- regular visitors get the exact same static
  app as before. Falls back to the generic `/og-image.png` when a page
  has no photo.

## What's next (v3 candidates)

- Comment moderation queue UI for admins (approve/reject unapproved
  comments -- the `approved` flag and API support already exist).
- Pagination controls in the frontend (the API already returns `meta`
  with page/per_page/total_count/total_pages); the admin list views
  currently just request up to 100 records at once instead.
- Real email delivery for admin invitations (currently `:test` delivery
  in dev/test -- the invite link is surfaced directly in the admin UI as
  a workaround).

## Deploying

See [DEPLOYMENT.md](./DEPLOYMENT.md) for pushing this to GitHub and
deploying to Heroku (Rails API + Postgres, and the built React app as a
static site), plus pointing a custom domain at it.

## Repository layout

```
backend/     Rails API app
frontend/    React + Vite + MUI app
docker-compose.yml   Local Postgres for development
```
