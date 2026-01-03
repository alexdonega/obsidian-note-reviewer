/**
 * Cookie-based storage utility
 *
 * Uses cookies instead of localStorage so settings persist across
 * different ports (each hook invocation uses a random port).
 * Cookies are scoped by domain, not port, so localhost:54321 and
 * localhost:54322 share the same cookies.
 */

import { safeJsonParseOrNull, type JsonValidator } from './safeJson';

/**
 * Note configuration type stored in cookies
 */
export interface NoteConfig {
  tipo: string;
  noteName: string;
  vaultPath?: string;
  notePath?: string;
}

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
 * Validator for NoteConfig structure
 * Ensures the parsed data has the required fields with correct types
 */
const isValidNoteConfig: JsonValidator<NoteConfig> = (data): data is NoteConfig => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  // Required fields
  if (typeof obj.tipo !== 'string' || typeof obj.noteName !== 'string') {
    return false;
  }
  // Optional fields - if present, must be strings
  if (obj.vaultPath !== undefined && typeof obj.vaultPath !== 'string') {
    return false;
  }
  if (obj.notePath !== undefined && typeof obj.notePath !== 'string') {
    return false;
  }
  return true;
};

/**
 * Save complete note configuration
 */
export function saveNoteConfig(config: NoteConfig): void {
  setCookie('noteConfig', JSON.stringify(config));
}

/**
 * Get saved note configuration
 *
 * Uses safeJsonParseOrNull with validation to ensure proper error handling
 * and type safety when parsing cookie data.
 *
 * Security note: Cookie data is same-origin only, making this lower risk
 * than URL-based shares, but validation ensures data integrity even if
 * cookies are corrupted or manually modified.
 */
export function getNoteConfig(): NoteConfig | null {
  const config = getCookie('noteConfig');
  if (!config) {
    return null;
  }
  return safeJsonParseOrNull<NoteConfig>(config, isValidNoteConfig);
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
 * Export all settings as a JSON-serializable object
 */
export function exportAllSettings(): Record<string, unknown> {
  return {
    vaultPath: getVaultPath(),
    notePath: getNotePath(),
    noteType: getNoteType(),
    noteName: getNoteName(),
    lastUsedTemplate: getLastUsedTemplate(),
    noteConfig: getNoteConfig(),
    noteTypePaths: getAllNoteTypePaths(),
    noteTypeTemplates: getAllNoteTypeTemplates(),
  };
}

/**
 * Validate imported settings
 */
export function validateSettingsImport(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Dados inválidos' };
  }
  return { valid: true };
}

/**
 * Import all settings from a JSON object
 */
export function importAllSettings(data: Record<string, unknown>): void {
  if (data.vaultPath && typeof data.vaultPath === 'string') {
    setVaultPath(data.vaultPath);
  }
  if (data.notePath && typeof data.notePath === 'string') {
    setNotePath(data.notePath);
  }
  if (data.noteType && typeof data.noteType === 'string') {
    setNoteType(data.noteType);
  }
  if (data.noteName && typeof data.noteName === 'string') {
    setNoteName(data.noteName);
  }
  if (data.lastUsedTemplate && typeof data.lastUsedTemplate === 'string') {
    setLastUsedTemplate(data.lastUsedTemplate);
  }
  if (data.noteTypePaths && typeof data.noteTypePaths === 'object') {
    for (const [tipo, path] of Object.entries(data.noteTypePaths as Record<string, string>)) {
      setNoteTypePath(tipo, path);
    }
  }
  if (data.noteTypeTemplates && typeof data.noteTypeTemplates === 'object') {
    for (const [tipo, template] of Object.entries(data.noteTypeTemplates as Record<string, string>)) {
      setNoteTypeTemplate(tipo, template);
    }
  }
}

// =====================================
// Annotation Persistence (localStorage)
// =====================================

/**
 * Generate a simple hash for the markdown content to use as storage key
 */
function generateContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(content.length, 1000); i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `note_${Math.abs(hash).toString(36)}`;
}

/**
 * Save annotations to localStorage
 */
export function saveAnnotations(markdown: string, annotations: unknown[]): void {
  try {
    const hash = generateContentHash(markdown);
    localStorage.setItem(`annotations_${hash}`, JSON.stringify(annotations));
    // Also save the current hash so we can check if content changed
    localStorage.setItem('current_note_hash', hash);
  } catch (e) {
    console.warn('Failed to save annotations to localStorage:', e);
  }
}

/**
 * Load annotations from localStorage
 */
export function loadAnnotations(markdown: string): unknown[] | null {
  try {
    const hash = generateContentHash(markdown);
    const stored = localStorage.getItem(`annotations_${hash}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (e) {
    console.warn('Failed to load annotations from localStorage:', e);
    return null;
  }
}

/**
 * Clear annotations from localStorage
 */
export function clearAnnotations(markdown: string): void {
  try {
    const hash = generateContentHash(markdown);
    localStorage.removeItem(`annotations_${hash}`);
  } catch (e) {
    console.warn('Failed to clear annotations from localStorage:', e);
  }
}

// =====================================
// Display Name (User Preference)
// =====================================

const DISPLAY_NAME_KEY = 'obsidian-reviewer-display-name';

/**
 * Get display name from storage
 */
export function getDisplayName(): string {
  return getItem(DISPLAY_NAME_KEY) ?? '';
}

/**
 * Set display name in storage
 */
export function setDisplayName(name: string): void {
  setItem(DISPLAY_NAME_KEY, name);
}
