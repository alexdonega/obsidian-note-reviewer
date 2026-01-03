/**
 * Notes API Integration Tests
 * Verifies CORS handling and API functionality for various origin scenarios
 */

import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import handler from '../notes';

/**
 * Mock implementation of VercelRequest for testing
 */
function createMockRequest(options: {
  method?: string;
  origin?: string | null;
  query?: Record<string, string | string[]>;
  body?: Record<string, any>;
}) {
  return {
    method: options.method || 'GET',
    headers: {
      origin: options.origin === null ? undefined : options.origin,
    },
    query: options.query || {},
    body: options.body || {},
  } as any;
}

/**
 * Mock implementation of VercelResponse for testing
 */
function createMockResponse() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let jsonBody: any = null;
  let ended = false;

  const mockRes = {
    headers,
    setHeader: mock((name: string, value: string) => {
      headers[name] = value;
      return mockRes;
    }),
    status: mock((code: number) => {
      statusCode = code;
      (mockRes as any).statusCode = code;
      return mockRes;
    }),
    json: mock((data: any) => {
      jsonBody = data;
      return mockRes;
    }),
    end: mock(() => {
      ended = true;
      return mockRes;
    }),
    statusCode,
    getStatusCode: () => statusCode,
    getJsonBody: () => jsonBody,
    isEnded: () => ended,
  };

  return mockRes as any;
}

