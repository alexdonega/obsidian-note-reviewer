/**
 * CommentInput Component
 *
 * Reusable comment input form with submit and cancel actions.
 * Integrates with MentionsInput for @mention support.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import MentionsInput, { MentionData, parseMentions } from './MentionsInput';

interface CommentInputProps {
  onSubmit: (content: string, mentions: string[]) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  initialValue?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  minLength?: number;
}

/**
 * Extract mentions from content using MentionsInput utility
 */
const extractMentions = (content: string): string[] => {
  return parseMentions(content);
};

/**
 * CommentInput component
 */
export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'Escreva um comentário...',
  submitLabel = 'Enviar',
  cancelLabel = 'Cancelar',
  initialValue = '',
  autoFocus = true,
  disabled = false,
  minLength = 1,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialValue);
  const [mentions, setMentions] = useState<MentionData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLDivElement>(null);

  // Update content when initialValue changes (e.g., for editing)
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      // Find the first textarea within the MentionsInput
      const textarea = textareaRef.current.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }, [autoFocus]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate user is logged in
    if (!user) {
      setError('Você precisa estar logado para comentar.');
      return;
    }

    // Validate content not empty
    const trimmedContent = content.trim();
    if (trimmedContent.length < minLength) {
      setError(`O comentário deve ter pelo menos ${minLength} caractere${minLength > 1 ? 's' : ''}.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Extract mention IDs
      const mentionIds = mentions.map((m) => m.id);
      await onSubmit(trimmedContent, mentionIds);

      // Clear input after successful submit
      setContent('');
      setMentions([]);
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setError(err instanceof Error ? err.message : 'Falha ao enviar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }

    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    if (submitting) return;

    // Only cancel if content is empty or user confirms
    if (content.trim()) {
      if (!confirm('Você tem alterações não salvas. Deseja cancelar?')) {
        return;
      }
    }

    setContent('');
    setMentions([]);
    setError(null);
    onCancel();
  };

  /**
   * Handle content change from MentionsInput
   */
  const handleContentChange = (value: string, newMentions: MentionData[]) => {
    setContent(value);
    setMentions(newMentions);
    setError(null);
  };

  const canSubmit = !submitting && !disabled && content.trim().length >= minLength;

  return (
    <div className="comment-input space-y-3" ref={textareaRef}>
      {/* Mentions Input */}
      <MentionsInput
        value={content}
        onChange={handleContentChange}
        placeholder={placeholder}
        rows={4}
        disabled={disabled || submitting}
        className="w-full"
        onKeyDown={handleKeyDown}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Dica: Ctrl/Cmd + Enter para enviar
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting || disabled}
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              canSubmit
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            } disabled:opacity-50`}
          >
            {submitting ? 'Enviando...' : submitLabel}
          </button>
        </div>
      </div>

      {/* Character Counter (for minimum length validation) */}
      {minLength > 1 && content.length > 0 && content.length < minLength && (
        <div className="text-xs text-muted-foreground">
          Mínimo de {minLength} caracteres ({content.length}/{minLength})
        </div>
      )}
    </div>
  );
};

/**
 * Lightweight version without cancel button
 */
export const QuickCommentInput: React.FC<Omit<CommentInputProps, 'onCancel'>> = ({
  onSubmit,
  placeholder = 'Escreva um comentário...',
  submitLabel = 'Enviar',
  initialValue = '',
  autoFocus = false,
  disabled = false,
  minLength = 1,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialValue);
  const [mentions, setMentions] = useState<MentionData[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || submitting) return;

    const trimmedContent = content.trim();
    if (trimmedContent.length < minLength) return;

    setSubmitting(true);

    try {
      const mentionIds = mentions.map((m) => m.id);
      await onSubmit(trimmedContent, mentionIds);
      setContent('');
      setMentions([]);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = !submitting && !disabled && content.trim().length >= minLength;

  return (
    <div className="quick-comment-input flex gap-2">
      <MentionsInput
        value={content}
        onChange={(value, newMentions) => {
          setContent(value);
          setMentions(newMentions);
        }}
        placeholder={placeholder}
        rows={2}
        disabled={disabled || submitting}
        className="flex-1"
        onKeyDown={handleKeyDown}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`self-end px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          canSubmit
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        {submitting ? '...' : submitLabel}
      </button>
    </div>
  );
};

export default CommentInput;
