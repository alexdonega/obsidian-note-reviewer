# Testing Patterns

**Analysis Date:** 2026-02-04

## Test Framework

**Runner:**
- Framework: Bun test runner
- Config: Built-in, no separate config file
- Command: `bun test`

**Assertion Library:**
- Built-in `expect` from Bun
- Additional assertions from `@testing-library/jest-dom`

**Run Commands:**
```bash
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test --coverage         # Coverage report
bun test --related          # Run tests for changed files
```

## Test File Organization

**Location:**
- Co-located with source files in `__tests__` directories
- Pattern: `/source/path/__tests__/module.test.ts`

**Naming:**
- Descriptive names: `notes.test.ts`, `path-validation.test.ts`
- Include test scope in name: `cors.test.ts`
- Mirror source file structure

**Structure:**
```
apps/
  portal/
    api/
      __tests__/          # API tests
        notes.test.ts
    utils/
      __tests__/          # Utility tests
        cors.test.ts
packages/
  ui/
    utils/
      __tests__/          # Unit tests
        sanitize.test.ts
    hooks/
      __tests__/          # Hook tests
        useFocusTrap.test.ts
  security/
    __tests__/          # Security tests
      csp.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('Module/Feature Name', () => {
  beforeEach(() => {
    // Setup for each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Specific functionality', () => {
    test('should do something correctly', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Patterns:**
- Describe block for test scope
- beforeEach/afterEach for setup/teardown
- Test names are descriptive sentences
- Arrange-Act-Assert pattern

## Mocking

**Framework:** Built-in mock functionality in Bun

**Patterns:**
```typescript
import { describe, test, expect, mock } from 'bun:test';

// Module mocking
mock.module('isomorphic-dompurify', () => ({
  default: {
    sanitize: mock((input: string) => input),
  },
}));

// Function mocking
const mockFunction = mock((input: string) => 'mocked');
```

**What to Mock:**
- External dependencies (DOMPurify, Supabase)
- File system operations
- Date/time for consistent tests
- Network requests
- Complex third-party libraries

**What NOT to Mock:**
- Core business logic
- Internal utility functions
- Data structures being tested
- Pure functions

## Fixtures and Factories

**Test Data:**
```typescript
// Constants for test data
const VALID_ORIGIN = 'https://r.alexdonega.com.br';
const MALICIOUS_ORIGIN = 'https://evil.com';
const TEST_NOTE = {
  slug: 'test-note',
  title: 'Test Note',
  content: 'Test content',
  createdAt: new Date().toISOString(),
};

// Test data generation functions
function createMockRequest(options: {
  method?: string;
  origin?: string | null;
  query?: Record<string, string | string[]>;
  body?: Record<string, any>;
}) {
  // Implementation
}
```

**Location:**
- Test data defined in test files or adjacent files
- No separate fixture directory
- Constants at top of test files

## Coverage

**Requirements:** Target not specified in config
**View Coverage:**
```bash
bun test --coverage
```

**Coverage Patterns:**
- Test happy paths and error cases
- Mock external dependencies to focus on unit logic
- Test edge cases and validation
- Include integration tests for API endpoints

## Test Types

**Unit Tests:**
- Scope: Individual functions, components, utilities
- Focus: Pure logic in isolation
- Mocking: Heavy use of mocks
- Examples: `sanitize.test.ts`, `parser.test.ts`

**Integration Tests:**
- Scope: API endpoints, data flow
- Focus: Component interaction, data persistence
- Mocking: Minimal, focus on integration
- Examples: `notes.test.ts`, `cors.test.ts`

**E2E Tests:**
- Framework: Not detected
- Status: Not implemented
- Coverage: Limited to manual testing

## Common Patterns

**Async Testing:**
```typescript
test('should handle async operation', async () => {
  // Arrange
  const promise = Promise.resolve('data');

  // Act
  const result = await promise;

  // Assert
  expect(result).toBe('data');
});
```

**Error Testing:**
```typescript
test('should throw error for invalid input', () => {
  // Arrange
  const invalidInput = null;

  // Act & Assert
  expect(() => functionUnderTest(invalidInput)).toThrow();
});
```

**Security Testing:**
```typescript
test('should prevent path traversal attacks', () => {
  const maliciousPath = '../../../etc/passwd';
  expect(validatePath(maliciousPath)).toBe(false);
});

test('should block malicious origins', () => {
  const maliciousOrigin = 'https://evil.com';
  expect(isOriginAllowed(maliciousOrigin)).toBe(false);
});
```

**Mock Response Testing:**
```typescript
test('should set correct headers', () => {
  const req = createMockRequest({ origin: VALID_ORIGIN });
  const res = createMockResponse();

  // Act
  handler(req, res);

  // Assert
  expect(res.setHeader).toHaveBeenCalledWith(
    'Access-Control-Allow-Origin',
    VALID_ORIGIN
  );
});
```

**Testing Hooks:**
```typescript
test('should update state on value change', () => {
  // Arrange
  renderHook(() => useCustomHook(initialValue));

  // Act
  act(() => result.current.setValue(newValue));

  // Assert
  expect(result.current.value).toBe(newValue);
});
```

## Test Best Practices

**Given-When-Then Pattern:**
```typescript
test('should validate user input', () => {
  // Given
  const input = 'valid-email@example.com';

  // When
  const result = validateEmail(input);

  // Then
  expect(result).toBe(true);
});
```

**Describe Block Organization:**
- Top level: Component/feature name
- Nested: Specific functionality areas
- Tests: Specific scenarios

**Error Boundaries:**
- Test error rendering with `ErrorBoundary` components
- Verify fallback UI displays correctly
- Test error propagation

**Performance Testing:**
- Limited to `performance.test.ts` in UI package
- Focus on component rendering times
- Use React's profiling utilities

**Multi-tenancy Testing:**
- Test with different organization contexts
- Verify tenant isolation
- Test cross-tenant data access prevention

---

*Testing analysis: 2026-02-04*