describe('Notes API CORS Integration', () => {
  const originalEnv = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = originalEnv;
    }
  });

  beforeEach(() => {
    delete process.env.ALLOWED_ORIGINS;
  });

  describe('CORS headers for allowed origins', () => {
    test('sets proper CORS headers for production domain', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://r.alexdonega.com.br',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('https://r.alexdonega.com.br');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(res.headers['Vary']).toBe('Origin');
    });

    test('sets proper CORS headers for www production domain', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://www.r.alexdonega.com.br',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('https://www.r.alexdonega.com.br');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    test('sets proper CORS headers for localhost:3000', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'http://localhost:3000',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    test('sets proper CORS headers for localhost:5173 (Vite)', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'http://localhost:5173',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    test('sets proper CORS headers for 127.0.0.1:3000', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'http://127.0.0.1:3000',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('http://127.0.0.1:3000');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    });
  });

  describe('CORS headers for disallowed origins', () => {
    test('does not set Allow-Origin for malicious domain', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://evil.attacker.com',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    test('does not set Allow-Origin for domain with similar prefix', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://r.alexdonega.com.br.evil.com',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    test('does not set Allow-Origin for subdomain injection attempt', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://malicious.r.alexdonega.com.br',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    test('handles null origin header', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: null,
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    test('handles missing origin header', () => {
      const req = createMockRequest({
        method: 'GET',
        query: { slug: 'test' },
      });
      // Remove origin header entirely
      delete req.headers.origin;
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    test('never sets credentials for disallowed origins', () => {
      const maliciousOrigins = [
        'https://evil.com',
        'https://phishing-site.com',
        'https://fake-alexdonega.com.br',
        'http://localhost:8080', // Not in allowed localhost ports
        'https://localhost:3000', // HTTPS localhost not allowed
      ];

      for (const origin of maliciousOrigins) {
        const req = createMockRequest({
          method: 'GET',
          origin,
          query: { slug: 'test' },
        });
        const res = createMockResponse();

        handler(req, res);

        expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
      }
    });
  });

  describe('Vary header', () => {
    test('includes Origin in Vary header for allowed origins', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://r.alexdonega.com.br',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Vary']).toBe('Origin');
    });

    test('includes Origin in Vary header for disallowed origins', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://evil.com',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Vary']).toBe('Origin');
    });

    test('includes Origin in Vary header when no origin provided', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: null,
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Vary']).toBe('Origin');
    });
  });

  describe('Preflight OPTIONS requests', () => {
    test('handles OPTIONS preflight request correctly', () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        origin: 'https://r.alexdonega.com.br',
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
      expect(res.headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
      expect(res.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    });

    test('sets CORS headers before handling preflight', () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        origin: 'https://r.alexdonega.com.br',
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('https://r.alexdonega.com.br');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    test('does not set credentials for disallowed origin preflight', () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        origin: 'https://evil.com',
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });

  describe('Security guarantees', () => {
    test('never sets wildcard Access-Control-Allow-Origin', () => {
      const origins = [
        'https://r.alexdonega.com.br',
        'http://localhost:3000',
        'https://evil.com',
        null,
        undefined,
      ];

      for (const origin of origins) {
        const req = createMockRequest({
          method: 'GET',
          origin: origin as any,
          query: { slug: 'test' },
        });
        const res = createMockResponse();

        handler(req, res);

        expect(res.headers['Access-Control-Allow-Origin']).not.toBe('*');
      }
    });

    test('never combines wildcard with credentials', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: '*',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      // If origin is '*', it should be rejected as invalid
      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });
});

describe('Notes API Functionality', () => {
  describe('GET /api/notes', () => {
    test('returns 404 for non-existent note', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://r.alexdonega.com.br',
        query: { slug: 'non-existent-slug' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
    });

    test('returns 405 for GET without slug', () => {
      const req = createMockRequest({
        method: 'GET',
        origin: 'https://r.alexdonega.com.br',
        query: {},
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
    });
  });

  describe('POST /api/notes', () => {
    test('returns 400 for missing required fields', () => {
      const req = createMockRequest({
        method: 'POST',
        origin: 'https://r.alexdonega.com.br',
        body: { title: 'Test' }, // Missing slug and content
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields: slug, title, content'
      });
    });

    test('creates note successfully with valid data', () => {
      const noteSlug = `test-note-${Date.now()}`;
      const req = createMockRequest({
        method: 'POST',
        origin: 'https://r.alexdonega.com.br',
        body: {
          slug: noteSlug,
          title: 'Test Note',
          content: 'Test content',
        },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        slug: noteSlug,
        url: `https://r.alexdonega.com.br/${noteSlug}`,
      });
    });

    test('allows POST from allowed origin with proper CORS', () => {
      const req = createMockRequest({
        method: 'POST',
        origin: 'http://localhost:3000',
        body: {
          slug: 'post-test-slug',
          title: 'Post Test',
          content: 'Post test content',
        },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('does not set credentials for POST from disallowed origin', () => {
      const req = createMockRequest({
        method: 'POST',
        origin: 'https://evil.com',
        body: {
          slug: 'evil-slug',
          title: 'Evil Note',
          content: 'Evil content',
        },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });

  describe('Method handling', () => {
    test('returns 405 for PUT method', () => {
      const req = createMockRequest({
        method: 'PUT',
        origin: 'https://r.alexdonega.com.br',
        body: { slug: 'test', title: 'Test', content: 'Test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    test('returns 405 for DELETE method', () => {
      const req = createMockRequest({
        method: 'DELETE',
        origin: 'https://r.alexdonega.com.br',
        query: { slug: 'test' },
      });
      const res = createMockResponse();

      handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
    });
  });
});

describe('Notes API with Environment Configuration', () => {
  const originalEnv = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = originalEnv;
    }
  });

  test('respects custom ALLOWED_ORIGINS environment variable', () => {
    process.env.ALLOWED_ORIGINS = 'https://custom.example.com,https://app.example.com';

    const req = createMockRequest({
      method: 'GET',
      origin: 'https://custom.example.com',
      query: { slug: 'test' },
    });
    const res = createMockResponse();

    handler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://custom.example.com');
    expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  test('rejects default origins when custom ALLOWED_ORIGINS is set', () => {
    process.env.ALLOWED_ORIGINS = 'https://custom.example.com';

    const req = createMockRequest({
      method: 'GET',
      origin: 'https://r.alexdonega.com.br', // Default origin
      query: { slug: 'test' },
    });
    const res = createMockResponse();

    handler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
  });

  test('rejects localhost when custom ALLOWED_ORIGINS is set', () => {
    process.env.ALLOWED_ORIGINS = 'https://custom.example.com';

    const req = createMockRequest({
      method: 'GET',
      origin: 'http://localhost:3000', // Default localhost origin
      query: { slug: 'test' },
    });
    const res = createMockResponse();

    handler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
  });
});

describe('Full CORS Request Flow', () => {
  const originalEnv = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = originalEnv;
    }
  });

  beforeEach(() => {
    delete process.env.ALLOWED_ORIGINS;
  });

  test('complete flow: preflight then actual request from allowed origin', () => {
    const origin = 'https://r.alexdonega.com.br';

    // 1. Preflight OPTIONS request
    const preflightReq = createMockRequest({
      method: 'OPTIONS',
      origin,
    });
    const preflightRes = createMockResponse();

    handler(preflightReq, preflightRes);

    expect(preflightRes.status).toHaveBeenCalledWith(200);
    expect(preflightRes.end).toHaveBeenCalled();
    expect(preflightRes.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(preflightRes.headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(preflightRes.headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
    expect(preflightRes.headers['Vary']).toBe('Origin');

    // 2. Actual POST request
    const postSlug = `flow-test-${Date.now()}`;
    const postReq = createMockRequest({
      method: 'POST',
      origin,
      body: {
        slug: postSlug,
        title: 'Flow Test Note',
        content: 'Flow test content',
      },
    });
    const postRes = createMockResponse();

    handler(postReq, postRes);

    expect(postRes.status).toHaveBeenCalledWith(201);
    expect(postRes.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(postRes.headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(postRes.headers['Vary']).toBe('Origin');

    // 3. GET request to retrieve the note
    const getReq = createMockRequest({
      method: 'GET',
      origin,
      query: { slug: postSlug },
    });
    const getRes = createMockResponse();

    handler(getReq, getRes);

    expect(getRes.status).toHaveBeenCalledWith(200);
    expect(getRes.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(getRes.headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  test('complete flow: preflight then blocked request from malicious origin', () => {
    const origin = 'https://malicious-site.com';

    // 1. Preflight OPTIONS request
    const preflightReq = createMockRequest({
      method: 'OPTIONS',
      origin,
    });
    const preflightRes = createMockResponse();

    handler(preflightReq, preflightRes);

    // Preflight still responds 200 but without credentials
    expect(preflightRes.status).toHaveBeenCalledWith(200);
    expect(preflightRes.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(preflightRes.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    expect(preflightRes.headers['Vary']).toBe('Origin');

    // 2. Actual POST request - would be blocked by browser CORS check
    // but server still processes it without credentials
    const postReq = createMockRequest({
      method: 'POST',
      origin,
      body: {
        slug: 'malicious-slug',
        title: 'Malicious Note',
        content: 'Malicious content',
      },
    });
    const postRes = createMockResponse();

    handler(postReq, postRes);

    // Server processes the request but doesn't allow credentials
    expect(postRes.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(postRes.headers['Access-Control-Allow-Credentials']).toBeUndefined();
  });

  test('localhost development flow works correctly', () => {
    const origin = 'http://localhost:3000';

    // 1. Preflight
    const preflightReq = createMockRequest({
      method: 'OPTIONS',
      origin,
    });
    const preflightRes = createMockResponse();

    handler(preflightReq, preflightRes);

    expect(preflightRes.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(preflightRes.headers['Access-Control-Allow-Credentials']).toBe('true');

    // 2. POST a note
    const postSlug = `localhost-test-${Date.now()}`;
    const postReq = createMockRequest({
      method: 'POST',
      origin,
      body: {
        slug: postSlug,
        title: 'Localhost Test',
        content: 'Localhost content',
      },
    });
    const postRes = createMockResponse();

    handler(postReq, postRes);

    expect(postRes.status).toHaveBeenCalledWith(201);
    expect(postRes.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(postRes.headers['Access-Control-Allow-Credentials']).toBe('true');
  });
});
