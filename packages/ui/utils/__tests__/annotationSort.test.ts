import { describe, test, expect } from 'bun:test';
import { sortAnnotations } from '../annotationSort';
import { Annotation, AnnotationType } from '../../types';

/**
 * Helper to create test annotations with minimal required fields
 */
function createAnnotation(
  overrides: Partial<Annotation> & { id: string; createdA: number; type: AnnotationType }
): Annotation {
  return {
    blockId: 'test-block',
    startOffset: 0,
    endOffset: 10,
    originalText: 'test text',
    ...overrides,
  };
}

describe('sortAnnotations', () => {
  describe('newest sort', () => {
    test('sorts annotations by timestamp descending (newest first)', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '2', createdA: 300, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT }),
      ];

      const sorted = sortAnnotations(annotations, 'newest');

      expect(sorted.map((a) => a.id)).toEqual(['2', '3', '1']);
    });

    test('handles annotations with same timestamps', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.DELETION }),
        createAnnotation({ id: '3', createdA: 100, type: AnnotationType.INSERTION }),
      ];

      const sorted = sortAnnotations(annotations, 'newest');

      // All have same timestamp, so order is stable (based on original order)
      expect(sorted.length).toBe(3);
      // Just verify all items are present
      expect(sorted.map((a) => a.id).sort()).toEqual(['1', '2', '3']);
    });
  });

  describe('oldest sort', () => {
    test('sorts annotations by timestamp ascending (oldest first)', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 300, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT }),
      ];

      const sorted = sortAnnotations(annotations, 'oldest');

      expect(sorted.map((a) => a.id)).toEqual(['2', '3', '1']);
    });

    test('handles annotations with same timestamps', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.DELETION }),
      ];

      const sorted = sortAnnotations(annotations, 'oldest');

      expect(sorted.length).toBe(2);
      expect(sorted.map((a) => a.id).sort()).toEqual(['1', '2']);
    });
  });

  describe('type sort', () => {
    test('sorts by annotation type following display order', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.GLOBAL_COMMENT }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.DELETION }),
        createAnnotation({ id: '3', createdA: 100, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '4', createdA: 100, type: AnnotationType.REPLACEMENT }),
        createAnnotation({ id: '5', createdA: 100, type: AnnotationType.INSERTION }),
      ];

      const sorted = sortAnnotations(annotations, 'type');

      // Expected order: DELETION, INSERTION, REPLACEMENT, COMMENT, GLOBAL_COMMENT
      expect(sorted.map((a) => a.type)).toEqual([
        AnnotationType.DELETION,
        AnnotationType.INSERTION,
        AnnotationType.REPLACEMENT,
        AnnotationType.COMMENT,
        AnnotationType.GLOBAL_COMMENT,
      ]);
    });

    test('uses secondary timestamp sort within same type', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 300, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT }),
      ];

      const sorted = sortAnnotations(annotations, 'type');

      // Within same type, should be oldest first
      expect(sorted.map((a) => a.id)).toEqual(['2', '3', '1']);
    });

    test('groups types then sorts by timestamp within groups', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 300, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.DELETION }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '4', createdA: 50, type: AnnotationType.DELETION }),
      ];

      const sorted = sortAnnotations(annotations, 'type');

      // DELETION first (sorted by timestamp), then COMMENT (sorted by timestamp)
      expect(sorted.map((a) => a.id)).toEqual(['4', '2', '3', '1']);
    });
  });

  describe('author sort', () => {
    test('sorts alphabetically by author name', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT, author: 'Charlie' }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ id: '3', createdA: 100, type: AnnotationType.COMMENT, author: 'Bob' }),
      ];

      const sorted = sortAnnotations(annotations, 'author');

      expect(sorted.map((a) => a.author)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('places annotations without author at the end', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT, author: 'Bob' }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT, author: undefined }),
        createAnnotation({ id: '3', createdA: 100, type: AnnotationType.COMMENT, author: 'Alice' }),
      ];

      const sorted = sortAnnotations(annotations, 'author');

      expect(sorted.map((a) => a.author)).toEqual(['Alice', 'Bob', undefined]);
    });

    test('uses secondary timestamp sort for same author', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 300, type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT, author: 'Alice' }),
      ];

      const sorted = sortAnnotations(annotations, 'author');

      // Same author, should be oldest first
      expect(sorted.map((a) => a.id)).toEqual(['2', '3', '1']);
    });

    test('sorts annotations without author by timestamp', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 300, type: AnnotationType.COMMENT, author: undefined }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT, author: undefined }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT, author: undefined }),
      ];

      const sorted = sortAnnotations(annotations, 'author');

      // No authors, all should be sorted by timestamp (oldest first)
      expect(sorted.map((a) => a.id)).toEqual(['2', '3', '1']);
    });

    test('handles mixed authors and no-author annotations', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 50, type: AnnotationType.COMMENT, author: undefined }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT, author: 'Bob' }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT, author: undefined }),
        createAnnotation({ id: '4', createdA: 150, type: AnnotationType.COMMENT, author: 'Alice' }),
      ];

      const sorted = sortAnnotations(annotations, 'author');

      // Alice, Bob, then no-author sorted by timestamp
      expect(sorted.map((a) => a.id)).toEqual(['4', '2', '1', '3']);
    });

    test('handles case-sensitive author sorting', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT, author: 'bob' }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ id: '3', createdA: 100, type: AnnotationType.COMMENT, author: 'charlie' }),
      ];

      const sorted = sortAnnotations(annotations, 'author');

      // localeCompare should handle case properly
      expect(sorted.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    test('returns empty array for empty input', () => {
      const sorted = sortAnnotations([], 'newest');
      expect(sorted).toEqual([]);
    });

    test('returns single item for single item input', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT }),
      ];

      const sorted = sortAnnotations(annotations, 'newest');

      expect(sorted.length).toBe(1);
      expect(sorted[0].id).toBe('1');
    });

    test('does not mutate original array', () => {
      const annotations: Annotation[] = [
        createAnnotation({ id: '1', createdA: 300, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT }),
        createAnnotation({ id: '3', createdA: 200, type: AnnotationType.COMMENT }),
      ];
      const originalIds = annotations.map((a) => a.id);

      sortAnnotations(annotations, 'newest');

      // Original array should be unchanged
      expect(annotations.map((a) => a.id)).toEqual(originalIds);
    });

    test('works with all annotation types', () => {
      const annotations: Annotation[] = Object.values(AnnotationType).map((type, index) =>
        createAnnotation({ id: `${index}`, createdA: index * 100, type })
      );

      // Should not throw for any sort option
      expect(() => sortAnnotations(annotations, 'newest')).not.toThrow();
      expect(() => sortAnnotations(annotations, 'oldest')).not.toThrow();
      expect(() => sortAnnotations(annotations, 'type')).not.toThrow();
      expect(() => sortAnnotations(annotations, 'author')).not.toThrow();
    });
  });
});
