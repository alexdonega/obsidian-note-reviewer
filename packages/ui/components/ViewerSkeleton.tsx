import React from 'react';
import { Skeleton, SkeletonText } from './Skeleton';

/**
 * ViewerSkeleton component - renders skeleton blocks mimicking typical markdown content
 *
 * This component displays a loading placeholder that matches the visual structure
 * of the Viewer component, including:
 * - Heading skeleton
 * - Paragraph skeletons
 * - Code block skeleton
 * - List item skeletons
 */
export function ViewerSkeleton() {
  return (
    <div className="relative z-50 w-full max-w-3xl">
      <article
        className="w-full max-w-3xl bg-card border border-border/50 rounded-xl shadow-xl p-5 md:p-10 lg:p-14 relative"
        role="status"
        aria-label="Loading content"
      >
        {/* Heading skeleton - larger, prominent */}
        <div className="mb-6 mt-0">
          <Skeleton
            variant="text"
            width="60%"
            height="2rem"
            className="rounded"
          />
        </div>

        {/* First paragraph skeleton - 3 lines */}
        <div className="mb-6">
          <SkeletonText lines={3} className="gap-3" />
        </div>

        {/* Second paragraph skeleton - 4 lines */}
        <div className="mb-6">
          <SkeletonText lines={4} className="gap-3" />
        </div>

        {/* Code block skeleton - mimics pre/code styling */}
        <div className="my-5">
          <div className="rounded-lg bg-muted/50 border border-border/30 p-4 space-y-2">
            {/* Shorter lines to mimic code indentation patterns */}
            <Skeleton variant="text" width="70%" height="1em" className="rounded" />
            <Skeleton variant="text" width="45%" height="1em" className="rounded" />
            <Skeleton variant="text" width="85%" height="1em" className="rounded" />
            <Skeleton variant="text" width="50%" height="1em" className="rounded" />
            <Skeleton variant="text" width="65%" height="1em" className="rounded" />
          </div>
        </div>

        {/* Subheading skeleton */}
        <div className="mb-4 mt-8">
          <Skeleton
            variant="text"
            width="40%"
            height="1.5rem"
            className="rounded"
          />
        </div>

        {/* Third paragraph skeleton - 2 lines */}
        <div className="mb-6">
          <SkeletonText lines={2} className="gap-3" />
        </div>

        {/* List items skeleton - 4 items */}
        <div className="space-y-3 mb-6">
          {[75, 60, 80, 55].map((width, index) => (
            <div key={index} className="flex gap-3 items-center">
              {/* Bullet point skeleton */}
              <Skeleton
                variant="circle"
                width={6}
                height={6}
                className="flex-shrink-0"
              />
              {/* List item text skeleton */}
              <Skeleton
                variant="text"
                width={`${width}%`}
                height="1em"
                className="rounded"
              />
            </div>
          ))}
        </div>

        {/* Screen reader text */}
        <span className="sr-only">Loading document content...</span>
      </article>
    </div>
  );
}

export default ViewerSkeleton;
