---
phase: 03-claude-code-integration
plan: 03b
type: execute
wave: 3
depends_on: ["03-03a"]
files_modified:
  - packages/ui/store/useAnnotationStore.ts
autonomous: true

must_haves:
  truths:
    - "useAnnotationStore.exportForClaude() method works"
    - "Annotations export includes all types present in store"
    - "Store metadata (total count, types breakdown) included"
  artifacts:
    - path: "packages/ui/store/useAnnotationStore.ts"
      provides: "Annotation store with export method"
      exports: ["exportForClaude"]
  key_links:
    - from: "packages/ui/store/useAnnotationStore.ts"
      to: "packages/ui/utils/claudeExport.ts"
      via: "import"
      pattern: "import.*exportForClaude"
---

<objective>
Integrate Claude export into annotation store.

**Purpose:** Provide convenient access to Claude format export from existing store.

**Output:** Extended useAnnotationStore with exportForClaude() method.
</objective>

<execution_context>
@C:\Users\Alex\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\Alex\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-claude-code-integration/03-03a-SUMMARY.md

# Existing store
@packages/ui/store/useAnnotationStore.ts
</context>

<tasks>

<task type="auto">
  <name>Add export to useAnnotationStore</name>
  <files>packages/ui/store/useAnnotationStore.ts</files>
  <action>
    Extend `packages/ui/store/useAnnotationStore.ts` with:

    1. **Import exportForClaude** - From ../utils/claudeExport.ts
    2. **Add exportForClaude() method** - Returns ClaudeAnnotationExport
    3. **Include store metadata** - Total count, types breakdown from current state

    Method signature:
    ```typescript
    exportForClaude(): ClaudeAnnotationExport {
      const annotations = this.annotations; // Current store annotations
      return exportForClaude(annotations);
    }
    ```

    DO NOT create new store structure - extend existing useAnnotationStore.
  </action>
  <verify>TypeScript compiles; method accessible from store instance</verify>
  <done>Store provides convenient export method for Claude format</done>
</task>

<task type="auto">
  <name>Test transformation with real annotations</name>
  <files>packages/ui/utils/__tests__/claudeExport.test.ts</files>
  <action>
    Extend `packages/ui/utils/__tests__/claudeExport.test.ts` with integration test:

    1. **Create test annotations** - One of each type using existing Annotation creation
    2. **Export using exportForClaude()** - Verify ClaudeAnnotationExport structure
    3. **Verify all types present** - Check annotations array has all 5 types
    4. **Verify status preserved** - Check status field preserved
    5. **Verify JSON structure** - JSON.stringify() produces valid JSON
    6. **Verify prompt formatting** - formatForPrompt produces readable Portuguese

    This test ensures transformer works with real Annotation objects, not just mocks.
  </action>
  <verify>Test runs and passes for real annotation objects</verify>
  <done>Integration test confirms transformer works with actual annotations</done>
</task>

</tasks>

<verification>
- [ ] useAnnotationStore has exportForClaude() method
- [ ] Method returns ClaudeAnnotationExport structure
- [ ] Integration test passes with real annotation objects
- [ ] All 5 types present in export when created
</verification>

<success_criteria>
1. Store integration provides convenient export access (CLAU-03, CLAU-06)
2. Transformer works with real Annotation objects
3. Status tracking preserved in export
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-03b-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 8 min
**Complexity:** Low (store extension + integration test)
