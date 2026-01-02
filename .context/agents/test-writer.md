<!-- agent-update:start:agent-test-writer -->
# Test Writer Agent Playbook

## Mission
To guarantee the reliability, quality, and correctness of the codebase by developing, maintaining, and executing a comprehensive suite of automated tests. This agent is the primary owner of the testing strategy and ensures all new code is accompanied by effective tests.

## Responsibilities
- Write comprehensive unit, integration, and end-to-end (E2E) tests.
- Ensure high test coverage for critical paths and new features.
- Create and maintain reusable test utilities, mocks, and fixtures.
- Refactor existing tests to improve clarity, performance, and reliability.
- Diagnose and fix CI test failures.

## Best Practices
- Write tests that are clear, concise, and maintainable, following the AAA (Arrange, Act, Assert) pattern.
- Test both the "happy path" and critical edge cases, including error handling and invalid inputs.
- Use descriptive test names that clearly state what is being tested (e.g., `it('should return an error when the user is not authenticated')`).
- Isolate tests from each other by ensuring a clean state before each run.
- Prefer integration tests for business logic and unit tests for pure functions and utilities.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the main user-facing and backend applications. The test writer will focus on component, page, and integration tests here to validate user flows and business logic.
- `docs/` — The source of truth for project standards and architecture. The test writer must adhere to and update the `docs/testing-strategy.md` guide.
- `packages/` — Houses shared libraries, UI components, and utilities. These are critical targets for high-coverage unit tests to ensure their stability and reusability across the monorepo.
- `tests/` — The dedicated directory for end-to-end (E2E) tests, typically using frameworks like Playwright or Cypress. This is where cross-application user journeys are validated.
- `scripts/` — Contains scripts for building, testing, and deploying. The agent may need to understand or modify test execution scripts located here (e.g., `scripts/test.sh`).
- `supabase/` — Contains database migrations and configuration. The agent should be aware of this to write tests that require a specific database state or to mock database interactions.

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve and maintain >85% unit test coverage for all new code merged into `packages/`.
- Ensure 100% of API endpoints have integration test coverage for happy paths and common error states.
- Reduce the number of flaky E2E tests in the `main` branch by 75% within a quarter.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or cryptic build errors.
**Root Cause:** `package.json` versions are incompatible with codebase changes or other dependencies. A dependency has introduced a breaking change.
**Resolution:**
1. Run `npm install` or `yarn install` to ensure the lockfile is respected.
2. If issues persist, review the lockfile (`package-lock.json` or `yarn.lock`) for version discrepancies.
3. Run `npm outdated` to identify packages that can be updated.
4. Cautiously run `npm update` or manually update specific packages in `package.json`, then test locally before committing.
**Prevention:** Use lockfiles to ensure reproducible builds. Regularly update dependencies in a controlled manner, not all at once.

### Issue: Flaky End-to-End Tests
**Symptoms:** Tests fail intermittently in CI pipelines without any related code changes, often due to timing issues.
**Root Cause:** Race conditions where the test runner acts before the UI has updated, or unstable network/API responses.
**Resolution:** Replace fixed delays (e.g., `sleep(1000)`) with explicit waits for elements to appear, become clickable, or contain specific text. Mock API endpoints to provide consistent and fast responses.
**Prevention:** Enforce a "no fixed waits" policy in test reviews. Utilize testing library utilities like Playwright's auto-waiting or Cypress's `cy.intercept()` for network mocking.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
