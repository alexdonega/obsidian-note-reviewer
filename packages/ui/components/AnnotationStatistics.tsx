import React, { useMemo } from 'react';
import { Annotation, AnnotationType } from '../types';
import { CollapsibleSection } from './CollapsibleSection';
import {
  calculateStatsByType,
  calculateStatsByAuthor,
  calculateTimingDistribution,
  sortAuthorsByCount,
  StatsByType as StatsByTypeData,
  StatsByAuthor as StatsByAuthorData,
  TimingDistribution as TimingDistributionData,
} from '../utils/annotationStats';
import { annotationTypeConfig } from '../utils/annotationTypeConfig';
import { isCurrentUser } from '../utils/identity';

export interface AnnotationStatisticsProps {
  /**
   * The annotations to calculate statistics for
   */
  annotations: Annotation[];
  /**
   * Optional callback when the section is toggled
   */
  onToggle?: (isCollapsed: boolean) => void;
  /**
   * Whether the section starts collapsed
   * @default true
   */
  defaultCollapsed?: boolean;
}

/**
 * Main statistics component that displays annotation statistics
 * broken down by type, author, and timing distribution.
 */
export const AnnotationStatistics: React.FC<AnnotationStatisticsProps> = ({
  annotations,
  onToggle,
  defaultCollapsed = true,
}) => {
  const statsByType = useMemo(
    () => calculateStatsByType(annotations),
    [annotations]
  );

  const statsByAuthor = useMemo(
    () => calculateStatsByAuthor(annotations),
    [annotations]
  );

  const timingDistribution = useMemo(
    () => calculateTimingDistribution(annotations),
    [annotations]
  );

  // Don't render if there are no annotations
  if (annotations.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Estatísticas"
      defaultCollapsed={defaultCollapsed}
      onToggle={onToggle}
      className="annotation-statistics"
    >
      <div className="annotation-statistics-content">
        <StatsByType stats={statsByType} />
        <StatsByAuthor stats={statsByAuthor} />
        <TimingDistributionSection distribution={timingDistribution} />
      </div>
    </CollapsibleSection>
  );
};

/**
 * Displays annotation counts for each type with colored badges.
 * Uses colors and icons from annotationTypeConfig.
 */
interface StatsByTypeProps {
  stats: StatsByTypeData;
}

const StatsByType: React.FC<StatsByTypeProps> = ({ stats }) => {
  const entries = Object.entries(stats).filter(([_, count]) => count > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="stats-section stats-by-type">
      <h4 className="stats-section-title">Por Tipo</h4>
      <div className="stats-badges">
        {entries.map(([type, count]) => {
          const config = annotationTypeConfig[type as AnnotationType];
          return (
            <div
              key={type}
              className={`stats-badge ${config.bg} ${config.color}`}
            >
              <span className="stats-badge-icon">{config.icon}</span>
              <span className="stats-badge-label">{config.label}</span>
              <span className="stats-badge-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Displays annotation counts per author.
 * Sorted by count descending.
 * Highlights the current user's contributions.
 */
interface StatsByAuthorProps {
  stats: StatsByAuthorData;
}

const StatsByAuthor: React.FC<StatsByAuthorProps> = ({ stats }) => {
  const sortedAuthors = useMemo(() => sortAuthorsByCount(stats), [stats]);

  if (sortedAuthors.length === 0) {
    return null;
  }

  return (
    <div className="stats-section stats-by-author">
      <h4 className="stats-section-title">Por Autor</h4>
      <div className="stats-author-list">
        {sortedAuthors.map(([author, count]) => {
          const isMe = isCurrentUser(author);
          return (
            <div
              key={author}
              className={`stats-author-item ${isMe ? 'stats-author-current' : ''}`}
            >
              <span className={`stats-author-name ${isMe ? 'stats-author-name-current' : ''}`}>
                {author}{isMe && ' (eu)'}
              </span>
              <span className={`stats-author-count ${isMe ? 'stats-author-count-current' : ''}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Displays the timing distribution across time buckets.
 * Shows distribution for today, this week, and older annotations.
 */
interface TimingDistributionSectionProps {
  distribution: TimingDistributionData;
}

const TimingDistributionSection: React.FC<TimingDistributionSectionProps> = ({ distribution }) => {
  const total = distribution.today + distribution.thisWeek + distribution.older;

  if (total === 0) {
    return null;
  }

  const buckets = [
    { key: 'today', label: 'Hoje', count: distribution.today },
    { key: 'thisWeek', label: 'Esta semana', count: distribution.thisWeek },
    { key: 'older', label: 'Anterior', count: distribution.older },
  ].filter(bucket => bucket.count > 0);

  return (
    <div className="stats-section stats-timing">
      <h4 className="stats-section-title">Quando</h4>
      <div className="stats-timing-list">
        {buckets.map(bucket => (
          <div key={bucket.key} className="stats-timing-item">
            <span className="stats-timing-label">{bucket.label}</span>
            <span className="stats-timing-count">{bucket.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
