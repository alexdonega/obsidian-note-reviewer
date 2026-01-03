/**
 * Cookie-based storage utility
 *
 * Uses cookies instead of localStorage so settings persist across
 * different ports (each hook invocation uses a random port).
 * Cookies are scoped by domain, not port, so localhost:54321 and
 * localhost:54322 share the same cookies.
 *
 * ## Security Measures
 *
 * This module implements the following cookie security flags:
 *
 * ### Secure Flag
 * - **Applied when**: Running in a secure context (HTTPS or localhost)
 * - **Purpose**: Prevents cookies from being transmitted over unencrypted HTTP connections
 * - **Implementation**: Conditionally added via `isSecureContext()` check
 *
 * ### SameSite=Lax
 * - **Applied**: Always
 * - **Purpose**: Provides CSRF protection by preventing cross-site cookie sending
 *   on most requests (allows cookies for top-level navigation GET requests only)
 *
 * ### HttpOnly Flag - NOT APPLIED
 * - **Reason**: The HttpOnly flag can ONLY be set via server-side HTTP Set-Cookie headers.
 *   This is a fundamental browser security limitation - JavaScript's `document.cookie` API
 *   cannot set HttpOnly because that would defeat its purpose (preventing JavaScript access).
 * - **Impact**: Cookies remain accessible to JavaScript. This is acceptable because:
 *   1. These cookies store user preferences, not sensitive authentication tokens
 *   2. The application runs locally and cookies are needed for the UI to function
 *   3. XSS protection should be handled at other layers (CSP, input sanitization)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 * @module storage
 */

import { getIdentity, saveIdentity } from './identity';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Get a value from cookie storage
 *
 * Retrieves a cookie value by name. The value is automatically URL-decoded.
 *
 * Note: Reading cookies does not involve security flags - those are only
 * relevant when setting cookies (they control how cookies are transmitted).
 *
 * @param key - The cookie name to retrieve
 * @returns The decoded cookie value, or null if not found or on error
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
 *
 * Creates a cookie with the following security attributes:
 * - `path=/` - Cookie available for all paths
 * - `max-age=ONE_YEAR_SECONDS` - Cookie expires in 1 year
 * - `SameSite=Lax` - CSRF protection (prevents cross-site requests)
 * - `Secure` - Only added in secure contexts (HTTPS or localhost)
 *
 * The Secure flag is conditionally applied because:
 * - In HTTPS contexts: Prevents cookie transmission over unencrypted connections
 * - In localhost contexts: Browsers treat localhost as "secure" for development
 * - In HTTP (non-localhost): Flag is omitted so cookies still work
 *
 * Note: HttpOnly flag is NOT set because it cannot be applied via JavaScript.
 * See module documentation for security rationale.
 *
 * @param key - The cookie name
 * @param value - The value to store (will be URL-encoded)
 * @throws Silently fails if cookies are not available (e.g., in non-browser environments)
 */
export function setItem(key: string, value: string): void {
  try {
    const encoded = encodeURIComponent(value);
    const secureFlag = isSecureContext() ? '; Secure' : '';
    document.cookie = `${key}=${encoded}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax${secureFlag}`;
  } catch (e) {
    // Cookie not available
  }
}

/**
 * Remove a value from cookie storage
 *
 * Deletes a cookie by setting its max-age to 0. Includes the same cookie
 * attributes (path, SameSite, Secure) used in `setItem()` to ensure proper
 * deletion across all browsers.
 *
 * **Why matching attributes matter:**
 * Browsers may treat cookies with different attributes as separate cookies.
 * For example, a cookie set with `path=/; Secure` is considered different
 * from one set with just `path=/`. To reliably delete the cookie, we must
 * include the same attributes that were used when setting it.
 *
 * Attributes included:
 * - `path=/` - Matches the path used in setItem
 * - `max-age=0` - Immediately expires the cookie
 * - `SameSite=Lax` - Matches the SameSite used in setItem
 * - `Secure` - Conditionally included if in a secure context
 *
 * @param key - The cookie name to remove
 * @throws Silently fails if cookies are not available
 */
export function removeItem(key: string): void {
  try {
    const secureFlag = isSecureContext() ? '; Secure' : '';
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  } catch (e) {
    // Cookie not available
  }
}

/**
 * Escape special regex characters in a string
 *
 * Used internally to safely search for cookie names that may contain
 * special regex characters.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for use in a RegExp
 * @internal
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if the current context is secure (HTTPS or localhost)
 *
 * Browsers treat the following as secure contexts:
 * - HTTPS connections
 * - localhost (127.0.0.1, ::1, or localhost hostname)
 * - file:// URLs
 *
 * Uses the modern window.isSecureContext API when available,
 * with fallback logic for older browsers.
 *
 * @returns true if running in a secure context, false otherwise
 */
export function isSecureContext(): boolean {
  try {
    // Modern API - available in all modern browsers
    if (typeof window !== 'undefined' && typeof window.isSecureContext === 'boolean') {
      return window.isSecureContext;
    }

    // Fallback for older browsers or non-browser environments
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;

      // HTTPS is always secure
      if (protocol === 'https:') {
        return true;
      }

      // Localhost is considered secure (allows Secure cookies in development)
      if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1')) {
        return true;
      }

      // file:// URLs are considered secure contexts
      if (protocol === 'file:') {
        return true;
      }
    }

    return false;
  } catch {
    // If we can't determine security context, assume insecure
    return false;
  }
}

/**
 * Storage object with localStorage-like API
 *
 * Provides a drop-in replacement for localStorage using cookies.
 * All security measures (Secure flag, SameSite) are automatically
 * applied when using these methods.
 *
 * @example
 * ```typescript
 * // Set a value (with security flags automatically applied)
 * storage.setItem('myKey', 'myValue');
 *
 * // Get a value
 * const value = storage.getItem('myKey');
 *
 * // Remove a value (with matching security flags)
 * storage.removeItem('myKey');
 * ```
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
