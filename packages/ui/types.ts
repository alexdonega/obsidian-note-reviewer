export enum AnnotationType {
  DELETION = 'DELETION',
  INSERTION = 'INSERTION',
  REPLACEMENT = 'REPLACEMENT',
  COMMENT = 'COMMENT',
  GLOBAL_COMMENT = 'GLOBAL_COMMENT',
}

export enum AnnotationStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export type EditorMode = 'selection' | 'redline' | 'edit';

export type SortOption = 'newest' | 'oldest' | 'type' | 'author';

export interface Annotation {
  id: string;
  blockId: string; // Legacy - not used with web-highlighter
  startOffset: number; // Legacy
  endOffset: number; // Legacy
  type: AnnotationType;
  text?: string; // For comments
  originalText: string; // The text that was selected
  createdA: number;
  author?: string; // Tater identity for collaborative sharing
  isGlobal?: boolean; // true for global comments (not tied to specific text)
  // Status tracking
  status?: AnnotationStatus; // Current status of the annotation
  resolvedAt?: number; // Timestamp when status was set to RESOLVED
  resolvedBy?: string; // User ID who resolved the annotation
  // web-highlighter metadata for cross-element selections
  startMeta?: {
    parentTagName: string;
    parentIndex: number;
    textOffset: number;
  };
  endMeta?: {
    parentTagName: string;
    parentIndex: number;
    textOffset: number;
  };
  // Visual marker metadata
  markerColor?: string; // Computed from annotation type for visual display
  markerPosition?: { top: number; left: number }; // For marker placement on the page
  isHighlighted?: boolean; // For hover/focus state
  targetSelector?: string; // CSS selector for element targeting
}

export interface Block {
  id: string;
  type: 'frontmatter' | 'paragraph' | 'heading' | 'blockquote' | 'list-item' | 'code' | 'hr' | 'table' | 'callout';
  content: string; // Plain text content
  level?: number; // For headings (1-6)
  language?: string; // For code blocks (e.g., 'rust', 'typescript')
  order: number; // Sorting order
  startLine: number; // 1-based line number in source
  // Callout-specific fields
  calloutType?: string; // 'note', 'warning', 'custom', etc
  calloutTitle?: string; // Título opcional
  isCollapsible?: boolean; // true se tem + ou -
  defaultCollapsed?: boolean; // true se tem -, false se tem +
}

export interface DiffResult {
  original: string;
  modified: string;
  diffText: string;
}

// Comment system types
export interface Comment {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mentions: string[]; // Array of user IDs mentioned in the comment
  createdAt: number;
  updatedAt?: number;
  parentId?: string; // For nested replies
}

export interface CommentThread {
  id: string;
  annotationId: string;
  comments: Comment[];
  status: AnnotationStatus;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface Mention {
  id: string;
  display: string;
  avatar?: string;
}

// Version history types - exported from types/version.ts
export type {
  DocumentVersion,
  VersionDiff,
  VersionChange,
  CreateVersionRequest,
  VersionListResponse,
  VersionComparison,
} from './types/version';
export type { VersionChangeType } from './types/version';
