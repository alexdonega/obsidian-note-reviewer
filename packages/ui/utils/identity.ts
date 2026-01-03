/**
 * Tater Identity System
 *
 * Generates anonymous identities for collaborative annotation sharing.
 * Format: {adjective}-tater-{noun}
 * Examples: "swift-tater-falcon", "gentle-tater-crystal"
 *
 * Users can also set a custom display name which takes precedence.
 */

import { uniqueUsernameGenerator, adjectives, nouns } from 'unique-username-generator';
import { storage, getDisplayName, setDisplayName } from './storage';

const STORAGE_KEY = 'obsidian-reviewer-identity';

/**
 * Generate a new tater identity
 */
export function generateIdentity(): string {
  // Use a unique separator to split adjective from noun, avoiding issues
  // with compound words that contain hyphens (e.g., "behind-the-scenes")
  const generated = uniqueUsernameGenerator({
    dictionaries: [adjectives, nouns],
    separator: '|||',
    style: 'lowerCase',
    randomDigits: 0,
    length: 50, // Prevent word truncation (default is too short)
  });

  const [adjective, noun] = generated.split('|||');
  return `${adjective}-${noun}-tater`;
}

/**
 * Get current identity from storage, or generate one if none exists
 * Returns display name if set, otherwise returns the anonymous identity
 */
export function getIdentity(): string {
  // Check for custom display name first
  const displayName = getDisplayName();
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }

  // Fall back to anonymous identity
  const stored = storage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const identity = generateIdentity();
  saveIdentity(identity);
  return identity;
}

/**
 * Get the raw anonymous identity (ignoring display name)
 */
export function getAnonymousIdentity(): string {
  const stored = storage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const identity = generateIdentity();
  saveIdentity(identity);
  return identity;
}

/**
 * Update the custom display name
 */
export function updateDisplayName(name: string): void {
  setDisplayName(name);
}

/**
 * Save identity to storage
 */
export function saveIdentity(identity: string): void {
  storage.setItem(STORAGE_KEY, identity);
}

/**
 * Regenerate identity and save to storage
 */
export function regenerateIdentity(): string {
  const identity = generateIdentity();
  saveIdentity(identity);
  return identity;
}

/**
 * Check if an identity belongs to the current user
 */
export function isCurrentUser(author: string | undefined): boolean {
  if (!author) return false;
  return storage.getItem(STORAGE_KEY) === author;
}
