import { describe, test, expect } from 'bun:test';
import {
  calculateStatsByType,
  calculateStatsByAuthor,
  getTimeBucket,
  calculateTimingDistribution,
  sortAuthorsByCount,
  getTotalFromStats,
  StatsByAuthor,
  StatsByType
} from '../annotationStats';
import { Annotation, AnnotationType } from '../../types';

/**
 * Helper to create mock annotations with minimal required fields
 */
const createAnnotation = (
  overrides: Partial<Annotation> & { type: AnnotationType }
): Annotation => ({
  id: `ann-${Math.random().toString(36).slice(2)}`,
  blockId: 'block-1',
  startOffset: 0,
  endOffset: 10,
  originalText: 'sample text',
  createdA: Date.now(),
  ...overrides
});

describe('annotationStats', () => {
  describe('calculateStatsByType', () => {
    test('returns empty object for empty array', () => {
      const result = calculateStatsByType([]);
      expect(result).toEqual({});
    });

    test('returns empty object for null/undefined input', () => {
      const result = calculateStatsByType(null as unknown as Annotation[]);
      expect(result).toEqual({});
    });

    test('counts single annotation correctly', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT })
      ];
      const result = calculateStatsByType(annotations);
      expect(result).toEqual({ [AnnotationType.COMMENT]: 1 });
    });

    test('counts multiple annotations of same type', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.COMMENT })
      ];
      const result = calculateStatsByType(annotations);
      expect(result).toEqual({ [AnnotationType.COMMENT]: 3 });
    });

    test('counts annotations of different types', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.INSERTION }),
        createAnnotation({ type: AnnotationType.DELETION }),
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.REPLACEMENT })
      ];
      const result = calculateStatsByType(annotations);
      expect(result).toEqual({
        [AnnotationType.COMMENT]: 2,
        [AnnotationType.INSERTION]: 1,
        [AnnotationType.DELETION]: 1,
        [AnnotationType.REPLACEMENT]: 1
      });
    });

    test('handles all annotation types', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.DELETION }),
        createAnnotation({ type: AnnotationType.INSERTION }),
        createAnnotation({ type: AnnotationType.REPLACEMENT }),
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.GLOBAL_COMMENT })
      ];
      const result = calculateStatsByType(annotations);
      expect(Object.keys(result)).toHaveLength(5);
      expect(result[AnnotationType.DELETION]).toBe(1);
      expect(result[AnnotationType.INSERTION]).toBe(1);
      expect(result[AnnotationType.REPLACEMENT]).toBe(1);
      expect(result[AnnotationType.COMMENT]).toBe(1);
      expect(result[AnnotationType.GLOBAL_COMMENT]).toBe(1);
    });

    test('only includes types that have annotations', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.INSERTION })
      ];
      const result = calculateStatsByType(annotations);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result[AnnotationType.DELETION]).toBeUndefined();
      expect(result[AnnotationType.REPLACEMENT]).toBeUndefined();
    });
  });

  describe('calculateStatsByAuthor', () => {
    test('returns empty object for empty array', () => {
      const result = calculateStatsByAuthor([]);
      expect(result).toEqual({});
    });

    test('returns empty object for null/undefined input', () => {
      const result = calculateStatsByAuthor(null as unknown as Annotation[]);
      expect(result).toEqual({});
    });

    test('counts single annotation with author', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Alice' })
      ];
      const result = calculateStatsByAuthor(annotations);
      expect(result).toEqual({ Alice: 1 });
    });

    test('groups annotations without author as Anônimo', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.COMMENT, author: undefined })
      ];
      const result = calculateStatsByAuthor(annotations);
      expect(result).toEqual({ 'Anônimo': 2 });
    });

    test('handles empty string author as Anônimo', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT, author: '' })
      ];
      const result = calculateStatsByAuthor(annotations);
      expect(result).toEqual({ 'Anônimo': 1 });
    });

    test('counts multiple authors correctly', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Bob' }),
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Charlie' }),
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Bob' }),
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Alice' })
      ];
      const result = calculateStatsByAuthor(annotations);
      expect(result).toEqual({
        Alice: 3,
        Bob: 2,
        Charlie: 1
      });
    });

    test('mixes named and anonymous authors correctly', () => {
      const annotations: Annotation[] = [
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ type: AnnotationType.COMMENT }),
        createAnnotation({ type: AnnotationType.COMMENT, author: 'Alice' }),
        createAnnotation({ type: AnnotationType.COMMENT })
      ];
      const result = calculateStatsByAuthor(annotations);
      expect(result).toEqual({
        Alice: 2,
        'Anônimo': 2
      });
    });
  });

  describe('getTimeBucket', () => {
    // Use a fixed "now" time for deterministic tests
    // 2024-06-15 (Saturday) at 14:00:00
    const fixedNow = new Date(2024, 5, 15, 14, 0, 0).getTime();

    test('returns "today" for timestamps from today', () => {
      // Same day, earlier hour
      const todayMorning = new Date(2024, 5, 15, 8, 0, 0).getTime();
      expect(getTimeBucket(todayMorning, fixedNow)).toBe('today');

      // Start of today (midnight)
      const todayMidnight = new Date(2024, 5, 15, 0, 0, 0).getTime();
      expect(getTimeBucket(todayMidnight, fixedNow)).toBe('today');

      // Exact same time
      expect(getTimeBucket(fixedNow, fixedNow)).toBe('today');
    });

    test('returns "thisWeek" for timestamps from this week (not today)', () => {
      // Friday (one day before Saturday)
      const friday = new Date(2024, 5, 14, 12, 0, 0).getTime();
      expect(getTimeBucket(friday, fixedNow)).toBe('thisWeek');

      // Monday (start of week)
      const monday = new Date(2024, 5, 10, 8, 0, 0).getTime();
      expect(getTimeBucket(monday, fixedNow)).toBe('thisWeek');

      // Tuesday
      const tuesday = new Date(2024, 5, 11, 15, 30, 0).getTime();
      expect(getTimeBucket(tuesday, fixedNow)).toBe('thisWeek');
    });

    test('returns "older" for timestamps before this week', () => {
      // Last Sunday (before Monday of current week)
      const lastSunday = new Date(2024, 5, 9, 23, 59, 59).getTime();
      expect(getTimeBucket(lastSunday, fixedNow)).toBe('older');

      // Last week
      const lastWeek = new Date(2024, 5, 5, 12, 0, 0).getTime();
      expect(getTimeBucket(lastWeek, fixedNow)).toBe('older');

      // A month ago
      const monthAgo = new Date(2024, 4, 15, 12, 0, 0).getTime();
      expect(getTimeBucket(monthAgo, fixedNow)).toBe('older');

      // A year ago
      const yearAgo = new Date(2023, 5, 15, 12, 0, 0).getTime();
      expect(getTimeBucket(yearAgo, fixedNow)).toBe('older');
    });

    test('handles week boundary correctly (Monday as start of week)', () => {
      // Testing with a Monday as "now"
      // 2024-06-17 (Monday) at 10:00
      const mondayNow = new Date(2024, 5, 17, 10, 0, 0).getTime();

      // Sunday before (should be "older")
      const sunday = new Date(2024, 5, 16, 23, 59, 59).getTime();
      expect(getTimeBucket(sunday, mondayNow)).toBe('older');

      // Monday morning (should be "today")
      const mondayMorning = new Date(2024, 5, 17, 8, 0, 0).getTime();
      expect(getTimeBucket(mondayMorning, mondayNow)).toBe('today');
    });

    test('handles Sunday correctly (week should start on previous Monday)', () => {
      // Testing with a Sunday as "now"
      // 2024-06-16 (Sunday) at 14:00
      const sundayNow = new Date(2024, 5, 16, 14, 0, 0).getTime();

      // Monday of that week (should be "thisWeek")
      const monday = new Date(2024, 5, 10, 12, 0, 0).getTime();
      expect(getTimeBucket(monday, sundayNow)).toBe('thisWeek');

      // Saturday (should be "thisWeek")
      const saturday = new Date(2024, 5, 15, 12, 0, 0).getTime();
      expect(getTimeBucket(saturday, sundayNow)).toBe('thisWeek');

      // Previous Sunday (should be "older")
      const prevSunday = new Date(2024, 5, 9, 12, 0, 0).getTime();
      expect(getTimeBucket(prevSunday, sundayNow)).toBe('older');
    });

    test('uses Date.now() when no "now" parameter provided', () => {
      // Current timestamp should be "today"
      const result = getTimeBucket(Date.now());
      expect(result).toBe('today');
    });
  });

  describe('calculateTimingDistribution', () => {
    // Use a fixed "now" time for deterministic tests
    // 2024-06-15 (Saturday) at 14:00:00
    const fixedNow = new Date(2024, 5, 15, 14, 0, 0).getTime();

    test('returns all zeros for empty array', () => {
      const result = calculateTimingDistribution([]);
      expect(result).toEqual({
        today: 0,
        thisWeek: 0,
        older: 0
      });
    });

    test('returns all zeros for null/undefined input', () => {
      const result = calculateTimingDistribution(null as unknown as Annotation[]);
      expect(result).toEqual({
        today: 0,
        thisWeek: 0,
        older: 0
      });
    });

    test('categorizes single annotation correctly', () => {
      const annotations: Annotation[] = [
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2024, 5, 15, 10, 0, 0).getTime() // Today
        })
      ];
      const result = calculateTimingDistribution(annotations, fixedNow);
      expect(result).toEqual({
        today: 1,
        thisWeek: 0,
        older: 0
      });
    });

    test('distributes annotations across all buckets', () => {
      const annotations: Annotation[] = [
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2024, 5, 15, 10, 0, 0).getTime() // Today
        }),
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2024, 5, 15, 8, 0, 0).getTime() // Today
        }),
        createAnnotation({
          type: AnnotationType.INSERTION,
          createdA: new Date(2024, 5, 13, 12, 0, 0).getTime() // This week (Thursday)
        }),
        createAnnotation({
          type: AnnotationType.DELETION,
          createdA: new Date(2024, 5, 11, 9, 0, 0).getTime() // This week (Tuesday)
        }),
        createAnnotation({
          type: AnnotationType.REPLACEMENT,
          createdA: new Date(2024, 5, 5, 12, 0, 0).getTime() // Older
        }),
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2024, 4, 20, 12, 0, 0).getTime() // Older (May)
        }),
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2023, 11, 25, 12, 0, 0).getTime() // Older (last year)
        })
      ];
      const result = calculateTimingDistribution(annotations, fixedNow);
      expect(result).toEqual({
        today: 2,
        thisWeek: 2,
        older: 3
      });
    });

    test('handles all annotations in one bucket', () => {
      const annotations: Annotation[] = [
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2024, 5, 15, 10, 0, 0).getTime()
        }),
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2024, 5, 15, 11, 0, 0).getTime()
        }),
        createAnnotation({
          type: AnnotationType.COMMENT,
          createdA: new Date(2024, 5, 15, 12, 0, 0).getTime()
        })
      ];
      const result = calculateTimingDistribution(annotations, fixedNow);
      expect(result).toEqual({
        today: 3,
        thisWeek: 0,
        older: 0
      });
    });
  });

  describe('sortAuthorsByCount', () => {
    test('returns empty array for empty input', () => {
      const result = sortAuthorsByCount({});
      expect(result).toEqual([]);
    });

    test('returns single author correctly', () => {
      const stats: StatsByAuthor = { Alice: 5 };
      const result = sortAuthorsByCount(stats);
      expect(result).toEqual([['Alice', 5]]);
    });

    test('sorts authors by count descending', () => {
      const stats: StatsByAuthor = {
        Alice: 3,
        Bob: 7,
        Charlie: 1,
        Diana: 5
      };
      const result = sortAuthorsByCount(stats);
      expect(result).toEqual([
        ['Bob', 7],
        ['Diana', 5],
        ['Alice', 3],
        ['Charlie', 1]
      ]);
    });

    test('handles equal counts (maintains order from Object.entries)', () => {
      const stats: StatsByAuthor = {
        Alice: 3,
        Bob: 3,
        Charlie: 3
      };
      const result = sortAuthorsByCount(stats);
      expect(result).toHaveLength(3);
      // All have count 3
      result.forEach(([, count]) => {
        expect(count).toBe(3);
      });
    });

    test('handles anonymous author', () => {
      const stats: StatsByAuthor = {
        Alice: 5,
        'Anônimo': 10,
        Bob: 3
      };
      const result = sortAuthorsByCount(stats);
      expect(result[0]).toEqual(['Anônimo', 10]);
      expect(result[1]).toEqual(['Alice', 5]);
      expect(result[2]).toEqual(['Bob', 3]);
    });
  });

  describe('getTotalFromStats', () => {
    test('returns 0 for empty object', () => {
      const result = getTotalFromStats({});
      expect(result).toBe(0);
    });

    test('returns correct total for StatsByType', () => {
      const stats: StatsByType = {
        [AnnotationType.COMMENT]: 5,
        [AnnotationType.INSERTION]: 3,
        [AnnotationType.DELETION]: 2
      };
      const result = getTotalFromStats(stats);
      expect(result).toBe(10);
    });

    test('returns correct total for StatsByAuthor', () => {
      const stats: StatsByAuthor = {
        Alice: 7,
        Bob: 4,
        Charlie: 2,
        'Anônimo': 3
      };
      const result = getTotalFromStats(stats);
      expect(result).toBe(16);
    });

    test('handles single entry', () => {
      const stats: StatsByType = {
        [AnnotationType.COMMENT]: 42
      };
      const result = getTotalFromStats(stats);
      expect(result).toBe(42);
    });
  });

  describe('integration scenarios', () => {
    test('comprehensive annotation analysis', () => {
      // 2024-06-15 (Saturday) at 14:00:00
      const fixedNow = new Date(2024, 5, 15, 14, 0, 0).getTime();

      const annotations: Annotation[] = [
        // Today - 2 comments from Alice
        createAnnotation({
          type: AnnotationType.COMMENT,
          author: 'Alice',
          createdA: new Date(2024, 5, 15, 9, 0, 0).getTime()
        }),
        createAnnotation({
          type: AnnotationType.COMMENT,
          author: 'Alice',
          createdA: new Date(2024, 5, 15, 10, 30, 0).getTime()
        }),
        // This week - 1 insertion from Bob, 1 deletion from Alice
        createAnnotation({
          type: AnnotationType.INSERTION,
          author: 'Bob',
          createdA: new Date(2024, 5, 13, 14, 0, 0).getTime()
        }),
        createAnnotation({
          type: AnnotationType.DELETION,
          author: 'Alice',
          createdA: new Date(2024, 5, 12, 11, 0, 0).getTime()
        }),
        // Older - 1 anonymous replacement, 1 global comment from Charlie
        createAnnotation({
          type: AnnotationType.REPLACEMENT,
          createdA: new Date(2024, 5, 1, 10, 0, 0).getTime()
        }),
        createAnnotation({
          type: AnnotationType.GLOBAL_COMMENT,
          author: 'Charlie',
          createdA: new Date(2024, 4, 20, 15, 0, 0).getTime()
        })
      ];

      // Test all stats together
      const statsByType = calculateStatsByType(annotations);
      expect(statsByType).toEqual({
        [AnnotationType.COMMENT]: 2,
        [AnnotationType.INSERTION]: 1,
        [AnnotationType.DELETION]: 1,
        [AnnotationType.REPLACEMENT]: 1,
        [AnnotationType.GLOBAL_COMMENT]: 1
      });
      expect(getTotalFromStats(statsByType)).toBe(6);

      const statsByAuthor = calculateStatsByAuthor(annotations);
      expect(statsByAuthor).toEqual({
        Alice: 3,
        Bob: 1,
        Charlie: 1,
        'Anônimo': 1
      });
      expect(getTotalFromStats(statsByAuthor)).toBe(6);

      const sortedAuthors = sortAuthorsByCount(statsByAuthor);
      expect(sortedAuthors[0]).toEqual(['Alice', 3]);

      const timingDistribution = calculateTimingDistribution(annotations, fixedNow);
      expect(timingDistribution).toEqual({
        today: 2,
        thisWeek: 2,
        older: 2
      });
    });
  });
});
