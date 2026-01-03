/**
 * Annotation Sorting Utilities
 *
 * Provides sorting functionality for annotations by various criteria:
 * - newest: Most recent annotations first (by createdA timestamp)
 * - oldest: Oldest annotations first (by createdA timestamp)
 * - type: Grouped by annotation type following display order
 * - author: Alphabetically by author name
 */

import { Annotation, AnnotationType, SortOption } from '../types';

/**
 * Type order for sorting annotations by type.
 * Follows the display order from typeConfig in AnnotationCard.
 */
const TYPE_ORDER: Record<AnnotationType, number> = {
  [AnnotationType.DELETION]: 0,
  [AnnotationType.INSERTION]: 1,
  [AnnotationType.REPLACEMENT]: 2,
  [AnnotationType.COMMENT]: 3,
  [AnnotationType.GLOBAL_COMMENT]: 4,
};

/**
 * Sort annotations by the specified criteria.
 *
 * @param annotations - Array of annotations to sort
 * @param sortOption - The sorting criteria to apply
 * @returns A new sorted array (does not mutate original)
 */
export function sortAnnotations(
  annotations: Annotation[],
  sortOption: SortOption
): Annotation[] {
  const sorted = [...annotations];

  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) => b.createdA - a.createdA);

    case 'oldest':
      return sorted.sort((a, b) => a.createdA - b.createdA);

    case 'type':
      return sorted.sort((a, b) => {
        const typeComparison = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
        // Secondary sort by timestamp (oldest first) within same type
        if (typeComparison === 0) {
          return a.createdA - b.createdA;
        }
        return typeComparison;
      });

    case 'author':
      return sorted.sort((a, b) => {
        // Annotations without author go to the end
        const authorA = a.author ?? '';
        const authorB = b.author ?? '';

        if (authorA === '' && authorB === '') {
          // Both have no author, sort by timestamp
          return a.createdA - b.createdA;
        }
        if (authorA === '') return 1;
        if (authorB === '') return -1;

        const authorComparison = authorA.localeCompare(authorB);
        // Secondary sort by timestamp (oldest first) within same author
        if (authorComparison === 0) {
          return a.createdA - b.createdA;
        }
        return authorComparison;
      });

    default:
      // TypeScript exhaustiveness check
      const _exhaustiveCheck: never = sortOption;
      return sorted;
  }
}
