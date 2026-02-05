/**
 * Diff generation utilities for document version comparison
 */

import { diffLines } from 'diff';
import type { VersionChange, VersionChangeType } from '../types/version';

/**
 * Generates a line-by-line diff between two document contents
 *
 * @param oldContent - The original document content
 * @param newContent - The modified document content
 * @returns Array of version changes
 */
export function generateDiff(
  oldContent: string,
  newContent: string
): VersionChange[] {
  // Normalize line endings to LF for consistent comparison
  const normalizedOld = normalizeLineEndings(oldContent);
  const normalizedNew = normalizeLineEndings(newContent);

  // Generate diff using diff library
  const changes = diffLines(normalizedOld, normalizedNew);

  const result: VersionChange[] = [];
  let lineNumber = 1;

  for (const change of changes) {
    const lines = change.value.split('\n');
    // Filter out empty strings from split (last element may be empty)
    const contentLines = lines.filter((line) => line !== '');

    for (const content of contentLines) {
      let changeType: VersionChangeType = 'equal';

      if (change.added) {
        changeType = 'add';
      } else if (change.removed) {
        changeType = 'remove';
      }

      result.push({
        type: changeType,
        lineNumber: lineNumber++,
        content: normalizeWhitespace(content),
      });
    }
  }

  return result;
}

/**
 * Normalizes line endings to LF (\n)
 *
 * @param text - Text to normalize
 * @returns Text with LF line endings
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Normalizes whitespace in text content
 * - Removes leading/trailing whitespace from each line
 * - Collapses multiple spaces into single space
 * - Preserves intentional indentation (4-space pattern)
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeWhitespace(text: string): string {
  // Preserve code blocks by detecting them (4+ space indent or tab indent)
  const isCodeLine = /^(\s{4,}|\t)/.test(text);

  if (isCodeLine) {
    // For code, just trim trailing whitespace
    return text.trimEnd();
  }

  // For non-code, collapse multiple spaces but preserve single spaces
  return text.trim().replace(/\s{2,}/g, ' ');
}

/**
 * Checks if a document is too large for efficient diff viewing
 *
 * @param content - Document content to check
 * @param maxLines - Maximum lines threshold (default: 10,000)
 * @returns True if document exceeds threshold
 */
export function isDocumentTooLarge(
  content: string,
  maxLines: number = 10000
): boolean {
  const lines = content.split('\n');
  return lines.length > maxLines;
}

/**
 * Gets statistics about a diff result
 *
 * @param changes - Array of version changes
 * @returns Statistics object with counts
 */
export function getDiffStats(changes: VersionChange[]): {
  additions: number;
  deletions: number;
  unchanged: number;
  total: number;
} {
  const stats = {
    additions: 0,
    deletions: 0,
    unchanged: 0,
    total: changes.length,
  };

  for (const change of changes) {
    switch (change.type) {
      case 'add':
        stats.additions++;
        break;
      case 'remove':
        stats.deletions++;
        break;
      case 'equal':
        stats.unchanged++;
        break;
    }
  }

  return stats;
}

/**
 * Formats a diff for display in the DiffViewer component
 *
 * @param changes - Array of version changes
 * @returns Object with oldContent and newContent strings
 */
export function formatDiffForViewer(changes: VersionChange[]): {
  oldContent: string;
  newContent: string;
} {
  const oldLines: string[] = [];
  const newLines: string[] = [];

  for (const change of changes) {
    switch (change.type) {
      case 'remove':
        oldLines.push(change.content);
        break;
      case 'add':
        newLines.push(change.content);
        break;
      case 'equal':
        oldLines.push(change.content);
        newLines.push(change.content);
        break;
    }
  }

  return {
    oldContent: oldLines.join('\n'),
    newContent: newLines.join('\n'),
  };
}

/**
 * Creates a summary of changes for display
 *
 * @param changes - Array of version changes
 * @returns Human-readable summary string
 */
export function createChangeSummary(changes: VersionChange[]): string {
  const stats = getDiffStats(changes);

  const parts: string[] = [];
  if (stats.additions > 0) {
    parts.push(`${stats.additions} addition${stats.additions !== 1 ? 's' : ''}`);
  }
  if (stats.deletions > 0) {
    parts.push(`${stats.deletions} deletion${stats.deletions !== 1 ? 's' : ''}`);
  }
  if (stats.unchanged > 0) {
    parts.push(`${stats.unchanged} unchanged`);
  }

  if (parts.length === 0) {
    return 'No changes';
  }

  return parts.join(', ');
}
