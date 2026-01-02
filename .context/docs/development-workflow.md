<!-- agent-update:start:development-workflow -->
# Development Workflow

This document outlines the day-to-day engineering process for contributing to this monorepo. Following these guidelines ensures consistency, quality, and a smooth collaboration process.

## Branching & Releases

This repository uses a **Trunk-Based Development** model. The `main` branch is the single source of truth and should always be in a deployable state.

-   **Branching:** All new work must be done on a feature branch created from `main`.
    -   Use a descriptive naming convention: `feature/<ticket-id>-short-description`, `fix/<ticket-id>-bug-fix`, or `chore/refactor-component`.
    -   Branches should be short-lived and focused on a single, discrete task.
-   **Pull Requests (PRs):** Changes are merged into `main` via Pull Requests. See the Code Review section for expectations.
-   **Releases:** Releases are created by tagging a commit on the `main` branch. We use semantic versioning (`vX.Y.Z`).

## Local Development

This is a monorepo managed by npm workspaces. All commands should be run from the root of the repository unless otherwise specified.

-   **Install dependencies:**
    ```bash
    npm install
    ```
-   **Run all apps and packages in development mode:**
    ```bash
    npm run dev
    ```
    *To run a specific app or package, use the `--filter` flag (powered by Turborepo):*
    ```bash
    npm run dev -- --filter=<package-name>
    ```
-   **Run tests:**
    ```bash
    npm test
    ```
-   **Build all packages for distribution:**
    ```bash
    npm run build
    ```
-   **Linting and Formatting:**
    ```bash
    npm run lint
    ```

## Code Review Expectations

A thorough code review process is critical for maintaining code quality and stability.

-   **PR Checklist:**
    -   Create a PR with a clear, descriptive title and a body that explains the "what" and "why" of the change. Link to any relevant issues.
    -   Ensure all automated CI checks (linting, tests, builds) are passing.
    -   Request a review from at least one core maintainer.
    -   Address all feedback and ensure the PR is approved before merging.
-   **AI Collaboration:** For guidelines on how to collaborate effectively with AI assistants during development and review, please reference our [agent collaboration guide](../../AGENTS.md).

## Onboarding Tasks

Welcome to the team! Here’s how to get started:

-   **Read the Docs:** Begin by reading the guides in the `/docs` directory to understand the project's architecture, goals, and key components.
-   **First Issues:** The best way to get familiar with the codebase is to pick up a small, well-defined task. Look for issues on our project board tagged with `good first issue` or `help wanted`.
-   **Access:** For access to internal runbooks, monitoring dashboards, or other team resources, please consult the team's shared documentation portal.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirm branching/release steps with CI configuration and recent tags.
2. Verify local commands against `package.json`; ensure flags and scripts still exist.
3. Capture review requirements (approvers, checks) from contributing docs or repository settings.
4. Refresh onboarding links (boards, dashboards) to their latest URLs.
5. Highlight any manual steps that should become automation follow-ups.

<!-- agent-readonly:sources -->
## Acceptable Sources
- CONTRIBUTING guidelines and `AGENTS.md`.
- Build pipelines, branch protection rules, or release scripts.
- Issue tracker boards used for onboarding or triage.

<!-- agent-update:end -->
