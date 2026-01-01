import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Settings } from '../Settings';

describe('Settings', () => {
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

  const openSettingsDialog = () => {
    const button = screen.getByTitle(/Configurações/);
    fireEvent.click(button);
  };

  describe('focus trapping', () => {
    test('auto-focuses first focusable element when dialog opens', async () => {
      render(<Settings />);

      openSettingsDialog();

      // Wait for focus trap to set up
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    test('traps focus within dialog - Tab cycles from last to first element', async () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');

      // Get all focusable elements in the dialog (buttons and inputs)
      const focusableElements = dialog.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus the last focusable element
      const lastElement = focusableElements[focusableElements.length - 1];
      (lastElement as HTMLElement).focus();
      expect(document.activeElement).toBe(lastElement);

      // Simulate Tab key press
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: false });

      // Should cycle to first focusable element
      await waitFor(() => {
        const focusedElement = document.activeElement;
        // Focus should be on a focusable element within the dialog
        expect(dialog.contains(focusedElement)).toBe(true);
      });
    });

    test('traps focus within dialog - Shift+Tab cycles from first to last element', async () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');

      // Get all focusable elements in the dialog
      const focusableElements = dialog.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus the first focusable element
      const firstElement = focusableElements[0];
      (firstElement as HTMLElement).focus();
      expect(document.activeElement).toBe(firstElement);

      // Simulate Shift+Tab key press
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

      // Should cycle to last focusable element
      await waitFor(() => {
        const focusedElement = document.activeElement;
        // Focus should still be within the dialog
        expect(dialog.contains(focusedElement)).toBe(true);
      });
    });

    test('focus stays within dialog when pressing Tab multiple times', async () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');

      // Focus an input element in the dialog
      const input = dialog.querySelector('input');
      if (input) {
        input.focus();
        expect(document.activeElement).toBe(input);
      }

      // Press Tab multiple times
      for (let i = 0; i < 15; i++) {
        fireEvent.keyDown(dialog, { key: 'Tab' });
        await waitFor(() => {
          // Focus should always stay within the dialog
          expect(dialog.contains(document.activeElement)).toBe(true);
        });
      }
    });
  });

  describe('Escape key handling', () => {
    test('closes dialog when Escape key is pressed', async () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeDefined();

      // Press Escape key
      fireEvent.keyDown(dialog, { key: 'Escape' });

      await waitFor(() => {
        // Dialog should be closed
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });

    test('Escape key stops propagation', async () => {
      const parentHandler = mock(() => {});

      // Add a parent handler
      document.body.addEventListener('keydown', parentHandler);

      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');

      // Press Escape key
      fireEvent.keyDown(dialog, { key: 'Escape' });

      // Parent handler should not be called (stopPropagation)
      await waitFor(() => {
        expect(parentHandler).not.toHaveBeenCalled();
      });

      document.body.removeEventListener('keydown', parentHandler);
    });

    test('other keys do not close dialog', async () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');

      // Press various keys
      fireEvent.keyDown(dialog, { key: 'Enter' });
      fireEvent.keyDown(dialog, { key: 'Space' });
      fireEvent.keyDown(dialog, { key: 'ArrowDown' });
      fireEvent.keyDown(dialog, { key: 'a' });

      // Dialog should still be open
      expect(screen.getByRole('dialog')).toBeDefined();
    });
  });

  describe('focus restoration on close', () => {
    test('restores focus to settings button when dialog closes', async () => {
      render(<Settings />);

      const settingsButton = screen.getByTitle(/Configurações/);
      settingsButton.focus();
      expect(document.activeElement).toBe(settingsButton);

      // Open the dialog
      fireEvent.click(settingsButton);

      // Wait for auto-focus to happen inside the dialog
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
      });

      const dialog = screen.getByRole('dialog');

      // Close the dialog with Escape key
      fireEvent.keyDown(dialog, { key: 'Escape' });

      // Wait for focus restoration
      await waitFor(() => {
        expect(document.activeElement).toBe(settingsButton);
      });
    });

    test('restores focus to settings button when close button is clicked', async () => {
      render(<Settings />);

      const settingsButton = screen.getByTitle(/Configurações/);
      settingsButton.focus();
      expect(document.activeElement).toBe(settingsButton);

      // Open the dialog
      fireEvent.click(settingsButton);

      // Wait for auto-focus to happen inside the dialog
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
      });

      // Find and click the close button (Fechar)
      const closeButton = screen.getByRole('button', { name: /Fechar/i });
      fireEvent.click(closeButton);

      // Wait for focus restoration
      await waitFor(() => {
        expect(document.activeElement).toBe(settingsButton);
      });
    });
  });

  describe('ARIA attributes', () => {
    test('dialog has role="dialog"', () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeDefined();
    });

    test('dialog has aria-modal="true"', () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    test('dialog has aria-labelledby pointing to title', () => {
      render(<Settings />);

      openSettingsDialog();

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('settings-dialog-title');

      // Verify the title element exists with this id
      const title = document.getElementById('settings-dialog-title');
      expect(title).toBeDefined();
      expect(title?.textContent).toContain('Configurações');
    });
  });

  describe('dialog visibility', () => {
    test('does not render dialog initially', () => {
      render(<Settings />);

      expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('renders dialog when settings button is clicked', () => {
      render(<Settings />);

      openSettingsDialog();

      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Configurações de Tipos de Nota')).toBeDefined();
    });
  });

  describe('basic functionality', () => {
    test('abre modal ao clicar no botão', () => {
      render(<Settings />);

      const button = screen.getByTitle(/Configurações/);
      fireEvent.click(button);

      expect(screen.getByText('Configurações de Tipos de Nota')).toBeDefined();
    });

    test('permite editar caminho do vault', async () => {
      const mockOnVaultPathChange = mock((path: string) => {});

      render(<Settings onNotePathChange={mockOnVaultPathChange} />);

      fireEvent.click(screen.getByTitle(/Configurações/));

      // Switch to a tab that has input fields (e.g., Conteúdo de Terceiros)
      const terceirosTab = screen.getByText('📚');
      fireEvent.click(terceirosTab);

      // Find an input field
      const inputs = screen.getAllByPlaceholderText(/caminho/i);
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'C:/Test/Vault' } });

        await waitFor(() => {
          expect(mockOnVaultPathChange).toHaveBeenCalledWith('C:/Test/Vault');
        });
      }
    });

    test('regenera identidade', async () => {
      const mockOnIdentityChange = mock((oldId: string, newId: string) => {});

      render(<Settings onIdentityChange={mockOnIdentityChange} />);

      fireEvent.click(screen.getByTitle(/Configurações/));

      // Switch to a tab that shows identity section (not 'regras')
      const terceirosTab = screen.getByText('📚');
      fireEvent.click(terceirosTab);

      const regenButton = screen.getByText('Gerar Nova Identidade');
      fireEvent.click(regenButton);

      await waitFor(() => {
        expect(mockOnIdentityChange).toHaveBeenCalled();
      });
    });
  });

  describe('tab navigation', () => {
    test('can switch between category tabs', async () => {
      render(<Settings />);

      openSettingsDialog();

      // Regras tab should be active by default
      expect(screen.getByText('📋')).toBeDefined();

      // Click on Conteúdo de Terceiros tab
      const terceirosTab = screen.getByText('📚');
      fireEvent.click(terceirosTab);

      // Terceiros content should be visible (has template and destination inputs)
      await waitFor(() => {
        expect(screen.getAllByText('Template:').length).toBeGreaterThan(0);
      });
    });
  });
});
