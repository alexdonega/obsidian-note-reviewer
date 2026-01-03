/**
 * Portable sharing utilities for Obsidian Note Reviewer
 *
 * Enables sharing plan + annotations via URL hash using:
 * - Native CompressionStream/DecompressionStream (deflate-raw)
 * - Base64url encoding for URL safety
 *
 * Inspired by textarea.my's approach.
 */

import { Annotation, AnnotationType } from '../types';
import { safeJsonParse } from './safeJson';

// Minimal shareable annotation format: [type, originalText, text?, author?]
export type ShareableAnnotation =
  | ['D', string, string | null]                    // Deletion: type, original, author
  | ['R', string, string, string | null]            // Replacement: type, original, replacement, author
  | ['C', string, string, string | null]            // Comment: type, original, comment, author
  | ['I', string, string, string | null];           // Insertion: type, context, new text, author

export interface SharePayload {
  p: string;  // plan markdown
  a: ShareableAnnotation[];
}

/**
 * Validate that a parsed object is a valid ShareableAnnotation
 * Checks type, required fields, and field types
 */
function isValidShareableAnnotation(item: unknown): item is ShareableAnnotation {
  if (!Array.isArray(item) || item.length < 3) {
    return false;
  }

  const type = item[0];
  const originalText = item[1];

  // Type must be one of the valid annotation types
  if (!['D', 'R', 'C', 'I'].includes(type as string)) {
    return false;
  }

  // Original text must be a string
  if (typeof originalText !== 'string') {
    return false;
  }

  // For Deletion: [type, originalText, author]
  if (type === 'D') {
    const author = item[2];
    // Author must be string or null
    return author === null || typeof author === 'string';
  }

  // For R, C, I: [type, originalText, text, author]
  if (item.length < 4) {
    return false;
  }

  const text = item[2];
  const author = item[3];

  // Text must be a string
  if (typeof text !== 'string') {
    return false;
  }

  // Author must be string or null
  return author === null || typeof author === 'string';
}

/**
 * Validate that a parsed object is a valid SharePayload
 * Returns true if the object has required fields with correct types
 *
 * Validates:
 * - p (plan): must be a string
 * - a (annotations): must be an array of valid ShareableAnnotation
 */
