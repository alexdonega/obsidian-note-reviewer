export enum AnnotationType {
  DELETION = 'DELETION',
  INSERTION = 'INSERTION',
  REPLACEMENT = 'REPLACEMENT',
  COMMENT = 'COMMENT',
  GLOBAL_COMMENT = 'GLOBAL_COMMENT',
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
