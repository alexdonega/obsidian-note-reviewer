// k6 Advanced Load Testing Scenarios
// Run: k6 run tests/load/advanced-scenarios.test.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const apiLatency = new Trend('api_latency');
const dbLatency = new Trend('db_latency');
const cacheHitRate = new Rate('cache_hits');
const concurrentUsers = new Gauge('concurrent_users');
const throughput = new Counter('requests_per_second');

// Test scenarios
export const options = {
  scenarios: {
    // Scenario 1: Constant load baseline
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      tags: { scenario: 'baseline' },
    },

    // Scenario 2: Ramping load (gradual increase)
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'ramp' },
      startTime: '5m',
    },

    // Scenario 3: Spike test (sudden traffic surge)
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 500 },
        { duration: '1m', target: 500 },
        { duration: '10s', target: 0 },
      ],
      tags: { scenario: 'spike' },
      startTime: '16m',
    },

    // Scenario 4: Soak test (sustained load)
    soak_test: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30m',
      tags: { scenario: 'soak' },
      startTime: '18m',
    },

    // Scenario 5: Breakpoint test (find max capacity)
    breakpoint_test: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1000,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 800 },
        { duration: '2m', target: 1200 },
      ],
      tags: { scenario: 'breakpoint' },
      startTime: '48m',
    },
  },

  thresholds: {
    // Performance requirements
    'http_req_duration{scenario:baseline}': ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{scenario:ramp}': ['p(95)<800', 'p(99)<1500'],
    'http_req_duration{scenario:spike}': ['p(95)<2000', 'p(99)<5000'],
    'http_req_duration{scenario:soak}': ['p(95)<600', 'p(99)<1200'],

    // Error rates
    'errors{scenario:baseline}': ['rate<0.01'],
    'errors{scenario:ramp}': ['rate<0.02'],
    'errors{scenario:spike}': ['rate<0.10'],
    'errors{scenario:soak}': ['rate<0.01'],

    // Success rates
    'success{scenario:baseline}': ['rate>0.99'],
    'success{scenario:ramp}': ['rate>0.98'],
    'success{scenario:soak}': ['rate>0.99'],

    // Cache performance
    cache_hits: ['rate>0.70'],

    // API latency
    api_latency: ['p(95)<500', 'p(99)<1000'],

    // Database latency
    db_latency: ['p(95)<200', 'p(99)<500'],
  },

  // Resource limits
  noConnectionReuse: false,
  userAgent: 'K6LoadTest/1.0',
  insecureSkipTLSVerify: true,
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_TOKEN}`,
};

// Weighted scenario distribution
const SCENARIO_WEIGHTS = {
  read: 60,    // 60% read operations
  write: 25,   // 25% write operations
  heavy: 10,   // 10% heavy operations
  realtime: 5, // 5% real-time operations
};

export default function () {
  const scenario = selectScenario();
  concurrentUsers.add(1);

  switch (scenario) {
    case 'read':
      readScenario();
      break;
    case 'write':
      writeScenario();
      break;
    case 'heavy':
      heavyScenario();
      break;
    case 'realtime':
      realtimeScenario();
      break;
  }

  throughput.add(1);
  sleep(randomIntBetween(1, 3));
}

// Read-heavy scenario (list, get, search)
function readScenario() {
  group('Read Operations', () => {
    // List notes
    group('List Notes', () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/api/notes?limit=50`, { headers });
      apiLatency.add(Date.now() - start);

      const success = check(res, {
        'list status 200': (r) => r.status === 200,
        'list has data': (r) => JSON.parse(r.body).length > 0,
        'list cached': (r) => r.headers['X-Cache-Hit'] === 'true',
      });

      if (res.headers['X-Cache-Hit'] === 'true') {
        cacheHitRate.add(1);
      } else {
        cacheHitRate.add(0);
        dbLatency.add(Date.now() - start);
      }

      updateMetrics(success);
    });

    sleep(0.5);

    // Get single note
    group('Get Note', () => {
      const noteId = 'test-note-id'; // Would come from list
      const start = Date.now();
      const res = http.get(`${BASE_URL}/api/notes/${noteId}`, { headers });
      apiLatency.add(Date.now() - start);

      const success = check(res, {
        'get status 200': (r) => r.status === 200 || r.status === 404,
        'get response time ok': (r) => r.timings.duration < 200,
      });

      updateMetrics(success);
    });

    sleep(0.5);

    // Search notes
    group('Search Notes', () => {
      const query = randomString(5);
      const start = Date.now();
      const res = http.get(`${BASE_URL}/api/notes/search?q=${query}`, { headers });
      apiLatency.add(Date.now() - start);

      const success = check(res, {
        'search status 200': (r) => r.status === 200,
        'search response time ok': (r) => r.timings.duration < 800,
      });

      updateMetrics(success);
    });
  });
}

