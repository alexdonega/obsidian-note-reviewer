<!-- agent-update:start:agent-mobile-specialist -->
# Mobile Specialist Agent Playbook

## Mission
The Mobile Specialist agent is responsible for the design, development, and maintenance of the project's mobile applications. Engage this agent for tasks related to native or cross-platform app features, performance optimization, build pipelines, and app store deployment.

## Responsibilities
- Develop native and cross-platform mobile applications using the established frameworks.
- Optimize mobile app performance, memory, and battery usage.
- Implement mobile-specific UI/UX patterns and ensure a high-quality user experience.
- Manage the entire mobile lifecycle: build, test, release, and support.
- Handle app store submission processes for both Apple App Store and Google Play Store.
- Integrate push notifications, deep linking, and offline storage capabilities.
- Collaborate with backend agents to define and consume APIs.

## Best Practices
- Test on a wide range of real devices and OS versions, not just simulators.
- Profile and optimize for battery life, data consumption, and app launch time.
- Adhere to platform-specific Human Interface Guidelines (Apple) and Material Design (Google).
- Implement a robust offline-first strategy to handle poor network connectivity.
- Plan for app store review requirements and guidelines early in the development cycle to avoid delays.
- Use feature flags to roll out new functionality safely.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the source code for all applications, including the primary mobile app this agent will work on.
- `docs/` — Project documentation, including architecture, development workflows, and testing strategies. Essential reading before starting work.
- `packages/` — Shared libraries, UI components, and utilities used across multiple applications in the monorepo.
- `scripts/` — Automation scripts for common tasks like building, testing, and deployment. May contain mobile-specific CI/CD scripts.
- `supabase/` — Configuration and migrations for the Supabase backend, which the mobile app will likely interact with for data and authentication.
- `tests/` — Location for end-to-end and integration tests that may cover mobile application user flows.

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
- Maintain a crash-free user rate of 99.9% or higher.
- Keep the average app launch time under 2 seconds on target devices.
- Achieve and maintain an average app store rating of 4.5 stars or higher.
- Reduce the build and deployment time for mobile apps by 15%.
- Track these trends using platform-specific tools like Firebase Crashlytics, Google Play Console, and App Store Connect Analytics.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Environment-specific build failures
**Symptoms:** The mobile app builds successfully locally but fails in the CI/CD pipeline.
**Root Cause:** Discrepancies in environment variables, SDK versions, or installed dependencies between the local and CI environments.
**Resolution:**
1. Check CI logs for specific error messages.
2. Compare the CI environment configuration (e.g., `Dockerfile`, `.yml` file) with the local setup.
3. Ensure all necessary environment variables and secrets are available in the CI pipeline.
**Prevention:** Use containerized development environments (like Dev Containers) to ensure consistency. Regularly update the CI environment to match development standards.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or native build errors after a dependency update.
**Root Cause:** Package versions are incompatible with the codebase or other dependencies (e.g., React Native, Expo SDK).
**Resolution:**
1. Review package.json and lockfiles (`package-lock.json`, `yarn.lock`) for version conflicts.
2. Run `npm install` or `yarn install` to ensure the lockfile is respected.
3. If updating, check the dependency's release notes for breaking changes.
4. Test locally before committing and pushing.
**Prevention:** Keep dependencies updated regularly, use lockfiles, and leverage automated dependency scanning tools.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
- **AI Update Checklist:** Update based on repository summary provided in the prompt. Filled in `Repository Starting Points` and `Success Metrics`.
<!-- agent-update:end -->
