/**
 * Document version types for version history and diff viewing
 */

export type VersionChangeType = 'add' | 'remove' | 'equal';

/**
 * Represents a single change in a document diff
 */
export interface VersionChange {
  type: VersionChangeType;
  lineNumber: number;
  content: string;
}

/**
 * Represents a diff between two document versions
 */
export interface VersionDiff {
  oldVersionId: string;
  newVersionId: string;
  changes: VersionChange[];
  createdAt: number;
}

/**
 * Represents a document version snapshot
 */
export interface DocumentVersion {
  id: string;
  documentId: string; // ID of the document (note_id in our case)
  content: string; // Full document content snapshot
  createdAt: number; // Timestamp when version was created
  createdBy: string; // User ID who created this version
  changeDescription?: string; // Optional description of changes
  annotationIds: string[]; // Snapshot of annotation IDs at this version
  versionNumber: number; // Sequential version number for this document
  metadata?: {
    title?: string; // Document title at this version
    authorName?: string; // Name of the user who created the version
    annotationCount?: number; // Number of annotations at this version
  };
}

/**
 * Request type for creating a new version
 */
export interface CreateVersionRequest {
  documentId: string;
  content: string;
  userId: string;
  description?: string;
  annotationIds: string[];
  metadata?: DocumentVersion['metadata'];
}

/**
 * Response type for version list
 */
export interface VersionListResponse {
  versions: DocumentVersion[];
  total: number;
  hasMore: boolean;
}

/**
 * Version comparison result
 */
export interface VersionComparison {
  oldVersion: DocumentVersion;
  newVersion: DocumentVersion;
  diff: VersionDiff;
}
