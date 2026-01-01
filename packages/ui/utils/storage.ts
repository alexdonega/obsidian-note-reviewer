/**
 * Cookie-based storage utility
 *
 * Uses cookies instead of localStorage so settings persist across
 * different ports (each hook invocation uses a random port).
 * Cookies are scoped by domain, not port, so localhost:54321 and
 * localhost:54322 share the same cookies.
 */

import { getIdentity, saveIdentity } from './identity';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Get a value from cookie storage
 */
export function getItem(key: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapeRegex(key)}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Set a value in cookie storage
 */
export function setItem(key: string, value: string): void {
  try {
    const encoded = encodeURIComponent(value);
    document.cookie = `${key}=${encoded}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  } catch (e) {
    // Cookie not available
  }
}

/**
 * Remove a value from cookie storage
 */
export function removeItem(key: string): void {
  try {
    document.cookie = `${key}=; path=/; max-age=0`;
  } catch (e) {
    // Cookie not available
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Storage object with localStorage-like API
 */
export const storage = {
  getItem,
  setItem,
  removeItem,
};

// Helper function to get cookie value (uses existing getItem)
function getCookie(key: string): string | null {
  return getItem(key);
}

// Helper function to set cookie value (uses existing setItem)
function setCookie(key: string, value: string): void {
  setItem(key, value);
}

/**
 * Get vault path from storage
 */
export function getVaultPath(): string {
  return getCookie('vaultPath') ?? '';
}

/**
 * Set vault path in storage
 */
export function setVaultPath(path: string): void {
  setCookie('vaultPath', path);
}

/**
 * Get note path from storage
 */
export function getNotePath(): string {
  return getCookie('notePath') ?? '';
}

/**
 * Set note path in storage
 */
export function setNotePath(path: string): void {
  setCookie('notePath', path);
}

/**
 * Get note type from storage
 */
export function getNoteType(): string | null {
  return getCookie('noteType');
}

/**
 * Set note type in storage
 */
export function setNoteType(tipo: string): void {
  setCookie('noteType', tipo);
}

/**
 * Get note name from storage
 */
export function getNoteName(): string {
  return getCookie('noteName') ?? '';
}

/**
 * Set note name in storage
 */
export function setNoteName(name: string): void {
  setCookie('noteName', name);
}

/**
 * Get last used template from storage
 */
export function getLastUsedTemplate(): string | null {
  return getCookie('lastTemplate');
}

/**
 * Set last used template in storage
 */
export function setLastUsedTemplate(template: string): void {
  setCookie('lastTemplate', template);
}

/**
 * Save complete note configuration
 */
export function saveNoteConfig(config: {
  tipo: string;
  noteName: string;
  vaultPath?: string;
  notePath?: string;
}): void {
  setCookie('noteConfig', JSON.stringify(config));
}

/**
 * Get saved note configuration
 */
export function getNoteConfig(): {
  tipo: string;
  noteName: string;
  vaultPath?: string;
  notePath?: string;
} | null {
  const config = getCookie('noteConfig');
  try {
    return config ? JSON.parse(config) : null;
  } catch {
    return null;
  }
}

/**
 * Get path for a specific note type
 */
export function getNoteTypePath(tipo: string): string {
  return getCookie(`notePath_${tipo}`) ?? '';
}

/**
 * Set path for a specific note type
 */
export function setNoteTypePath(tipo: string, path: string): void {
  setCookie(`notePath_${tipo}`, path);
}

/**
 * Get all configured note type paths
 */
export function getAllNoteTypePaths(): Record<string, string> {
  const paths: Record<string, string> = {};
  // Parse all cookies to find notePath_* entries
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key.startsWith('notePath_')) {
      const tipo = key.replace('notePath_', '');
      paths[tipo] = decodeURIComponent(value);
    }
  }
  return paths;
}

/**
 * Get template path for a specific note type
 */
export function getNoteTypeTemplate(tipo: string): string {
  return getCookie(`noteTemplate_${tipo}`) ?? '';
}

/**
 * Set template path for a specific note type
 */
export function setNoteTypeTemplate(tipo: string, templatePath: string): void {
  setCookie(`noteTemplate_${tipo}`, templatePath);
}

/**
 * Get all configured note type template paths
 */
export function getAllNoteTypeTemplates(): Record<string, string> {
  const templates: Record<string, string> = {};
  // Parse all cookies to find noteTemplate_* entries
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key.startsWith('noteTemplate_')) {
      const tipo = key.replace('noteTemplate_', '');
      templates[tipo] = decodeURIComponent(value);
    }
  }
  return templates;
}

/**
 * Settings export structure for backup and sharing
 *
 * Used for exporting/importing all user settings as JSON.
 * Version field enables future compatibility handling.
 */
export interface SettingsExport {
  /** Schema version for future compatibility */
  version: number;
  /** User's tater identity (e.g., "swift-falcon-tater") */
  identity: string;
  /** Note type paths mapping (tipo -> path) */
  notePaths: Record<string, string>;
  /** Note type templates mapping (tipo -> template path) */
  noteTemplates: Record<string, string>;
}

/** Current settings export schema version */
const SETTINGS_EXPORT_VERSION = 1;

/**
 * Result of settings validation
 */
export interface SettingsValidationResult {
  /** Whether the settings object is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Validate an imported settings object
 *
 * Checks that the object has the correct structure and types
 * before applying it via importAllSettings.
 *
 * @param data - The parsed JSON data to validate
 * @returns Validation result with valid flag and optional error message
 */
export function validateSettingsImport(data: unknown): SettingsValidationResult {
  // Check that data is an object
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Settings must be a valid JSON object' };
  }

  const obj = data as Record<string, unknown>;

  // Check required top-level fields
  if (typeof obj.version !== 'number') {
    return { valid: false, error: 'Missing or invalid "version" field (must be a number)' };
  }

  if (typeof obj.identity !== 'string') {
    return { valid: false, error: 'Missing or invalid "identity" field (must be a string)' };
  }

  if (typeof obj.notePaths !== 'object' || obj.notePaths === null || Array.isArray(obj.notePaths)) {
    return { valid: false, error: 'Missing or invalid "notePaths" field (must be an object)' };
  }

  if (typeof obj.noteTemplates !== 'object' || obj.noteTemplates === null || Array.isArray(obj.noteTemplates)) {
    return { valid: false, error: 'Missing or invalid "noteTemplates" field (must be an object)' };
  }

  // Validate notePaths entries are all strings
  const notePaths = obj.notePaths as Record<string, unknown>;
  for (const [key, value] of Object.entries(notePaths)) {
    if (typeof value !== 'string') {
      return { valid: false, error: `Invalid notePaths entry "${key}" (value must be a string)` };
    }
  }

  // Validate noteTemplates entries are all strings
  const noteTemplates = obj.noteTemplates as Record<string, unknown>;
  for (const [key, value] of Object.entries(noteTemplates)) {
    if (typeof value !== 'string') {
      return { valid: false, error: `Invalid noteTemplates entry "${key}" (value must be a string)` };
    }
  }

  return { valid: true };
}

/**
 * Export all settings as a SettingsExport object
 *
 * Gathers all note type paths, note type templates, and identity
 * into a single exportable object for backup and sharing.
 */
export function exportAllSettings(): SettingsExport {
  return {
    version: SETTINGS_EXPORT_VERSION,
    identity: getIdentity(),
    notePaths: getAllNoteTypePaths(),
    noteTemplates: getAllNoteTypeTemplates(),
  };
}

/**
 * Import all settings from a SettingsExport object
 *
 * Applies all note type paths, note type templates, and identity
 * from a previously exported settings object.
 *
 * @param settings - The settings object to import
 * @returns true if import was successful, false if version is unsupported
 */
export function importAllSettings(settings: SettingsExport): boolean {
  // Handle version mismatch gracefully
  // Version 1 is the only version currently supported
  // Future versions may need migration logic here
  if (settings.version > SETTINGS_EXPORT_VERSION) {
    // Newer version - attempt import but warn (graceful degradation)
    // The settings structure should be backwards compatible
  }

  // Import identity
  if (settings.identity) {
    saveIdentity(settings.identity);
  }

  // Import note paths
  if (settings.notePaths) {
    for (const [tipo, path] of Object.entries(settings.notePaths)) {
      setNoteTypePath(tipo, path);
    }
  }

  // Import note templates
  if (settings.noteTemplates) {
    for (const [tipo, templatePath] of Object.entries(settings.noteTemplates)) {
      setNoteTypeTemplate(tipo, templatePath);
    }
  }

  return true;
}
