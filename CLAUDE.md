# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the Open edX Backstage instance — a monorepo-based [Backstage](https://backstage.io) deployment serving as the internal developer portal for the Open edX project. It is deployed to Heroku at https://backstage.openedx.org.

## Development Commands

### Setup (one-time)
```bash
corepack enable
yarn install
```

Requires Node 20 or 22 (see `.nvmrc`), and the following environment variables for GitHub auth:
- `AUTH_GITHUB_CLIENT_APP_ID`
- `AUTH_GITHUB_CLIENT_ID`
- `AUTH_GITHUB_CLIENT_SECRET`
- `AUTH_GITHUB_CLIENT_PRIVATE_KEY`

### Daily Development
```bash
yarn dev          # Start both frontend (port 3000) and backend (port 7007) together
yarn start        # Frontend only
yarn start-backend  # Backend only
```

### Building
```bash
yarn tsc          # Type-check
yarn build:all    # Build all packages
yarn build:backend  # Build backend only (for Docker)
yarn build-image  # Build Docker image
```

### Testing & Linting
```bash
yarn test         # Run tests
yarn test:all     # Run tests with coverage
yarn test:e2e     # Run Playwright E2E tests
yarn lint:all     # Lint all packages
yarn prettier:check  # Check formatting
```

## Architecture

### Monorepo Structure
- **`packages/app/`** — Frontend React application (Backstage frontend)
- **`packages/backend/`** — Node.js backend service (Backstage backend)
- **`plugins/`** — Custom Backstage plugins (currently empty, ready for development)
- **`catalog-extra/`** — Additional catalog YAML files (e.g., LTI plugin)
- **`examples/`** — Sample entities and scaffolder templates

### Frontend (`packages/app`)
Standard Backstage React app with these plugins enabled:
- Catalog, Scaffolder, TechDocs, API Docs, Tech Radar, Search, Catalog Graph
- GitHub Actions (community plugin)
- GitHub authentication with openedx org requirement

Key files: `src/App.tsx` (routes and plugin bindings), `src/components/catalog/EntityPage.tsx` (entity display), `src/apis.ts`.

### Backend (`packages/backend`)
Single entry point at `src/index.ts` that registers all backend plugins:
- **Auth**: GitHub provider + guest (development only)
- **Catalog**: GitHub org discovery for the `openedx` GitHub organization (main/master branches)
- **Search**: PostgreSQL engine in production, collating catalog and TechDocs
- **TechDocs**: Local build/generate/publish in development
- **Scaffolder**: Software templates
- **Events**: GitHub event routing

### Configuration
- `app-config.yaml` — Development config (SQLite in-memory, localhost URLs)
- `app-config.production.yaml` — Production config (PostgreSQL via env vars, https://backstage.openedx.org)

### Database
- Development: SQLite3 (better-sqlite3, in-memory)
- Production: PostgreSQL (connection via `PGSSLMODE`, `PG*` environment variables)

### Deployment
Docker image built from `packages/backend/Dockerfile` and deployed to Heroku. The image bundles the compiled frontend and serves it from the backend.

## Adding Plugins

New plugins go in `plugins/` directory. Scaffold with:
```bash
yarn new
```

Then register the plugin in `packages/app/src/App.tsx` (frontend) and/or `packages/backend/src/index.ts` (backend).

## Catalog Discovery

The backend automatically discovers and ingests entities from the `openedx` GitHub organization. Additional catalog files can be added to `catalog-extra/` and referenced in `app-config.yaml` under `catalog.locations`.
