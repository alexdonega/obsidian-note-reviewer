/**
 * CORS Utility Module
 * Provides secure CORS handling with origin validation
 */

import type { VercelResponse } from '@vercel/node';

/**
 * Default allowed origins for CORS
 * Production domain and common localhost ports for development
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'https://r.alexdonega.com.br',
  'https://www.r.alexdonega.com.br',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173', // Vite default port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

/**
 * Get the list of allowed origins from environment variable or defaults
 * ALLOWED_ORIGINS env var should be a comma-separated list of origins
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
  }

  return DEFAULT_ALLOWED_ORIGINS;
}

/**
 * Check if the given origin is in the allowlist
 *
 * @param origin - The Origin header value from the request
 * @returns true if the origin is allowed, false otherwise
 */
export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

/**
 * Set appropriate CORS headers on the response based on origin validation
 *
 * @param res - Vercel response object
 * @param origin - The Origin header value from the request
 * @returns The response object for chaining
 */
export function setCorsHeaders(
  res: VercelResponse,
  origin: string | null | undefined
): VercelResponse {
  // Always set Vary header to ensure proper caching
  res.setHeader('Vary', 'Origin');

  // Set allowed methods and headers for all requests
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (isOriginAllowed(origin)) {
    // Origin is in allowlist - reflect the origin and allow credentials
    res.setHeader('Access-Control-Allow-Origin', origin!);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // Origin is not in allowlist - don't set Allow-Origin or credentials
    // This effectively blocks cross-origin requests from unknown origins
    // Note: We don't set Access-Control-Allow-Origin at all for disallowed origins
    // This is more secure than setting it to a different value
  }

  return res;
}

/**
 * Handle CORS preflight (OPTIONS) request
 * Returns true if this was a preflight request and it was handled
 *
 * @param method - The HTTP method of the request
 * @param res - Vercel response object
 * @returns true if this was an OPTIONS request (handled), false otherwise
 */
export function handlePreflightRequest(
  method: string | undefined,
  res: VercelResponse
): boolean {
  if (method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
