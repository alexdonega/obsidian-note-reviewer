---
phase: 04-advanced-ai
plan: 01
subsystem: ai-suggestions
tags: [claude-api, ai, suggestions, annotations]

# Dependency graph
requires:
  - phase: 03-claude-code-integration
    plan: 05
    provides: Claude Code integration and annotation types
provides:
  - AI package with Claude API integration
  - Suggestion engine with configurable behavior
  - UI component for displaying and managing suggestions
  - Hook server endpoint for AI suggestions
affects: [ai-01-complete, phase-04-progress]

# Tech tracking
tech-stack:
  added:
    - "@anthropic-ai/sdk": "^0.32.0"
  patterns:
    - "Claude API integration with Anthropic SDK"
    - "localStorage for configuration persistence"
    - "JSON parsing with fallback for AI responses"
    - "React hooks for state management"
    - "Accept/reject pattern for user feedback"

key-files:
  created:
    - packages/ai/package.json
    - packages/ai/src/types.ts
    - packages/ai/src/config.ts
    - packages/ai/src/suggester.ts
    - apps/portal/src/components/AISuggestions.tsx
  modified:
    - apps/hook/server/index.ts

key-decisions:
  - "Use Claude 3.5 Sonnet for quality suggestions"
  - "Temperature 0.3 for consistent results"
  - "localStorage for API key persistence (client-side)"
  - "Three suggestion types: deletion, replacement, comment"
  - "Configurable sensitivity levels (low/medium/high)"
  - "Confidence scores for each suggestion (0-1)"
  - "User must accept - no auto-apply"

patterns-established:
  - "AI package structure: types, config, suggester modules"
  - "Error handling with user-friendly messages"
  - "Loading states with visual feedback"
  - "API key validation before requests"
  - "JSON parsing with markdown code block removal"

# Metrics
duration: 35min
completed: 2026-02-05
---

# Phase 4 Plan 01: AI-Suggested Annotations Summary

**Complete AI suggestion system with Claude API integration, user controls, and configurable behavior**

## Performance

- **Duration:** 35 min
- **Started:** 2026-02-05T21:00:00Z
- **Completed:** 2026-02-05T21:35:00Z
- **Tasks:** 6
- **Files created:** 5
- **Files modified:** 2

## Accomplishments

- Created @obsidian-note-reviewer/ai package with proper structure
- Implemented Claude API integration for generating suggestions
- Added configuration management with localStorage persistence
- Built AISuggestions UI component with accept/reject controls
- Added /api/ai-suggestions endpoint to hook server
- Configurable sensitivity levels and suggestion types

## Task Commits

Each task was committed atomically:

1. **AI Package Structure** - `packages/ai/` created
   - package.json with Anthropic SDK dependency
   - tsconfig.json extending root config
   - src/ and __tests__/ directories

2. **Type Definitions** - `packages/ai/src/types.ts`
   - AISuggestion interface with id, type, confidence, reason
   - SuggestionConfig with enabled, sensitivity, maxSuggestions
   - SuggestionResult with suggestions, model, tokensUsed

3. **Configuration Management** - `packages/ai/src/config.ts`
   - getAIConfig() - retrieve config from localStorage
   - updateAIConfig() - update partial config
   - setAPIKey() / getAPIKey() - API key management
   - resetAIConfig() - reset to defaults

4. **AI Suggestion Engine** - `packages/ai/src/suggester.ts`
   - generateSuggestions() - Claude API call
   - buildSystemPrompt() - configurable prompts
   - parseSuggestions() - JSON parsing with fallback
   - acceptSuggestion() / rejectSuggestion() - handling

5. **UI Component** - `apps/portal/src/components/AISuggestions.tsx`
   - Suggestion display with accept/reject buttons
   - Confidence score visualization
   - API key input when missing
   - Loading and error states

6. **Hook Server Endpoint** - `apps/hook/server/index.ts`
   - POST /api/ai-suggestions endpoint
   - Claude API integration on server
   - Returns suggestions with metadata

## Files Created/Modified

### packages/ai/package.json (NEW)
```json
{
  "name": "@obsidian-note-reviewer/ai",
  "exports": {
    "./suggester": "./src/suggester.ts",
    "./config": "./src/config.ts",
    "./types": "./src/types.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0"
  }
}
```

