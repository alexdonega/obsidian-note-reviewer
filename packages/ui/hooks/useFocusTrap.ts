/**
 * Focus Trap Hook for Modal Dialogs
 *
 * Provides accessibility features for modal dialogs:
 * - Traps focus within the modal container
 * - Cycles Tab/Shift+Tab through focusable elements
 * - Handles Escape key to close the modal
 * - Restores focus to the previously focused element on close
 */

import { RefObject, useEffect, useRef } from 'react';

/**
 * Selector for all potentially focusable elements
 * Includes: buttons, links, inputs, textareas, selects, and elements with tabindex
 */
const FOCUSABLE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'textarea',
  'select',
  '[tabindex]',
].join(',');

/**
 * Get all focusable elements within a container
 *
 * Filters out:
 * - Disabled elements
 * - Elements with tabindex="-1"
 * - Hidden elements (display: none, visibility: hidden)
 * - Elements inside hidden containers
 *
 * @param container - The container element to search within
 * @returns Array of focusable HTMLElements in DOM order
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

  return Array.from(elements).filter((element) => {
    // Skip disabled elements
    if (
      element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      if (element.disabled) {
        return false;
      }
    }

    // Skip elements with negative tabindex (explicitly removed from tab order)
    const tabindex = element.getAttribute('tabindex');
    if (tabindex !== null && parseInt(tabindex, 10) < 0) {
      return false;
    }

    // Skip hidden elements
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }

    // Check if any ancestor is hidden (element inside collapsed container, etc.)
    let parent = element.parentElement;
    while (parent && parent !== container) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
        return false;
      }
      parent = parent.parentElement;
    }

    return true;
  });
}

interface UseFocusTrapOptions {
  /** Ref to the modal container element */
  containerRef: RefObject<HTMLElement>;
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal (called on Escape key) */
  onClose: () => void;
}

/**
 * Hook to trap focus within a modal dialog
 *
 * @param options - Configuration options for the focus trap
 *
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 *
 * useFocusTrap({
 *   containerRef: modalRef,
 *   isOpen: isModalOpen,
 *   onClose: handleClose,
 * });
 *
 * return (
 *   <div ref={modalRef} role="dialog" aria-modal="true">
 *     ...modal content...
 *   </div>
 * );
 * ```
 */
export function useFocusTrap(options: UseFocusTrapOptions): void {
  const { containerRef, isOpen, onClose } = options;

  /**
   * Ref to store the element that was focused before the modal opened.
   * This allows us to restore focus when the modal closes.
   */
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    // Store the currently focused element before the modal takes over focus
    // This is captured when the modal opens (isOpen becomes true)
    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    // Auto-focus the first focusable element in the modal
    // Use requestAnimationFrame to ensure the DOM has rendered
    requestAnimationFrame(() => {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the container itself
        // This ensures focus is trapped in the modal even without interactive elements
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Tab key for focus cycling
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(container);

        // If no focusable elements, prevent Tab from leaving the modal
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (event.shiftKey) {
          // Shift+Tab: cycle backwards
          // If focus is on first element or not in the modal, wrap to last element
          if (activeElement === firstElement || !focusableElements.includes(activeElement)) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: cycle forwards
          // If focus is on last element or not in the modal, wrap to first element
          if (activeElement === lastElement || !focusableElements.includes(activeElement)) {
            event.preventDefault();
            firstElement.focus();
          }
        }
        return;
      }

      // Handle Escape key to close the modal
      // Prevent propagation to avoid triggering parent handlers
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element when the modal closes
      // Check that the element is still in the document and can receive focus
      if (
        previouslyFocusedElement.current &&
        document.contains(previouslyFocusedElement.current)
      ) {
        // Use requestAnimationFrame to ensure cleanup happens after React's commit phase
        requestAnimationFrame(() => {
          previouslyFocusedElement.current?.focus();
        });
      }
    };
  }, [isOpen, containerRef, onClose]);
}
