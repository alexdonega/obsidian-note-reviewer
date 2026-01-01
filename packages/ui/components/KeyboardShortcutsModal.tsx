/**
 * Keyboard Shortcuts Modal
 *
 * Modal that displays all available keyboard shortcuts organized by category.
 * Triggered by pressing '?' key or via the help button.
 */

import React, { useEffect, useCallback } from 'react';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getShortcutsByCategory,
  formatShortcutKey,
} from '../utils/shortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Handle Escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const shortcutsByCategory = getShortcutsByCategory();

  // Filter out empty categories
  const activeCategories = CATEGORY_ORDER.filter(
    (category) => shortcutsByCategory[category].length > 0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-sm">Atalhos de Teclado</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Fechar (Esc)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
          {activeCategories.map((category) => (
            <div key={category}>
              {/* Category header */}
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category]}
              </h4>

              {/* Shortcuts list */}
              <div className="space-y-1">
                {shortcutsByCategory[category].map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {shortcut.label}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {shortcut.description}
                      </div>
                    </div>
                    <kbd className="ml-3 px-2 py-1 text-xs font-mono bg-muted border border-border rounded-md text-muted-foreground shrink-0">
                      {formatShortcutKey(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {activeCategories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum atalho disponivel.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Esc</kbd> para fechar
          </p>
        </div>
      </div>
    </div>
  );
};
