import { useState, useCallback, useEffect, useRef } from 'react';
import { Annotation, AnnotationType } from '../types';
import { useAnnotationStore } from '../store/useAnnotationStore';
import {
  findElementByOffset,
  getSelectorForElement,
  calculateMarkerPosition
} from '../utils/elementSelector';

export interface SelectionRange {
  startOffset: number;
  endOffset: number;
  text: string;
  startElement: HTMLElement | null;
  endElement: HTMLElement | null;
}

export interface UseAnnotationTargetingOptions {
  containerRef?: React.RefObject<HTMLElement>;
  onCreateAnnotation?: (annotation: Annotation) => void;
  enabled?: boolean;
}

/**
 * useAnnotationTargeting - Hook for annotation targeting logic
 *
 * Handles text selection events and provides utilities for creating
 * annotations from selections. Integrates with useAnnotationStore
 * for persistence and manages edge cases for cross-block selections.
 */
export function useAnnotationTargeting(options: UseAnnotationTargetingOptions = {}) {
  const {
    containerRef,
    onCreateAnnotation,
    enabled = true
  } = options;

  const addAnnotation = useAnnotationStore(state => state.addAnnotation);
  const selectAnnotation = useAnnotationStore(state => state.selectAnnotation);
  const annotations = useAnnotationStore(state => state.annotations);

  const [currentSelection, setCurrentSelection] = useState<SelectionRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const lastSelectionRef = useRef<SelectionRange | null>(null);

  /**
   * Calculate the character offset for a selection point
   */
  const calculateOffset = useCallback((node: Node, offset: number, container: HTMLElement): number => {
    let totalOffset = 0;
    let found = false;

    function traverse(currentNode: Node): void {
      if (found) return;

      if (currentNode === node) {
        totalOffset += offset;
        found = true;
        return;
      }

      if (currentNode.nodeType === Node.TEXT_NODE) {
        totalOffset += currentNode.textContent?.length || 0;
      }

      for (const child of currentNode.childNodes) {
        traverse(child);
        if (found) return;
      }
    }

    traverse(container);
    return totalOffset;
  }, []);

  /**
   * Get the current selection range info
   */
  const getSelectionRange = useCallback((): SelectionRange | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const container = containerRef?.current || document.body;

    // Get start and end elements
    const startElement = range.startContainer.parentElement?.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th') as HTMLElement | null;
    const endElement = range.endContainer.parentElement?.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th') as HTMLElement | null;

    // Calculate offsets
    const startOffset = calculateOffset(range.startContainer, range.startOffset, container);
    const endOffset = calculateOffset(range.endContainer, range.endOffset, container);

    // Get selected text
    const text = range.toString().trim();

    if (!text) return null;

    return {
      startOffset,
      endOffset,
      text,
      startElement,
      endElement
    };
  }, [containerRef, calculateOffset]);

  /**
   * Handle selection change events
   */
  useEffect(() => {
    if (!enabled) return;

    const handleSelectionChange = () => {
      const selectionRange = getSelectionRange();

      if (selectionRange) {
        setCurrentSelection(selectionRange);
        setIsSelecting(false);
        lastSelectionRef.current = selectionRange;
      } else {
        // Only clear if user explicitly clicked away (not just during selection)
        setTimeout(() => {
          const currentSelection = window.getSelection();
          if (!currentSelection || currentSelection.isCollapsed) {
            setCurrentSelection(null);
          }
        }, 100);
      }
    };

    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        handleSelectionChange();
      }
    };

    const handleMouseDown = () => {
      setIsSelecting(true);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enabled, getSelectionRange, isSelecting]);

  /**
   * Create an annotation from the current selection
   */
  const createAnnotationFromSelection = useCallback((
    type: AnnotationType,
    comment?: string,
    author?: string
  ): Annotation | null => {
    const selection = currentSelection || lastSelectionRef.current;
    if (!selection || !selection.text) {
      console.warn('No valid selection to create annotation from');
      return null;
    }

    const container = containerRef?.current || document.body;

    // Check for edge cases
    if (selection.startElement !== selection.endElement) {
      console.warn('Selection spans multiple blocks - this may not be fully supported');
    }

    // Generate unique ID
    const id = `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create target selector if we have a start element
    let targetSelector: string | undefined;
    if (selection.startElement) {
      targetSelector = getSelectorForElement(selection.startElement);
    }

    // Calculate marker position
    let markerPosition: { top: number; left: number } | undefined;
    if (selection.startElement) {
      markerPosition = calculateMarkerPosition(selection.startElement, selection.startOffset);
    }

    // Create the annotation
    const annotation: Annotation = {
      id,
      blockId: selection.startElement?.getAttribute('data-block-id') || '',
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      type,
      text: comment,
      originalText: selection.text,
      createdA: Date.now(),
      author,
      targetSelector,
      markerPosition,
      isHighlighted: false,
      // Store metadata for cross-element selections
      startMeta: selection.startElement ? {
        parentTagName: selection.startElement.tagName,
        parentIndex: Array.from(selection.startElement.parentElement?.children || [])
          .indexOf(selection.startElement),
        textOffset: selection.startOffset
      } : undefined,
      endMeta: selection.endElement ? {
        parentTagName: selection.endElement.tagName,
        parentIndex: Array.from(selection.endElement.parentElement?.children || [])
          .indexOf(selection.endElement),
        textOffset: selection.endOffset
      } : undefined
    };

    // Add to store
    addAnnotation(annotation);
    selectAnnotation(id);

    // Clear the selection
    window.getSelection()?.removeAllRanges();
    setCurrentSelection(null);
    lastSelectionRef.current = null;

    // Call callback if provided
    if (onCreateAnnotation) {
      onCreateAnnotation(annotation);
    }

    return annotation;
  }, [currentSelection, containerRef, addAnnotation, selectAnnotation, onCreateAnnotation]);

  /**
   * Clear the current selection
   */
  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setCurrentSelection(null);
    lastSelectionRef.current = null;
  }, []);

  /**
   * Check if a selection is valid for annotation
   */
  const isSelectionValid = useCallback((): boolean => {
    const selection = currentSelection || lastSelectionRef.current;
    if (!selection) return false;

    // Must have text
    if (!selection.text || selection.text.length === 0) return false;

    // Must have positive range
    if (selection.startOffset >= selection.endOffset) return false;

    // Optional: Check if selection is within supported elements
    if (selection.startElement && selection.endElement) {
      const supportedTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'TD', 'TH'];
      return supportedTags.includes(selection.startElement.tagName) ||
             supportedTags.includes(selection.endElement.tagName);
    }

    return true;
  }, [currentSelection]);

  /**
   * Get the current selection text
   */
  const getSelectionText = useCallback((): string => {
    const selection = currentSelection || lastSelectionRef.current;
    return selection?.text || '';
  }, [currentSelection]);

  return {
    currentSelection,
    isSelecting,
    isSelectionValid,
    createAnnotationFromSelection,
    clearSelection,
    getSelectionText,
    annotations
  };
}
