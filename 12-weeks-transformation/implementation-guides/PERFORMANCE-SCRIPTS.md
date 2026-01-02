# 🚀 Performance Testing & Optimization Scripts

## Quick Start

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:load": "k6 run tests/load/advanced-scenarios.test.js",
    "test:load:quick": "k6 run --duration 1m --vus 10 tests/load/notes-api.test.js",
    "test:chaos": "k6 run tests/chaos/chaos-scenarios.test.js",
    "test:memory": "node --expose-gc packages/ui/lib/performance/memory-profiler.ts",

    "build:optimized": "cd packages/ui && vite build --config vite.config.optimized.ts",
    "analyze:bundle": "node scripts/analyze-bundle.js",
    "analyze:bundle:visual": "npm run build:optimized && open packages/ui/dist/stats.html",

    "db:optimize": "psql $DATABASE_URL -f scripts/db-optimization.sql",
    "db:analyze": "psql $DATABASE_URL -c 'ANALYZE VERBOSE;'",
    "db:vacuum": "psql $DATABASE_URL -c 'VACUUM ANALYZE;'",

    "perf:report": "node scripts/generate-performance-report.js",
    "perf:all": "npm run test:load && npm run test:chaos && npm run analyze:bundle && npm run perf:report",

    "lighthouse": "lighthouse http://localhost:4173 --config-path=.lighthouserc.json --output=html --output-path=./lighthouse-report.html",
    "lighthouse:ci": "lhci autorun"
  }
}
```

## Installation

Install required dependencies:

```bash
# k6 (Load testing)
# macOS
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
# or
scoop install k6

# Lighthouse
npm install -g @lhci/cli lighthouse

# Vite plugins for bundle optimization
bun add -D rollup-plugin-visualizer vite-plugin-compression vite-plugin-pwa
```

## Usage Guide

### 1. Load Testing

**Quick test (1 minute, 10 VUs):**
```bash
npm run test:load:quick
```

**Full advanced scenarios (60+ minutes):**
```bash
npm run test:load
```

**Custom test:**
```bash
k6 run --duration 5m --vus 50 tests/load/notes-api.test.js
```

**Environment variables:**
```bash
export API_URL=http://localhost:3001
export API_TOKEN=your_token_here
k6 run tests/load/advanced-scenarios.test.js
```

### 2. Chaos Engineering

**Run chaos tests:**
```bash
npm run test:chaos
```

**Individual scenarios:**
```bash
# Network latency
k6 run --scenario latency_injection tests/chaos/chaos-scenarios.test.js

# Random failures
k6 run --scenario random_failures tests/chaos/chaos-scenarios.test.js

# Database timeout
k6 run --scenario db_timeout tests/chaos/chaos-scenarios.test.js
```

### 3. Bundle Analysis

**Analyze current bundle:**
```bash
npm run analyze:bundle
```

**Build optimized and analyze:**
```bash
npm run build:optimized
npm run analyze:bundle
```

**Visual analysis (interactive treemap):**
```bash
npm run analyze:bundle:visual
```

### 4. Database Optimization

**Run full optimization suite:**
```bash
npm run db:optimize
```

**Individual operations:**
```bash
# Analyze tables
npm run db:analyze

# Vacuum tables
npm run db:vacuum

# Check slow queries
psql $DATABASE_URL -c "SELECT * FROM get_slow_queries(interval '1 hour');"

# Check index usage
psql $DATABASE_URL -c "SELECT * FROM analyze_index_usage();"

# Estimate bloat
psql $DATABASE_URL -c "SELECT * FROM estimate_index_bloat();"
```

### 5. Memory Profiling

**Start memory profiler:**
```bash
npm run test:memory
```

**In your React components:**
```typescript
import { useMemoryMonitor, memoryProfiler } from '@/performance/memory-profiler';

