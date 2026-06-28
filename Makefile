.PHONY: install backend frontend test test-backend test-frontend lint up down

install:
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements-dev.txt
	cd frontend && npm install

backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload

frontend:
	cd frontend && npm run dev

test-backend:
	cd backend && . .venv/bin/activate && pytest

test-frontend:
	cd frontend && npm run test

test: test-backend test-frontend

lint:
	cd backend && . .venv/bin/activate && ruff check .
	cd frontend && npm run lint

up:
	docker compose up --build

down:
	docker compose down
