/**
 * AnimatedCheckmark Component
 *
 * A reusable checkmark SVG that draws with a stroke animation for enhanced visual feedback.
 * Uses CSS animations defined in index.css (copy-check-animated class) for the stroke-dashoffset
 * animation effect. Automatically respects user's prefers-reduced-motion preference via CSS.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AnimatedCheckmark />
 *
 * // With custom size and additional class
 * <AnimatedCheckmark size={20} className="my-custom-class" />
 *
 * // Combined with copy feedback hook
 * {copied && <AnimatedCheckmark className={iconClass} />}
 * ```
 */

import React from 'react';

export interface AnimatedCheckmarkProps {
  /**
   * Size of the checkmark in pixels.
   * Can also be a string like 'w-4' for Tailwind classes.
   * @default 16
   */
  size?: number | string;
  /**
   * Additional CSS class names to apply to the SVG.
   * Typically used for icon transition animations (e.g., 'copy-icon-enter').
   */
  className?: string;
  /**
   * Stroke width for the checkmark path.
   * @default 2
   */
  strokeWidth?: number;
  /**
   * Whether to animate the checkmark drawing.
   * When true, applies the 'copy-check-animated' class for stroke animation.
   * @default true
   */
  animated?: boolean;
  /**
   * Accessible label for the checkmark.
   * @default 'Success'
   */
  'aria-label'?: string;
}

/**
 * AnimatedCheckmark - A checkmark SVG with optional stroke-draw animation
 *
 * The animation is CSS-based and automatically respects the user's
 * prefers-reduced-motion preference. When reduced motion is preferred,
 * the checkmark displays instantly without animation while maintaining
 * full visual feedback.
 */
export function AnimatedCheckmark({
  size = 16,
  className = '',
  strokeWidth = 2,
  animated = true,
  'aria-label': ariaLabel = 'Success',
}: AnimatedCheckmarkProps) {
  // Handle size - can be a number (pixels) or string (Tailwind class)
  const sizeStyles: React.CSSProperties =
    typeof size === 'number'
      ? { width: size, height: size }
      : {};

  // Build the class name
  // Always include the base animated class when animated is true
  const animatedClass = animated ? 'copy-check-animated' : '';

  // Combine all classes - filter out empty strings
  const combinedClassName = [animatedClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      className={combinedClassName || undefined}
      style={sizeStyles}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      role="img"
      aria-label={ariaLabel}
    >
      {/*
        Checkmark path: M5 13l4 4L19 7
        - Starts at point (5, 13)
        - Draws line to (9, 17) - the bottom of the check
        - Draws line to (19, 7) - the top of the check

        The stroke-dasharray and stroke-dashoffset values in CSS are set to 24
        which is approximately the path length, allowing for a smooth draw animation.
      */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

/**
 * Hook to detect if user prefers reduced motion.
 * Can be used to conditionally skip JavaScript-based animations
 * while CSS animations are handled automatically by media query.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 * // Use this to skip any JS-based animation logic
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(() => {
    // Default to false during SSR, check on client
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value on client
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener with options for modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

export default AnimatedCheckmark;
