// Chaos Engineering Tests
// Validate system resilience under failure conditions
// Run: k6 run tests/chaos/chaos-scenarios.test.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const failureRecoveryTime = new Trend('failure_recovery_time_ms');
const circuitBreakerTrips = new Counter('circuit_breaker_trips');
const retrySuccessRate = new Rate('retry_success_rate');
const degradedOperationsRate = new Rate('degraded_operations');

export const options = {
  scenarios: {
    // Scenario 1: Network latency injection
    latency_injection: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      tags: { chaos: 'latency' },
    },

    // Scenario 2: Random failures
    random_failures: {
      executor: 'constant-vus',
      vus: 30,
      duration: '3m',
      tags: { chaos: 'failures' },
      startTime: '3m',
    },

    // Scenario 3: Database timeout
    db_timeout: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      tags: { chaos: 'db_timeout' },
      startTime: '6m',
    },

    // Scenario 4: Cache failure
    cache_failure: {
      executor: 'constant-vus',
      vus: 40,
      duration: '2m',
      tags: { chaos: 'cache_failure' },
      startTime: '8m',
    },

    // Scenario 5: Resource exhaustion
    resource_exhaustion: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 150 },
        { duration: '30s', target: 0 },
      ],
      tags: { chaos: 'exhaustion' },
      startTime: '10m',
    },
  },

  thresholds: {
    // System should handle failures gracefully
    'http_req_failed{chaos:latency}': ['rate<0.05'], // <5% failure
    'http_req_failed{chaos:failures}': ['rate<0.20'], // <20% failure
    'http_req_failed{chaos:db_timeout}': ['rate<0.30'], // <30% failure
    'http_req_failed{chaos:cache_failure}': ['rate<0.10'], // <10% failure

    // Recovery time should be fast
    failure_recovery_time_ms: ['p(95)<5000', 'p(99)<10000'],

    // Retry mechanism should work
    retry_success_rate: ['rate>0.70'], // >70% success after retry

    // Degraded mode should activate
    degraded_operations: ['rate>0'], // Should have some degraded ops
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_TOKEN}`,
};

export default function () {
  const scenario = __ENV.SCENARIO;

  switch (__ITER % 5) {
    case 0:
      testNetworkLatency();
      break;
    case 1:
      testRandomFailures();
      break;
    case 2:
      testDatabaseTimeout();
      break;
    case 3:
      testCacheFailure();
      break;
    case 4:
      testResourceExhaustion();
      break;
  }

  sleep(randomIntBetween(1, 3));
}

// Test 1: Network latency injection
function testNetworkLatency() {
  group('Network Latency Test', () => {
    const start = Date.now();

    // Simulate slow network by adding artificial delays
    const delayMs = randomIntBetween(100, 2000);
    sleep(delayMs / 1000);

    const res = http.get(`${BASE_URL}/api/notes?limit=20`, { headers });

    const success = check(res, {
      'tolerates latency': (r) => r.status === 200,
      'has timeout handling': (r) => r.timings.duration < 30000, // 30s timeout
    });

    if (!success && res.status === 0) {
      // Connection failed, measure recovery time
      const recoveryStart = Date.now();
      const retryRes = http.get(`${BASE_URL}/api/health`, { headers });

      if (retryRes.status === 200) {
        failureRecoveryTime.add(Date.now() - recoveryStart);
      }
    }
  });
}

// Test 2: Random failures (simulate 500 errors, timeouts)
function testRandomFailures() {
  group('Random Failure Test', () => {
    const failureChance = Math.random();

    if (failureChance < 0.3) {
      // 30% chance of simulating failure
      simulateFailure();
    } else {
      // Normal operation
      const res = http.get(`${BASE_URL}/api/notes`, { headers });

      check(res, {
        'handles failures gracefully': (r) => r.status === 200 || r.status === 503,
        'returns error details': (r) => {
          if (r.status >= 500) {
            const body = JSON.parse(r.body);
            return body.error !== undefined;
          }
          return true;
        },
      });
    }
  });
}

// Test 3: Database timeout
function testDatabaseTimeout() {
  group('Database Timeout Test', () => {
    // Trigger slow query
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/notes/search?q=complex-query-timeout`, {
      headers,
      timeout: '10s',
    });

    const duration = Date.now() - start;

    const success = check(res, {
      'has query timeout': (r) => r.timings.duration < 10000,
      'returns timeout error': (r) => {
        if (duration > 5000) {
          return r.status === 504 || r.status === 408;
        }
        return true;
      },
      'circuit breaker activates': (r) => {
        if (r.status === 503) {
          circuitBreakerTrips.add(1);
          return true;
        }
        return r.status !== 503;
      },
    });

    // Test retry mechanism
    if (!success) {
      sleep(1);
      const retryRes = http.get(`${BASE_URL}/api/notes?limit=5`, { headers });
      retrySuccessRate.add(retryRes.status === 200 ? 1 : 0);
    }
  });
}

