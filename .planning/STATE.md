# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-02-04)

**Core value:** Usuários podem revisar visualmente notas e planos, com integração perfeita com Claude Code e colaboração em tempo real.
**Current focus:** Phase 2 - Annotation System

## Current Position

Phase: 2 of 13 (Annotation System)
Plan: 3 of 5 in current phase
Status: In progress
Last activity: 2026-02-05 — Completed Plan 02-03: Implement Status Tracking Workflow

Progress: [█████████░░] 47%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 6 min
- Total execution time: 0.8 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01    | 6     | 6     | 7 min    |
| 02    | 2     | 5     | 3 min    |

**Recent Trend:**
- Last 5 plans: 01-02 (7 min), 01-03 (8 min), 01-04 (3 min), 01-05 (8 min), 02-03 (3 min)
- Trend: Fast execution, clean build

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**From 01-01 (Vite SPA Auth Infrastructure):**
- Use @supabase/supabase-js browser client (NOT @supabase/ssr for Next.js)
- Session persisted in localStorage (not httpOnly cookies - SPA pattern)
- Vite env var convention (VITE_* prefix) instead of Next.js (NEXT_PUBLIC_*)
- Auth utilities placed in Security package per existing architecture
- AuthProvider wraps entire Portal app for global auth context

**From 01-02 (Session Management):**
- Window focus listener refreshes session when user returns to tab
- Periodic session refresh every 15 minutes (Supabase tokens last 1 hour)
- Session utilities provide proactive expiry warnings and validation
- Debug hooks verify localStorage persistence works correctly

**From 01-03 (Auth UI):**
- Split-screen layout: branding left, form right (hidden on mobile)
- Google is primary OAuth provider (button appears first)
- OAuth button text: "Entrar com Google" and "Entrar com GitHub"
- Dedicated auth pages at /auth/login and /auth/signup (not modals)
- Toggle between login/signup via links ("Não tem conta? Cadastre-se" / "Já tem conta? Faça login")
- ProtectedRoute wrapper redirects unauthenticated users to /auth/login
- PublicRoute wrapper redirects authenticated users to /dashboard
- Inline error display (not toast notifications) for simpler SPA UX

**From 01-04 (Password Reset and Enhanced OAuth):**
- New vs returning user detection via created_at timestamp (< 5 seconds = new user)
- New users after OAuth redirect to /welcome, returning users to /dashboard
- Dynamic origin for redirect URLs (window.location.origin) to avoid hardcoding issues
- Password reset uses two-page flow: forgot-password → reset-password
- Token validation runs on mount with loading state
- All auth forms use react-router-dom Link for client-side navigation
- Password minimum 6 characters enforced on reset page

**From 01-05 (Welcome/Onboarding with Avatar Upload):**
- Display name is REQUIRED field (validated before submission)
- Skip button available per locked decision (users can complete profile later)
- Returning users skip onboarding (check full_name in metadata, redirect to dashboard)
- Supabase Storage for avatars instead of Gravatar (user-controlled, privacy-friendly)
- User-isolated folders for storage (userId/fileName pattern)
- Avatar URL stored in user_metadata.avatar_url for quick access
- Onboarding detection via metadata check (full_name presence)

**From 02-01 (Enhance Annotation System with Visual Markers):**
- Placed annotation components in packages/ui instead of separate annotation package (consistency with existing structure)
- Extended Annotation interface with visual metadata (markerColor, markerPosition, isHighlighted, targetSelector)
- Marker style determined by AnnotationType (badge, icon, underline, highlight)
- AnnotationMarker component supports 4 visual styles for different annotation types
- Element targeting via CSS selectors for reliable element identification
- Overlay rendering with fixed positioning and z-index management
- Selection-based annotation creation with useAnnotationTargeting hook

**From 02-03 (Implement Status Tracking Workflow):**
- Any collaborator can change annotation status (not just author) - collaborative decision model
- Status stored in annotation metadata field for Supabase compatibility without schema migration
- Optimistic updates for better UX with async Supabase persistence
- Both sync and async status update methods for different use cases
- Three-state workflow: OPEN → IN_PROGRESS → RESOLVED with ability to reopen
- Portuguese labels for status display (Aberto, Em Progresso, Resolvido)
- Confirmation dialog for RESOLVED status to prevent accidental resolution

### Pending Todos

None yet.

### Blockers/Concerns

**Action required:** User must create "avatars" bucket in Supabase Dashboard before avatar upload works:
1. Go to Supabase Dashboard → Storage → New bucket
2. Name: `avatars`, make it Public
3. Add RLS policy allowing users to upload to their own folder

**Potential concerns from 02-01:**
- Marker positioning may need fine-tuning for complex markdown layouts (nested lists, tables)
- Cross-block selection handling implemented but may need testing with edge cases
- Performance with many annotations should be monitored (may need virtualization)

**From 02-03:**
- Plan 02-02 (Threaded Comments) has not been completed yet, but status tracking (02-03) is independent
- Status tracking stores data in metadata JSONB field to avoid database migration
- AnnotationPanel needs integration with StatusBadge component (future task)
- Notification system (Phase 5) can use status changes for triggers

## Session Continuity

Last session: 2026-02-05 16:36
Stopped at: Completed 02-03 - Implement Status Tracking Workflow
Resume file: None
