<!-- agent-update:start:tooling -->
# Tooling & Productivity Guide

This guide collects the scripts, automation, and editor settings that keep contributors efficient and the codebase consistent.

## Required Tooling
- **Node.js** — Install via [nvm](https://github.com/nvm-sh/nvm) (recommended for version management). The repository's `.nvmrc` file specifies the correct version. Powers the runtime for all apps, packages, and scripts.
- **Yarn** — Install via `npm install -g yarn`. Requires version 3.x (Berry) for workspace support. Manages dependencies across the monorepo; run `yarn install` at the root to get started.
- **Git** — Standard installation (e.g., via Homebrew on macOS: `brew install git`). Essential for version control; configure with your `user.name` and `user.email`.
- **Docker** — Install from [official docs](https://docs.docker.com/get-docker/). Required for running the local development environment via the Supabase CLI.
- **Supabase CLI** — Install via `npm install -g supabase`. Manages the local Supabase stack (Postgres database, Auth, Storage, etc.). Key commands are `supabase start` and `supabase stop`. See the `supabase/` directory for configuration.

## Recommended Automation
- **Pre-commit hooks**: Husky and lint-staged are configured in `package.json`. Hooks are installed automatically after `yarn install` and run ESLint, Prettier, and type checks before each commit to maintain code quality.
- **Linting and formatting**: Run `yarn lint` for static analysis (ESLint) and `yarn format` to apply Prettier styles. Integrating these with your IDE is highly recommended for real-time feedback and auto-formatting on save.
- **Code generators and scaffolding**: The `scripts/` directory contains helpers for common tasks. For example, use `yarn scaffold agent` to generate a new agent playbook from a template.
- **Build and test automation**: Turborepo orchestrates tasks across the monorepo.
  - `yarn build`: Builds all packages and apps.
  - `yarn test`: Runs all unit and integration tests (using Jest/Vitest).
  - `yarn dev`: Starts all apps in development mode with hot-reloading.

## IDE / Editor Setup
We strongly recommend VS Code for a streamlined development experience.
- **VS Code extensions**:
  - **ESLint** (`dbaeumer.vscode-eslint`) — Catches linting errors in real-time.
  - **Prettier - Code formatter** (`esbenp.prettier-vscode`) — Ensures consistent styling; enable "Format on Save".
  - **GitLens** (`eamodio.gitlens`) — Supercharges the built-in Git capabilities.
  - **Supabase** (`supabase.supabase-vscode`) — Connects to your local database, manages types, and provides helpful snippets.
- **Workspace settings**: The repository includes a `.vscode/settings.json` file. VS Code will automatically use these settings, which configure the editor to use the workspace's version of TypeScript and enable format-on-save for supported files.
- **API Testing**: Use an API client like "Thunder Client" (VS Code extension) or Postman for testing endpoints.

## Productivity Tips
- **Terminal aliases**: Add shortcuts to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.) to speed up common commands:
  ```bash
  alias yi='yarn install'
  alias yb='yarn build'
  alias yt='yarn test'
  alias yd='yarn dev'
  alias ss='supabase start'
  ```
- **Local Supabase Stack**: The entire local backend (database, auth, etc.) is managed by the Supabase CLI.
  - Run `supabase start` from the root to spin up all services in Docker.
  - Once started, you can access the local Supabase Studio GUI at `http://localhost:54323` to manage your database, inspect tables, and view logs.
  - Run `supabase stop` to shut down the services.
- **Parallel Development**: Use Turborepo's filtering capabilities to work on a subset of the monorepo. For example, to run `dev` only for apps:
  ```bash
  yarn turbo run dev --filter=./apps/*
  ```
- **Local AI Emulators**: For development on AI-related features, run `yarn start:context` to emulate the `ai-context` scaffolding server locally.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Verify commands align with the latest scripts and build tooling.
2. Remove instructions for deprecated tools and add replacements.
3. Highlight automation that saves time during reviews or releases.
4. Cross-link to runbooks or README sections that provide deeper context.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Onboarding docs, internal wikis, and team retrospectives.
- Script directories, package manifests, CI configuration.
- Maintainer recommendations gathered during pairing or code reviews.

<!-- agent-update:end -->
