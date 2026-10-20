# Copilot instructions for Gesta

## Project overview

This repository is a Node.js monorepo for Gesta, a student/internship management web app.

- Root package uses npm workspaces: `backend/` and `frontend/`
- Backend: Express + TypeScript + SQLite (`better-sqlite3`), schema managed with SQL migration files
- Frontend: React + TypeScript + Vite + React Router
- Local development uses a demo auth mode; real email-based login is intentionally not implemented

## Local workflow and commands

Use Node 22.14+ (Node 24 LTS recommended). Do not run arbitrary global installs; prefer the repo scripts at the root.

### One-time setup

```bash
npm ci
npm run setup
```

`npm run setup` creates `backend/.env` if needed and initializes the SQLite database with demo data. This is a one-time setup step.

### Run the app

```bash
npm run dev
```

This starts the API on `http://localhost:3000` and the frontend on `http://localhost:5173`.

### Validation commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run check
```

`npm run check` is the main pre-commit validation: lint + typecheck + tests + build.

### Single-test commands

Run one backend test file:

```bash
npm run test -w backend -- --run tests/offers.test.ts
```

Run one frontend test file:

```bash
npm run test -w frontend -- --run tests/CompaniesPage.test.tsx
```

Equivalent workspace-local forms also work:

```bash
cd backend && npx vitest run tests/offers.test.ts
cd frontend && npx vitest run tests/CompaniesPage.test.tsx
```

## High-level architecture

### Backend

The backend follows a layered architecture with explicit assembly in `app.ts` and `main.ts`:

- `main.ts` reads env config, initializes the SQLite database, and starts the server
- `app.ts` wires Express middleware, route controllers, and the error handler
- `controllers/`: HTTP request validation and response shaping
- `services/`: business rules and authorization checks; they do not receive `Request` or `Response`
- `repositories/`: raw SQL queries against SQLite; return DBO records
- `models/`: database objects, business objects, and DTO types
- `mappers/`: translation between SQL rows, domain objects, and API payloads
- `middlewares/`: authentication, authorization, and central error handling
- `db/`: connection management, migrations, and seed data

The project intentionally favors readable SQL and explicit type guards over ORM-heavy patterns. Error handling is centralized with `throw new HttpError(status, code, message)` and the middleware converts this into the JSON error format expected by the frontend.

### Frontend

Frontend code follows the MVVM pattern used in the course:

- `pages/`: route-level screens
- `hooks/`: stateful logic (`useAuth`, `useCompanies`, `useOffers`, etc.)
- `services/`: HTTP requests and JSON validation
- `models/`: response types
- `components/`: reusable UI without route knowledge
- `utils/`: helpers, type guards, labels, auth token storage, and view rules

`useAuth` is called once in `App.tsx` and the token/session state is passed down via props. A 401 response triggers unauthorized flow and the user is sent back to the login screen.

## Key codebase conventions

- `npm ci` is preferred over `npm install`; the repo lockfile is intentionally kept stable.
- `.npmrc` sets `ignore-scripts=true` to avoid running native build scripts during install for `better-sqlite3`.
- The API is not expected to use a `Bearer` prefix in the `Authorization` header; the raw token is passed through.
- `API_PORT` is the environment variable for the API port; do not use `PORT` for this project.
- Database schema changes must be added as new migration files in `backend/src/db/migrations/` instead of modifying existing SQL migration files in place.
- The project keeps SQL visible and intentional: SQLite constraints, allowed values, and uniqueness rules are enforced in the database, while business rules belong to services.
- Demo data and user IDs are intentionally stable and are reused in tests through seed helper utilities.
- Frontend API services validate JSON with custom type guards before returning data to hooks/pages.
- For backend imports, use extension-suffixed relative imports like `.ts`; TypeScript rewrites them at build time.

## Project-specific behavior to respect

- This project has a demo auth mode that bypasses real authentication for local development (`DEMO_AUTH_ENABLED=true` in `backend/.env`).
- The server refuses to start in production with demo auth enabled.
- The database lives under `backend/data/gesta.db` and is created automatically if needed.
- Some features listed in the requirements are intentionally unimplemented; do not assume they exist without verifying the code.
- When touching permissions or authorization rules, follow the existing named access rules pattern (`isAdmin`, `hasContactRole`, `canListOffers`, etc.) rather than ad hoc checks.

## When making changes

- Prefer matching the existing layered pattern over introducing new abstractions.
- Keep test setup in the same style as the repo: in-memory SQLite for backend tests and mocked fetches for frontend tests.
- Before adding a new feature, inspect the closest existing “reference flow” in the repo (for example company listing or offers listing) and mirror that structure.
- If a change affects the API contract, update the relevant backend/frontend service and tests together.
