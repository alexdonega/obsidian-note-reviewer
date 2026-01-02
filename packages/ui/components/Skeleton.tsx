import React from 'react';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  /** Shape variant of the skeleton */
  variant?: SkeletonVariant;
  /** Width of the skeleton (CSS value or number in pixels) */
  width?: string | number;
  /** Height of the skeleton (CSS value or number in pixels) */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Disable animation */
  disableAnimation?: boolean;
  /** Number of lines for text variant */
  lines?: number;
}

function formatSize(size: string | number | undefined): string | undefined {
  if (size === undefined) return undefined;
  return typeof size === 'number' ? `${size}px` : size;
}

/**
 * Skeleton component for loading placeholder UI
 *
 * Supports three variants:
 * - text: For text content with optional multiple lines
 * - rect: For rectangular content blocks (default)
 * - circle: For circular avatars and icons
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  className = '',
  disableAnimation = false,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = `bg-muted ${disableAnimation ? '' : 'animate-pulse'}`;

  const formattedWidth = formatSize(width);
  const formattedHeight = formatSize(height);

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={`flex flex-col gap-2 ${className}`}
        role="status"
        aria-label="Loading content"
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} rounded`}
            style={{
              width: index === lines - 1 ? '80%' : (formattedWidth || '100%'),
              height: formattedHeight || '1em',
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Variant-specific styles
  const variantClasses = {
    text: 'rounded',
    rect: 'rounded-md',
    circle: 'rounded-full',
  };

  // Default dimensions based on variant
  const defaultStyles: React.CSSProperties = {
    width: formattedWidth || (variant === 'circle' ? '40px' : '100%'),
    height: formattedHeight || (variant === 'text' ? '1em' : variant === 'circle' ? '40px' : '100px'),
  };

  // For circle, ensure equal width and height
  if (variant === 'circle' && formattedWidth && !formattedHeight) {
    defaultStyles.height = formattedWidth;
  }
  if (variant === 'circle' && formattedHeight && !formattedWidth) {
    defaultStyles.width = formattedHeight;
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={defaultStyles}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Convenience components for common use cases

export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
}

/**
 * Skeleton for text content
 */
export function SkeletonText({ lines = 1, ...props }: SkeletonTextProps) {
  return <Skeleton variant="text" lines={lines} {...props} />;
}

export interface SkeletonCircleProps extends Omit<SkeletonProps, 'variant' | 'width' | 'height'> {
  size?: string | number;
}

/**
 * Skeleton for circular elements like avatars
 */
export function SkeletonCircle({ size = 40, ...props }: SkeletonCircleProps) {
  return <Skeleton variant="circle" width={size} height={size} {...props} />;
}

export interface SkeletonBlockProps extends Omit<SkeletonProps, 'variant'> {}

/**
 * Skeleton for rectangular blocks
 */
export function SkeletonBlock(props: SkeletonBlockProps) {
  return <Skeleton variant="rect" {...props} />;
}
