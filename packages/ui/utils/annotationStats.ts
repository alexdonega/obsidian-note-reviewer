import { Annotation, AnnotationType } from '../types';

/**
 * Statistics counting annotations by type
 */
export interface StatsByType {
  [key: string]: number;
}

/**
 * Statistics counting annotations by author
 */
export interface StatsByAuthor {
  [author: string]: number;
}

/**
 * Time bucket categories for timing distribution
 */
export type TimeBucket = 'today' | 'thisWeek' | 'older';

/**
 * Distribution of annotations across time buckets
 */
export interface TimingDistribution {
  today: number;
  thisWeek: number;
  older: number;
}

/**
 * Calculates the count of annotations for each AnnotationType.
 * Returns an object with AnnotationType values as keys and counts as values.
 * Only includes types that have at least one annotation.
 */
export const calculateStatsByType = (annotations: Annotation[]): StatsByType => {
  if (!annotations || annotations.length === 0) {
    return {};
  }

  return annotations.reduce((acc, annotation) => {
    const type = annotation.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as StatsByType);
};

/**
 * Calculates the count of annotations for each author.
 * Returns an object with author names as keys and counts as values.
 * Annotations without an author are grouped under 'Anônimo'.
 */
export const calculateStatsByAuthor = (annotations: Annotation[]): StatsByAuthor => {
  if (!annotations || annotations.length === 0) {
    return {};
  }

  return annotations.reduce((acc, annotation) => {
    const author = annotation.author || 'Anônimo';
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {} as StatsByAuthor);
};

/**
 * Determines which time bucket a timestamp belongs to.
 * @param timestamp - The timestamp to categorize (in milliseconds)
 * @param now - The current time (optional, defaults to Date.now())
 */
export const getTimeBucket = (timestamp: number, now: number = Date.now()): TimeBucket => {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayStart = startOfToday.getTime();

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
  startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekStart = startOfWeek.getTime();

  if (timestamp >= todayStart) {
    return 'today';
  } else if (timestamp >= weekStart) {
    return 'thisWeek';
  } else {
    return 'older';
  }
};

/**
 * Calculates the distribution of annotations across time buckets.
 * Returns counts for 'today', 'thisWeek', and 'older'.
 * @param annotations - The annotations to analyze
 * @param now - The current time (optional, defaults to Date.now())
 */
export const calculateTimingDistribution = (
  annotations: Annotation[],
  now: number = Date.now()
): TimingDistribution => {
  const distribution: TimingDistribution = {
    today: 0,
    thisWeek: 0,
    older: 0
  };

  if (!annotations || annotations.length === 0) {
    return distribution;
  }

  annotations.forEach(annotation => {
    const bucket = getTimeBucket(annotation.createdA, now);
    distribution[bucket]++;
  });

  return distribution;
};

/**
 * Sorts authors by their annotation count in descending order.
 * Returns an array of [author, count] tuples.
 */
export const sortAuthorsByCount = (statsByAuthor: StatsByAuthor): [string, number][] => {
  return Object.entries(statsByAuthor).sort((a, b) => b[1] - a[1]);
};

/**
 * Gets the total count of annotations from StatsByType.
 */
export const getTotalFromStats = (stats: StatsByType | StatsByAuthor): number => {
  return Object.values(stats).reduce((sum, count) => sum + count, 0);
};
