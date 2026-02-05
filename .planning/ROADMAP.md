# Roadmap: Obsidian Note Reviewer

## Overview

Build a visual markdown review tool with seamless Claude Code integration and real-time collaboration. The journey starts with authentication foundations, progresses through annotation systems and Claude Code integration (the key differentiator), adds collaboration and advanced features, and concludes with deployment, polish, and quality assurance.

**Brownfield context:** Existing codebase with TypeScript + React + Vite + Bun + Supabase. Building upon the working annotation system and visual reviewer, extending with multi-user capabilities, AI integration, and production readiness.

**Depth:** Comprehensive - 12 phases reflecting the 61 v1 requirements with natural delivery boundaries and parallel development opportunities.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Authentication** - Multi-user foundation for all collaborative features
- [ ] **Phase 2: Annotation System** - Core visual review and markdown rendering capabilities
- [ ] **Phase 3: Claude Code Integration** - Key differentiator: seamless AI-assisted review workflow
- [ ] **Phase 4: Advanced AI** - AI-suggested annotations, vault context understanding, summarization
- [ ] **Phase 5: Real-Time Collaboration** - Multi-user presence, cursors, and sharing capabilities
- [ ] **Phase 6: Multi-Document Review** - Tabbed interface for reviewing multiple plans simultaneously
- [ ] **Phase 7: Mobile Support** - Responsive design and breakpoint comparison features
- [ ] **Phase 8: Configuration System** - Apple-style settings page with user preferences
- [ ] **Phase 9: Sharing Infrastructure** - SEO-friendly slug-based URLs and guest access
- [ ] **Phase 10: Stripe Monetization** - Freemium model with lifetime subscriptions
- [ ] **Phase 11: Deployment** - Vercel deployment with custom domain configuration
- [ ] **Phase 12: Design System** - Minimalist Apple-style design with theming
- [ ] **Phase 13: Quality & Stability** - Production hardening, testing, and performance optimization

## Phase Details