### packages/ai/src/types.ts (NEW - 155 lines)
Key types:
- `AISuggestion` - id, type (deletion|replacement|comment), confidence, reason
- `SuggestionConfig` - enabled, sensitivity, maxSuggestions, suggestionTypes, apiKey
- `SuggestionResult` - suggestions array, model, tokensUsed

### packages/ai/src/config.ts (NEW - 95 lines)
Functions:
- `getAIConfig()` - Returns config with defaults
- `updateAIConfig(updates)` - Updates and persists
- `setAPIKey(key)` / `getAPIKey()` - API key management
- `clearAPIKey()` - Remove stored key
- `isAIEnabled()` / `setAIEnabled(bool)` - Enable/disable

### packages/ai/src/suggester.ts (NEW - 220 lines)
Functions:
- `generateSuggestions(content, config)` - Main API function
- `buildSystemPrompt(config)` - Creates Claude prompt
- `parseSuggestions(text)` - Extracts JSON from response
- `acceptSuggestion(suggestion, content)` - Applies suggestion
- `rejectSuggestion(id)` - Logs rejection
- `getConfidenceLabel(score)` - Returns "Alta|Média|Baixa"

### apps/portal/src/components/AISuggestions.tsx (NEW - 250 lines)
Features:
- API key input when missing
- Loading state with animation
- Suggestion cards with type badges
- Confidence score display
- Accept/reject buttons
- Regenerate button
- Error handling

### apps/hook/server/index.ts (MODIFIED)
Added endpoint:
```typescript
POST /api/ai-suggestions
Body: { config?: { apiKey?: string } }
Response: {
  ok: boolean,
  suggestions: AISuggestion[],
  model: string,
  tokensUsed: number
}
```

## API Specification

### generateSuggestions()

**Input:**
```typescript
{
  content: string;          // Document content to analyze
  config: SuggestionConfig; // AI configuration
}
```

**Output:**
```typescript
{
  suggestions: AISuggestion[];
  model: string;        // "claude-3-5-sonnet-20241022"
  tokensUsed: number;   // Total tokens consumed
}
```

### AISuggestion Structure
```typescript
{
  id: string;                    // "ai-sugg-{timestamp}-{index}"
  type: 'deletion' | 'replacement' | 'comment';
  confidence: number;            // 0.0 - 1.0
  reason: string;                // Why this was suggested
  targetText: string;            // Original text
  suggestedText?: string;        // Replacement text
}
```

## Component Specifications

### AISuggestions Props
```typescript
interface AISuggestionsProps {
  content: string;                             // Document to analyze
  onAcceptSuggestion: (annotation: Annotation) => void;  // Callback
}
```

### States
- `suggestions: AISuggestion[]` - Generated suggestions
- `loading: boolean` - API in progress
- `error: string | null` - Error message
- `hasApiKey: boolean` - API key presence

## Decisions Made

1. **Client-side API key storage** - Using localStorage (will encrypt in production)
2. **No auto-apply** - User must explicitly accept each suggestion
3. **Temperature 0.3** - Lower for more consistent, conservative suggestions
4. **JSON-only response** - Claude instructed to return only JSON array
5. **Markdown code block handling** - Strip ```json``` wrapper if present
6. **Confidence scores** - Display to user but don't filter
7. **Regenerate button** - Allow getting new suggestions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed as specified.

## Authentication Gates

None - API key provided by user directly (not using app authentication).

## User Setup Required

**Anthropic API Key Required:**

Users must provide their own Anthropic API key to use AI suggestions:
1. Go to Settings or AI Suggestions panel
2. Enter API key (starts with `sk-ant-`)
3. Key is stored in localStorage

**Note:** API key is currently stored in plain text. Production should use encryption.

## Next Phase Readiness

- AI package structure ready for additional AI features
- Pattern established for Claude API integration
- UI components can be extended for vault context (04-02)
- Configuration system ready for additional AI settings

---

*Phase: 04-advanced-ai*
*Plan: 01*
*Completed: 2026-02-05*
*Status: ✅ COMPLETE*
