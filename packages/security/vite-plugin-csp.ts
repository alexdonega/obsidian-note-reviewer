/**
 * Vite CSP Plugin
 *
 * A reusable Vite plugin that provides Content Security Policy protection.
 * - Development: Injects CSP headers via dev server middleware
 * - Production: Adds CSP meta tags to HTML during build
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */

import type { Plugin, ViteDevServer, IndexHtmlTransformContext } from 'vite';
import { getCSPHeader, getCSPMetaContent, type CSPOptions } from './csp.ts';

/**
 * Configuration options for the CSP Vite plugin
 */
export interface ViteCSPPluginOptions extends CSPOptions {
  /**
   * Whether to add CSP meta tag during build
   * @default true
   */
  injectMetaTag?: boolean;

  /**
   * Whether to add CSP header during development
   * @default true
   */
  injectHeader?: boolean;

  /**
   * Custom CSP header value (overrides generated CSP)
   * If provided, this will be used instead of generating CSP from options
   */
  customCSP?: string;
}

/**
 * Create a Vite plugin that injects CSP headers during development
 * and adds CSP meta tags during build.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { viteCSP } from '@obsidian-note-reviewer/security/vite-plugin-csp';
 *
 * export default defineConfig({
 *   plugins: [
 *     viteCSP({
 *       allowCDN: true,
 *       allowGoogleFonts: true,
 *     }),
 *   ],
 * });
 * ```
 */
export function viteCSP(options: ViteCSPPluginOptions = {}): Plugin {
  const {
    injectMetaTag = true,
    injectHeader = true,
    customCSP,
    ...cspOptions
  } = options;

  // Cache generated CSP strings
  let devCSP: string | null = null;
  let prodCSP: string | null = null;

  /**
   * Get CSP string for development mode
   */
  function getDevCSP(): string {
    if (customCSP) return customCSP;
    if (!devCSP) {
      devCSP = getCSPHeader({ ...cspOptions, isDev: true });
    }
    return devCSP;
  }

  /**
   * Get CSP string for production mode (meta tag format)
   */
  function getProdCSPMeta(): string {
    if (customCSP) return customCSP;
    if (!prodCSP) {
      prodCSP = getCSPMetaContent({ ...cspOptions, isDev: false });
    }
    return prodCSP;
  }

  return {
    name: 'vite-plugin-csp',

    /**
     * Configure the dev server to inject CSP headers
     */
    configureServer(server: ViteDevServer): void {
      if (!injectHeader) return;

      server.middlewares.use((req, res, next) => {
        // Add CSP header to all responses
        res.setHeader('Content-Security-Policy', getDevCSP());

        // Also add other security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        next();
      });
    },

    /**
     * Transform HTML during build to inject CSP meta tag
     */
    transformIndexHtml: {
      order: 'pre',
      handler(
        html: string,
        ctx: IndexHtmlTransformContext
      ): string {
        if (!injectMetaTag) return html;

        // Only inject meta tag during build, not during dev server
        // (dev server uses headers instead)
        const isDev = ctx.server !== undefined;
        if (isDev) return html;

        const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${getProdCSPMeta()}">`;

        // Inject meta tag after <head> or at the start of <head> content
        // Handle various head tag formats
        const headMatch = html.match(/<head[^>]*>/i);
        if (headMatch && headMatch.index !== undefined) {
          const insertPosition = headMatch.index + headMatch[0].length;
          return (
            html.slice(0, insertPosition) +
            '\n    ' +
            cspMeta +
            html.slice(insertPosition)
          );
        }

        // Fallback: try to insert before </head>
        const headCloseMatch = html.match(/<\/head>/i);
        if (headCloseMatch && headCloseMatch.index !== undefined) {
          return (
            html.slice(0, headCloseMatch.index) +
            '    ' +
            cspMeta +
            '\n  ' +
            html.slice(headCloseMatch.index)
          );
        }

        // Last resort: return unchanged
        return html;
      },
    },
  };
}

/**
 * Pre-configured CSP plugin for the hook app
 *
 * Hook app runs embedded in user's browser via ephemeral server.
 * Uses restrictive CSP since it handles user-generated content.
 */
export function viteCSPHook(): Plugin {
  return viteCSP({
    allowCDN: false,
    allowGoogleFonts: false,
  });
}

/**
 * Pre-configured CSP plugin for the portal app
 *
 * Portal uses API proxy in development.
 */
export function viteCSPPortal(): Plugin {
  return viteCSP({
    allowCDN: false,
    allowGoogleFonts: true,
  });
}

/**
 * Pre-configured CSP plugin for the marketing app
 *
 * Marketing site uses highlight.js from CDN.
 */
export function viteCSPMarketing(): Plugin {
  return viteCSP({
    allowCDN: true,
    allowGoogleFonts: true,
  });
}

// Default export for convenience
export default viteCSP;
