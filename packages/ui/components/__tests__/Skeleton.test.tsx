import { describe, test, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonBlock } from '../Skeleton';

describe('Skeleton', () => {
  describe('base Skeleton component', () => {
    test('renders with default rect variant', () => {
      render(<Skeleton />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeDefined();
      expect(skeleton.getAttribute('aria-label')).toBe('Loading content');
    });

    test('renders with text variant', () => {
      render(<Skeleton variant="text" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeDefined();
      expect(skeleton.className).toContain('rounded');
    });

    test('renders with circle variant', () => {
      render(<Skeleton variant="circle" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeDefined();
      expect(skeleton.className).toContain('rounded-full');
    });

    test('renders with rect variant', () => {
      render(<Skeleton variant="rect" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeDefined();
      expect(skeleton.className).toContain('rounded-md');
    });

    test('applies custom width and height', () => {
      render(<Skeleton width={200} height={50} />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.style.width).toBe('200px');
      expect(skeleton.style.height).toBe('50px');
    });

    test('accepts string values for width and height', () => {
      render(<Skeleton width="100%" height="2rem" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.style.width).toBe('100%');
      expect(skeleton.style.height).toBe('2rem');
    });

    test('applies custom className', () => {
      render(<Skeleton className="custom-class" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('custom-class');
    });

    test('has pulse animation by default', () => {
      render(<Skeleton />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('animate-pulse');
    });

    test('disables animation when disableAnimation is true', () => {
      render(<Skeleton disableAnimation />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.className).not.toContain('animate-pulse');
    });

    test('includes screen reader text', () => {
      render(<Skeleton />);

      expect(screen.getByText('Loading...')).toBeDefined();
    });

    test('has accessibility attributes', () => {
      render(<Skeleton />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.getAttribute('role')).toBe('status');
      expect(skeleton.getAttribute('aria-label')).toBe('Loading content');
    });
  });

  describe('text variant with multiple lines', () => {
    test('renders multiple skeleton lines', () => {
      render(<Skeleton variant="text" lines={3} />);

      const skeleton = screen.getByRole('status');
      // Count child elements (the skeleton lines)
      const lines = skeleton.querySelectorAll('div');
      expect(lines.length).toBe(3);
    });

    test('last line has 80% width', () => {
      render(<Skeleton variant="text" lines={3} />);

      const skeleton = screen.getByRole('status');
      const lines = skeleton.querySelectorAll('div');
      const lastLine = lines[lines.length - 1];
      expect(lastLine.style.width).toBe('80%');
    });

    test('applies gap between lines', () => {
      render(<Skeleton variant="text" lines={3} />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toContain('flex');
      expect(skeleton.className).toContain('flex-col');
      expect(skeleton.className).toContain('gap-2');
    });
  });

  describe('circle variant sizing', () => {
    test('maintains equal width and height for circle', () => {
      render(<Skeleton variant="circle" width={60} />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.style.width).toBe('60px');
      expect(skeleton.style.height).toBe('60px');
    });

    test('uses height for width when only height provided', () => {
      render(<Skeleton variant="circle" height={80} />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.style.width).toBe('80px');
      expect(skeleton.style.height).toBe('80px');
    });

    test('uses default 40px for circle without dimensions', () => {
      render(<Skeleton variant="circle" />);

      const skeleton = screen.getByRole('status');
      expect(skeleton.style.width).toBe('40px');
      expect(skeleton.style.height).toBe('40px');
    });
  });
});

describe('SkeletonText', () => {
  test('renders text variant', () => {
    render(<SkeletonText />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeDefined();
    expect(skeleton.className).toContain('rounded');
  });

  test('renders multiple lines', () => {
    render(<SkeletonText lines={4} />);

    const skeleton = screen.getByRole('status');
    const lines = skeleton.querySelectorAll('div');
    expect(lines.length).toBe(4);
  });

  test('passes through additional props', () => {
    render(<SkeletonText className="extra-class" disableAnimation />);

    const skeleton = screen.getByRole('status');
    expect(skeleton.className).toContain('extra-class');
    expect(skeleton.className).not.toContain('animate-pulse');
  });
});

describe('SkeletonCircle', () => {
  test('renders circle variant', () => {
    render(<SkeletonCircle />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeDefined();
    expect(skeleton.className).toContain('rounded-full');
  });

  test('uses default size of 40px', () => {
    render(<SkeletonCircle />);

    const skeleton = screen.getByRole('status');
    expect(skeleton.style.width).toBe('40px');
    expect(skeleton.style.height).toBe('40px');
  });

  test('accepts custom size', () => {
    render(<SkeletonCircle size={64} />);

    const skeleton = screen.getByRole('status');
    expect(skeleton.style.width).toBe('64px');
    expect(skeleton.style.height).toBe('64px');
  });

  test('accepts string size', () => {
    render(<SkeletonCircle size="3rem" />);

    const skeleton = screen.getByRole('status');
    expect(skeleton.style.width).toBe('3rem');
    expect(skeleton.style.height).toBe('3rem');
  });
});

describe('SkeletonBlock', () => {
  test('renders rect variant', () => {
    render(<SkeletonBlock />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeDefined();
    expect(skeleton.className).toContain('rounded-md');
  });

  test('accepts width and height props', () => {
    render(<SkeletonBlock width="100%" height={120} />);

    const skeleton = screen.getByRole('status');
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('120px');
  });

  test('passes through className', () => {
    render(<SkeletonBlock className="my-block" />);

    const skeleton = screen.getByRole('status');
    expect(skeleton.className).toContain('my-block');
  });
});
