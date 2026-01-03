/**
 * CORS Utility Module Tests
 * Comprehensive tests for origin validation and CORS header handling
 */

import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import {
  getAllowedOrigins,
  isOriginAllowed,
  setCorsHeaders,
  handlePreflightRequest,
} from '../cors';

/**
 * Mock implementation of VercelResponse for testing
 */
function createMockResponse() {
  const headers: Record<string, string> = {};
  const mockRes = {
    headers,
    setHeader: mock((name: string, value: string) => {
      headers[name] = value;
      return mockRes;
    }),
    status: mock((code: number) => {
      (mockRes as any).statusCode = code;
      return mockRes;
    }),
    end: mock(() => mockRes),
    statusCode: 200,
  };
  return mockRes as any;
}

describe('getAllowedOrigins', () => {
  const originalEnv = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    // Restore original environment
    if (originalEnv === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = originalEnv;
    }
  });

  test('returns default origins when ALLOWED_ORIGINS is not set', () => {
    delete process.env.ALLOWED_ORIGINS;

    const origins = getAllowedOrigins();

    expect(origins).toContain('https://r.alexdonega.com.br');
    expect(origins).toContain('https://www.r.alexdonega.com.br');
    expect(origins).toContain('http://localhost:3000');
    expect(origins).toContain('http://localhost:5173');
  });

  test('parses comma-separated ALLOWED_ORIGINS environment variable', () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com,https://app.example.com';

    const origins = getAllowedOrigins();

    expect(origins).toEqual(['https://example.com', 'https://app.example.com']);
    expect(origins).not.toContain('https://r.alexdonega.com.br');
  });

  test('trims whitespace from origins in ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = '  https://example.com  ,  https://app.example.com  ';

    const origins = getAllowedOrigins();

    expect(origins).toEqual(['https://example.com', 'https://app.example.com']);
  });

  test('filters out empty values from ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com,,https://app.example.com,';

    const origins = getAllowedOrigins();

    expect(origins).toEqual(['https://example.com', 'https://app.example.com']);
    expect(origins.length).toBe(2);
  });

  test('handles single origin in ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = 'https://single.example.com';

    const origins = getAllowedOrigins();

    expect(origins).toEqual(['https://single.example.com']);
  });

  test('returns empty array when ALLOWED_ORIGINS is empty string', () => {
    process.env.ALLOWED_ORIGINS = '';

    const origins = getAllowedOrigins();

    expect(origins).toEqual([]);
  });

  test('returns empty array when ALLOWED_ORIGINS contains only commas', () => {
    process.env.ALLOWED_ORIGINS = ',,,';

    const origins = getAllowedOrigins();

    expect(origins).toEqual([]);
  });
});