// Write-heavy scenario (create, update, delete)
function writeScenario() {
  group('Write Operations', () => {
    let noteId;

    // Create note
    group('Create Note', () => {
      const payload = JSON.stringify({
        title: `Load Test Note ${Date.now()}-${randomString(5)}`,
        content: generateContent(randomIntBetween(100, 500)),
        markdown: '# Test\n\nLoad test content',
        tags: ['load-test', 'performance'],
      });

      const start = Date.now();
      const res = http.post(`${BASE_URL}/api/notes`, payload, { headers });
      apiLatency.add(Date.now() - start);
      dbLatency.add(Date.now() - start);

      const success = check(res, {
        'create status 201': (r) => r.status === 201,
        'create has id': (r) => JSON.parse(r.body).id !== undefined,
      });

      if (success) {
        noteId = JSON.parse(res.body).id;
      }

      updateMetrics(success);
    });

    sleep(1);

    // Update note
    if (noteId) {
      group('Update Note', () => {
        const payload = JSON.stringify({
          title: `Updated ${Date.now()}`,
          content: generateContent(randomIntBetween(100, 300)),
        });

        const start = Date.now();
        const res = http.put(`${BASE_URL}/api/notes/${noteId}`, payload, { headers });
        apiLatency.add(Date.now() - start);
        dbLatency.add(Date.now() - start);

        const success = check(res, {
          'update status 200': (r) => r.status === 200,
        });

        updateMetrics(success);
      });

      sleep(0.5);

      // Delete note
      group('Delete Note', () => {
        const start = Date.now();
        const res = http.del(`${BASE_URL}/api/notes/${noteId}`, { headers });
        apiLatency.add(Date.now() - start);
        dbLatency.add(Date.now() - start);

        const success = check(res, {
          'delete status 204': (r) => r.status === 204 || r.status === 200,
        });

        updateMetrics(success);
      });
    }
  });
}

