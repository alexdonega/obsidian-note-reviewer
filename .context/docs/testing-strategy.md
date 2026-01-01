<!-- agent-update:start:testing-strategy -->
# Testing Strategy

Document how quality is maintained across the codebase.

## Test Types
- **Unit**: Unit tests focus on individual functions, components, and modules in isolation. We use Jest as the primary framework, configured via `packages/*/jest.config.js` for monorepo support. Tests are colocated with source files (e.g., `component.test.ts` next to `component.ts`) or in `__tests__` directories. Mocking is handled with Jest's built-in utilities or libraries like `msw` for API simulations.
- **Integration**: Integration tests verify interactions between modules, such as API endpoints with database mocks or component integrations in React apps. Scenarios include service layer tests with in-memory databases (e.g., SQLite via `jest-mock-extended`). Tooling includes Jest with Supertest for HTTP integrations and Vitest for faster package-specific runs where applicable.
- **End-to-end**: E2E tests simulate real user workflows across the full stack, using Playwright for browser automation. Harnesses are set up in `apps/*/e2e/` with dedicated environments (e.g., local Docker Compose for backend services). Tests run against staging-like setups, covering critical paths like user authentication and data flows.

## Running Tests
- Execute all tests with `npm run test` (runs Jest in the root, respecting monorepo workspaces).
- Use watch mode locally: `npm run test -- --watch` for interactive development.
- Add coverage runs before releases: `npm run test -- --coverage`, which generates reports in `coverage/` and enforces thresholds via `--coverageThreshold`.
- For specific packages: `npm run test --workspace=packages/core`.
- E2E tests: `npm run test:e2e` launches Playwright in headed mode; use `npm run test:e2e:ci` for headless CI runs.

## Quality Gates
- Minimum coverage: 80% for unit tests (branch and statement), 70% for integration; enforced in CI via Jest config and GitHub Actions.
- Linting: Prettier for formatting (enforced via `npm run format:check`) and ESLint for code quality (rules from `@typescript-eslint` and custom configs in `.eslintrc.js`), run as `npm run lint` before merges.
- Required checks: All PRs must pass "Test Suite", "Lint & Format", and "Build" jobs in GitHub Actions. Security scans via `npm audit` are also gated.

## Troubleshooting
- **Flaky suites**: Occasional timeouts in E2E tests due to network variability in CI; mitigated by retries (Playwright config: `retries: 2`) and isolated Docker environments. See [Issue #45](https://github.com/repo/issues/45) for ongoing network stability improvements.
- **Long-running tests**: Integration tests with real DB setups can exceed 5 minutes; parallelize with Jest's `--runInBand` disabled and use `testTimeout: 30000` where needed.
- **Environment quirks**: Ensure Node.js 18+ and Yarn 1.x for consistent monorepo resolution. If mocks fail, clear `node_modules` and run `yarn install --check-files`.

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