describe('isOriginAllowed', () => {
  const originalEnv = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = originalEnv;
    }
  });

  describe('with production origins', () => {
    beforeEach(() => {
      delete process.env.ALLOWED_ORIGINS;
    });

    test('allows production domain', () => {
      expect(isOriginAllowed('https://r.alexdonega.com.br')).toBe(true);
    });

    test('allows www production domain', () => {
      expect(isOriginAllowed('https://www.r.alexdonega.com.br')).toBe(true);
    });
  });

  describe('with localhost variations', () => {
    beforeEach(() => {
      delete process.env.ALLOWED_ORIGINS;
    });

    test('allows localhost:3000', () => {
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
    });

    test('allows localhost:3001', () => {
      expect(isOriginAllowed('http://localhost:3001')).toBe(true);
    });

    test('allows localhost:3002', () => {
      expect(isOriginAllowed('http://localhost:3002')).toBe(true);
    });

    test('allows localhost:5173 (Vite default)', () => {
      expect(isOriginAllowed('http://localhost:5173')).toBe(true);
    });

    test('allows 127.0.0.1:3000', () => {
      expect(isOriginAllowed('http://127.0.0.1:3000')).toBe(true);
    });

    test('allows 127.0.0.1:5173', () => {
      expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
    });

    test('rejects localhost without port', () => {
      expect(isOriginAllowed('http://localhost')).toBe(false);
    });

    test('rejects localhost with unknown port', () => {
      expect(isOriginAllowed('http://localhost:8080')).toBe(false);
    });

    test('rejects https localhost (not in default list)', () => {
      expect(isOriginAllowed('https://localhost:3000')).toBe(false);
    });
  });

  describe('with invalid/malicious origins', () => {
    beforeEach(() => {
      delete process.env.ALLOWED_ORIGINS;
    });

    test('rejects null origin', () => {
      expect(isOriginAllowed(null)).toBe(false);
    });

    test('rejects undefined origin', () => {
      expect(isOriginAllowed(undefined)).toBe(false);
    });

    test('rejects empty string origin', () => {
      expect(isOriginAllowed('')).toBe(false);
    });

    test('rejects arbitrary malicious domain', () => {
      expect(isOriginAllowed('https://evil.attacker.com')).toBe(false);
    });

    test('rejects domain with similar prefix', () => {
      expect(isOriginAllowed('https://r.alexdonega.com.br.evil.com')).toBe(false);
    });

    test('rejects domain with similar suffix', () => {
      expect(isOriginAllowed('https://evil.r.alexdonega.com.br')).toBe(false);
    });

    test('rejects subdomain injection attempt', () => {
      expect(isOriginAllowed('https://malicious.r.alexdonega.com.br')).toBe(false);
    });

    test('rejects file:// protocol', () => {
      expect(isOriginAllowed('file://localhost')).toBe(false);
    });

    test('rejects data: URL', () => {
      expect(isOriginAllowed('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    test('rejects javascript: URL', () => {
      expect(isOriginAllowed('javascript:alert(1)')).toBe(false);
    });

    test('rejects origin with path', () => {
      expect(isOriginAllowed('https://r.alexdonega.com.br/path')).toBe(false);
    });

    test('rejects origin with query string', () => {
      expect(isOriginAllowed('https://r.alexdonega.com.br?query=value')).toBe(false);
    });

    test('rejects case variation attack', () => {
      expect(isOriginAllowed('https://R.ALEXDONEGA.COM.BR')).toBe(false);
    });

    test('rejects wildcard origin', () => {
      expect(isOriginAllowed('*')).toBe(false);
    });
  });

  describe('with custom environment configuration', () => {
    test('allows custom origin from environment', () => {
      process.env.ALLOWED_ORIGINS = 'https://custom.example.com';

      expect(isOriginAllowed('https://custom.example.com')).toBe(true);
    });

    test('rejects default origins when custom is set', () => {
      process.env.ALLOWED_ORIGINS = 'https://custom.example.com';

      expect(isOriginAllowed('https://r.alexdonega.com.br')).toBe(false);
      expect(isOriginAllowed('http://localhost:3000')).toBe(false);
    });

    test('allows multiple custom origins', () => {
      process.env.ALLOWED_ORIGINS = 'https://app.example.com,https://api.example.com';

      expect(isOriginAllowed('https://app.example.com')).toBe(true);
      expect(isOriginAllowed('https://api.example.com')).toBe(true);
      expect(isOriginAllowed('https://other.example.com')).toBe(false);
    });
  });
});

