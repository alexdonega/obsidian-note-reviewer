---
phase: 03-claude-code-integration
plan: 04a
type: execute
wave: 3
depends_on: ["03-03a", "03-03b"]
files_modified:
  - apps/portal/src/components/PromptEditor.tsx
  - apps/portal/src/components/AnnotationExport.tsx
autonomous: true

must_haves:
  truths:
    - "Default prompt template is in Portuguese with placeholders"
    - "PromptEditor allows editing prompt template"
    - "Variable substitution works: {summary}, {annotations}, {totalCount}"
    - "Custom templates persist to localStorage"
  artifacts:
    - path: "apps/portal/src/components/PromptEditor.tsx"
      provides: "Editable prompt template component"
      min_lines: 80
      exports: ["PromptEditor"]
    - path: "apps/portal/src/components/AnnotationExport.tsx"
      provides: "Annotation preview and display component"
      min_lines: 60
      exports: ["AnnotationExport"]
  key_links:
    - from: "apps/portal/src/components/PromptEditor.tsx"
      to: "packages/ui/utils/claudeExport.ts"
      via: "import"
      pattern: "import.*formatPrompt|exportForClaude"
    - from: "apps/portal/src/components/PromptEditor.tsx"
      to: "apps/portal/src/components/AnnotationExport.tsx"
      via: "component usage"
      pattern: "<AnnotationExport"
---

<objective>
Create automatic prompt template with editable customization field.

**Purpose:** Enable CLAU-04 and CLAU-05 requirements - automatic prompt formatting with user-editable field.

**Output:** PromptEditor and AnnotationExport React components.
</objective>

<execution_context>
@C:\Users\Alex\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\Alex\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-claude-code-integration/03-CONTEXT.md
@.planning/phases/03-claude-code-integration/03-RESEARCH.md

# Existing patterns
@packages/ui/utils/claudeExport.ts
@packages/ui/types/claude.ts
</context>

<tasks>

<task type="auto">
  <name>Define default prompt template</name>
  <files>apps/portal/src/components/PromptEditor.tsx</files>
  <action>
    Create default Portuguese prompt template in PromptEditor component:

    ```
    Aqui estão as revisões do plano:

    {summary}

    ## Anotações Detalhadas

    {annotations}

    Total: {totalCount} anotações.

    Por favor, revise e implemente estas mudanças.
    ```

    Placeholders: {summary}, {annotations}, {totalCount}

    DO NOT use English - maintain Portuguese language consistency with existing UI.
  </action>
  <verify>DEFAULT_PROMPT constant exists with Portuguese text and placeholders</verify>
  <done>Default template ready for user customization</done>
</task>

<task type="auto">
  <name>Create PromptEditor component</name>
  <files>apps/portal/src/components/PromptEditor.tsx</files>
  <action>
    Create `apps/portal/src/components/PromptEditor.tsx` with:

    1. **State management**
       - template: editable prompt text
       - customTemplate: loaded from localStorage (key: obsreview-prompt-template)

    2. **UI elements**
       - Textarea for editing prompt template
       - Preview section showing formatted output
       - Reset button (restores DEFAULT_PROMPT)
       - Save button (persists to localStorage)

    3. **Variable substitution**
       - formatPrompt() replaces {summary}, {annotations}, {totalCount}
       - Uses generateSummary() and formatForPrompt() from claudeExport.ts

    4. **Validation** - Warn if required placeholders missing

    Use Tailwind classes matching existing minimalist Apple-style design.

    DO NOT add excessive UI chrome - keep minimal and functional.
  </action>
  <verify>Component compiles; has textarea, preview, reset, save elements</verify>
  <done>Editable prompt template with preview ready</done>
</task>

<task type="auto">
  <name>Implement variable substitution</name>
  <files>apps/portal/src/components/PromptEditor.tsx</files>
  <action>
    Add formatPrompt function to PromptEditor:

    ```typescript
    function formatPrompt(template: string, annotations: ClaudeAnnotation[]): string {
      const summary = generateSummary(annotations);
      const formattedAnnotations = formatForPrompt({
        annotations,
        totalCount: annotations.length,
        summary
      });

      return template
        .replace('{summary}', summary)
        .replace('{annotations}', formattedAnnotations)
        .replace('{totalCount}', String(annotations.length));
    }
    ```

    Handle missing placeholders gracefully - if not in template, skip replacement.

    DO NOT use regex replacement - simple string replace is sufficient and safer.
  </action>
  <verify>formatPrompt function replaces all three placeholders</verify>
  <done>Variable substitution produces formatted prompt output</done>
</task>

<task type="auto">
  <name>Create AnnotationExport preview component</name>
  <files>apps/portal/src/components/AnnotationExport.tsx</files>
  <action>
    Create `apps/portal/src/components/AnnotationExport.tsx` with:

    1. **Group annotations by type**
       - edições (edit)
       - comentários globais (comment_global)
       - comentários individuais (comment_individual)
       - exclusões (deletion)

    2. **Display elements**
       - Status badges (open/in_progress/resolved) with colors
       - Collapsible sections for each type
       - Copy button for raw JSON
       - Portuguese labels for all text

    3. **Styling** - Match existing minimalist Apple-style using Tailwind

    Component groups ClaudeAnnotation[] for readable preview before sending.

    DO NOT implement filtering - show all annotations regardless of status.
  </action>
  <verify>Component compiles; groups annotations by type</verify>
  <done>Preview component displays annotations clearly before sending</done>
</task>

<task type="auto">
  <name>Persist custom templates to localStorage</name>
  <files>apps/portal/src/components/PromptEditor.tsx</files>
  <action>
    Add localStorage integration to PromptEditor:

    1. **Load on mount** - useEffect reads obsreview-prompt-template key
    2. **Save on change** - Update localStorage when template changes
    3. **Reset clears** - Reset button removes localStorage entry
    4. **Error handling** - Try/catch around localStorage access (may be disabled)

    Storage key: `obsreview-prompt-template`

    DO NOT use other storage mechanisms - localStorage is sufficient for this use case.
  </action>
  <verify>localStorage read/write happens with correct key</verify>
  <done>Custom templates persist across browser sessions</done>
</task>

</tasks>

<verification>
- [ ] Default prompt template exists in Portuguese
- [ ] PromptEditor has textarea and preview
- [ ] Variable substitution replaces all three placeholders
- [ ] AnnotationExport groups by type with status badges
- [ ] Custom templates save/load from localStorage
</verification>

<success_criteria>
1. Default prompt automatically formats revisions for Claude Code (CLAU-04)
2. Editable field allows customization before sending (CLAU-05)
3. Variable substitution works correctly
4. Custom templates persist across sessions
</success_criteria>

<output>
After completion, create `.planning/phases/03-claude-code-integration/03-04a-SUMMARY.md`
</output>

---

**Plan created:** 2026-02-05
**Estimated duration:** 20 min
**Complexity:** Medium (UI components + state management)
