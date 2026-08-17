.PHONY: setup backend-setup frontend-setup \
        test backend-test frontend-test \
        server frontend-dev \
        clean

# ---- Setup ---------------------------------------------------------------

setup: backend-setup frontend-setup

backend-setup:
	cd backend && [ -f .env ] || cp .env.example .env
	cd backend && sed -i '' "s/DATABASE_USERNAME=postgres/DATABASE_USERNAME=$$(whoami)/" .env
	cd backend && sed -i '' "s/DATABASE_PASSWORD=postgres/DATABASE_PASSWORD=/" .env
	cd backend && bundle install
	cd backend && bin/rails db:prepare
	cd backend && bin/rails db:seed

frontend-setup:
	cd frontend && [ -f .env ] || cp .env.example .env
	cd frontend && npm install

# ---- Tests ----------------------------------------------------------------

test: backend-test frontend-test

backend-test:
	cd backend && bundle exec rspec

frontend-test:
	cd frontend && npm test

# ---- Run --------------------------------------------------------------

server:
	cd backend && bin/rails server

frontend-dev:
	cd frontend && npm run dev

# ---- Housekeeping -----------------------------------------------------

clean:
	cd backend && rm -rf log/* tmp/* storage/*
	cd backend && touch log/.keep tmp/.keep storage/.keep