describe('setCorsHeaders', () => {
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

  describe('for allowed origins', () => {
    test('sets Access-Control-Allow-Origin to exact origin', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://r.alexdonega.com.br');

      expect(res.headers['Access-Control-Allow-Origin']).toBe('https://r.alexdonega.com.br');
    });

    test('sets Access-Control-Allow-Credentials to true', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://r.alexdonega.com.br');

      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    test('sets Vary header to Origin for proper caching', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://r.alexdonega.com.br');

      expect(res.headers['Vary']).toBe('Origin');
    });

    test('sets Access-Control-Allow-Methods header', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://r.alexdonega.com.br');

      expect(res.headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
    });

    test('sets Access-Control-Allow-Headers header', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://r.alexdonega.com.br');

      expect(res.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    });

    test('reflects the exact origin for localhost', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'http://localhost:3000');

      expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
      expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    test('returns response object for chaining', () => {
      const res = createMockResponse();

      const result = setCorsHeaders(res, 'https://r.alexdonega.com.br');

      expect(result).toBe(res);
    });
  });

  describe('for disallowed origins', () => {
    test('does not set Access-Control-Allow-Origin', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://evil.attacker.com');

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    test('does not set Access-Control-Allow-Credentials', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://evil.attacker.com');

      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    test('still sets Vary header', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://evil.attacker.com');

      expect(res.headers['Vary']).toBe('Origin');
    });

    test('still sets Allow-Methods header', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://evil.attacker.com');

      expect(res.headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
    });

    test('handles null origin', () => {
      const res = createMockResponse();

      setCorsHeaders(res, null);

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
      expect(res.headers['Vary']).toBe('Origin');
    });

    test('handles undefined origin', () => {
      const res = createMockResponse();

      setCorsHeaders(res, undefined);

      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });

  describe('security guarantees', () => {
    test('never sets wildcard origin', () => {
      const res = createMockResponse();

      setCorsHeaders(res, 'https://r.alexdonega.com.br');

      expect(res.headers['Access-Control-Allow-Origin']).not.toBe('*');
    });

    test('never combines wildcard with credentials', () => {
      const res = createMockResponse();

      setCorsHeaders(res, '*');

      // Even if someone passes '*' as origin, it should be rejected
      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    test('credentials only set for validated origins', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      setCorsHeaders(res1, 'https://r.alexdonega.com.br');
      setCorsHeaders(res2, 'https://unknown.com');

      expect(res1.headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(res2.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });
});

describe('handlePreflightRequest', () => {
  test('returns true and ends response for OPTIONS request', () => {
    const res = createMockResponse();

    const result = handlePreflightRequest('OPTIONS', res);

    expect(result).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  test('returns false for GET request', () => {
    const res = createMockResponse();

    const result = handlePreflightRequest('GET', res);

    expect(result).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  test('returns false for POST request', () => {
    const res = createMockResponse();

    const result = handlePreflightRequest('POST', res);

    expect(result).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns false for undefined method', () => {
    const res = createMockResponse();

    const result = handlePreflightRequest(undefined, res);

    expect(result).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('is case-sensitive (only uppercase OPTIONS)', () => {
    const res = createMockResponse();

    const result = handlePreflightRequest('options', res);

    expect(result).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('Integration: Full CORS flow', () => {
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

  test('complete flow for allowed origin preflight', () => {
    const res = createMockResponse();
    const origin = 'https://r.alexdonega.com.br';

    setCorsHeaders(res, origin);
    const isPreflightHandled = handlePreflightRequest('OPTIONS', res);

    expect(isPreflightHandled).toBe(true);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(res.headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
    expect(res.headers['Vary']).toBe('Origin');
  });

  test('complete flow for allowed origin actual request', () => {
    const res = createMockResponse();
    const origin = 'http://localhost:3000';

    setCorsHeaders(res, origin);
    const isPreflightHandled = handlePreflightRequest('GET', res);

    expect(isPreflightHandled).toBe(false);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(res.headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  test('complete flow for disallowed origin', () => {
    const res = createMockResponse();
    const origin = 'https://malicious.com';

    setCorsHeaders(res, origin);

    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
    expect(res.headers['Vary']).toBe('Origin');
  });

  test('complete flow with custom environment origins', () => {
    process.env.ALLOWED_ORIGINS = 'https://staging.example.com,https://prod.example.com';
    const res = createMockResponse();

    // Test allowed staging origin
    setCorsHeaders(res, 'https://staging.example.com');
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://staging.example.com');

    // Test disallowed localhost (not in custom list)
    const res2 = createMockResponse();
    setCorsHeaders(res2, 'http://localhost:3000');
    expect(res2.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
});
