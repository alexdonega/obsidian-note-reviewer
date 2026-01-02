import { log } from './logger';
import { realtime } from './realtime';

// Operation types for Operational Transformation
export type OperationType = 'insert' | 'delete' | 'retain';

export interface Operation {
  type: OperationType;
  position: number;
  content?: string;
  length?: number;
  userId: string;
  timestamp: number;
  version: number;
}

export interface DocumentState {
  content: string;
  version: number;
  operations: Operation[];
}

// Operational Transformation engine
export class OTEngine {
  private document: DocumentState;
  private pendingOperations: Operation[] = [];
  private userId: string;

  constructor(initialContent: string, userId: string) {
    this.document = {
      content: initialContent,
      version: 0,
      operations: [],
    };
    this.userId = userId;
  }

  // Apply local operation
  applyLocal(op: Operation): void {
    this.document.content = this.applyOperation(this.document.content, op);
    this.document.version++;
    this.document.operations.push(op);

    log.debug('Local operation applied', { op, version: this.document.version });
  }

  // Apply remote operation
  applyRemote(remoteOp: Operation): void {
    // Transform against pending operations
    let transformedOp = remoteOp;

    for (const pendingOp of this.pendingOperations) {
      transformedOp = this.transform(transformedOp, pendingOp);
    }

    // Apply transformed operation
    this.document.content = this.applyOperation(this.document.content, transformedOp);
    this.document.version = Math.max(this.document.version, remoteOp.version);
    this.document.operations.push(transformedOp);

    log.debug('Remote operation applied', { op: transformedOp, version: this.document.version });
  }

  // Transform two concurrent operations
  private transform(op1: Operation, op2: Operation): Operation {
    // Insert vs Insert
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position < op2.position || (op1.position === op2.position && op1.userId < op2.userId)) {
        return op1;
      }
      return {
        ...op1,
        position: op1.position + (op2.content?.length || 0),
      };
    }

    // Insert vs Delete
    if (op1.type === 'insert' && op2.type === 'delete') {
      if (op1.position <= op2.position) {
        return op1;
      }
      return {
        ...op1,
        position: Math.max(op1.position - (op2.length || 0), op2.position),
      };
    }

    // Delete vs Insert
    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return op1;
      }
      return {
        ...op1,
        position: op1.position + (op2.content?.length || 0),
      };
    }

    // Delete vs Delete
    if (op1.type === 'delete' && op2.type === 'delete') {
      if (op1.position < op2.position) {
        return op1;
      }
      if (op1.position > op2.position + (op2.length || 0)) {
        return {
          ...op1,
          position: op1.position - (op2.length || 0),
        };
      }
      // Overlapping deletes - adjust position and length
      const overlap = Math.min(
        (op1.length || 0),
        op2.position + (op2.length || 0) - op1.position
      );
      return {
        ...op1,
        position: op2.position,
        length: (op1.length || 0) - overlap,
      };
    }

    return op1;
  }

  // Apply operation to content
  private applyOperation(content: string, op: Operation): string {
    switch (op.type) {
      case 'insert':
        return (
          content.slice(0, op.position) +
          (op.content || '') +
          content.slice(op.position)
        );

      case 'delete':
        return (
          content.slice(0, op.position) +
          content.slice(op.position + (op.length || 0))
        );

      case 'retain':
        return content;

      default:
        return content;
    }
  }

  getContent(): string {
    return this.document.content;
  }

  getVersion(): number {
    return this.document.version;
  }

  addPending(op: Operation): void {
    this.pendingOperations.push(op);
  }

  clearPending(): void {
    this.pendingOperations = [];
  }
}

// Collaborative editor manager
export class CollaborativeEditor {
  private engine: OTEngine;
  private noteId: string;
  private userId: string;
  private channelName: string;
  private subscription: any;
  private onContentChange?: (content: string) => void;

  constructor(
    noteId: string,
    userId: string,
    initialContent: string,
    onContentChange?: (content: string) => void
  ) {
    this.noteId = noteId;
    this.userId = userId;
    this.channelName = `collab:note:${noteId}`;
    this.engine = new OTEngine(initialContent, userId);
    this.onContentChange = onContentChange;

    this.setupRealtimeSync();
  }

