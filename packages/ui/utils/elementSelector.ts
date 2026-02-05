import { AnnotationType } from '../types';

/**
 * Element Selector Utilities
 *
 * Utilities for targeting and highlighting markdown elements for annotations.
 * Supports precise element targeting across different markdown block types.
 */

/**
 * DOM element interface for annotation targeting
 */
export interface ElementInfo {
  element: HTMLElement;
  textOffset: number;
  parentIndex: number;
  parentTagName: string;
}

/**
 * Finds an element by character offset in the document
 * Traverses the DOM to locate which text node contains the offset
 *
 * @param offset - Character offset in the document
 * @param rootElement - Root element to search within (default: document body)
 * @returns Element information or null if not found
 */
export function findElementByOffset(
  offset: number,
  rootElement: HTMLElement = document.body
): ElementInfo | null {
  let currentOffset = 0;

  function traverse(node: Node): ElementInfo | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;

      if (currentOffset <= offset && offset <= currentOffset + textLength) {
        // Found the text node containing the offset
        const parent = node.parentElement;
        if (parent) {
          const siblings = Array.from(parent.parentElement?.children || []);
          const parentIndex = siblings.indexOf(parent);

          return {
            element: parent as HTMLElement,
            textOffset: offset - currentOffset,
            parentIndex,
            parentTagName: parent.tagName
          };
        }
      }

      currentOffset += textLength;
    }

    // Recursively traverse child nodes
    for (const child of node.childNodes) {
      const result = traverse(child);
      if (result) return result;
    }

    return null;
  }

  return traverse(rootElement);
}

/**
 * Generates a unique CSS selector for an element
 * Creates a selector that can reliably identify the element
 *
 * @param element - The element to generate selector for
 * @returns CSS selector string
 */
export function getSelectorForElement(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    // Add ID if present
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

    // Add class if present
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(Boolean);
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }

    // Add nth-child if no ID or class
    if (!current.id && (!current.className || typeof current.className !== 'string' || current.className.trim().split(/\s+/).filter(Boolean).length === 0)) {
      const siblings = Array.from(current.parentElement?.children || [])
        .filter(el => el.tagName === current!.tagName);
      const index = siblings.indexOf(current);
      if (index > 0 || siblings.length > 1) {
        selector += `:nth-child(${index + 1})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

/**
 * Applies visual highlight to an element based on annotation type
 *
 * @param selector - CSS selector for the element
 * @param type - Annotation type for styling
 * @returns boolean indicating success
 */
export function highlightElement(selector: string, type: AnnotationType): boolean {
  try {
    const element = document.querySelector(selector);
    if (!element) return false;

    // Remove existing highlight if present
    clearHighlight(selector);

    // Add data attribute for tracking
    element.setAttribute('data-annotation', type);

    // Apply type-specific styling
    const baseStyles = 'transition-colors duration-200';
    const typeStyles = getTypeStyles(type);

    element.classList.add(...baseStyles.split(' '), ...typeStyles.split(' '));

    return true;
  } catch (error) {
    console.warn(`Failed to highlight element: ${selector}`, error);
    return false;
  }
}

/**
 * Removes visual highlight from an element
 *
 * @param selector - CSS selector for the element
 * @returns boolean indicating success
 */
export function clearHighlight(selector: string): boolean {
  try {
    const element = document.querySelector(selector);
    if (!element) return false;

    // Remove annotation data attribute
    element.removeAttribute('data-annotation');

    // Remove annotation-specific classes
    const classesToRemove = Array.from(element.classList)
      .filter(cls => cls.startsWith('annotation-') || cls.includes('highlight'));

    element.classList.remove(...classesToRemove);

    return true;
  } catch (error) {
    console.warn(`Failed to clear highlight: ${selector}`, error);
    return false;
  }
}

/**
 * Gets type-specific CSS classes for highlighting
 */
function getTypeStyles(type: AnnotationType): string {
  const baseClass = 'annotation-highlight';

  switch (type) {
    case AnnotationType.DELETION:
      return `${baseClass} bg-destructive/20 line-through text-destructive`;
    case AnnotationType.INSERTION:
      return `${baseClass} bg-secondary/30 text-secondary underline decoration-wavy`;
    case AnnotationType.REPLACEMENT:
      return `${baseClass} bg-primary/20 text-primary border-b-2 border-primary`;
    case AnnotationType.COMMENT:
      return `${baseClass} bg-accent/20 text-accent border-b-2 border-accent border-dashed`;
    case AnnotationType.GLOBAL_COMMENT:
      return `${baseClass} bg-blue-500/10 text-blue-600`;
    default:
      return `${baseClass} bg-muted/30`;
  }
}

/**
 * Calculates the position for an annotation marker
 * Returns the top/left coordinates for placing a marker
 *
 * @param element - The element to position marker on
 * @param offset - Optional offset within the element
 * @returns Position object with top/left coordinates
 */
export function calculateMarkerPosition(
  element: HTMLElement,
  offset?: number
): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  let top = rect.top + scrollTop;
  let left = rect.left + scrollLeft;

  // If offset is provided, try to find more precise position
  if (offset !== undefined && element.textContent) {
    const range = document.createRange();
    const textNodes = getTextNodes(element);

    let currentOffset = 0;
    for (const node of textNodes) {
      const nodeLength = node.textContent?.length || 0;
      if (currentOffset + nodeLength >= offset) {
        try {
          range.setStart(node, offset - currentOffset);
          range.setEnd(node, offset - currentOffset);
          const rangeRect = range.getBoundingClientRect();
          top = rangeRect.top + scrollTop;
          left = rangeRect.left + scrollLeft;
          break;
        } catch {
          // Fallback to element position if range fails
          break;
        }
      }
      currentOffset += nodeLength;
    }
  }

  return { top, left };
}

/**
 * Helper to get all text nodes within an element
 */
function getTextNodes(element: HTMLElement): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent?.trim()) {
      textNodes.push(node as Text);
    }
  }

  return textNodes;
}

/**
 * Finds elements matching markdown block types
 * Useful for targeting specific markdown structures
 *
 * @param blockType - Type of markdown block ('paragraph', 'heading', 'code', etc.)
 * @param root - Root element to search within
 * @returns Array of matching elements
 */
export function findElementsByBlockType(
  blockType: 'paragraph' | 'heading' | 'code' | 'list' | 'blockquote' | 'table',
  root: HTMLElement = document.body
): HTMLElement[] {
  const selectors: Record<typeof blockType, string> = {
    paragraph: 'p',
    heading: 'h1, h2, h3, h4, h5, h6',
    code: 'pre, code',
    list: 'ul, ol, li',
    blockquote: 'blockquote',
    table: 'table, tbody, thead, tr, td, th'
  };

  const selector = selectors[blockType];
  const elements = Array.from(root.querySelectorAll(selector));

  return elements as HTMLElement[];
}

/**
 * Clears all annotation highlights from the document
 *
 * @param root - Root element to clear highlights from
 */
export function clearAllHighlights(root: HTMLElement = document.body): void {
  const highlighted = root.querySelectorAll('[data-annotation]');
  highlighted.forEach(el => {
    el.removeAttribute('data-annotation');
    const classesToRemove = Array.from(el.classList)
      .filter(cls => cls.startsWith('annotation-') || cls.includes('highlight'));
    el.classList.remove(...classesToRemove);
  });
}
