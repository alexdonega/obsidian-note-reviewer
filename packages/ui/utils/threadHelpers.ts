/**
 * Thread Helper Utilities
 *
 * Utility functions for comment thread operations including:
 * - Thread ID generation
 * - Thread retrieval
 * - Comment tree building
 * - Mention parsing
 */

import { Comment, CommentThread } from '../types';

/**
 * Generate a unique thread ID
 * Format: thread_{timestamp}_{random}
 */
export const generateThreadId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `thread_${timestamp}_${random}`;
};

/**
 * Generate a unique comment ID
 * Format: comment_{timestamp}_{random}
 */
export const generateCommentId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `comment_${timestamp}_${random}`;
};

/**
 * Get thread for a specific annotation
 * Returns the thread associated with the given annotation ID
 */
export const getThreadForAnnotation = (
  annotationId: string,
  threads: CommentThread[]
): CommentThread | undefined => {
  return threads.find((thread) => thread.annotationId === annotationId);
};

/**
 * Get root comments (comments without parentId)
 * These are top-level comments in a thread
 */
export const getRootComments = (thread: CommentThread): Comment[] => {
  return thread.comments.filter((comment) => !comment.parentId);
};

/**
 * Get all replies for a specific comment
 * Returns direct children (parentId === commentId)
 */
export const getRepliesForComment = (
  commentId: string,
  comments: Comment[]
): Comment[] => {
  return comments.filter((comment) => comment.parentId === commentId);
};

/**
 * Build a nested comment tree for display
 * Organizes comments into a hierarchical structure with nested replies
 */
export interface CommentNode {
  comment: Comment;
  replies: CommentNode[];
  depth: number;
}

export const buildCommentTree = (thread: CommentThread): CommentNode[] => {
  const rootComments = getRootComments(thread);
  const commentMap = new Map<string, Comment>();

  // Build a map of all comments for quick lookup
  thread.comments.forEach((comment) => {
    commentMap.set(comment.id, comment);
  });

  /**
   * Recursively build the tree for a comment
   */
  const buildNode = (comment: Comment, depth: number = 0): CommentNode => {
    const replies = getRepliesForComment(comment.id, thread.comments);
    return {
      comment,
      replies: replies.map((reply) => buildNode(reply, depth + 1)),
      depth,
    };
  };

  // Build tree starting from root comments
  return rootComments.map((comment) => buildNode(comment));
};

/**
 * Flatten a comment tree back to a list (in display order)
 * Useful for rendering or exporting
 */
export const flattenCommentTree = (nodes: CommentNode[]): Comment[] => {
  const result: Comment[] = [];

  const flatten = (node: CommentNode) => {
    result.push(node.comment);
    node.replies.forEach(flatten);
  };

  nodes.forEach(flatten);
  return result;
};

/**
 * Parse mentions from comment content
 * Extracts user IDs from @__id__ markup format
 */
export const parseMentions = (content: string): string[] => {
  const mentionRegex = /@__([^_]+)__/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

/**
 * Replace mention IDs with display names
 * Converts @__id__ to @displayName for rendering
 */
export const renderMentions = (
  content: string,
  getUserDisplayName: (userId: string) => string
): string => {
  return content.replace(/@__([^_]+)__/g, (match, userId) => {
    const displayName = getUserDisplayName(userId);
    return `@${displayName || userId}`;
  });
};

/**
 * Check if a comment mentions a specific user
 */
export const isUserMentioned = (comment: Comment, userId: string): boolean => {
  return comment.mentions.includes(userId);
};

/**
 * Get all comments that mention a specific user
 */
export const getCommentsMentioningUser = (
  thread: CommentThread,
  userId: string
): Comment[] => {
  return thread.comments.filter((comment) => isUserMentioned(comment, userId));
};

/**
 * Count total comments in a thread (including nested replies)
 */
export const countTotalComments = (thread: CommentThread): number => {
  return thread.comments.length;
};

/**
 * Count root comments only (top-level comments without parentId)
 */
export const countRootComments = (thread: CommentThread): number => {
  return getRootComments(thread).length;
};

/**
 * Get thread statistics
 */
export interface ThreadStats {
  totalComments: number;
  rootComments: number;
  participants: number;
  lastActivity: number;
}

export const getThreadStats = (thread: CommentThread): ThreadStats => {
  const totalComments = thread.comments.length;
  const rootComments = countRootComments(thread);

  // Get unique participants (by authorId)
  const participants = new Set(thread.comments.map((c) => c.authorId)).size;

  // Get last activity timestamp
  const lastActivity = thread.updatedAt;

  return {
    totalComments,
    rootComments,
    participants,
    lastActivity,
  };
};

/**
 * Check if thread has unread comments for a user
 * (Based on user's last read timestamp - requires tracking)
 */
export const hasUnreadComments = (
  thread: CommentThread,
  lastReadTimestamp: number
): boolean => {
  return thread.updatedAt > lastReadTimestamp;
};

/**
 * Get comments since a specific timestamp
 */
export const getCommentsSince = (
  thread: CommentThread,
  since: number
): Comment[] => {
  return thread.comments.filter((comment) => comment.createdAt > since);
};

/**
 * Validate comment content before submission
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateComment = (
  content: string,
  minLength: number = 1,
  maxLength: number = 10000
): ValidationResult => {
  const trimmed = content.trim();

  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `O comentário deve ter pelo menos ${minLength} caractere${minLength > 1 ? 's' : ''}.`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `O comentário não pode ter mais de ${maxLength} caracteres.`,
    };
  }

  // Check if content only contains mentions (no actual text)
  const withoutMentions = trimmed.replace(/@__[^_]+__/g, '').trim();
  if (withoutMentions.length === 0) {
    return {
      valid: false,
      error: 'O comentário deve conter texto além das menções.',
    };
  }

  return { valid: true };
};

/**
 * Sort comments by different criteria
 */
export type CommentSortOption = 'newest' | 'oldest' | 'most_replies';

export const sortComments = (
  comments: Comment[],
  sortBy: CommentSortOption = 'newest'
): Comment[] => {
  const sorted = [...comments];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt - a.createdAt);

    case 'oldest':
      return sorted.sort((a, b) => a.createdAt - b.createdAt);

    case 'most_replies':
      // This requires access to all comments to count replies
      // For now, just return as-is (would need full thread context)
      return sorted;

    default:
      return sorted;
  }
};

/**
 * Get comment depth (how nested a comment is)
 */
export const getCommentDepth = (
  comment: Comment,
  allComments: Comment[]
): number => {
  let depth = 0;
  let currentComment = comment;

  while (currentComment.parentId) {
    depth++;
    const parent = allComments.find((c) => c.id === currentComment.parentId);
    if (!parent) break;
    currentComment = parent;
  }

  return depth;
};

/**
 * Format comment timestamp for display
 */
export const formatCommentTimestamp = (
  timestamp: number,
  locale: string = 'pt-BR'
): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'agora';
  } else if (diffMins < 60) {
    return `há ${diffMins} min`;
  } else if (diffHours < 24) {
    return `há ${diffHours}h`;
  } else if (diffDays < 7) {
    return `há ${diffDays}d`;
  } else {
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};
