/**
 * Unit tests for the shared CORS utility
 * Run with: deno test --allow-env supabase/functions/_shared/cors.test.ts
 */

import {
  assertEquals,
  assertStringIncludes,
} from 'https://deno.land/std@0.208.0/assert/mod.ts';

import {
  getAllowedOrigins,
  isOriginAllowed,
  getCorsHeaders,
  handleCorsPreflightRequest,
} from './cors.ts';

// Helper to create a mock Request with a specific Origin header
function createMockRequest(origin: string | null): Request {
  const headers = new Headers();
  if (origin) {
    headers.set('Origin', origin);
  }
  return new Request('https://example.com/test', {
    method: 'OPTIONS',
    headers,
  });
}

Deno.test('getAllowedOrigins', async (t) => {
  await t.step('returns default allowed origins', () => {
    // Clear any env variable
    Deno.env.delete('ALLOWED_ORIGINS');

    const origins = getAllowedOrigins();

    assertEquals(origins.includes('https://plannotator.ai'), true);
    assertEquals(origins.includes('https://www.plannotator.ai'), true);
    assertEquals(origins.includes('https://r.alexdonega.com.br'), true);
    assertEquals(origins.includes('http://localhost:3000'), true);
    assertEquals(origins.includes('http://localhost:5173'), true);
  });

  await t.step('includes origins from ALLOWED_ORIGINS env var', () => {
    Deno.env.set('ALLOWED_ORIGINS', 'https://custom.example.com,https://another.example.com');

    const origins = getAllowedOrigins();

    assertEquals(origins.includes('https://custom.example.com'), true);
    assertEquals(origins.includes('https://another.example.com'), true);
    // Still includes default origins
    assertEquals(origins.includes('https://plannotator.ai'), true);

    // Cleanup
    Deno.env.delete('ALLOWED_ORIGINS');
  });

  await t.step('handles empty ALLOWED_ORIGINS env var', () => {
    Deno.env.set('ALLOWED_ORIGINS', '');

    const origins = getAllowedOrigins();

    // Should still have default origins
    assertEquals(origins.includes('https://plannotator.ai'), true);
    assertEquals(origins.length, 5); // Only default origins

    // Cleanup
    Deno.env.delete('ALLOWED_ORIGINS');
  });

  await t.step('trims whitespace from env var origins', () => {
    Deno.env.set('ALLOWED_ORIGINS', '  https://spaced.example.com  ,  https://also-spaced.com  ');

    const origins = getAllowedOrigins();

    assertEquals(origins.includes('https://spaced.example.com'), true);
    assertEquals(origins.includes('https://also-spaced.com'), true);

    // Cleanup
    Deno.env.delete('ALLOWED_ORIGINS');
  });
});

Deno.test('isOriginAllowed', async (t) => {
  await t.step('returns true for allowed production origins', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    assertEquals(isOriginAllowed('https://plannotator.ai'), true);
    assertEquals(isOriginAllowed('https://www.plannotator.ai'), true);
    assertEquals(isOriginAllowed('https://r.alexdonega.com.br'), true);
  });

  await t.step('returns true for allowed localhost origins', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    assertEquals(isOriginAllowed('http://localhost:3000'), true);
    assertEquals(isOriginAllowed('http://localhost:5173'), true);
  });

  await t.step('returns false for disallowed origins', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    assertEquals(isOriginAllowed('https://evil.com'), false);
    assertEquals(isOriginAllowed('https://malicious-site.net'), false);
    assertEquals(isOriginAllowed('http://localhost:8080'), false);
  });

  await t.step('returns false for null origin', () => {
    assertEquals(isOriginAllowed(null), false);
  });

  await t.step('returns false for empty string origin', () => {
    assertEquals(isOriginAllowed(''), false);
  });

  await t.step('returns true for origins added via env var', () => {
    Deno.env.set('ALLOWED_ORIGINS', 'https://custom.example.com');

    assertEquals(isOriginAllowed('https://custom.example.com'), true);

    // Cleanup
    Deno.env.delete('ALLOWED_ORIGINS');
  });
});

