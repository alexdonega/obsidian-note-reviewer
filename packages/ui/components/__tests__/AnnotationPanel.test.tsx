import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotationPanel } from '../AnnotationPanel';
import { Annotation, AnnotationType } from '../../types';

// Mock navigator.clipboard
const mockWriteText = mock(() => Promise.resolve());

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  });
  mockWriteText.mockClear();
});

afterEach(() => {
  mockWriteText.mockClear();
});

// Helper to create test annotations
function createAnnotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'test-1',
    blockId: 'block-1',
    startOffset: 0,
    endOffset: 10,
    type: AnnotationType.COMMENT,
    originalText: 'highlighted text',
    text: 'comment text',
    createdA: Date.now(),
    author: 'test-user',
    ...overrides,
  };
}

// Default props for AnnotationPanel
const defaultProps = {
  isOpen: true,
  annotations: [] as Annotation[],
  blocks: [],
  onSelect: mock(() => {}),
  onDelete: mock(() => {}),
  selectedId: null,
};

describe('AnnotationPanel', () => {
  describe('AnnotationCard copy functionality', () => {
    test('renders annotation card with copy button', () => {
      const annotation = createAnnotation();

      render(
        <AnnotationPanel
          {...defaultProps}
          annotations={[annotation]}
        />
      );

      // Should render the annotation card
      expect(screen.getByText('comment text')).toBeDefined();
      // Copy button should exist (with title "Copiar")
      expect(screen.getByTitle('Copiar')).toBeDefined();
    });

    test('copy button has correct hover visibility classes', () => {
      const annotation = createAnnotation();

      render(
        <AnnotationPanel
          {...defaultProps}
          annotations={[annotation]}
        />
      );

      const copyButton = screen.getByTitle('Copiar');
      // Button should have opacity-0 for default hidden state and group-hover:opacity-100 for hover visibility
      expect(copyButton.className).toContain('opacity-0');
      expect(copyButton.className).toContain('group-hover:opacity-100');
    });

    test('clicking copy button copies annotation.text to clipboard', async () => {
      const annotation = createAnnotation({
        text: 'my comment text',
        originalText: 'original highlighted',
      });

      render(
        <AnnotationPanel
          {...defaultProps}
          annotations={[annotation]}
        />
      );

      const copyButton = screen.getByTitle('Copiar');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('my comment text');
      });
    });

    test('clicking copy button copies originalText when text is not available', async () => {
      const annotation = createAnnotation({
        type: AnnotationType.DELETION,
        text: undefined,
        originalText: 'text to delete',
      });

      render(
        <AnnotationPanel
          {...defaultProps}
          annotations={[annotation]}
        />
      );

      const copyButton = screen.getByTitle('Copiar');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('text to delete');
      });
    });

    test('copy button shows checkmark after successful copy', async () => {
      const annotation = createAnnotation();

      render(
        <AnnotationPanel
          {...defaultProps}
          annotations={[annotation]}
        />
      );

      const copyButton = screen.getByTitle('Copiar');
      fireEvent.click(copyButton);

      await waitFor(() => {
        // After clicking, title should change to "Copiado!"
        expect(screen.getByTitle('Copiado!')).toBeDefined();
      });
    });
  });
});
