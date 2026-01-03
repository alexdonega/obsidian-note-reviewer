// k6 Load Testing Suite for Notes API
// Run: k6 run tests/load/notes-api.test.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const notesCreated = new Counter('notes_created');
const notesRead = new Counter('notes_read');
const cacheHitRate = new Rate('cache_hits');
const apiLatency = new Trend('api_latency');

// Test configuration
export const options = {
  stages: [
    // Ramp-up
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 },   // Stay at 50 users for 5 minutes

    // Spike test
    { duration: '1m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 200 },  // Hold spike for 3 minutes
    { duration: '1m', target: 50 },   // Drop back to 50

    // Stress test
    { duration: '2m', target: 300 },  // Push to 300 users
    { duration: '2m', target: 300 },  // Hold for 2 minutes

    // Ramp-down
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],

  thresholds: {
    // Performance SLAs
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'],                  // Error rate < 1%
    errors: ['rate<0.05'],                           // Custom error rate < 5%

    // Throughput requirements
    http_reqs: ['rate>100'],                         // >100 req/s

    // Cache performance
    cache_hits: ['rate>0.70'],                       // >70% cache hit rate
  },

  ext: {
    loadimpact: {
      distribution: {
        'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 50 },
        'amazon:ie:dublin': { loadZone: 'amazon:ie:dublin', percent: 30 },
        'amazon:jp:tokyo': { loadZone: 'amazon:jp:tokyo', percent: 20 },
      },
    },
  },
};

// Test setup
const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_TOKEN}`,
};

// Test data generators
function generateNote() {
  return {
    title: `Load Test Note ${Date.now()}-${Math.random()}`,
    content: `This is a load test note with some content. Generated at ${new Date().toISOString()}`,
    markdown: `# Load Test\n\nThis is **bold** and this is *italic*.`,
    tags: ['load-test', 'performance'],
  };
}

function randomNoteId(notes) {
  return notes[Math.floor(Math.random() * notes.length)];
}

// Main test scenario
export default function () {
  const notes = [];

  group('Create Note', () => {
    const payload = JSON.stringify(generateNote());
    const createStart = Date.now();

    const res = http.post(`${BASE_URL}/api/notes`, payload, { headers });

    apiLatency.add(Date.now() - createStart);

    const success = check(res, {
      'create status is 201': (r) => r.status === 201,
      'create response has id': (r) => JSON.parse(r.body).id !== undefined,
      'create response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (success) {
      notesCreated.add(1);
      const note = JSON.parse(res.body);
      notes.push(note.id);
    } else {
      errorRate.add(1);
      console.error(`Create failed: ${res.status} ${res.body}`);
    }
  });

  sleep(1);

  group('List Notes', () => {
    const listStart = Date.now();
    const res = http.get(`${BASE_URL}/api/notes`, { headers });

    apiLatency.add(Date.now() - listStart);

    const success = check(res, {
      'list status is 200': (r) => r.status === 200,
      'list returns array': (r) => Array.isArray(JSON.parse(r.body)),
      'list response time < 300ms': (r) => r.timings.duration < 300,
    });

    if (!success) {
      errorRate.add(1);
    }

    // Check for cache headers
    if (res.headers['X-Cache-Hit'] === 'true') {
      cacheHitRate.add(1);
    } else {
      cacheHitRate.add(0);
    }
  });

  sleep(0.5);

  if (notes.length > 0) {
    group('Get Note', () => {
      const noteId = randomNoteId(notes);
      const getStart = Date.now();

      const res = http.get(`${BASE_URL}/api/notes/${noteId}`, { headers });

      apiLatency.add(Date.now() - getStart);

      const success = check(res, {
        'get status is 200': (r) => r.status === 200,
        'get returns note': (r) => JSON.parse(r.body).id === noteId,
        'get response time < 200ms': (r) => r.timings.duration < 200,
      });

      if (success) {
        notesRead.add(1);
      } else {
        errorRate.add(1);
      }

      // Check cache performance
      if (res.headers['X-Cache-Hit'] === 'true') {
        cacheHitRate.add(1);
      } else {
        cacheHitRate.add(0);
      }
    });

    sleep(0.5);

    group('Update Note', () => {
      const noteId = randomNoteId(notes);
      const payload = JSON.stringify({
        title: `Updated Note ${Date.now()}`,
        content: 'Updated content',
      });

      const updateStart = Date.now();
      const res = http.put(`${BASE_URL}/api/notes/${noteId}`, payload, { headers });

      apiLatency.add(Date.now() - updateStart);

      const success = check(res, {
        'update status is 200': (r) => r.status === 200,
        'update response time < 400ms': (r) => r.timings.duration < 400,
      });

      if (!success) {
        errorRate.add(1);
      }
    });

    sleep(1);

    group('Search Notes', () => {
      const searchStart = Date.now();
      const res = http.get(`${BASE_URL}/api/notes/search?q=test`, { headers });

      apiLatency.add(Date.now() - searchStart);

      const success = check(res, {
        'search status is 200': (r) => r.status === 200,
        'search returns results': (r) => Array.isArray(JSON.parse(r.body)),
        'search response time < 800ms': (r) => r.timings.duration < 800,
      });

      if (!success) {
        errorRate.add(1);
      }
    });
  }

  sleep(2);
}

// Setup - runs once before test
export function setup() {
  console.log('🚀 Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Authenticated: ${API_TOKEN ? 'Yes' : 'No'}`);

  // Health check
  const res = http.get(`${BASE_URL}/health`);
  if (res.status !== 200) {
    throw new Error(`API health check failed: ${res.status}`);
  }

  return { startTime: Date.now() };
}

// Teardown - runs once after test
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`✅ Load test completed in ${duration.toFixed(2)}s`);
}

// Handle summary
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, opts) {
  const indent = opts.indent || '';
  const enableColors = opts.enableColors !== false;

  let summary = '\n';
  summary += `${indent}Load Test Summary\n`;
  summary += `${indent}${'-'.repeat(50)}\n`;

  // Requests
  const httpReqs = data.metrics.http_reqs;
  summary += `${indent}Total Requests: ${httpReqs.values.count}\n`;
  summary += `${indent}Request Rate: ${httpReqs.values.rate.toFixed(2)}/s\n`;

  // Response times
  const duration = data.metrics.http_req_duration;
  summary += `${indent}Avg Response Time: ${duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}P95 Response Time: ${duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}P99 Response Time: ${duration.values['p(99)'].toFixed(2)}ms\n`;

  // Errors
  const failedReqs = data.metrics.http_req_failed;
  const errorPct = (failedReqs.values.rate * 100).toFixed(2);
  summary += `${indent}Error Rate: ${errorPct}%\n`;

  // Custom metrics
  if (data.metrics.cache_hits) {
    const cacheHitPct = (data.metrics.cache_hits.values.rate * 100).toFixed(2);
    summary += `${indent}Cache Hit Rate: ${cacheHitPct}%\n`;
  }

  summary += `${indent}${'-'.repeat(50)}\n`;

  return summary;
}