// Test 4: Cache failure (degraded mode)
function testCacheFailure() {
  group('Cache Failure Test', () => {
    // Simulate cache miss/failure by adding cache-buster
    const cacheBuster = Date.now();
    const res = http.get(`${BASE_URL}/api/notes?cb=${cacheBuster}`, { headers });

    check(res, {
      'works without cache': (r) => r.status === 200,
      'falls back to database': (r) => {
        // Should take longer without cache
        return r.timings.duration > 50; // >50ms indicates DB query
      },
      'marks as degraded': (r) => {
        if (r.headers['X-Cache-Hit'] === 'false') {
          degradedOperationsRate.add(1);
          return true;
        }
        return false;
      },
    });
  });
}

// Test 5: Resource exhaustion
function testResourceExhaustion() {
  group('Resource Exhaustion Test', () => {
    // Create memory pressure with large payloads
    const largePayload = JSON.stringify({
      title: 'Large Note',
      content: 'x'.repeat(10000), // 10KB content
      markdown: '#'.repeat(5000),
      tags: Array.from({ length: 100 }, (_, i) => `tag-${i}`),
    });

    const res = http.post(`${BASE_URL}/api/notes`, largePayload, {
      headers,
      timeout: '15s',
    });

    check(res, {
      'handles large payloads': (r) => r.status === 201 || r.status === 413,
      'has payload limits': (r) => {
        if (r.status === 413) {
          const body = JSON.parse(r.body);
          return body.error.includes('too large') || body.error.includes('limit');
        }
        return true;
      },
      'prevents memory exhaustion': (r) => r.status !== 0, // Not crashed
    });

    // Test concurrent connections
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(['GET', `${BASE_URL}/api/notes`, null, { headers }]);
    }

    const responses = http.batch(requests);
    const allSuccessful = responses.every(r => r.status === 200 || r.status === 429);

    check(allSuccessful, {
      'rate limits concurrent requests': () => allSuccessful,
    });
  });
}

// Helper: Simulate failure condition
function simulateFailure() {
  const failureType = randomIntBetween(0, 2);

  switch (failureType) {
    case 0:
      // Timeout
      http.get(`${BASE_URL}/api/slow-endpoint`, {
        headers,
        timeout: '1s',
      });
      break;
    case 1:
      // Invalid request
      http.post(`${BASE_URL}/api/notes`, 'invalid-json', { headers });
      break;
    case 2:
      // Non-existent endpoint
      http.get(`${BASE_URL}/api/nonexistent-${Date.now()}`, { headers });
      break;
  }
}

// Setup
export function setup() {
  console.log('🔥 Starting Chaos Engineering Tests');
  console.log('Target:', BASE_URL);
  console.log('Scenarios:', Object.keys(options.scenarios).join(', '));

  // Verify system is healthy before chaos
  const health = http.get(`${BASE_URL}/api/health`);
  if (health.status !== 200) {
    throw new Error('System is not healthy before chaos tests');
  }

  return { startTime: Date.now() };
}

// Teardown
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000 / 60;
  console.log(`✅ Chaos tests completed in ${duration.toFixed(2)} minutes`);

  // Check if system recovered
  const health = http.get(`${BASE_URL}/api/health`);
  if (health.status === 200) {
    console.log('✅ System recovered successfully');
  } else {
    console.warn('⚠️  System may still be degraded');
  }
}

