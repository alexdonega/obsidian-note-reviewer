/**
 * Content Security Policy (CSP) Configuration
 *
 * Provides CSP directives for all apps in the monorepo.
 * CSP is a critical defense-in-depth mechanism that prevents XSS attacks
 * even when input validation fails.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */

/**
 * Trusted external sources for various resource types
 */
const TRUSTED_SOURCES = {
  /** CDN for highlight.js used in marketing app */
  cdnjs: 'https://cdnjs.cloudflare.com',
  /** Google Fonts for custom typography */
  googleFonts: 'https://fonts.googleapis.com',
  /** Google Fonts static assets */
  googleFontsStatic: 'https://fonts.gstatic.com',
} as const;

/**
 * CSP directive configuration for each policy type
 */
export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'font-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'frame-ancestors': string[];
  'object-src': string[];
  'base-uri': string[];
}

/**
 * Options for generating CSP configuration
 */
export interface CSPOptions {
  /** Enable development mode (allows unsafe-eval for HMR) */
  isDev?: boolean;
  /** Allow external CDN sources (for highlight.js) */
  allowCDN?: boolean;
  /** Allow Google Fonts */
  allowGoogleFonts?: boolean;
  /** Additional trusted script sources */
  additionalScriptSources?: string[];
  /** Additional trusted style sources */
  additionalStyleSources?: string[];
  /** Additional trusted connect sources */
  additionalConnectSources?: string[];
}

/**
 * Base CSP directives common to all environments
 */
function getBaseDirectives(): CSPDirectives {
  return {
    // Default policy: restrict to same origin
    'default-src': ["'self'"],

    // Scripts: self only by default (extended based on options)
    'script-src': ["'self'"],

    // Styles: allow self and inline styles for Tailwind
    'style-src': ["'self'", "'unsafe-inline'"],

    // Fonts: self only by default
    'font-src': ["'self'"],

    // Images: allow self, data URIs, blobs, and HTTPS images
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],

    // Connections: allow self (extended for WebSocket in dev)
    'connect-src': ["'self'"],

    // Prevent clickjacking
    'frame-ancestors': ["'none'"],

    // Block object/embed plugins
    'object-src': ["'none'"],

    // Prevent base tag injection
    'base-uri': ["'self'"],
  };
}

/**
 * Generate CSP directives based on environment and options
 */
export function getCSPDirectives(options: CSPOptions = {}): CSPDirectives {
  const {
    isDev = false,
    allowCDN = false,
    allowGoogleFonts = false,
    additionalScriptSources = [],
    additionalStyleSources = [],
    additionalConnectSources = [],
  } = options;

  const directives = getBaseDirectives();

  // Development mode: allow unsafe-eval for Vite HMR and WebSocket connections
  if (isDev) {
    directives['script-src'].push("'unsafe-eval'");
    directives['connect-src'].push('ws:', 'wss:');
  }

  // Allow inline scripts (needed for Vite's script injection)
  // Note: In production, consider using nonces instead
  directives['script-src'].push("'unsafe-inline'");

  // Allow CDN sources (for highlight.js in marketing app)
  if (allowCDN) {
    directives['script-src'].push(TRUSTED_SOURCES.cdnjs);
    directives['style-src'].push(TRUSTED_SOURCES.cdnjs);
  }

  // Allow Google Fonts
  if (allowGoogleFonts) {
    directives['style-src'].push(TRUSTED_SOURCES.googleFonts);
    directives['font-src'].push(TRUSTED_SOURCES.googleFontsStatic);
  }

  // Add additional trusted sources
  if (additionalScriptSources.length > 0) {
    directives['script-src'].push(...additionalScriptSources);
  }

  if (additionalStyleSources.length > 0) {
    directives['style-src'].push(...additionalStyleSources);
  }

  if (additionalConnectSources.length > 0) {
    directives['connect-src'].push(...additionalConnectSources);
  }

  return directives;
}

/**
 * Convert CSP directives object to header string
 */
export function directivesToString(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Get CSP header value for the given options
 */
export function getCSPHeader(options: CSPOptions = {}): string {
  const directives = getCSPDirectives(options);
  return directivesToString(directives);
}

/**
 * Get CSP meta tag content for the given options
 * Note: Meta tags don't support frame-ancestors, report-uri, or sandbox
 */
export function getCSPMetaContent(options: CSPOptions = {}): string {
  const directives = getCSPDirectives(options);

  // Remove directives not supported in meta tags
  const metaSafeDirectives = { ...directives };
  delete (metaSafeDirectives as Partial<CSPDirectives>)['frame-ancestors'];

  return Object.entries(metaSafeDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Pre-configured CSP for the hook app (single-file embedded app)
 *
 * Hook app runs embedded in user's browser via ephemeral server.
 * Uses restrictive CSP since it handles user-generated content.
 */
export function getHookCSP(isDev = false): string {
  return getCSPHeader({
    isDev,
    allowCDN: false,
    allowGoogleFonts: false,
  });
}

/**
 * Pre-configured CSP for the portal app
 *
 * Portal uses API proxy in development.
 */
export function getPortalCSP(isDev = false): string {
  return getCSPHeader({
    isDev,
    allowCDN: false,
    allowGoogleFonts: true,
  });
}

/**
 * Pre-configured CSP for the marketing app
 *
 * Marketing site uses highlight.js from CDN.
 */
export function getMarketingCSP(isDev = false): string {
  return getCSPHeader({
    isDev,
    allowCDN: true,
    allowGoogleFonts: true,
  });
}

/**
 * Production CSP for Vercel deployment
 *
 * Stricter policy without development-specific allowances.
 */
export function getProductionCSP(): string {
  return getCSPHeader({
    isDev: false,
    allowCDN: true,
    allowGoogleFonts: true,
  });
}

/**
 * CSP directives as an object (for Vercel headers config)
 */
export const CSP_DIRECTIVES = {
  development: getCSPDirectives({ isDev: true }),
  production: getCSPDirectives({ isDev: false }),
  hook: {
    development: getCSPDirectives({ isDev: true }),
    production: getCSPDirectives({ isDev: false }),
  },
  portal: {
    development: getCSPDirectives({ isDev: true, allowGoogleFonts: true }),
    production: getCSPDirectives({ isDev: false, allowGoogleFonts: true }),
  },
  marketing: {
    development: getCSPDirectives({ isDev: true, allowCDN: true, allowGoogleFonts: true }),
    production: getCSPDirectives({ isDev: false, allowCDN: true, allowGoogleFonts: true }),
  },
} as const;
