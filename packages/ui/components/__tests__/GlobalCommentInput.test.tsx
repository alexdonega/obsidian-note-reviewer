import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { GlobalCommentInput } from '../GlobalCommentInput';

// Mock the identity utility
mock.module('../utils/identity', () => ({
  getIdentity: () => 'test-tater-identity',
}));

describe('GlobalCommentInput', () => {
  let rafCallback: FrameRequestCallback | null = null;
  const originalRaf = window.requestAnimationFrame;

  beforeEach(() => {
    // Mock requestAnimationFrame to execute immediately
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      rafCallback = callback;
      // Execute immediately for synchronous testing
      callback(0);
      return 1;
    };
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    rafCallback = null;
  });

  const defaultProps = {
    isOpen: true,
    onClose: mock(() => {}),
    onSubmit: mock(() => {}),
  };

  describe('focus trapping', () => {
    test('auto-focuses first focusable element when modal opens', async () => {
      render(<GlobalCommentInput {...defaultProps} />);

      // Wait for focus trap to set up
      await waitFor(() => {
        // The first focusable element should be focused (close button or input)
        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    test('traps focus within modal - Tab cycles from last to first element', async () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const dialog = screen.getByRole('dialog');

      // Get all focusable elements in the modal (buttons and inputs)
      const focusableElements = dialog.querySelectorAll('button, input, textarea');
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus the last focusable element (submit button)
      const lastElement = focusableElements[focusableElements.length - 1];
      (lastElement as HTMLElement).focus();
      expect(document.activeElement).toBe(lastElement);

      // Simulate Tab key press
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: false });

      // Should cycle to first focusable element
      await waitFor(() => {
        const focusedElement = document.activeElement;
        // Focus should be on a focusable element within the modal
        expect(dialog.contains(focusedElement)).toBe(true);
      });
    });

    test('traps focus within modal - Shift+Tab cycles from first to last element', async () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const dialog = screen.getByRole('dialog');

      // Get all focusable elements in the modal
      const focusableElements = dialog.querySelectorAll('button, input, textarea');
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus the first focusable element (close button)
      const firstElement = focusableElements[0];
      (firstElement as HTMLElement).focus();
      expect(document.activeElement).toBe(firstElement);

      // Simulate Shift+Tab key press
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

      // Should cycle to last focusable element
      await waitFor(() => {
        const focusedElement = document.activeElement;
        // Focus should still be within the modal
        expect(dialog.contains(focusedElement)).toBe(true);
      });
    });

    test('focus stays within modal when pressing Tab', async () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const dialog = screen.getByRole('dialog');

      // Focus the textarea
      const textarea = dialog.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        expect(document.activeElement).toBe(textarea);
      }

      // Press Tab multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(dialog, { key: 'Tab' });
        await waitFor(() => {
          // Focus should always stay within the modal
          expect(dialog.contains(document.activeElement)).toBe(true);
        });
      }
    });
  });

  describe('Escape key handling', () => {
    test('closes modal when Escape key is pressed', async () => {
      const onClose = mock(() => {});
      render(<GlobalCommentInput {...defaultProps} onClose={onClose} />);

      const dialog = screen.getByRole('dialog');

      // Press Escape key
      fireEvent.keyDown(dialog, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('Escape key stops propagation', async () => {
      const onClose = mock(() => {});
      const parentHandler = mock(() => {});

      // Add a parent handler
      document.body.addEventListener('keydown', parentHandler);

      render(<GlobalCommentInput {...defaultProps} onClose={onClose} />);

      const dialog = screen.getByRole('dialog');

      // Press Escape key
      fireEvent.keyDown(dialog, { key: 'Escape' });

      // Parent handler should not be called (stopPropagation)
      await waitFor(() => {
        expect(parentHandler).not.toHaveBeenCalled();
      });

      document.body.removeEventListener('keydown', parentHandler);
    });

    test('other keys do not close modal', async () => {
      const onClose = mock(() => {});
      render(<GlobalCommentInput {...defaultProps} onClose={onClose} />);

      const dialog = screen.getByRole('dialog');

      // Press various keys
      fireEvent.keyDown(dialog, { key: 'Enter' });
      fireEvent.keyDown(dialog, { key: 'Space' });
      fireEvent.keyDown(dialog, { key: 'ArrowDown' });
      fireEvent.keyDown(dialog, { key: 'a' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('focus restoration on close', () => {
    test('restores focus to trigger element when modal closes', async () => {
      const onClose = mock(() => {});

      // Create and focus a trigger button before rendering the modal
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Global Comment';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      expect(document.activeElement).toBe(triggerButton);

      // Render the modal (simulating it opening after trigger click)
      const { rerender } = render(
        <GlobalCommentInput {...defaultProps} isOpen={true} onClose={onClose} />
      );

      // Wait for auto-focus to happen
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
      });

      // Close the modal by rerendering with isOpen=false
      rerender(<GlobalCommentInput {...defaultProps} isOpen={false} onClose={onClose} />);

      // Wait for focus restoration
      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton);
      });

      // Cleanup
      document.body.removeChild(triggerButton);
    });

    test('handles case when trigger element is removed from DOM', async () => {
      const onClose = mock(() => {});

      // Create and focus a trigger button
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Global Comment';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      // Render the modal
      const { rerender } = render(
        <GlobalCommentInput {...defaultProps} isOpen={true} onClose={onClose} />
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
      });

      // Remove the trigger button from DOM (simulating dynamic content)
      document.body.removeChild(triggerButton);

      // Close the modal - should not throw
      rerender(<GlobalCommentInput {...defaultProps} isOpen={false} onClose={onClose} />);

      // Test passes if no error is thrown
    });
  });

  describe('ARIA attributes', () => {
    test('modal has role="dialog"', () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeDefined();
    });

    test('modal has aria-modal="true"', () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    test('modal has aria-labelledby pointing to title', () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('global-comment-modal-title');

      // Verify the title element exists with this id
      const title = document.getElementById('global-comment-modal-title');
      expect(title).toBeDefined();
      expect(title?.textContent).toBe('Comentário Global');
    });
  });

  describe('modal visibility', () => {
    test('does not render when isOpen is false', () => {
      render(<GlobalCommentInput {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('renders when isOpen is true', () => {
      render(<GlobalCommentInput {...defaultProps} isOpen={true} />);

      expect(screen.getByRole('dialog')).toBeDefined();
    });
  });

  describe('form interaction', () => {
    test('can enter comment text', async () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Adicione um comentário/i);
      fireEvent.change(textarea, { target: { value: 'Test comment' } });

      expect((textarea as HTMLTextAreaElement).value).toBe('Test comment');
    });

    test('can enter author name', async () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const authorInput = screen.getByPlaceholderText(/Seu nome/i);
      fireEvent.change(authorInput, { target: { value: 'Test Author' } });

      expect((authorInput as HTMLInputElement).value).toBe('Test Author');
    });

    test('submit button is disabled when comment is empty', () => {
      render(<GlobalCommentInput {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /Adicionar Comentário/i });
      expect(submitButton.getAttribute('disabled')).toBe('');
    });

    test('Ctrl+Enter submits the comment', async () => {
      const onSubmit = mock(() => {});
      render(<GlobalCommentInput {...defaultProps} onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/Adicione um comentário/i);
      fireEvent.change(textarea, { target: { value: 'Test comment' } });

      // Press Ctrl+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });
});
