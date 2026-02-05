/**
 * CommentThread Component
 *
 * Displays threaded comments with nested replies and visual hierarchy.
 * Supports recursive rendering for nested comment structures.
 */

import React, { useState, useMemo } from 'react';
import { Comment, CommentThread as CommentThreadType, Mention } from '../types';
import { useAuth } from '../providers/AuthProvider';
import MentionsInput, { MentionData, parseMentions } from './MentionsInput';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentThreadProps {
  thread: CommentThreadType;
  onAddComment: (content: string, mentions: string[], parentId?: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string, mentions: string[]) => Promise<void>;
  maxDepth?: number;
}

interface CommentThreadItemProps {
  comment: Comment;
  depth: number;
  maxDepth: number;
  allComments: Comment[];
  onReply: (parentId: string) => void;
  replyingTo: string | null;
  onAddReply: (content: string, mentions: string[], parentId: string) => Promise<void>;
  onCancelReply: () => void;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string, mentions: string[]) => Promise<void>;
  replyingToName?: string;
}

/**
 * Format timestamp for display
 */
const formatTimestamp = (timestamp: number): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return 'agora';
  }
};

/**
 * Parse content and highlight mentions
 */
const renderContentWithMentions = (content: string): React.ReactNode => {
  // Split content by mention pattern @__id__
  const parts = content.split(/(@__[^_]+__)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@__') && part.endsWith('__')) {
      const userId = part.slice(3, -2);
      return (
        <span key={index} className="mention-highlight inline-flex">
          @{userId}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

/**
 * Individual comment item with recursive reply support
 */
const CommentThreadItem: React.FC<CommentThreadItemProps> = ({
  comment,
  depth,
  maxDepth,
  allComments,
  onReply,
  replyingTo,
  onAddReply,
  onCancelReply,
  onDeleteComment,
  onUpdateComment,
  replyingToName,
}) => {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [replyMentions, setReplyMentions] = useState<MentionData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editMentions, setEditMentions] = useState<MentionData[]>([]);

  const isOwner = user?.id === comment.authorId;
  const isReplying = replyingTo === comment.id;
  const canReply = depth < maxDepth;

  // Get all replies to this comment
  const replies = useMemo(() => {
    return allComments.filter((c) => c.parentId === comment.id);
  }, [allComments, comment.id]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const mentionIds = replyMentions.map((m) => m.id);
      await onAddReply(replyContent, mentionIds, comment.id);
      setReplyContent('');
      setReplyMentions([]);
      onCancelReply();
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!onDeleteComment || !confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }

    try {
      await onDeleteComment(comment.id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleUpdateComment = async () => {
    if (!onUpdateComment || !editContent.trim()) return;

    setSubmitting(true);
    try {
      const mentionIds = editMentions.map((m) => m.id);
      await onUpdateComment(comment.id, editContent, mentionIds);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditMentions([]);
  };

  const marginLeftClass = depth > 0 ? 'ml-4 md:ml-6' : '';
  const borderClass = depth > 0 ? 'border-l-2 border-border' : '';

  return (
    <div className={`${marginLeftClass} ${borderClass} pl-0 md:pl-4 py-2`}>
      {/* Comment Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {comment.authorAvatar ? (
          <img
            src={comment.authorAvatar}
            alt={comment.authorName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-primary">
              {comment.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(comment.createdAt)}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-muted-foreground">(editado)</span>
            )}
            {isOwner && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Editar
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={handleDeleteComment}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <MentionsInput
                value={editContent}
                onChange={(value, mentions) => {
                  setEditContent(value);
                  setEditMentions(mentions);
                }}
                rows={3}
                placeholder="Editar comentário..."
                className="w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateComment}
                  disabled={submitting || !editContent.trim()}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-sm break-words">
              {renderContentWithMentions(comment.content)}
            </div>
          )}

          {/* Reply Action */}
          {canReply && !isEditing && (
            <button
              onClick={() => onReply(comment.id)}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Responder
            </button>
          )}

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              {replyingToName && (
                <div className="text-xs text-muted-foreground">
                  Respondendo a <span className="font-medium">{replyingToName}</span>
                </div>
              )}
              <MentionsInput
                value={replyContent}
                onChange={(value, mentions) => {
                  setReplyContent(value);
                  setReplyMentions(mentions);
                }}
                rows={3}
                placeholder="Escreva sua resposta..."
                className="w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyContent.trim()}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Enviando...' : 'Responder'}
                </button>
                <button
                  onClick={onCancelReply}
                  className="px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {replies.map((reply) => (
                <CommentThreadItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  allComments={allComments}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  onAddReply={onAddReply}
                  onCancelReply={onCancelReply}
                  onDeleteComment={onDeleteComment}
                  onUpdateComment={onUpdateComment}
                  replyingToName={reply.authorName}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Main CommentThread component
 */
export const CommentThread: React.FC<CommentThreadProps> = ({
  thread,
  onAddComment,
  onDeleteComment,
  onUpdateComment,
  maxDepth = 5,
}) => {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newCommentMentions, setNewCommentMentions] = useState<MentionData[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Get root comments (no parent)
  const rootComments = useMemo(() => {
    return thread.comments.filter((c) => !c.parentId);
  }, [thread.comments]);

  const handleReply = (commentId: string) => {
    if (!user) {
      alert('Você precisa estar logado para comentar.');
      return;
    }
    setReplyingTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleAddReply = async (content: string, mentions: string[], parentId: string) => {
    await onAddComment(content, mentions, parentId);
  };

  const handleAddRootComment = async () => {
    if (!newCommentContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const mentionIds = newCommentMentions.map((m) => m.id);
      await onAddComment(newCommentContent, mentionIds);
      setNewCommentContent('');
      setNewCommentMentions([]);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-thread space-y-4">
      {/* Root Comments */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentThreadItem
              key={comment.id}
              comment={comment}
              depth={0}
              maxDepth={maxDepth}
              allComments={thread.comments}
              onReply={handleReply}
              replyingTo={replyingTo}
              onAddReply={handleAddReply}
              onCancelReply={handleCancelReply}
              onDeleteComment={onDeleteComment}
              onUpdateComment={onUpdateComment}
            />
          ))
        )}
      </div>

      {/* New Comment Input */}
      {user && (
        <div className="border-t border-border pt-4">
          <MentionsInput
            value={newCommentContent}
            onChange={(value, mentions) => {
              setNewCommentContent(value);
              setNewCommentMentions(mentions);
            }}
            rows={3}
            placeholder="Adicione um comentário..."
            className="w-full"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleAddRootComment}
              disabled={submitting || !newCommentContent.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar Comentário'}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
          Faça login para participar da discussão.
        </div>
      )}
    </div>
  );
};

export default CommentThread;