// Heavy operations (batch, export, complex queries)
function heavyScenario() {
  group('Heavy Operations', () => {
    // Batch operation
    group('Batch Update', () => {
      const noteIds = Array.from({ length: 10 }, (_, i) => `note-${i}`);
      const payload = JSON.stringify({
        noteIds,
        operation: 'update',
        data: { tags: ['batch-updated'] },
      });

      const start = Date.now();
      const res = http.post(`${BASE_URL}/api/notes/batch`, payload, { headers });
      apiLatency.add(Date.now() - start);
      dbLatency.add(Date.now() - start);

      const success = check(res, {
        'batch status 200': (r) => r.status === 200,
        'batch response time ok': (r) => r.timings.duration < 5000,
      });

      updateMetrics(success);
    });

    sleep(2);

    // Export operation
    group('Export Notes', () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/api/notes/export?format=json`, { headers });
      apiLatency.add(Date.now() - start);

      const success = check(res, {
        'export status 200': (r) => r.status === 200,
        'export has content': (r) => r.body.length > 0,
      });

      updateMetrics(success);
    });
  });
}

// Real-time operations (presence, collaborative editing)
function realtimeScenario() {
  group('Real-time Operations', () => {
    // WebSocket connection would go here
    // For HTTP testing, we simulate with polling

    group('Presence Update', () => {
      const payload = JSON.stringify({
        userId: `user-${randomString(8)}`,
        cursor: { x: randomIntBetween(0, 1920), y: randomIntBetween(0, 1080) },
      });

      const start = Date.now();
      const res = http.post(`${BASE_URL}/api/presence`, payload, { headers });
      apiLatency.add(Date.now() - start);

      const success = check(res, {
        'presence status 200': (r) => r.status === 200,
        'presence low latency': (r) => r.timings.duration < 100,
      });

      updateMetrics(success);
    });
  });
}

// Helper functions
function selectScenario() {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const [scenario, weight] of Object.entries(SCENARIO_WEIGHTS)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return scenario;
    }
  }

  return 'read';
}

function generateContent(words) {
  const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';
  const loremWords = lorem.split(' ');

  return Array.from({ length: words }, (_, i) =>
    loremWords[i % loremWords.length]
  ).join(' ');
}

function updateMetrics(success) {
  if (success) {
    successRate.add(1);
    errorRate.add(0);
  } else {
    successRate.add(0);
    errorRate.add(1);
  }
}

// Setup
export function setup() {
  console.log('🚀 Starting advanced load tests');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Scenarios: ${Object.keys(options.scenarios).join(', ')}`);

  return { startTime: Date.now() };
}

// Teardown
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000 / 60;
  console.log(`✅ Load tests completed in ${duration.toFixed(2)} minutes`);
}

// Handle summary
export function handleSummary(data) {
  return {
    'stdout': generateTextSummary(data),
    'load-test-advanced-results.json': JSON.stringify(data, null, 2),
    'load-test-advanced-results.html': generateHtmlSummary(data),
  };
}

function generateTextSummary(data) {
  const scenarios = Object.keys(options.scenarios);
  let summary = '\n';
  summary += '='.repeat(60) + '\n';
  summary += '  ADVANCED LOAD TEST RESULTS\n';
  summary += '='.repeat(60) + '\n\n';

  // Overall stats
  const httpReqs = data.metrics.http_reqs;
  summary += `Total Requests: ${httpReqs.values.count}\n`;
  summary += `Request Rate: ${httpReqs.values.rate.toFixed(2)}/s\n`;
  summary += `Duration: ${(data.state.testRunDurationMs / 1000 / 60).toFixed(2)} minutes\n\n`;

  // Response times by scenario
  summary += 'Response Times by Scenario:\n';
  summary += '-'.repeat(60) + '\n';

  scenarios.forEach(scenario => {
    const metric = data.metrics[`http_req_duration{scenario:${scenario}}`];
    if (metric) {
      summary += `  ${scenario.padEnd(20)} P95: ${metric.values['p(95)'].toFixed(2)}ms  P99: ${metric.values['p(99)'].toFixed(2)}ms\n`;
    }
  });

  summary += '\n';

  // Error rates
  const errorPct = (data.metrics.errors.values.rate * 100).toFixed(2);
  const successPct = (data.metrics.success.values.rate * 100).toFixed(2);

  summary += `Success Rate: ${successPct}%\n`;
  summary += `Error Rate: ${errorPct}%\n\n`;

  // Cache performance
  if (data.metrics.cache_hits) {
    const cacheHitPct = (data.metrics.cache_hits.values.rate * 100).toFixed(2);
    summary += `Cache Hit Rate: ${cacheHitPct}%\n`;
  }

  summary += '='.repeat(60) + '\n';

  return summary;
}

function generateHtmlSummary(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Load Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #4CAF50; color: white; }
    tr:hover { background-color: #f5f5f5; }
    .metric { display: inline-block; margin: 10px 20px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
    .metric-label { color: #666; }
  </style>
</head>
<body>
  <h1>Advanced Load Test Results</h1>
  <div>
    <div class="metric">
      <div class="metric-value">${data.metrics.http_reqs.values.count}</div>
      <div class="metric-label">Total Requests</div>
    </div>
    <div class="metric">
      <div class="metric-value">${data.metrics.http_reqs.values.rate.toFixed(2)}/s</div>
      <div class="metric-label">Request Rate</div>
    </div>
    <div class="metric">
      <div class="metric-value">${(data.metrics.success.values.rate * 100).toFixed(2)}%</div>
      <div class="metric-label">Success Rate</div>
    </div>
  </div>
  <h2>Performance Metrics</h2>
  <pre>${JSON.stringify(data.metrics, null, 2)}</pre>
</body>
</html>
  `;
}