function MyComponent() {
  // Auto-monitor component lifecycle
  useMemoryMonitor('MyComponent');

  // Manual profiling
  useEffect(() => {
    const cleanup = memoryProfiler.monitorComponent('MyComponent', this);
    return cleanup;
  }, []);

  return <div>...</div>;
}
```

**Get memory status:**
```typescript
const status = memoryProfiler.getStatus();
console.log('Memory trend:', status.trend);
console.log('Current usage:', status.current);
console.log('Leaks detected:', status.leaks);
```

### 6. Lighthouse Audits

**Single run:**
```bash
npm run lighthouse
```

**CI mode (multiple runs):**
```bash
npm run lighthouse:ci
```

**Custom thresholds:**
```bash
lighthouse http://localhost:4173 \
  --preset=desktop \
  --throttling.cpuSlowdownMultiplier=1 \
  --output=json \
  --output-path=./lighthouse-results.json
```

### 7. Performance Reports

**Generate comprehensive report:**
```bash
npm run perf:report
```

**Run all tests and generate report:**
```bash
npm run perf:all
```

**Output files:**
- `performance-reports/performance-report-{timestamp}.html` - Full HTML report
- `performance-summary.md` - Markdown summary (for PRs)
- `performance-reports/performance-scores-{timestamp}.json` - Raw JSON data

## CI/CD Integration

The performance tests automatically run on every PR via GitHub Actions.

**Workflows:**
- `.github/workflows/performance-budget.yml` - Main performance workflow

**Checks performed:**
1. Bundle size analysis
2. Lighthouse audits
3. Web Vitals measurement
4. Quick load test
5. Memory leak detection
6. Performance budget validation

**Thresholds (will fail CI if exceeded):**
- JavaScript bundle: 500 KB max
- CSS bundle: 100 KB max
- Total bundle: 2 MB max
- Lighthouse Performance: 90+ score
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Performance Budgets

Budgets are enforced in multiple places:

1. **Vite build:** `vite.config.optimized.ts`
   - Chunk size warnings at 1000 KB

2. **Bundle analyzer:** `scripts/analyze-bundle.js`
   - Fails if budgets exceeded

3. **Lighthouse:** `.lighthouserc.json`
   - Performance score: 90+
   - Accessibility: 95+
   - Best Practices: 90+

4. **CI workflow:** `.github/workflows/performance-budget.yml`
   - Enforces all budgets

## Optimization Checklist

### Before Release
- [ ] Run `npm run test:load` and verify P95 < 500ms
- [ ] Run `npm run test:chaos` and verify resilience
- [ ] Run `npm run analyze:bundle` and check for large deps
- [ ] Run `npm run db:optimize` on production replica
- [ ] Run `npm run lighthouse` and achieve 90+ score
- [ ] Check `npm run test:memory` for leaks
- [ ] Generate final report with `npm run perf:report`

### Monitoring in Production
- Enable OpenTelemetry tracing (see `packages/ui/lib/observability/`)
- Configure metrics endpoint in `.env`
- Set up alerting webhooks
- Monitor health checks endpoint: `/api/health`
- Review performance reports weekly

## Troubleshooting

### k6 tests failing
```bash
# Check if API is running
curl http://localhost:3001/api/health

# Increase timeout
k6 run --http-debug tests/load/notes-api.test.js

# Run with fewer VUs
k6 run --vus 1 --duration 10s tests/load/notes-api.test.js
```

### Bundle size too large
```bash
# Analyze what's included
npm run analyze:bundle:visual

# Check for duplicate dependencies
npx depcheck

# Use bundle buddy
npx bundle-buddy packages/ui/dist/stats.json
```

### Memory leaks detected
```bash
# Force GC during profiling
node --expose-gc packages/ui/lib/performance/memory-profiler.ts

# Use Chrome DevTools
# 1. Build app: npm run build
# 2. Serve: npm run preview
# 3. Open Chrome DevTools > Memory > Take heap snapshot
```

### Database slow queries
```bash
# Enable query logging
# In postgresql.conf:
# log_min_duration_statement = 100  # Log queries > 100ms

# Check current locks
psql $DATABASE_URL -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Find missing indexes
psql $DATABASE_URL -c "SELECT * FROM find_missing_indexes();"
```

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [Web Vitals](https://web.dev/vitals/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

---

**Generated by:** Obsidian Note Reviewer Performance Suite
**Last updated:** ${new Date().toISOString()}
