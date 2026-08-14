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

Requires Node 22 or 24 (see `.nvmrc`), and the following environment variables for GitHub auth:
- `AUTH_GITHUB_APP_ID`
- `AUTH_GITHUB_CLIENT_ID`
- `AUTH_GITHUB_CLIENT_SECRET`
- `AUTH_GITHUB_PRIVATE_KEY`

### Daily Development
```bash
yarn start              # Start both frontend (port 3000) and backend (port 7007) together
yarn start app          # Frontend only
yarn start backend      # Backend only
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
Uses the **declarative frontend** architecture (`@backstage/frontend-defaults`). Plugins are auto-discovered via `app.packages: all` in `app-config.yaml` — no manual wiring needed for standard plugins.

Key files:
- `src/App.tsx` — 7-line entry point: `createApp({ features: [catalogPlugin, navModule] })`
- `src/modules/nav/` — custom sidebar (`NavContentBlueprint`) and GitHub sign-in page (`SignInPageBlueprint`)
- `src/index.tsx` — renders via `App.createRoot()`

Plugins enabled: Catalog (set as root `/`), Scaffolder, TechDocs, API Docs, Tech Radar, Search, Catalog Graph, GitHub Actions, Notifications, Signals.

### Backend (`packages/backend`)
Single entry point at `src/index.ts` that registers all backend plugins:
- **Auth**: GitHub provider + guest (development only)
- **Catalog**: GitHub org discovery for the `openedx` GitHub organization (main/master branches)
- **Search**: PostgreSQL engine in production, collating catalog and TechDocs
- **TechDocs**: Local build/generate/publish in development
- **Scaffolder**: Software templates
- **Events**: GitHub event routing

### Configuration
- `app-config.yaml` — Base config (SQLite in-memory, localhost URLs)
- `app-config.production.yaml` — Production overlay (PostgreSQL via env vars, https://backstage.openedx.org)

Production loads both, in that order, and deep-merges them (see `CMD` in
`packages/backend/Dockerfile`). The production file only *overrides*: anything
in `app-config.yaml` is live in production unless restated there. Objects merge
key by key, arrays replace wholesale.

### Database
- Development: SQLite3 (better-sqlite3, in-memory)
- Production: PostgreSQL (connection via `PGSSLMODE`, `PG*` environment variables)

### Deployment
Docker image built from `packages/backend/Dockerfile` and deployed to Heroku. The image bundles the compiled frontend and serves it from the backend.

## Upgrading Backstage

Docs: https://backstage.io/docs/getting-started/keeping-backstage-updated/

```bash
yarn backstage-cli versions:bump
```

That only changes version numbers. Template files — configs, Dockerfile,
`package.json`, `.yarnrc.yml` — never update themselves, so drift accumulates
silently and has to be reconciled by hand.

### Diffing against the upstream template

```bash
# which create-app version each release shipped with
curl -s https://versions.backstage.io/v1/releases/<version>/manifest.json | grep -A1 create-app
npm pack @backstage/create-app@<version>   # then untar and diff
```

Two mistakes that have bitten us:

- **Diff the full template against ours, not old template vs new template.**
  A version-to-version diff only shows what upstream changed recently. It
  never surfaces sections that have been in the template for years and were
  simply never adopted here.
- **Use the right template directory.** We use the new frontend system. In
  create-app 0.8.x that lived in `templates/next-app`; `templates/default-app`
  was still the old system. Diffing the wrong one makes real additions look
  like migration noise we'd already handled.

Compare *every* config file, including `app-config.production.yaml`.

Template config we don't want gets copied in **commented out with a one-line
reason**. Absence alone doesn't say whether we decided against something or
never noticed it.

### Verifying

`yarn tsc` and unit tests pass while runtime wiring is broken, so they are not
enough on their own.

```bash
CI=true yarn test          # plain `yarn test` runs in watch mode and hangs
yarn lint:all
yarn build:all
yarn install --immutable
yarn build-image           # this is the deploy path
yarn backstage-cli config:check --lax --strict --deprecated
yarn backstage-cli config:check --lax --strict --deprecated \
  --config app-config.yaml --config app-config.production.yaml
```

Then boot the backend with throwaway `AUTH_GITHUB_*` values and confirm every
plugin appears in the `Plugin initialization started` line. GitHub 401s are
expected; a missing plugin is not.

### Gotchas

- **A backend package usually needs a frontend half, and always needs
  registering.** `plugin-user-settings-backend` does nothing without
  `plugin-app-module-user-settings`, and nothing added to
  `packages/backend/package.json` runs until it is added to
  `packages/backend/src/index.ts`.
- **Check whether a failure pre-dates the upgrade** before fixing it — stash
  and re-run on `main`. `yarn prettier:check` already fails on ~24 files.
- **`yarn install` re-sorts dependencies alphabetically** in `package.json`,
  so hand-ordering does not survive.
- **Yarn comes from corepack**, pinned with an integrity hash in
  `packageManager`. We do not vendor a binary in `.yarn/releases` the way the
  template does. Bump it with `corepack use yarn@<version>`.

## Adding Plugins

New plugins go in `plugins/` directory. Scaffold with:
```bash
yarn new
```

Then register the plugin in `packages/app/src/App.tsx` (frontend) and/or `packages/backend/src/index.ts` (backend).

## Catalog Discovery

The backend automatically discovers and ingests entities from the `openedx` GitHub organization. Files under `catalog-extra/` are picked up by the `extraCatalogs` provider in `app-config.yaml` via its `catalogPath` glob.
