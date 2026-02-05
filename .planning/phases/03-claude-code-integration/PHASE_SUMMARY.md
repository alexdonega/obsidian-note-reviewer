# Phase 3: Claude Code Integration - Planning Summary

**Planned:** 2026-02-05
**Plans Created:** 5
**Total Estimated Duration:** 95 minutes (1 hour 35 min)

## Overview

Phase 3 integrates the Obsidian Note Reviewer with Claude Code through hooks, enabling seamless AI-assisted plan review. This phase delivers the key differentiator: automatic reviewer opening and structured annotation feedback to Claude Code.

## Plans

### Wave 1 - Hook Infrastructure (30 min)

**Plan 03-01: Implement PostToolUse Hook Extension for Obsidian Note Creation** (15 min)
- Extends existing PostToolUse Write hook pattern
- Detects Obsidian plan file creation (`.obsidian/plans/`, `Plans/`)
- Spawns Bun.serve server, opens viewer, outputs structured JSON
- Implements inactivity timeout (25 min) to prevent hook hangs
- **Delivers:** CLAU-01 - Creating note in Obsidian opens reviewer

**Plan 03-02: Implement Plan Mode Hook Integration** (15 min)
- Uses PermissionRequest hook with ExitPlanMode matcher
- Separate from Write hook (different hook type)
- Implements hook priority logic to prevent double-opening
- **Delivers:** CLAU-02 - Activating plan mode opens reviewer

### Wave 2 - Export & UI (45 min)

**Plan 03-03: Build Structured Annotation Export Format** (20 min)
- Creates Claude Code export types (`ClaudeAnnotation`, `ClaudeAnnotationExport`)
- Transforms Phase 2 annotation types to Claude-compatible format
- Maps all 5 AnnotationType values: DELETION, INSERTION, REPLACEMENT, COMMENT, GLOBAL_COMMENT
- Includes unit tests for all types
- **Delivers:** CLAU-03 - Annotations sent in structured format

**Plan 03-04: Create Automatic Prompt Template with Editable Customization Field** (25 min)
- React component with textarea for prompt customization
- Variable substitution: `{summary}`, `{annotations}`, `{totalCount}`
- Portuguese language default template
- Persists custom templates to localStorage
- Preview of final formatted output
- **Delivers:** CLAU-04, CLAU-05 - Automatic prompt with editable field

### Wave 3 - Verification (20 min)

**Plan 03-05: Ensure All Annotation Types Are Captured and Sent** (20 min)
- Audits export to ensure ALL annotation types included (CLAU-06)
- Comprehensive test coverage for each type
- Integration test for full workflow
- Hook server update to accept and forward annotations
- **Delivers:** CLAU-06 - All annotation types captured

## Requirements Coverage

| Requirement | Plan | Status |
|-------------|------|--------|
| CLAU-01: Hook abre reviewer ao criar nota no Obsidian | 03-01 | Covered |
| CLAU-02: Hook abre reviewer ao ativar plan mode | 03-02 | Covered |
| CLAU-03: Anotações enviadas em formato estruturado | 03-03 | Covered |
| CLAU-04: Prompt fixo automático formata revisões | 03-04 | Covered |
| CLAU-05: Campo editável permite customizar prompt | 03-04 | Covered |
| CLAU-06: Todas anotações incluídas (edições, comentários, exclusões, marcações) | 03-05 | Covered |

## Key Decisions

1. **Reuse Existing Hook Pattern** - Extend proven `apps/hook/server/index.ts` pattern instead of building new infrastructure
2. **Separate Hook Commands** - `obsreview-obsidian` for Write events, `obsreview-plan` for ExitPlanMode (prevents conflicts)
3. **Type-Safe Export** - TypeScript transformations from Phase 2 `Annotation` types to `ClaudeAnnotation` format
4. **Portuguese Language** - Prompts and UI in Portuguese to match existing codebase
5. **Inactivity Timeout** - 25-minute timeout prevents hook hangs (30 min max allowed)

## File Structure

```
apps/hook/
├── hooks/
│   ├── hooks.json                    # Existing: PostToolUse Write (temp dir)
│   ├── obsidian-hooks.json           # New: PostToolUse Write (Obsidian plans)
│   └── claude-hooks.json             # New: PermissionRequest ExitPlanMode
├── server/
│   ├── index.ts                      # Existing: Temp dir Write handler
│   ├── obsidianHook.ts               # New: Obsidian Write handler
│   └── planModeHook.ts               # New: ExitPlanMode handler
├── bin/
│   ├── obsreview.ts                  # Existing
│   ├── obsreview-obsidian.ts         # New
│   └── obsreview-plan.ts             # New
└── dist/
      ├── index.html                  # Existing
      ├── obsidianHook.js             # New built output
      └── planModeHook.js             # New built output

packages/ui/
├── types/
│   └── claude.ts                     # New: ClaudeAnnotationExport types
├── utils/
│   ├── claudeExport.ts               # New: Annotation → Claude transformer
│   └── __tests__/
│       └── claudeExport.test.ts      # New: Type coverage tests
└── store/
    └── useAnnotationStore.ts         # Update: Add exportForClaude()

apps/portal/src/
├── components/
│   ├── PromptEditor.tsx              # New: Editable prompt field
│   └── AnnotationExport.tsx          # New: Export preview
└── pages/
    └── review.tsx                    # Update: Integrate prompt editor
```

## Success Criteria

1. Creating a note in Obsidian automatically opens the reviewer
2. Activating plan mode in Claude Code automatically opens the reviewer
3. Annotations are sent back to Claude Code in structured format
4. Automatic prompt formats revisions for Claude Code with editable field
5. All annotation types are included: edits, global comments, individual comments, deletions, highlights

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hook timeout exceeded | 25-min inactivity timeout, countdown timer, cancel button |
| Missing annotation types in export | Comprehensive tests for each type, count verification |
| Hook double-opening | Priority logic: ExitPlanMode skips if Write hook active |
| Obsidian event timing issues | Use metadataCache.on('changed') not vault.on('create') |
| Hook output not parsed by Claude Code | Use stdout with hookSpecificOutput structure |

## Next Steps

Execute plans in wave order:
1. Wave 1 (parallel): 03-01, 03-02
2. Wave 2 (parallel): 03-03, 03-04
3. Wave 3 (sequential): 03-05

---

**Planning Complete**
**Quality Gate:** All items verified
- [x] PLAN.md files created in phase directory
- [x] Each plan has valid frontmatter (wave, depends_on, files_modified, autonomous)
- [x] Tasks are specific and actionable
- [x] Dependencies correctly identified
- [x] Waves assigned for parallel execution
- [x] must_haves derived from phase goal