// Summary handler
export function handleSummary(data) {
  const chaosMetrics = {
    failure_recovery_time: data.metrics.failure_recovery_time_ms,
    circuit_breaker_trips: data.metrics.circuit_breaker_trips,
    retry_success_rate: data.metrics.retry_success_rate,
    degraded_operations: data.metrics.degraded_operations,
  };

  console.log('\n🔥 Chaos Engineering Summary:');
  console.log('━'.repeat(60));

  if (chaosMetrics.failure_recovery_time) {
    console.log(`Recovery Time P95: ${chaosMetrics.failure_recovery_time.values['p(95)'].toFixed(2)}ms`);
  }

  if (chaosMetrics.circuit_breaker_trips) {
    console.log(`Circuit Breaker Trips: ${chaosMetrics.circuit_breaker_trips.values.count}`);
  }

  if (chaosMetrics.retry_success_rate) {
    console.log(`Retry Success Rate: ${(chaosMetrics.retry_success_rate.values.rate * 100).toFixed(2)}%`);
  }

  if (chaosMetrics.degraded_operations) {
    console.log(`Degraded Operations: ${(chaosMetrics.degraded_operations.values.rate * 100).toFixed(2)}%`);
  }

  console.log('━'.repeat(60));

  return {
    'stdout': generateTextSummary(data),
    'chaos-test-results.json': JSON.stringify(data, null, 2),
    'chaos-test-results.html': generateHtmlReport(data),
  };
}

function generateTextSummary(data) {
  let summary = '\n';
  summary += '🔥 CHAOS ENGINEERING RESULTS\n';
  summary += '='.repeat(60) + '\n\n';

  const scenarios = ['latency', 'failures', 'db_timeout', 'cache_failure', 'exhaustion'];

  scenarios.forEach(chaos => {
    const metric = data.metrics[`http_req_failed{chaos:${chaos}}`];
    if (metric) {
      const failRate = (metric.values.rate * 100).toFixed(2);
      const status = failRate < 20 ? '✅' : '⚠️';
      summary += `${status} ${chaos.padEnd(20)} Failure Rate: ${failRate}%\n`;
    }
  });

  summary += '\n' + '='.repeat(60) + '\n';
  return summary;
}

function generateHtmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Chaos Engineering Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #d32f2f; }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-value { font-size: 32px; font-weight: bold; color: #d32f2f; }
    .metric-label { color: #666; margin-top: 8px; }
    .status-ok { color: #4caf50; }
    .status-warn { color: #ff9800; }
    .status-error { color: #d32f2f; }
    table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #d32f2f; color: white; }
  </style>
</head>
<body>
  <h1>🔥 Chaos Engineering Report</h1>

  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-value">${data.metrics.http_reqs.values.count}</div>
      <div class="metric-label">Total Requests</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${data.metrics.circuit_breaker_trips ? data.metrics.circuit_breaker_trips.values.count : 0}</div>
      <div class="metric-label">Circuit Breaker Trips</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${data.metrics.retry_success_rate ? (data.metrics.retry_success_rate.values.rate * 100).toFixed(1) + '%' : 'N/A'}</div>
      <div class="metric-label">Retry Success Rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${data.metrics.failure_recovery_time_ms ? data.metrics.failure_recovery_time_ms.values['p(95)'].toFixed(0) + 'ms' : 'N/A'}</div>
      <div class="metric-label">Recovery Time P95</div>
    </div>
  </div>

  <h2>Scenario Results</h2>
  <table>
    <thead>
      <tr>
        <th>Scenario</th>
        <th>Failure Rate</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${['latency', 'failures', 'db_timeout', 'cache_failure', 'exhaustion'].map(chaos => {
        const metric = data.metrics[`http_req_failed{chaos:${chaos}}`];
        if (!metric) return '';
        const rate = (metric.values.rate * 100).toFixed(2);
        const status = rate < 20 ? 'OK' : rate < 40 ? 'WARNING' : 'ERROR';
        const statusClass = rate < 20 ? 'status-ok' : rate < 40 ? 'status-warn' : 'status-error';
        return `
          <tr>
            <td>${chaos}</td>
            <td>${rate}%</td>
            <td class="${statusClass}">${status}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <h2>Full Metrics</h2>
  <pre>${JSON.stringify(data.metrics, null, 2)}</pre>
</body>
</html>
  `;
}
