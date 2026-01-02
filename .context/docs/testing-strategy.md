<!-- agent-update:start:testing-strategy -->
# Testing Strategy

This document outlines the testing strategy for the monorepo, ensuring code quality, stability, and correctness across all applications and packages. Our approach is layered to catch issues at the most appropriate and efficient stage of development.

## Test Types
- **Unit**: Unit tests focus on individual functions, components, and modules in isolation. We use **Jest** as the primary framework, configured for monorepo support in the root `jest.config.js`. Tests are colocated with source files (e.g., `component.test.ts` next to `component.ts`). Mocking is handled with Jest's built-in utilities and **`msw`** for simulating third-party API responses.
- **Integration**: Integration tests verify interactions between different modules, services, and our backend (**Supabase**). We use a local, Docker-based Supabase environment for testing against a realistic database and auth setup, managed via the Supabase CLI (`supabase start`). Tests use Jest and **Supertest** to validate API endpoint behavior from the service layer down to the database.
- **End-to-end (E2E)**: E2E tests simulate real user workflows using **Playwright**. These tests run against a fully self-contained environment spun up via Docker Compose, including the frontend applications and a local Supabase stack. This ensures high-fidelity testing of critical user paths like authentication, data creation, and core feature interactions. E2E test suites are located in `tests/e2e/`.

## Running Tests
To ensure a consistent testing environment, first ensure the local Supabase stack is running for any tests that require it: `supabase start`.

- **Run all tests**: `npm test` runs all Jest unit and integration tests across all workspaces.
- **Watch mode for development**: `npm test -- --watch` reruns tests on file changes.
- **Run with coverage**: `npm test -- --coverage` generates a coverage report in the `coverage/` directory and enforces thresholds.
- **Run tests for a specific package**: `npm test -w <package-name>` (e.g., `npm test -w @scope/core`).
- **Run E2E tests (UI Mode)**: `npm run test:e2e` launches Playwright in UI mode for local development and debugging.
- **Run E2E tests (Headless/CI)**: `npm run test:e2e:ci` runs the full E2E suite in a headless browser, as it would in the CI pipeline.

## Quality Gates
All pull requests are gated by the following required checks in our GitHub Actions CI pipeline:

- **Static Analysis**: Code must pass linting and formatting checks.
  - `npm run lint`: Runs ESLint for code quality and best practices.
  - `npm run format:check`: Runs Prettier to ensure consistent code style.
- **Type Checking**: `npm run type-check` verifies TypeScript types across the entire repository (`tsc --noEmit`).
- **Unit & Integration Tests**: The `unit-and-integration-tests` job must pass, running the full Jest suite and meeting coverage requirements.
  - **Minimum Coverage**: 80% for unit tests, 70% for integration tests (branch and statement).
- **E2E Tests**: The `e2e-tests` job must pass, validating critical user flows.
- **Build**: The `build` job must successfully compile all apps and packages.
- **Security**: The `security` job runs `npm audit --audit-level=high` to check for critical vulnerabilities in dependencies.

## Troubleshooting
- **Flaky E2E Tests**: E2E tests can occasionally fail in CI due to network timing or async operations. Our Playwright configuration includes a retry mechanism (`retries: 2` in CI) to mitigate this. Persistent flakiness should be investigated and fixed, not ignored. See [Issue #45](https://github.com/repo/issues/45) for tracking stability improvements.
- **Slow Test Suites**: Integration and E2E tests can be slow due to the overhead of starting Docker containers for Supabase. To speed up local development, run tests against an already-running stack (`supabase start`). In CI, test suites are parallelized by default using Jest workers.
- **Environment Mismatches**: Ensure you are using the Node.js version specified in `.nvmrc` (e.g., Node.js 20.x) and a recent version of `npm` (v9+). If you encounter strange dependency or module resolution errors, a clean install often helps: `rm -rf node_modules && npm install`.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review test scripts and CI workflows to confirm command accuracy.
2. Update Quality Gates with current thresholds (coverage %, lint rules, required checks).
3. Document new test categories or suites introduced since the last update.
4. Record known flaky areas and link to open issues for visibility.
5. Confirm troubleshooting steps remain valid with current tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- `package.json` scripts and testing configuration files.
- CI job definitions (GitHub Actions, CircleCI, etc.).
- Issue tracker items labelled “testing” or “flaky” with maintainer confirmation.

<!-- agent-update:end -->
