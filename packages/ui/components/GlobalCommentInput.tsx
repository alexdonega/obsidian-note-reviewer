/**
 * Global Comment Input Modal
 *
 * Modal for adding global comments that apply to the entire document
 * rather than specific text selections.
 */

import React, { useState, useEffect, useRef } from 'react';
import { getIdentity } from '../utils/identity';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface GlobalCommentInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string, author: string) => void;
}

export const GlobalCommentInput: React.FC<GlobalCommentInputProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Set up focus trap for accessibility
  useFocusTrap({
    containerRef: modalRef,
    isOpen,
    onClose,
  });

  // Load author from storage on mount
  useEffect(() => {
    if (isOpen) {
      const identity = getIdentity();
      if (identity) {
        setAuthor(identity);
      }
      setComment(''); // Reset comment when opening
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!comment.trim()) return;

    const finalAuthor = author.trim() || 'Anônimo';
    onSubmit(comment, finalAuthor);
    setComment('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    // Note: Escape key is handled by useFocusTrap hook for consistency
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-comment-modal-title"
        className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 id="global-comment-modal-title" className="font-semibold text-sm">Comentário Global</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Author Input */}
          <div>
            <label htmlFor="author" className="block text-xs font-medium text-muted-foreground mb-2">
              Autor
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Seu nome (opcional)"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Comment Textarea */}
          <div>
            <label htmlFor="comment" className="block text-xs font-medium text-muted-foreground mb-2">
              Comentário sobre o documento
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Adicione um comentário que se aplica ao documento inteiro..."
              rows={5}
              autoFocus
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Dica: Ctrl/Cmd + Enter para enviar
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!comment.trim()}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comment.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Adicionar Comentário
          </button>
        </div>
      </div>
    </div>
  );
};
