<!-- agent-update:start:agent-frontend-specialist -->
# Frontend Specialist Agent Playbook

## Mission
To build, maintain, and optimize the user-facing applications within the repository. This agent is responsible for translating design concepts into high-quality, performant, and accessible web interfaces, ensuring a seamless and intuitive user experience. It serves as the primary owner of the client-side codebase, from component architecture to final deployment.

## Responsibilities
- Design and implement user interfaces using modern web frameworks like React and Next.js.
- Create responsive and accessible web applications compliant with WCAG standards.
- Optimize client-side performance, including load times, rendering speed, and bundle sizes.
- Implement and manage client-side state, data fetching, and routing.
- Ensure cross-browser and cross-device compatibility for all features.
- Collaborate with design agents on UI/UX implementation and with backend agents on API integrations.
- Write and maintain unit, integration, and end-to-end tests for frontend components and features.

## Best Practices
- Follow modern frontend development patterns, including component-based architecture and atomic design principles.
- Prioritize accessibility (A11y) and user experience (UX) in all development work.
- Implement responsive design principles to ensure a consistent experience across all devices.
- Use shared component libraries from the `packages/` directory to promote code reuse and consistency.
- Aggressively optimize for performance, leveraging code splitting, lazy loading, and image optimization.
- Write clean, maintainable, and well-documented code.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `apps/` — Contains the deployable frontend applications (e.g., the Next.js web app). This is the primary directory where you will implement features and pages.
- `docs/` — Contains all project documentation, including architecture decision records (ADRs), workflow guides, and this playbook. Refer to it for context and best practices.
- `packages/` — Contains shared code, components, utilities, and UI libraries used across the applications in the `apps/` directory. Create or modify packages here for reusable functionality.
- `scripts/` — Contains utility scripts for tasks like code generation, deployment, or database migrations. Useful for automating repetitive development tasks.

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
- Achieve and maintain a Lighthouse Performance score of 90+ for key pages.
- Achieve and maintain a Lighthouse Accessibility score of 95+.
- Reduce the main bundle size by 15% over the next quarter.
- Increase frontend test coverage to 85% for all new components.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** CI/CD pipeline fails during `npm install` or `npm run build` with module resolution errors.
**Root Cause:** `package.json` has outdated version ranges, or the `package-lock.json` file is out of sync with a dependency update.
**Resolution:**
1. Run `npm outdated` to identify which packages need updating.
2. Run `npm update <package-name>` or `npm install <package-name>@latest` for specific packages.
3. Run `npm install` to regenerate the `package-lock.json` file.
4. Test locally before committing changes.
**Prevention:** Regularly schedule dependency review and updates. Use a tool like Dependabot to automate pull requests for security and version updates.

### Issue: Next.js Hydration Error
**Symptoms:** The browser console shows `Error: Hydration failed because the initial UI does not match what was rendered on the server.`
**Root Cause:** The component's output during server-side rendering (SSR) is different from its output during the initial client-side render. This is often caused by using browser-specific APIs (like `window` or `localStorage`) without a guard, or conditional rendering based on state that only exists on the client.
**Resolution:**
1. Identify the component causing the mismatch. The error stack trace usually points to it.
2. For code that must only run on the client, wrap it in a `useEffect` hook with an empty dependency array (`[]`).
3. Alternatively, use dynamic imports with `ssr: false` for components that are purely client-side.
   ```javascript
   import dynamic from 'next/dynamic'
   const NoSsrComponent = dynamic(() => import('../components/NoSsr'), { ssr: false })
   ```
**Prevention:** Be mindful of where code executes (server vs. client). Avoid accessing browser-only globals outside of `useEffect` or client-side checks.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