### Phase 1: Authentication
**Goal**: Users can securely create accounts and authenticate, enabling all multi-user features
**Depends on**: Nothing (foundation phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can create account with email/password and login with email/senha or OAuth (GitHub/Google)
  2. User session persists across browser refresh without requiring re-login
  3. User can logout from any page and is redirected appropriately
  4. User profile displays with display name and avatar
**Plans**: TBD

Plans:
- [ ] 01-01: Implement Supabase Auth with email/password and OAuth providers
- [ ] 01-02: Build session management with JWT persistence
- [ ] 01-03: Create user profile system with display name and avatar

### Phase 2: Annotation System
**Goal**: Users can visually annotate markdown documents with threaded comments and status tracking
**Depends on**: Phase 1 (user authentication required for comment ownership)
**Requirements**: ANNO-01, ANNO-02, ANNO-03, ANNO-04, ANNO-05, ANNO-06, ANNO-07
**Success Criteria** (what must be TRUE):
  1. User can add visual annotations to specific markdown elements with clear visual markers
  2. User can create threaded comment discussions with @mentions and replies
  3. User can set annotation status (open/in-progress/resolved) with visual indicators
  4. User can view document version history and restore previous versions
  5. Markdown renders correctly with code blocks, images, and standard syntax
**Plans**: TBD

Plans:
- [ ] 02-01: Enhance existing annotation system with visual markers and element targeting
- [ ] 02-02: Build threaded comment system with @mentions and replies
- [ ] 02-03: Implement status tracking workflow (open/in-progress/resolved)
- [ ] 02-04: Create version history with diff viewing and restore capability
- [ ] 02-05: Verify markdown rendering supports standard syntax, code blocks, and images

### Phase 3: Claude Code Integration
**Goal**: Claude Code workflow seamlessly integrates with visual reviewer for AI-assisted plan review
**Depends on**: Phase 2 (annotation system provides substrate for AI feedback)
**Requirements**: CLAU-01, CLAU-02, CLAU-03, CLAU-04, CLAU-05, CLAU-06
**Success Criteria** (what must be TRUE):
  1. Creating a note in Obsidian automatically opens the reviewer (hook integration)
  2. Activating plan mode in Claude Code automatically opens the reviewer (hook integration)
  3. Annotations are sent back to Claude Code in structured format (edições, comentários globais/individuais, exclusões, marcações)
  4. Automatic prompt formats revisions for Claude Code with editable field for customization
  5. All annotation types are included in feedback: edits, global comments, individual comments, deletions, highlights
**Plans**: TBD

Plans:
- [ ] 03-01: Implement PostToolUse hook to trigger reviewer on Obsidian note creation
- [ ] 03-02: Implement plan mode hook to trigger reviewer from Claude Code
- [ ] 03-03: Build structured annotation export format for Claude Code
- [ ] 03-04: Create automatic prompt template with editable customization field
- [ ] 03-05: Ensure all annotation types (edits, comments, deletions, highlights) are captured and sent

### Phase 4: Advanced AI
**Goal**: AI proactively suggests annotations and understands Obsidian vault context for intelligent feedback
**Depends on**: Phase 3 (Claude Code integration provides AI capability foundation)
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. AI suggests annotations proactively by identifying potential issues in plans/docs
  2. AI understands Obsidian vault context including backlinks and graph relationships
  3. AI generates executive summaries from annotated documents that respect annotation context
**Plans**: TBD

Plans:
- [ ] 04-01: Implement AI-suggested annotations using LLM analysis
- [ ] 04-02: Build Obsidian vault context understanding (backlinks, graph, dataview)
- [ ] 04-03: Create AI-powered summarization that incorporates annotated content

### Phase 5: Real-Time Collaboration
**Goal**: Multiple users can collaborate on reviews with presence indicators and shared access
**Depends on**: Phase 1 (authentication), Phase 2 (annotation system)
**Requirements**: COLL-01, COLL-02, COLL-03, COLL-04, COLL-05
**Success Criteria** (what must be TRUE):
  1. User can see presence indicators showing who else is viewing the document
  2. User can see real-time cursors and avatars of active users in the document
  3. User can share review via friendly slug-based URL (e.g., r.alexdonega.com.br/plan/nome-do-plano)
  4. Guest users can view shared reviews without requiring login
  5. Native workflow with Obsidian vault allows local file access and preserves Obsidian links/graph
**Plans**: TBD

Plans:
- [ ] 05-01: Integrate Liveblocks for real-time presence and cursor tracking
- [ ] 05-02: Build shareable link system with unique slug generation and validation
- [ ] 05-03: Implement guest access for viewing reviews without authentication
- [ ] 05-04: Create Obsidian vault integration for local file access

### Phase 6: Multi-Document Review
**Goal**: Users can review multiple documents simultaneously with tabbed interface
**Depends on**: Phase 2 (annotation system works per-document)
**Requirements**: MULT-01, MULT-02, MULT-03
**Success Criteria** (what must be TRUE):
  1. User can open and view multiple documents simultaneously in tabbed interface
  2. User can navigate between documents using tabs without losing annotation state
  3. User can see cross-references and links between related documents
**Plans**: TBD

Plans:
- [ ] 06-01: Build tabbed interface for multiple document viewing
- [ ] 06-02: Implement annotation state persistence across tab switches
- [ ] 06-03: Create cross-reference visualization for linked documents

### Phase 7: Mobile Support
**Goal**: Interface works seamlessly on mobile devices with responsive design
**Depends on**: Nothing (can be developed in parallel)
**Requirements**: MOBL-01, MOBL-02
**Success Criteria** (what must be TRUE):
  1. Interface functions correctly on mobile devices with touch interactions
  2. User can compare views across mobile/tablet/desktop breakpoints (breakpoint comparison)
**Plans**: TBD

Plans:
- [ ] 07-01: Implement responsive design for mobile devices
- [ ] 07-02: Build breakpoint comparison tool for viewing across device sizes
- [ ] 07-03: Optimize touch interactions for mobile annotation workflow

### Phase 8: Configuration System
**Goal**: Users can customize preferences through Apple-style settings page
**Depends on**: Phase 1 (user authentication for per-user settings)
**Requirements**: CONF-01, CONF-02, CONF-03, CONF-04
**Success Criteria** (what must be TRUE):
  1. User can access settings page with modern Apple-style design
  2. User can configure theme preference (dark/light mode automatic)
  3. User can configure save location preference (Obsidian vault, cloud, or both)
  4. User can customize Claude Code integration prompt template
**Plans**: TBD

Plans:
- [ ] 08-01: Design and build Apple-style settings page UI
- [ ] 08-02: Implement theme configuration with automatic dark/light mode switching
- [ ] 08-03: Create save location preference system (vault/cloud/both)
- [ ] 08-04: Build customizable prompt template editor for Claude Code integration

### Phase 9: Sharing Infrastructure
**Goal**: SEO-friendly URLs with multi-user collaboration on shared plans
**Depends on**: Phase 5 (real-time collaboration foundation)
**Requirements**: SHAR-01, SHAR-02, SHAR-03
**Success Criteria** (what must be TRUE):
  1. Shared reviews use friendly slug-based URLs (r.alexdonega.com.br/plan/nome-do-plano)
  2. Slugs are unique, validated, and conflict-free
  3. Multiple users can view and annotate shared plans collaboratively
**Plans**: TBD

Plans:
- [ ] 09-01: Implement slug-based URL routing with validation
- [ ] 09-02: Build multi-user annotation system for shared plans
- [ ] 09-03: Create permission system for shared plan access

### Phase 10: Stripe Monetization
**Goal**: Freemium model with Stripe payments for premium features and lifetime subscriptions
**Depends on**: Phase 1 (authentication), Phase 5 (multi-user collaboration)
**Requirements**: MONY-01, MONY-02, MONY-03, MONY-04, MONY-05, MONY-06
**Success Criteria** (what must be TRUE):
  1. Free tier limits usage to individual (no collaborators)
  2. Paid tier enables unlimited collaborators with subscription billing
  3. Stripe checkout process processes payments correctly
  4. Lifetime subscription option available as one-time purchase
  5. Stripe webhooks are verified with signature validation for security
**Plans**: TBD

Plans:
- [ ] 10-01: Implement freemium tier system with collaborator limits
- [ ] 10-02: Integrate Stripe checkout for subscription payments
- [ ] 10-03: Build lifetime subscription option with one-time payment
- [ ] 10-04: Create Stripe webhook endpoints with signature verification
- [ ] 10-05: Implement subscription state management in Supabase

### Phase 11: Deployment
**Goal**: Application deployed to Vercel with custom domain and production environment
**Depends on**: All feature phases complete (1-10)
**Requirements**: DEPL-01, DEPL-02, DEPL-03, DEPL-04
**Success Criteria** (what must be TRUE):
  1. Application deploys successfully to Vercel from Git repository
  2. Custom domain r.alexdonega.com.br is configured and accessible
  3. DNS records point r subdomain to Vercel correctly
  4. Environment variables are configured for production with proper secrets management
**Plans**: TBD

Plans:
- [ ] 11-01: Configure Vercel project with GitHub integration
- [ ] 11-02: Set up custom domain r.alexdonega.com.br in Vercel
- [ ] 11-03: Configure DNS A records to point r subdomain to Vercel
- [ ] 11-04: Set up production environment variables in Vercel

### Phase 12: Design System
**Goal**: Minimalist Apple-style design with theming and personalized colors
**Depends on**: Nothing (can be developed in parallel with other phases)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. Interface exhibits minimalist Apple/macOS-style design aesthetic
  2. Theme system supports automatic dark/light mode switching
  3. User can customize accent colors for personalization
  4. UX is optimized for usability with intuitive navigation and interactions
**Plans**: TBD

Plans:
- [ ] 12-01: Design and implement Apple-style design system components
- [ ] 12-02: Build theme system with automatic dark/light mode
- [ ] 12-03: Create color customization system for user personalization
- [ ] 12-04: Conduct UX audit and optimize usability across all interfaces

### Phase 13: Quality & Stability
**Goal**: Production-ready application with robust error handling, logging, testing, and performance
**Depends on**: All feature phases complete (1-12)
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06
**Success Criteria** (what must be TRUE):
  1. No console.log statements remain in production code
  2. Pino logging system configured appropriately for production
  3. Errors are handled gracefully with user-friendly error messages
  4. Undo/redo system works for all annotation operations
  5. Automated tests cover critical features
  6. Application performs without memory leaks and optimized load times
**Plans**: TBD

Plans:
- [ ] 13-01: Remove all console.log statements and configure Pino logging
- [ ] 13-02: Implement robust error handling with user-friendly messages
- [ ] 13-03: Build undo/redo system for annotation operations
- [ ] 13-04: Create automated test suite for critical features
- [ ] 13-05: Conduct performance audit and fix memory leaks
- [ ] 13-06: Separate hardcoded Portuguese strings into i18n system

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12 -> 13

Note: Some phases can be developed in parallel due to minimal dependencies:
- Phase 7 (Mobile) can parallel with any phase
- Phase 12 (Design) can parallel with any phase
- Phase 6 (Multi-Document) can parallel with Phases 4, 5
- Phase 8 (Config) can parallel with Phases 3, 4, 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication | 0/3 | Not started | - |
| 2. Annotation System | 0/5 | Not started | - |
| 3. Claude Code Integration | 0/5 | Not started | - |
| 4. Advanced AI | 0/3 | Not started | - |
| 5. Real-Time Collaboration | 0/4 | Not started | - |
| 6. Multi-Document Review | 0/3 | Not started | - |
| 7. Mobile Support | 0/3 | Not started | - |
| 8. Configuration System | 0/4 | Not started | - |
| 9. Sharing Infrastructure | 0/3 | Not started | - |
| 10. Stripe Monetization | 0/5 | Not started | - |
| 11. Deployment | 0/4 | Not started | - |
| 12. Design System | 0/4 | Not started | - |
| 13. Quality & Stability | 0/6 | Not started | - |

## Coverage Summary

**Total v1 Requirements:** 61
**Phases:** 13
**Requirements per Phase:**
- Phase 1 (Authentication): 5 requirements
- Phase 2 (Annotation System): 7 requirements
- Phase 3 (Claude Code Integration): 6 requirements
- Phase 4 (Advanced AI): 3 requirements
- Phase 5 (Real-Time Collaboration): 5 requirements
- Phase 6 (Multi-Document Review): 3 requirements
- Phase 7 (Mobile Support): 2 requirements
- Phase 8 (Configuration System): 4 requirements
- Phase 9 (Sharing Infrastructure): 3 requirements
- Phase 10 (Stripe Monetization): 6 requirements
- Phase 11 (Deployment): 4 requirements
- Phase 12 (Design System): 4 requirements
- Phase 13 (Quality & Stability): 6 requirements

**Coverage:** 61/61 requirements mapped (100%)