export function validateSharePayload(data: unknown): data is SharePayload {
  // Must be a non-null object
  if (data === null || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required 'p' field is a string
  if (!('p' in obj) || typeof obj.p !== 'string') {
    return false;
  }

  // Check required 'a' field is an array
  if (!('a' in obj) || !Array.isArray(obj.a)) {
    return false;
  }

  // Validate each annotation in the array
  for (const annotation of obj.a) {
    if (!isValidShareableAnnotation(annotation)) {
      return false;
    }
  }

  return true;
}

/**
 * Compress a SharePayload to a base64url string
 */
export async function compress(payload: SharePayload): Promise<string> {
  const json = JSON.stringify(payload);
  const byteArray = new TextEncoder().encode(json);

  const stream = new CompressionStream('deflate-raw');
  const writer = stream.writable.getWriter();
  writer.write(byteArray);
  writer.close();

  const buffer = await new Response(stream.readable).arrayBuffer();
  const compressed = new Uint8Array(buffer);

  // Convert to base64url (URL-safe base64)
  const base64 = btoa(String.fromCharCode(...compressed));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decompress a base64url string back to SharePayload
 */
export async function decompress(b64: string): Promise<SharePayload> {
  // Restore standard base64
  const base64 = b64
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const binary = atob(base64);
  const byteArray = Uint8Array.from(binary, c => c.charCodeAt(0));

  const stream = new DecompressionStream('deflate-raw');
  const writer = stream.writable.getWriter();
  writer.write(byteArray);
  writer.close();

  const buffer = await new Response(stream.readable).arrayBuffer();
  const json = new TextDecoder().decode(buffer);

  const result = safeJsonParse<SharePayload>(json, validateSharePayload);
  if (!result.success) {
    throw new Error(`Failed to parse share payload: ${result.error}`);
  }

  return result.data;
}

/**
 * Convert full Annotation objects to minimal shareable format
 */
export function toShareable(annotations: Annotation[]): ShareableAnnotation[] {
  return annotations.map(ann => {
    const type = ann.type[0] as 'D' | 'R' | 'C' | 'I';
    const author = ann.author || null;

    if (type === 'D') {
      return ['D', ann.originalText, author] as ShareableAnnotation;
    }

    // R, C, I all have text
    return [type, ann.originalText, ann.text || '', author] as ShareableAnnotation;
  });
}

/**
 * Convert shareable format back to full Annotation objects
 * Note: blockId, offsets, and meta will need to be populated separately
 * by finding the text in the rendered document.
 */
export function fromShareable(data: ShareableAnnotation[]): Annotation[] {
  const typeMap: Record<string, AnnotationType> = {
    'D': AnnotationType.DELETION,
    'R': AnnotationType.REPLACEMENT,
    'C': AnnotationType.COMMENT,
    'I': AnnotationType.INSERTION,
  };

  return data.map((item, index) => {
    const type = item[0];
    const originalText = item[1];
    // For deletion: [type, original, author]
    // For others: [type, original, text, author]
    const text = type === 'D' ? undefined : item[2] as string;
    const author = type === 'D' ? item[2] as string | null : item[3] as string | null;

    return {
      id: `shared-${index}-${Date.now()}`,
      blockId: '',  // Will be populated during highlight restoration
      startOffset: 0,
      endOffset: 0,
      type: typeMap[type],
      text: text || undefined,
      originalText,
      createdA: Date.now() + index,  // Preserve order
      author: author || undefined,
      // startMeta/endMeta will be set by web-highlighter
    };
  });
}

/**
 * Generate a full shareable URL from plan and annotations
 */
const SHARE_BASE_URL = 'https://r.alexdonega.com.br';

/**
 * Extract a friendly slug from markdown content
 * Tries to find: title from frontmatter > first heading > generic name
 */
function extractFriendlySlug(markdown: string): string {
  // Try to extract title from frontmatter
  const frontmatterMatch = markdown.match(/^---\s*\n[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?\n---/i);
  if (frontmatterMatch) {
    return slugify(frontmatterMatch[1]);
  }

  // Try to extract first H1 heading
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return slugify(h1Match[1]);
  }

  // Try to extract first H2 heading
  const h2Match = markdown.match(/^##\s+(.+)$/m);
  if (h2Match) {
    return slugify(h2Match[1]);
  }

  // Fallback: use date-based slug
  const now = new Date();
  return `nota-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Convert text to URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .slice(0, 30) // Limit length
    .replace(/^-+|-+$/g, ''); // Trim hyphens
}

export async function generateShareUrl(
  markdown: string,
  annotations: Annotation[]
): Promise<string> {
  const payload: SharePayload = {
    p: markdown,
    a: toShareable(annotations),
  };

  const hash = await compress(payload);

  // Generate a friendly slug prefix for the URL
  const slug = extractFriendlySlug(markdown);
  const annotationCount = annotations.length;

  // Format: slug~count~hash (using ~ as separator since it's URL-safe and uncommon)
  // This makes URLs like: r.alexdonega.com.br/#obsidian-note-reviewer~5~[compressed]
  const friendlyHash = `${slug}~${annotationCount}~${hash}`;

  return `${SHARE_BASE_URL}/#${friendlyHash}`;
}

/**
 * Parse a share URL hash and return the payload
 * Supports both new format (slug~count~hash) and legacy format (hash only)
 * Returns null if no valid hash or parsing fails
 */
export async function parseShareHash(): Promise<SharePayload | null> {
  const hash = window.location.hash.slice(1); // Remove leading #

  if (!hash) {
    return null;
  }

  try {
    // Check for new format with slug prefix: slug~count~hash
    const parts = hash.split('~');
    let compressedHash: string;

    if (parts.length >= 3) {
      // New format: extract the actual hash (last part)
      compressedHash = parts.slice(2).join('~'); // In case hash contains ~
    } else {
      // Legacy format: entire hash is the compressed data
      compressedHash = hash;
    }

    return await decompress(compressedHash);
  } catch (e) {
    console.warn('Failed to parse share hash:', e);
    return null;
  }
}

/**
 * Extract metadata from a friendly share URL hash
 * Returns slug and annotation count if available
 */
export function extractShareMetadata(hash: string): { slug: string | null; count: number | null } {
  if (!hash) {
    return { slug: null, count: null };
  }

  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const parts = cleanHash.split('~');

  if (parts.length >= 3) {
    const slug = parts[0];
    const count = parseInt(parts[1], 10);
    return {
      slug: slug || null,
      count: isNaN(count) ? null : count
    };
  }

  return { slug: null, count: null };
}

/**
 * Get the size of a URL in a human-readable format
 */
export function formatUrlSize(url: string): string {
  const bytes = new Blob([url]).size;
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}
