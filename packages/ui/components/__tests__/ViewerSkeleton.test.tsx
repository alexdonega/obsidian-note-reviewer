import { describe, test, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { ViewerSkeleton } from '../ViewerSkeleton';

describe('ViewerSkeleton', () => {
  describe('accessibility', () => {
    test('has role="status" on article element', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      expect(article).toBeDefined();
      expect(article.tagName.toLowerCase()).toBe('article');
    });

    test('has aria-label for screen readers', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      expect(article.getAttribute('aria-label')).toBe('Loading content');
    });

    test('includes screen reader only text', () => {
      render(<ViewerSkeleton />);

      expect(screen.getByText('Loading document content...')).toBeDefined();
    });
  });

  describe('structure', () => {
    test('renders container with correct classes', () => {
      const { container } = render(<ViewerSkeleton />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('relative');
      expect(wrapper.className).toContain('w-full');
      expect(wrapper.className).toContain('max-w-3xl');
    });

    test('renders article with viewer styling', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      expect(article.className).toContain('bg-card');
      expect(article.className).toContain('rounded-xl');
      expect(article.className).toContain('shadow-xl');
    });

    test('renders heading skeleton', () => {
      render(<ViewerSkeleton />);

      // Query all skeleton elements (role="status" divs with muted background)
      const article = screen.getByRole('status');
      const headingSection = article.querySelector('.mb-6.mt-0');
      expect(headingSection).toBeDefined();

      // The heading skeleton should have a larger height
      const headingSkeleton = headingSection?.querySelector('[style*="height: 2rem"]');
      expect(headingSkeleton).toBeDefined();
    });

    test('renders paragraph skeletons', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      // Check for paragraph sections (mb-6 containers with skeleton text)
      const paragraphSections = article.querySelectorAll('.mb-6');
      // We have: heading section (mb-6 mt-0), first paragraph, second paragraph, third paragraph, list section
      expect(paragraphSections.length).toBeGreaterThanOrEqual(4);
    });

    test('renders code block skeleton', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      // The code block has a bg-muted/50 container
      const codeBlock = article.querySelector('.bg-muted\\/50');
      expect(codeBlock).toBeDefined();

      // Should have multiple code lines (5 in the implementation)
      const codeLines = codeBlock?.querySelectorAll('[role="status"]');
      expect(codeLines?.length).toBe(5);
    });

    test('renders list items skeleton', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      // List items have flex gap-3 items-center layout
      const listItems = article.querySelectorAll('.flex.gap-3.items-center');
      expect(listItems.length).toBe(4);
    });

    test('renders circular bullet points for list items', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      // Look for circle skeletons (6px size)
      const bulletPoints = article.querySelectorAll('[style*="width: 6px"]');
      expect(bulletPoints.length).toBe(4);
    });

    test('renders subheading skeleton', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      // Subheading section has mt-8 class
      const subheadingSection = article.querySelector('.mt-8');
      expect(subheadingSection).toBeDefined();

      // Check for the subheading skeleton (1.5rem height)
      const subheadingSkeleton = subheadingSection?.querySelector('[style*="height: 1.5rem"]');
      expect(subheadingSkeleton).toBeDefined();
    });
  });

  describe('skeleton elements have animation', () => {
    test('all skeleton elements have animate-pulse class', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      // Get all elements with bg-muted (skeleton elements)
      const skeletons = article.querySelectorAll('.bg-muted');

      // All skeleton elements should be animated
      skeletons.forEach(skeleton => {
        expect(skeleton.className).toContain('animate-pulse');
      });
    });
  });

  describe('responsive padding', () => {
    test('article has responsive padding classes', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      // Check for responsive padding classes
      expect(article.className).toContain('p-5');
      expect(article.className).toContain('md:p-10');
      expect(article.className).toContain('lg:p-14');
    });
  });

  describe('list item widths', () => {
    test('list items have varying widths for realistic appearance', () => {
      render(<ViewerSkeleton />);

      const article = screen.getByRole('status');
      const listItemTexts = article.querySelectorAll('.flex.gap-3.items-center [style*="width"]');

      // Check that we have different widths for variety
      const widths = new Set<string>();
      listItemTexts.forEach(item => {
        const width = (item as HTMLElement).style.width;
        if (width.includes('%')) {
          widths.add(width);
        }
      });

      // Should have at least 3 different widths (75%, 60%, 80%, 55%)
      expect(widths.size).toBeGreaterThanOrEqual(3);
    });
  });
});