Deno.test('getCorsHeaders', async (t) => {
  await t.step('returns allowed origin for valid request origin', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://plannotator.ai');
    const headers = getCorsHeaders(req);

    assertEquals(headers['Access-Control-Allow-Origin'], 'https://plannotator.ai');
  });

  await t.step('returns first allowed origin for disallowed request origin', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://evil.com');
    const headers = getCorsHeaders(req);

    // Falls back to first allowed origin
    assertEquals(headers['Access-Control-Allow-Origin'], 'https://plannotator.ai');
  });

  await t.step('returns first allowed origin for null request origin', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest(null);
    const headers = getCorsHeaders(req);

    assertEquals(headers['Access-Control-Allow-Origin'], 'https://plannotator.ai');
  });

  await t.step('returns correct origin when using env var origins', () => {
    Deno.env.set('ALLOWED_ORIGINS', 'https://custom.example.com');

    const req = createMockRequest('https://custom.example.com');
    const headers = getCorsHeaders(req);

    assertEquals(headers['Access-Control-Allow-Origin'], 'https://custom.example.com');

    // Cleanup
    Deno.env.delete('ALLOWED_ORIGINS');
  });

  await t.step('includes required CORS headers', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://plannotator.ai');
    const headers = getCorsHeaders(req);

    assertEquals(headers['Access-Control-Allow-Origin'], 'https://plannotator.ai');
    assertStringIncludes(headers['Access-Control-Allow-Headers'], 'authorization');
    assertStringIncludes(headers['Access-Control-Allow-Headers'], 'content-type');
    assertStringIncludes(headers['Access-Control-Allow-Methods'], 'GET');
    assertStringIncludes(headers['Access-Control-Allow-Methods'], 'POST');
    assertStringIncludes(headers['Access-Control-Allow-Methods'], 'DELETE');
    assertStringIncludes(headers['Access-Control-Allow-Methods'], 'OPTIONS');
    assertEquals(headers['Access-Control-Allow-Credentials'], 'true');
  });

  await t.step('reflects localhost origin for local development', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('http://localhost:5173');
    const headers = getCorsHeaders(req);

    assertEquals(headers['Access-Control-Allow-Origin'], 'http://localhost:5173');
  });
});

Deno.test('handleCorsPreflightRequest', async (t) => {
  await t.step('returns response with status 204', async () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://plannotator.ai');
    const response = handleCorsPreflightRequest(req);

    assertEquals(response.status, 204);
  });

  await t.step('returns response with null body', async () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://plannotator.ai');
    const response = handleCorsPreflightRequest(req);

    const body = await response.text();
    assertEquals(body, '');
  });

  await t.step('returns response with validated CORS headers', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://plannotator.ai');
    const response = handleCorsPreflightRequest(req);

    assertEquals(response.headers.get('Access-Control-Allow-Origin'), 'https://plannotator.ai');
    assertStringIncludes(response.headers.get('Access-Control-Allow-Headers') || '', 'authorization');
    assertStringIncludes(response.headers.get('Access-Control-Allow-Methods') || '', 'OPTIONS');
    assertEquals(response.headers.get('Access-Control-Allow-Credentials'), 'true');
  });

  await t.step('returns fallback origin for disallowed origin in preflight', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://malicious-site.com');
    const response = handleCorsPreflightRequest(req);

    // Falls back to first allowed origin
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), 'https://plannotator.ai');
  });
});

// Security-focused tests
Deno.test('CORS security', async (t) => {
  await t.step('does not use wildcard origin', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    const req = createMockRequest('https://plannotator.ai');
    const headers = getCorsHeaders(req);

    // Should never be '*'
    const origin = headers['Access-Control-Allow-Origin'];
    assertEquals(origin !== '*', true, 'Origin should not be wildcard');
  });

  await t.step('rejects similar but different origins', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    // Subdomain that looks similar but isn't allowed
    assertEquals(isOriginAllowed('https://evil.plannotator.ai'), false);
    assertEquals(isOriginAllowed('https://plannotator.ai.evil.com'), false);
    assertEquals(isOriginAllowed('https://fakeplannotator.ai'), false);
  });

  await t.step('rejects origins with different protocols', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    // HTTP vs HTTPS
    assertEquals(isOriginAllowed('http://plannotator.ai'), false); // Only https is allowed
    assertEquals(isOriginAllowed('https://localhost:3000'), false); // Only http is allowed for localhost
  });

  await t.step('rejects origins with different ports', () => {
    Deno.env.delete('ALLOWED_ORIGINS');

    assertEquals(isOriginAllowed('http://localhost:9999'), false);
    assertEquals(isOriginAllowed('http://localhost'), false);
  });
});
