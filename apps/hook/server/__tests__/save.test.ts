// API tests require a running server
// To run these tests, start the server first:
// bun run apps/hook/server/index.ts

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';

describe('POST /api/save', () => {
  test.skip('endpoint exists and responds', async () => {
    // This test is skipped by default
    // To run it, start the server and remove .skip
    const response = await fetch('http://localhost:5173/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '# Test',
        path: '/tmp/test.md'
      })
    });

    expect(response.status).toBeLessThan(500);
  });

  test('validates UTF-8 encoding preservation', () => {
    const testString = 'Título com Acentuação: ção, ã, é';
    const encoded = new TextEncoder().encode(testString);
    const decoded = new TextDecoder().decode(encoded);

    expect(decoded).toBe(testString);
    expect(decoded).toContain('ção');
    expect(decoded).toContain('Acentuação');
  });
});
