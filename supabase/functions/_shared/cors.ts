/**
 * Shared CORS utility for Supabase Edge Functions
 * Validates request origins against an allowlist to prevent CSRF-like attacks
 */

// Security: Whitelist of allowed origins (no wildcards for production)
const DEFAULT_ALLOWED_ORIGINS = [
  'https://obsidian-note-reviewer.ai',
  'https://www.obsidian-note-reviewer.ai',
  'https://r.alexdonega.com.br',
  'http://localhost:3000',
  'http://localhost:5173',
];

/**
 * Get the list of allowed origins, including any from environment variable
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  const additionalOrigins = envOrigins
    ? envOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  return [...DEFAULT_ALLOWED_ORIGINS, ...additionalOrigins];
}

/**
 * Validate if a request origin is in the allowed list
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin);
}

/**
 * Get CORS headers with validated origin
 * Falls back to first allowed origin if request origin not in allowlist
 *
 * @param req - The incoming Request object
 * @returns CORS headers object
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const allowedOrigins = getAllowedOrigins();

  // Use the request origin if it's in the allowlist, otherwise use the first allowed origin
  const allowedOrigin = origin && isOriginAllowed(origin)
    ? origin
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Handle CORS preflight (OPTIONS) requests consistently
 *
 * Usage in edge functions:
 * ```typescript
 * if (req.method === 'OPTIONS') {
 *   return handleCorsPreflightRequest(req);
 * }
 * ```
 *
 * @param req - The incoming Request object
 * @returns Response with appropriate CORS headers for preflight
 */
export function handleCorsPreflightRequest(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export type CorsHeaders = ReturnType<typeof getCorsHeaders>;
