<!-- agent-update:start:tooling -->
# Tooling & Productivity Guide

Collect the scripts, automation, and editor settings that keep contributors efficient.

## Required Tooling
- **Node.js** — Install via [nvm](https://github.com/nvm-sh/nvm) (recommended for version management). Requires version 18.x or higher. Powers the runtime for all apps, packages, and scripts in the monorepo.
- **Yarn** — Install via `npm install -g yarn` or through nvm. Requires version 3.x (Berry) for workspace support. Manages dependencies across packages and apps; run `yarn install` at the root.
- **Git** — Standard installation (e.g., via Homebrew on macOS: `brew install git`). Requires version 2.30 or higher. Essential for version control; configure with `git config --global user.name` and `user.email`.
- **Docker** — Install from [official docs](https://docs.docker.com/get-docker/). Version 20+ recommended. Used for containerized environments in local development and CI/CD pipelines.

## Recommended Automation
- **Pre-commit hooks**: Use Husky and lint-staged (configured in `package.json`). Install with `yarn install` to enable. Runs ESLint, Prettier formatting, and type checks before commits to maintain code quality.
- **Linting and formatting**: `yarn lint` (ESLint for JS/TS) and `yarn format` (Prettier). Integrate with VS Code for auto-formatting on save.
- **Code generators and scaffolding**: Leverage scripts in the `scripts/` directory, such as `yarn scaffold agent` for generating new agent playbooks. Use `tsc --watch` for TypeScript compilation during development.
- **Build and test automation**: `yarn build` for full monorepo builds (via Turborepo if configured) and `yarn test` for Jest/Vitest suites. Watch mode: `yarn dev` for hot-reloading in apps.

## IDE / Editor Setup
- **VS Code extensions**:
  - ESLint (dbaeumer.vscode-eslint) — Catches linting errors in real-time.
  - Prettier - Code formatter (esbenp.prettier-vscode) — Ensures consistent styling; enable "Format on Save".
  - TypeScript Importer (pmneo.tsimporter) — Quick imports for TS/JS modules.
  - GitLens (eamodio.gitlens) — Enhanced Git blame and history views.
- **Workspace settings**: Copy `.vscode/settings.json` from the repo root to your project for shared configurations like TypeScript paths and editor formatting rules.
- **Snippets**: Use built-in VS Code snippets for React/TS components, or install "Thunder Client" for API testing directly in the editor.

## Productivity Tips
- **Terminal aliases**: Add to `~/.zshrc` or `~/.bashrc`: `alias yi='yarn install'`, `alias yb='yarn build'`, `alias yt='yarn test'`. For monorepo navigation: `alias apps='cd apps && ls'`.
- **Container workflows**: Use `docker-compose up` (from `docker-compose.yml` in root) to spin up local services mirroring production, including databases for app testing.
- **Local emulators**: For AI-related tooling, run `yarn start:context` to emulate the ai-context scaffolding server. Share dotfiles via the `references/dotfiles/` directory for team consistency.
- **Shortcuts for loops**: Use `yarn turbo run dev --filter=apps/*` for parallel development across apps. Integrate with tmux for multi-pane terminal sessions during reviews.

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