  private setupRealtimeSync(): void {
    // Listen for operations from other users
    this.subscription = realtime.onBroadcast(
      this.channelName,
      'operation',
      (payload: Operation) => {
        if (payload.userId !== this.userId) {
          this.engine.applyRemote(payload);
          this.onContentChange?.(this.engine.getContent());
        }
      }
    );

    log.info('Collaborative editing started', { noteId: this.noteId });
  }

  // Insert text
  async insert(position: number, content: string): Promise<void> {
    const op: Operation = {
      type: 'insert',
      position,
      content,
      userId: this.userId,
      timestamp: Date.now(),
      version: this.engine.getVersion() + 1,
    };

    this.engine.applyLocal(op);
    this.engine.addPending(op);

    // Broadcast to other users
    await realtime.broadcast(this.channelName, 'operation', op);

    this.onContentChange?.(this.engine.getContent());
  }

  // Delete text
  async delete(position: number, length: number): Promise<void> {
    const op: Operation = {
      type: 'delete',
      position,
      length,
      userId: this.userId,
      timestamp: Date.now(),
      version: this.engine.getVersion() + 1,
    };

    this.engine.applyLocal(op);
    this.engine.addPending(op);

    // Broadcast to other users
    await realtime.broadcast(this.channelName, 'operation', op);

    this.onContentChange?.(this.engine.getContent());
  }

  // Replace text (delete + insert)
  async replace(position: number, length: number, content: string): Promise<void> {
    await this.delete(position, length);
    await this.insert(position, content);
  }

  getContent(): string {
    return this.engine.getContent();
  }

  destroy(): void {
    this.subscription?.unsubscribe();
    log.info('Collaborative editing stopped', { noteId: this.noteId });
  }
}

// Conflict resolution strategies
export class ConflictResolver {
  // Last Write Wins (LWW) - simplest strategy
  static lastWriteWins<T extends { timestamp: number }>(local: T, remote: T): T {
    return local.timestamp > remote.timestamp ? local : remote;
  }

  // Version-based resolution
  static versionBased<T extends { version: number }>(local: T, remote: T): T {
    return local.version > remote.version ? local : remote;
  }

  // Merge strategy - keep both changes
  static merge(localContent: string, remoteContent: string, baseContent: string): string {
    // Simple three-way merge
    const localDiff = this.diff(baseContent, localContent);
    const remoteDiff = this.diff(baseContent, remoteContent);

    // If no conflicts, apply both diffs
    if (!this.hasConflicts(localDiff, remoteDiff)) {
      return this.applyDiffs(baseContent, [localDiff, remoteDiff]);
    }

    // Has conflicts - keep both with markers
    return `<<<<<<< LOCAL\n${localContent}\n=======\n${remoteContent}\n>>>>>>> REMOTE`;
  }

  private static diff(from: string, to: string): { type: string; value: string }[] {
    // Simplified diff - in production use a library like diff-match-patch
    if (from === to) return [];

    return [
      { type: 'delete', value: from },
      { type: 'insert', value: to },
    ];
  }

  private static hasConflicts(diff1: any[], diff2: any[]): boolean {
    // Simplified conflict detection
    return diff1.length > 0 && diff2.length > 0;
  }

  private static applyDiffs(base: string, diffs: any[][]): string {
    // Simplified diff application
    return diffs.reduce((content, diff) => {
      return diff.reduce((acc, change) => {
        if (change.type === 'insert') return change.value;
        return acc;
      }, content);
    }, base);
  }
}

// Typing indicator manager
export class TypingIndicator {
  private channelName: string;
  private userId: string;
  private userInfo: { name: string; avatar?: string };
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private isTyping = false;

  constructor(channelName: string, userId: string, userInfo: { name: string; avatar?: string }) {
    this.channelName = channelName;
    this.userId = userId;
    this.userInfo = userInfo;
  }

  // Start typing
  async startTyping(): Promise<void> {
    if (this.isTyping) {
      this.resetTimeout();
      return;
    }

    this.isTyping = true;

    await realtime.broadcast(this.channelName, 'typing:start', {
      userId: this.userId,
      ...this.userInfo,
    });

    this.resetTimeout();
  }

  // Stop typing
  async stopTyping(): Promise<void> {
    if (!this.isTyping) return;

    this.isTyping = false;

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    await realtime.broadcast(this.channelName, 'typing:stop', {
      userId: this.userId,
    });
  }

  private resetTimeout(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Auto-stop after 3 seconds of inactivity
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  }

  destroy(): void {
    this.stopTyping();
  }
}
