---
phase: 03-claude-code-integration
plan: 03a
type: execute
wave: 2
depends_on: ["03-01a", "03-01b", "03-02a", "03-02b"]
files_modified:
  - packages/ui/types/claude.ts
  - packages/ui/utils/claudeExport.ts
  - packages/ui/utils/__tests__/claudeExport.test.ts
autonomous: true

must_haves:
  truths:
    - "All 5 AnnotationType values map to correct ClaudeAnnotationType"
    - "exportForClaude() returns valid ClaudeAnnotationExport structure"
    - "Unit tests cover all annotation types and edge cases"
  artifacts:
    - path: "packages/ui/types/claude.ts"
      provides: "Claude Code export type definitions"
      min_lines: 30
      exports: ["ClaudeAnnotationType", "ClaudeAnnotation", "ClaudeAnnotationExport"]
    - path: "packages/ui/utils/claudeExport.ts"
      provides: "Annotation transformation logic"
      min_lines: 60
      exports: ["transformAnnotation", "exportForClaude", "generateSummary", "formatForPrompt"]
    - path: "packages/ui/utils/__tests__/claudeExport.test.ts"
      provides: "Unit tests for annotation export"
      min_lines: 80
  key_links:
    - from: "packages/ui/utils/claudeExport.ts"
      to: "packages/ui/types/claude.ts"
      via: "import"
      pattern: "import.*ClaudeAnnotation"
    - from: "packages/ui/utils/claudeExport.ts"
      to: "packages/ui/types.ts"
      via: "import"
      pattern: "import.*Annotation.*AnnotationType"
    - from: "packages/ui/utils/__tests__/claudeExport.test.ts"
      to: "packages/ui/utils/claudeExport.ts"
      via: "import"
      pattern: "import.*exportForClaude"
---

<objective>
Build Claude Code export types and annotation transformation logic.

**Purpose:** Enable CLAU-03 and CLAU-06 requirements - transform internal annotations to structured Claude Code format with complete type coverage.

**Output:** Type definitions, transformer functions, and comprehensive unit tests.
</objective>

<execution_context>
@C:\Users\Alex\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\Alex\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-claude-code-integration/03-CONTEXT.md
@.planning/phases/03-claude-code-integration/03-RESEARCH.md

# Existing annotation types
@packages/ui/types.ts
</context>

<tasks>

<task type="auto">
  <name>Define Claude Code export types</name>
  <files>packages/ui/types/claude.ts</files>
  <action>
    Create `packages/ui/types/claude.ts` with:

    1. **ClaudeAnnotationType enum** - Values: edit, comment_global, comment_individual, deletion, highlight
    2. **ClaudeAnnotationStatus enum** - Values: open, in_progress, resolved
    3. **ClaudeAnnotation interface** - Fields:
       - type: ClaudeAnnotationType
       - text?: string (for edits, replacements)
       - originalText?: string (text being modified)
       - comment?: string (for comments)
       - status?: ClaudeAnnotationStatus
       - lineNumber?: number (approximate line reference)
       - author?: string
    4. **ClaudeAnnotationExport interface** - Fields:
       - summary: string
       - annotations: ClaudeAnnotation[]
       - totalCount: number
       - metadata: { exportDate: string, types: Record<ClaudeAnnotationType, number> }

    DO NOT add optional fields beyond what Claude Code expects.
  </action>
  <verify>TypeScript compiles; all types exported</verify>
  <done>Type definitions ready for transformer implementation</done>
</task>

<task type="auto">
  <name>Create annotation transformer</name>
  <files>packages/ui/utils/claudeExport.ts</files>
  <action>
    Create `packages/ui/utils/claudeExport.ts` with:

    1. **transformAnnotation(annotation: Annotation): ClaudeAnnotation** - Maps single annotation:
       - DELETION → { type: 'deletion', originalText }
       - INSERTION → { type: 'edit', text, originalText }
       - REPLACEMENT → { type: 'edit', text, originalText }
       - COMMENT → { type: 'comment_individual', text: originalText, comment: text }
       - GLOBAL_COMMENT → { type: 'comment_global', comment: text }
       - Include status, lineNumber, author if present

    2. **exportForClaude(annotations: Annotation[]): ClaudeAnnotationExport** - Transforms array

    3. **generateSummary(annotations: ClaudeAnnotation[]): string** - Portuguese summary

    4. **formatForPrompt(export: ClaudeAnnotationExport): string** - Markdown formatting

    DO NOT use default/else cases that might drop types - explicitly handle all enum values.
  </action>
  <verify>TypeScript compiles; all AnnotationType enum values handled in typeMap</verify>
  <done>Transformer handles all 5 annotation types with explicit mapping</done>
</task>

<task type="auto">
  <name>Write unit tests for all annotation types</name>
  <files>packages/ui/utils/__tests__/claudeExport.test.ts</files>
  <action>
    Create `packages/ui/utils/__tests__/claudeExport.test.ts` with:

    1. **Test each AnnotationType → ClaudeAnnotationType mapping** - 5 separate test cases
    2. **Test status preservation** - Verify open/in_progress/resolved preserved
    3. **Test summary generation** - Counts by type correctly
    4. **Test prompt formatting** - Portuguese output, markdown structure
    5. **Test empty annotations** - Returns empty export with totalCount: 0
    6. **Test mixed array** - All 5 types together, totalCount matches input length
    7. **Test missing optional fields** - Handles undefined gracefully

    Use Vitest patterns from existing tests in packages/ui/.

    DO NOT skip any AnnotationType value - all must have explicit test cases.
  </action>
  <verify>Tests run with `bun test`; all pass for 5 annotation types</verify>
  <done>Test coverage proves no annotation types are dropped</done>
</task>

</tasks>

<verification>
- [ ] Type definitions file exists with all required interfaces
- [ ] Transformer explicitly handles all 5 AnnotationType values
- [ ] Unit tests cover each annotation type individually
- [ ] Tests pass for mixed array (all types together)
- [ ] Empty annotations case handled
</verification>

<success_criteria>
1. exportForClaude() transforms all annotation types correctly (CLAU-03, CLAU-06)
2. Export structure is parseable JSON matching ClaudeAnnotationExport interface
3. Unit tests pass with 100% type coverage
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-03a-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 18 min
**Complexity:** Low (pure transformation logic)
