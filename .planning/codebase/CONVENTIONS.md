# Coding Conventions

**Analysis Date:** 2026-02-04

## Naming Patterns

**Files:**
- PascalCase for component files: `ActivityFeed.tsx`, `AnnotationPanel.tsx`
- camelCase for utility files: `cors.ts`, `pathValidation.ts`
- kebab-case for configuration: `vite.config.ts`
- `.test.ts` suffix for test files

**Functions:**
- camelCase for functions: `getAllowedOrigins()`, `isOriginAllowed()`, `setCorsHeaders()`
- PascalCase for React components: `ActivityFeed`, `AnnotationPanel`
- underscore prefix for internal/private functions: `_validatePath()`

**Variables:**
- camelCase for local variables: `filePath`, `noteContent`, `sortedAnnotations`
- UPPER_CASE for constants: `DEFAULT_ALLOWED_ORIGINS`, `TEMP_DIR`
- UPPER_SNAKE_CASE for environment variables: `ALLOWED_ORIGINS`

**Types:**
- PascalCase for interfaces and types: `ActivityType`, `PanelProps`, `CSPDirectives`
- PascalCase for enum-like unions: `ActivityType`, `AnnotationType`

## Code Style

**Formatting:**
- Tool: ESLint with Prettier
- Key settings:
  - 2 spaces indentation
  - Semicolons required
  - Single quotes for strings
  - Trailing commas in multi-line structures
  - No unused variables (except prefixed with `_`)

**Linting:**
- Tool: ESLint with additional plugins
- Key rules:
  - `@typescript-eslint/no-unused-vars`: error (with `_` exception)
  - `@typescript-eslint/no-explicit-any`: warn
  - `@typescript-eslint/no-non-null-assertion`: warn
  - `no-console`: warn (allow warn/error)
  - `no-debugger`: error
  - `no-alert`: error
  - Security plugin enabled for all files

## Import Organization

**Order:**
1. Node.js built-ins: `import path from 'path';`
2. External packages: `import React from 'react';`
3. Internal packages (with absolute paths): `import { supabase } from '../lib/supabase';`
4. Local imports (relative paths): `import { validatePath } from './pathValidation';`

**Path Aliases:**
- `@` → apps directory root
- `@obsidian-note-reviewer/ui` → packages/ui
- `@obsidian-note-reviewer/editor` → packages/editor
- `@obsidian-note-reviewer/security` → packages/security

## Error Handling

**Patterns:**
- Try/catch for async operations with specific error types
- Return proper HTTP status codes for APIs
- Use descriptive error messages
- Log errors with appropriate context (using pino logger)
- Graceful degradation for non-critical failures

```typescript
// Example: API error handling
try {
  const { data, error } = await supabase.from('notes').select('*');
  if (error) throw error;
  return data;
} catch (error) {
  logger.error('Failed to fetch notes:', error);
  throw createError(500, 'Failed to fetch notes');
}
```

## Logging

**Framework:** Pino logger
**Patterns:**
- Use structured logging with consistent format
- Log errors with stack traces
- Include request ID when available
- Log important state changes and user actions
- Use appropriate log levels: error, warn, info, debug

```typescript
import { log } from '../lib/logger';

// Error logging
log.error('Failed to validate path', { error: pathError.message, path: userPath });

// Info logging
log.info('Note approved', { noteId, userId });
```

## Comments

**When to Comment:**
- Complex business logic requiring explanation
- Security-sensitive validation logic
- External API integration patterns
- Non-obvious side effects
- TODO items with clear justification

**JSDoc/TSDoc:**
- Required for all public APIs and components
- Include parameter types and descriptions
- Document return types
- Provide examples for complex functions
- Mark deprecated methods with @deprecated

```typescript
/**
 * Validates a file path against allowed directories to prevent path traversal attacks
 * @param userPath - The path to validate
 * @returns true if path is safe, false otherwise
 * @throws {Error} If path contains null bytes or other malicious input
 */
function validatePath(userPath: string): boolean {
  // Implementation
}
```

## Function Design

**Size:**
- Prefer small, focused functions (< 20 lines)
- Maximum 50 lines for complex operations
- Single responsibility principle

**Parameters:**
- Keep parameter count ≤ 4
- Use interfaces for complex parameter objects
- Optional parameters with defaults
- Avoid optional boolean parameters

**Return Values:**
- Consistent return types
- Use Result pattern for async operations when appropriate
- Avoid null returns - use undefined or empty arrays

## Module Design

**Exports:**
- Named exports preferred over default
- Barrel files for re-exports: `export * from './utils';`
- Group related exports together
- Document exported API

**Barrel Files:**
- Use in packages for public API
- Format: `packages/ui/index.ts`
- No barrel files in apps directory

## React Component Patterns

**Component Structure:**
- Use functional components with hooks
- Separate concerns: container vs presentational
- Use TypeScript for props
- Implement proper error boundaries

```typescript
interface PanelProps {
  isOpen: boolean;
  annotations: Annotation[];
  onSelect: (id: string) => void;
  onDelete: (id) => void;
  selectedId: string | null;
  shareUrl?: string;
}

export const AnnotationPanel: React.FC<PanelProps> = ({
  isOpen,
  annotations,
  onSelect,
  onDelete,
  selectedId,
  shareUrl
}) => {
  // Implementation
};
```

**Hook Patterns:**
- Custom hooks use camelCase prefix: `useCopyFeedback`
- Return consistent shape
- Use useCallback for event handlers
- Separate state and effects logic

---

*Convention analysis: 2026-02-04*