/**
 * Cookie-based storage utility
 *
 * Uses cookies instead of localStorage so settings persist across
 * different ports (each hook invocation uses a random port).
 * Cookies are scoped by domain, not port, so localhost:54321 and
 * localhost:54322 share the same cookies.
 */

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
