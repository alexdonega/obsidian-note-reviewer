import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from '../ExportModal';
import { AnnotationType } from '../../types';

const mockAnnotations = [
  {
    id: '1',
    blockId: 'block-1',
    startOffset: 0,
    endOffset: 10,
    type: AnnotationType.REPLACEMENT,
    originalText: 'old text',
    text: 'new text',
    author: 'test-author',
    createdA: Date.now(),
  },
  {
    id: '2',
    blockId: 'block-2',
    startOffset: 0,
    endOffset: 5,
    type: AnnotationType.DELETION,
    originalText: 'deleted',
    createdA: Date.now(),
  },
];

const defaultProps = {
  isOpen: true,
  onClose: mock(() => {}),
  shareUrl: 'https://example.com/share?data=abc123',
  shareUrlSize: '1.2 KB',
  diffOutput: '- old text\n+ new text',
  annotationCount: 2,
  annotations: mockAnnotations,
};

describe('ExportModal', () => {
  test('renders all three tabs', () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByText('Share')).toBeDefined();
    expect(screen.getByText('Raw Diff')).toBeDefined();
    expect(screen.getByText('JSON')).toBeDefined();
  });

  test('does not render when isOpen is false', () => {
    render(<ExportModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Share')).toBeNull();
    expect(screen.queryByText('Export')).toBeNull();
  });

  test('shows Share tab content by default', () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByText('Shareable URL')).toBeDefined();
    expect(screen.getByDisplayValue(defaultProps.shareUrl)).toBeDefined();
    expect(screen.getByText(defaultProps.shareUrlSize)).toBeDefined();
  });

  test('switches to Raw Diff tab and shows diff content', () => {
    render(<ExportModal {...defaultProps} />);

    const diffTab = screen.getByText('Raw Diff');
    fireEvent.click(diffTab);

    expect(screen.getByText(defaultProps.diffOutput)).toBeDefined();
    expect(screen.getByText('Download .diff')).toBeDefined();
  });

  test('switches to JSON tab and displays JSON content', () => {
    render(<ExportModal {...defaultProps} />);

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    // Verify JSON tab is active and shows content
    expect(screen.getByText('Download .json')).toBeDefined();
  });

  test('JSON content contains expected annotation data', () => {
    render(<ExportModal {...defaultProps} />);

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    // The JSON should contain our annotation data
    const preElement = screen.getByText(/REPLACEMENT/);
    expect(preElement).toBeDefined();
    expect(screen.getByText(/old text/)).toBeDefined();
    expect(screen.getByText(/new text/)).toBeDefined();
    expect(screen.getByText(/test-author/)).toBeDefined();
    expect(screen.getByText(/DELETION/)).toBeDefined();
    expect(screen.getByText(/deleted/)).toBeDefined();
  });

  test('JSON output is properly formatted', () => {
    render(<ExportModal {...defaultProps} />);

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    // Find the pre element with JSON content and verify structure
    const preElements = document.querySelectorAll('pre');
    const jsonPre = Array.from(preElements).find(pre => pre.textContent?.includes('REPLACEMENT'));

    expect(jsonPre).toBeDefined();
    const jsonContent = jsonPre?.textContent || '';

    // Parse the JSON to verify it's valid
    const parsed = JSON.parse(jsonContent);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
    expect(parsed[0].type).toBe('REPLACEMENT');
    expect(parsed[0].originalText).toBe('old text');
    expect(parsed[0].text).toBe('new text');
    expect(parsed[0].author).toBe('test-author');
    expect(parsed[1].type).toBe('DELETION');
    expect(parsed[1].originalText).toBe('deleted');
  });

  test('shows correct annotation count in header', () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByText('2 annotations')).toBeDefined();
  });

  test('shows singular annotation text for one annotation', () => {
    render(<ExportModal {...defaultProps} annotationCount={1} />);

    expect(screen.getByText('1 annotation')).toBeDefined();
  });

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = mock(() => {});
    render(<ExportModal {...defaultProps} onClose={mockOnClose} />);

    // Find the close button (the X button in the header)
    const closeButtons = document.querySelectorAll('button');
    const closeButton = Array.from(closeButtons).find(btn =>
      btn.querySelector('svg path[d*="M6 18L18 6"]')
    );

    expect(closeButton).toBeDefined();
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  test('JSON tab shows Copy and Download buttons', () => {
    render(<ExportModal {...defaultProps} />);

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    expect(screen.getByText('Copy')).toBeDefined();
    expect(screen.getByText('Download .json')).toBeDefined();
  });

  test('JSON does not include undefined fields', () => {
    const annotationsWithoutOptionals = [
      {
        id: '1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.DELETION,
        originalText: 'text to delete',
        createdA: Date.now(),
        // No text or author fields
      },
    ];

    render(
      <ExportModal
        {...defaultProps}
        annotations={annotationsWithoutOptionals}
        annotationCount={1}
      />
    );

    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);

    const preElements = document.querySelectorAll('pre');
    const jsonPre = Array.from(preElements).find(pre => pre.textContent?.includes('DELETION'));
    const jsonContent = jsonPre?.textContent || '';

    const parsed = JSON.parse(jsonContent);
    expect(parsed[0].text).toBeUndefined();
    expect(parsed[0].author).toBeUndefined();
    expect(parsed[0].type).toBe('DELETION');
    expect(parsed[0].originalText).toBe('text to delete');
  });
});
