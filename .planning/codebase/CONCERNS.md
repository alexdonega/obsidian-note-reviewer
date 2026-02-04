# Codebase Concerns

**Analysis Date:** 2026-02-04

## Tech Debt

**Large Component Files:**
- Issue: `packages/ui/components/Viewer.tsx` (1,449 lines) violates single responsibility principle
- Files: `packages/ui/components/Viewer.tsx`, `packages/ui/components/AnnotationPanel.tsx`
- Impact: Difficult to maintain, test, and understand
- Fix approach: Split into smaller focused components (Viewer, Toolbar, AnnotationRenderer, etc.)

**Mixed Language UI Text:**
- Issue: Portuguese and English mixed throughout UI components
- Files: `packages/ui/components/DecisionBar.tsx`, `packages/ui/components/ConfigEditor.tsx`
- Impact: Inconsistent user experience, maintenance difficulty
- Fix approach: Create i18n system with proper language separation

**Console Logging in Production:**
- Issue: Development console logs remain in server code
- Files: `apps/hook/server/index.ts`, `packages/ui/components/ConfigEditor.tsx`, `packages/ui/components/Viewer.tsx`
- Impact: Performance impact, information leakage
- Fix approach: Replace with proper logging framework with environment-based levels

## Known Bugs

**Character Encoding Issues:**
- Issue: Portuguese UI text shows encoding errors in some components
- Files: `packages/ui/components/DecisionBar.tsx`, `packages/ui/components/ConfigEditor.tsx`
- Symptoms: Accented characters display as � or boxes
- Trigger: Certain character combinations in markdown content
- Workaround: Force UTF-8 encoding in all text rendering

**Path Traversal Vulnerability (FIXED):**
- Issue: Previously vulnerable to CWE-22 attacks via `/api/save` endpoint
- Files: `apps/hook/server/index.ts`, `apps/hook/server/pathValidation.ts`
- Trigger: Malicious file paths with `../` sequences
- Mitigation: Comprehensive path validation implemented

## Security Considerations

**XSS Prevention:**
- Risk: SVG rendering via `dangerouslySetInnerHTML` in Viewer component
- Files: `packages/ui/components/Viewer.tsx`, `packages/ui/utils/sanitize.ts`
- Current mitigation: DOMPurify sanitization with strict SVG configuration
- Recommendations: Regular security audits, CSP headers implementation

**Cookie Security:**
- Risk: Missing security flags on cookies
- Files: `packages/ui/utils/storage.ts`
- Current mitigation: Uses SameSite=Lax
- Recommendations: Add Secure flag for HTTPS, consider HttpOnly for sensitive data

**CORS Configuration:**
- Risk: Overly permissive CORS settings noted in security specs
- Files: `apps/portal/utils/cors.ts`
- Current mitigation: Basic CORS configuration
- Recommendations: Implement origin whitelisting, restrict allowed methods

## Performance Bottlenecks

**Large Component Re-renders:**
- Problem: `Viewer.tsx` re-renders entire note on small changes
- Files: `packages/ui/components/Viewer.tsx`
- Cause: React.memo not consistently applied
- Improvement path: Implement granular memoization, virtual scrolling for large notes

**Resource Loading:**
- Problem: Multiple redundant HTTP requests for same resources
- Files: `packages/ui/lib/offline-sync.ts`
- Cause: No effective caching strategy
- Improvement path: Implement service workers, cache invalidation

**Memory Usage:**
- Problem: Large notes consume excessive memory
- Files: `packages/ui/components/Viewer.tsx`, `packages/ui/lib/offline-sync.ts`
- Cause: Loading entire content into memory
- Improvement path: Stream processing, pagination for large documents

## Fragile Areas

**Annotation System:**
- Files: `packages/ui/components/AnnotationPanel.tsx`, `packages/ui/types/annotation.ts`
- Why fragile: Tightly coupled to markdown parsing logic
- Safe modification: Extract annotation processing to service layer
- Test coverage: Limited unit tests for edge cases

**File Path Handling:**
- Files: `apps/hook/server/pathValidation.ts`, `apps/hook/server/index.ts`
- Why fragile: Multiple OS path formats (Windows/Unix)
- Safe modification: Use path library consistently, test all scenarios
- Test coverage: Comprehensive test suite exists

**Localization:**
- Files: All UI components with hardcoded strings
- Why fragile: Manual string management prone to errors
- Safe modification: Implement i18n framework before adding new languages
- Test coverage: No automated testing for translations

## Scaling Limits

**Concurrent User Support:**
- Current capacity: Single-user design
- Limit: No session management, conflicts possible
- Scaling path: Implement user sessions, optimistic locking

**File Size Limits:**
- Current capacity: Tested up to 100KB notes
- Limit: Memory issues with larger files
- Scaling path: Streaming processing, background processing

**Annotation Storage:**
- Current capacity: In-memory only
- Limit: Data loss on refresh
- Scaling path: Backend database, offline synchronization

## Dependencies at Risk

**Highlight.js:**
- Risk: Outdated version, known vulnerabilities
- Impact: Syntax highlighting security issues
- Migration plan: Upgrade to newer version or switch to Prism.js

**Mermaid:**
- Risk: Version conflicts, security updates needed
- Impact: Diagram rendering failures
- Migration plan: Regular updates, CDN fallback

**Bun.js:**
- Risk: Less tested than Node.js
- Impact: Potential runtime issues
- Migration plan: Consider Node.js fallback for production

## Missing Critical Features

**Undo/Redo System:**
- Problem: No history management for annotations
- Blocks: Complex annotation editing workflows
- Priority: High

**Collaborative Editing:**
- Problem: No real-time collaboration
- Blocks: Team-based workflows
- Priority: Medium

**Export Formats:**
- Problem: Limited export options (JSON only)
- Blocks: Integration with other tools
- Priority: Low

## Test Coverage Gaps

**Edge Case Testing:**
- What's not tested: Malformed markdown, special characters
- Files: `packages/ui/components/Viewer.tsx`
- Risk: Rendering errors, crashes
- Priority: High

**Security Testing:**
- What's not tested: XSS attempts, path traversal
- Files: `apps/hook/server/index.ts`
- Risk: Vulnerability exploitation
- Priority: Critical

**Performance Testing:**
- What's not tested: Large file handling, concurrent operations
- Files: `packages/ui/components/Viewer.tsx`
- Risk: Performance degradation
- Priority: Medium

---

*Concerns audit: 2026-02-04*