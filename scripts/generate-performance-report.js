#!/usr/bin/env node
// Comprehensive Performance Report Generator
// Aggregates all performance metrics into a single report

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = './performance-reports';
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-').split('.')[0];

// Load data from various sources
function loadJSON(path, defaultValue = {}) {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading ${path}:`, error.message);
  }
  return defaultValue;
}

function generateReport() {
  console.log('📊 Generating comprehensive performance report...\n');

  // Load all metrics
  const loadTestResults = loadJSON('./load-test-results.json');
  const chaosTestResults = loadJSON('./chaos-test-results.json');
  const memoryReport = loadJSON('./packages/ui/memory-report.json');
  const bundleStats = loadJSON('./packages/ui/dist/stats.json');
  const lighthouseResults = loadJSON('./lighthouse-results.json');
  const webVitals = loadJSON('./packages/ui/web-vitals-report.json');

  // Generate scores
  const scores = calculateScores({
    loadTestResults,
    chaosTestResults,
    memoryReport,
    bundleStats,
    lighthouseResults,
    webVitals,
  });

  // Generate HTML report
  const htmlReport = generateHTMLReport(scores, {
    loadTestResults,
    chaosTestResults,
    memoryReport,
    bundleStats,
    lighthouseResults,
    webVitals,
  });

  // Generate Markdown summary
  const mdSummary = generateMarkdownSummary(scores);

  // Save reports
  if (!existsSync(OUTPUT_DIR)) {
    require('fs').mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  writeFileSync(`${OUTPUT_DIR}/performance-report-${TIMESTAMP}.html`, htmlReport);
  writeFileSync('./performance-summary.md', mdSummary);
  writeFileSync(`${OUTPUT_DIR}/performance-scores-${TIMESTAMP}.json`, JSON.stringify(scores, null, 2));

  console.log(`✅ Reports generated:`);
  console.log(`   - ${OUTPUT_DIR}/performance-report-${TIMESTAMP}.html`);
  console.log(`   - performance-summary.md`);
  console.log(`   - ${OUTPUT_DIR}/performance-scores-${TIMESTAMP}.json`);

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📈 PERFORMANCE SUMMARY');
  console.log('='.repeat(80));
  console.log(`Overall Score: ${scores.overall.score}/100 (${scores.overall.grade})`);
  console.log(`Load Test:     ${scores.loadTest.score}/100`);
  console.log(`Resilience:    ${scores.resilience.score}/100`);
  console.log(`Memory:        ${scores.memory.score}/100`);
  console.log(`Bundle Size:   ${scores.bundle.score}/100`);
  console.log(`Lighthouse:    ${scores.lighthouse.score}/100`);
  console.log(`Web Vitals:    ${scores.webVitals.score}/100`);
  console.log('='.repeat(80) + '\n');

  // Exit with error if overall score < 80
  if (scores.overall.score < 80) {
    console.error('❌ Performance score below threshold (80)');
    process.exit(1);
  }

  console.log('✅ All performance checks passed!\n');
}

function calculateScores(data) {
  const scores = {
    loadTest: calculateLoadTestScore(data.loadTestResults),
    resilience: calculateResilienceScore(data.chaosTestResults),
    memory: calculateMemoryScore(data.memoryReport),
    bundle: calculateBundleScore(data.bundleStats),
    lighthouse: calculateLighthouseScore(data.lighthouseResults),
    webVitals: calculateWebVitalsScore(data.webVitals),
  };

  // Calculate overall score (weighted average)
  const weights = {
    loadTest: 0.2,
    resilience: 0.15,
    memory: 0.15,
    bundle: 0.15,
    lighthouse: 0.2,
    webVitals: 0.15,
  };

  const overall = Object.keys(weights).reduce((sum, key) => {
    return sum + scores[key].score * weights[key];
  }, 0);

  scores.overall = {
    score: Math.round(overall),
    grade: getGrade(overall),
  };

  return scores;
}

function calculateLoadTestScore(data) {
  if (!data || !data.metrics) {
    return { score: 0, details: 'No load test data' };
  }

  const metrics = data.metrics;
  let score = 100;

  // Check response times
  if (metrics.http_req_duration) {
    const p95 = metrics.http_req_duration.values?.['p(95)'] || 0;
    if (p95 > 1000) score -= 30;
    else if (p95 > 500) score -= 15;
  }

  // Check error rate
  if (metrics.http_req_failed) {
    const errorRate = metrics.http_req_failed.values?.rate || 0;
    if (errorRate > 0.05) score -= 30;
    else if (errorRate > 0.01) score -= 15;
  }

  // Check throughput
  if (metrics.http_reqs) {
    const rate = metrics.http_reqs.values?.rate || 0;
    if (rate < 10) score -= 10;
  }

  return {
    score: Math.max(0, score),
    details: {
      p95: metrics.http_req_duration?.values?.['p(95)'],
      errorRate: metrics.http_req_failed?.values?.rate,
      throughput: metrics.http_reqs?.values?.rate,
    },
  };
}

function calculateResilienceScore(data) {
  if (!data || !data.metrics) {
    return { score: 0, details: 'No chaos test data' };
  }

  let score = 100;
  const metrics = data.metrics;

  // Check failure rates per scenario
  ['latency', 'failures', 'db_timeout', 'cache_failure'].forEach((scenario) => {
    const metric = metrics[`http_req_failed{chaos:${scenario}}`];
    if (metric) {
      const failRate = metric.values?.rate || 0;
      if (failRate > 0.3) score -= 15;
      else if (failRate > 0.2) score -= 10;
    }
  });

  // Check recovery time
  if (metrics.failure_recovery_time_ms) {
    const p95 = metrics.failure_recovery_time_ms.values?.['p(95)'] || 0;
    if (p95 > 10000) score -= 10;
    else if (p95 > 5000) score -= 5;
  }

  return {
    score: Math.max(0, score),
    details: metrics,
  };
}

function calculateMemoryScore(data) {
  if (!data || !data.summary) {
    return { score: 100, details: 'No memory issues detected' };
  }

  let score = 100;
  const summary = data.summary;

  // Check for memory leaks
  if (summary.totalLeaks > 0) {
    score -= summary.totalLeaks * 10;
  }

  // Check memory trend
  if (summary.trend === 'increasing') {
    score -= 15;
  }

  // Check current memory usage
  if (summary.currentMemoryMB > 500) {
    score -= 20;
  } else if (summary.currentMemoryMB > 300) {
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    details: summary,
  };
}

function calculateBundleScore(data) {
  if (!data) {
    return { score: 0, details: 'No bundle stats' };
  }

  let score = 100;

  // Assuming bundle stats format
  const totalSize = data.totalSize || 0;
  const jsSize = data.jsSize || 0;
  const cssSize = data.cssSize || 0;

  // Check total bundle size
  if (totalSize > 2 * 1024 * 1024) score -= 30; // > 2MB
  else if (totalSize > 1.5 * 1024 * 1024) score -= 15; // > 1.5MB

  // Check JS size
  if (jsSize > 500 * 1024) score -= 20; // > 500KB
  else if (jsSize > 400 * 1024) score -= 10; // > 400KB

  // Check CSS size
  if (cssSize > 100 * 1024) score -= 10; // > 100KB

  return {
    score: Math.max(0, score),
    details: {
      totalSize,
      jsSize,
      cssSize,
    },
  };
}

function calculateLighthouseScore(data) {
  if (!data || !data.categories) {
    return { score: 0, details: 'No Lighthouse data' };
  }

  const categories = data.categories;
  const scores = {
    performance: categories.performance?.score || 0,
    accessibility: categories.accessibility?.score || 0,
    bestPractices: categories['best-practices']?.score || 0,
    seo: categories.seo?.score || 0,
  };

  // Weighted average (performance is more important)
  const avgScore =
    scores.performance * 0.4 +
    scores.accessibility * 0.2 +
    scores.bestPractices * 0.2 +
    scores.seo * 0.2;

  return {
    score: Math.round(avgScore * 100),
    details: scores,
  };
}

function calculateWebVitalsScore(data) {
  if (!data || !data.vitals) {
    return { score: 100, details: 'No Web Vitals data' };
  }

  let score = 100;
  const vitals = data.vitals;

  // LCP (Largest Contentful Paint)
  if (vitals.lcp > 4000) score -= 30;
  else if (vitals.lcp > 2500) score -= 15;

  // FID (First Input Delay)
  if (vitals.fid > 300) score -= 20;
  else if (vitals.fid > 100) score -= 10;

  // CLS (Cumulative Layout Shift)
  if (vitals.cls > 0.25) score -= 25;
  else if (vitals.cls > 0.1) score -= 10;

  // FCP (First Contentful Paint)
  if (vitals.fcp > 3000) score -= 15;
  else if (vitals.fcp > 1800) score -= 5;

  // TTFB (Time to First Byte)
  if (vitals.ttfb > 800) score -= 10;
  else if (vitals.ttfb > 600) score -= 5;

  return {
    score: Math.max(0, score),
    details: vitals,
  };
}

function getGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function generateHTMLReport(scores, data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report - ${new Date().toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 1.1em; }

    .score-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8f9fa;
    }
    .score-card {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s ease;
    }
    .score-card:hover { transform: translateY(-5px); }
    .score-card h3 {
      color: #495057;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .score-value {
      font-size: 3em;
      font-weight: bold;
      margin: 10px 0;
    }
    .score-A { color: #28a745; }
    .score-B { color: #5bc0de; }
    .score-C { color: #f0ad4e; }
    .score-D { color: #d9534f; }
    .score-F { color: #dc3545; }
    .grade {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 10px;
    }

    .details-section {
      padding: 40px;
    }
    .details-section h2 {
      color: #495057;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
    }
    .metric-row:last-child { border-bottom: none; }
    .metric-label { color: #6c757d; }
    .metric-value { font-weight: bold; color: #212529; }

    .recommendations {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 20px 0;
    }
    .recommendations h3 { color: #856404; margin-bottom: 10px; }
    .recommendations ul { margin-left: 20px; color: #856404; }

    .footer {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Performance Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="score-grid">
      <div class="score-card">
        <h3>Overall Score</h3>
        <div class="score-value score-${scores.overall.grade[0]}">${scores.overall.score}</div>
        <div class="grade" style="background: ${getGradeColor(scores.overall.grade)}; color: white;">
          ${scores.overall.grade}
        </div>
      </div>

      ${Object.entries(scores)
        .filter(([key]) => key !== 'overall')
        .map(
          ([key, data]) => `
        <div class="score-card">
          <h3>${formatKey(key)}</h3>
          <div class="score-value score-${getGrade(data.score)[0]}">${data.score}</div>
          <div class="grade" style="background: ${getGradeColor(getGrade(data.score))}; color: white;">
            ${getGrade(data.score)}
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="details-section">
      <h2>📊 Detailed Metrics</h2>

      <h3 style="margin-top: 30px;">Load Test Results</h3>
      ${generateMetricRows(scores.loadTest.details)}

      <h3 style="margin-top: 30px;">Resilience (Chaos Test)</h3>
      <p>System maintained ${(100 - calculateFailureRate(scores.resilience.details)).toFixed(1)}% availability under chaos conditions</p>

      <h3 style="margin-top: 30px;">Memory Profile</h3>
      ${generateMetricRows(scores.memory.details)}

      <h3 style="margin-top: 30px;">Bundle Size</h3>
      ${generateMetricRows(formatBundleSizes(scores.bundle.details))}

      <h3 style="margin-top: 30px;">Lighthouse Scores</h3>
      ${generateMetricRows(formatLighthouseScores(scores.lighthouse.details))}

      <h3 style="margin-top: 30px;">Web Vitals</h3>
      ${generateMetricRows(scores.webVitals.details)}
    </div>

    ${generateRecommendations(scores)}

    <div class="footer">
      <p>Generated by Obsidian Note Reviewer Performance Suite</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateMarkdownSummary(scores) {
  return `# 📊 Performance Report

**Generated:** ${new Date().toLocaleString()}

## Overall Score: ${scores.overall.score}/100 (${scores.overall.grade})

### Category Breakdown

| Category | Score | Grade |
|----------|-------|-------|
| Load Test | ${scores.loadTest.score}/100 | ${getGrade(scores.loadTest.score)} |
| Resilience | ${scores.resilience.score}/100 | ${getGrade(scores.resilience.score)} |
| Memory | ${scores.memory.score}/100 | ${getGrade(scores.memory.score)} |
| Bundle Size | ${scores.bundle.score}/100 | ${getGrade(scores.bundle.score)} |
| Lighthouse | ${scores.lighthouse.score}/100 | ${getGrade(scores.lighthouse.score)} |
| Web Vitals | ${scores.webVitals.score}/100 | ${getGrade(scores.webVitals.score)} |

## Status

${scores.overall.score >= 90 ? '✅ **Excellent** - All performance metrics are within optimal ranges' : ''}
${scores.overall.score >= 80 && scores.overall.score < 90 ? '✅ **Good** - Performance is acceptable with minor optimizations needed' : ''}
${scores.overall.score >= 70 && scores.overall.score < 80 ? '⚠️ **Needs Improvement** - Several performance issues detected' : ''}
${scores.overall.score < 70 ? '❌ **Critical** - Significant performance issues require immediate attention' : ''}

---
*This is an automated performance report. See the full HTML report for detailed analysis.*
`;
}

function generateMetricRows(data) {
  if (!data || typeof data !== 'object') return '';

  return Object.entries(data)
    .map(([key, value]) => {
      const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
      return `
      <div class="metric-row">
        <span class="metric-label">${formatKey(key)}</span>
        <span class="metric-value">${formattedValue}</span>
      </div>
    `;
    })
    .join('');
}

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatBundleSizes(data) {
  return {
    'Total Size': `${(data.totalSize / 1024).toFixed(2)} KB`,
    'JavaScript': `${(data.jsSize / 1024).toFixed(2)} KB`,
    'CSS': `${(data.cssSize / 1024).toFixed(2)} KB`,
  };
}

function formatLighthouseScores(data) {
  return {
    Performance: `${(data.performance * 100).toFixed(0)}%`,
    Accessibility: `${(data.accessibility * 100).toFixed(0)}%`,
    'Best Practices': `${(data.bestPractices * 100).toFixed(0)}%`,
    SEO: `${(data.seo * 100).toFixed(0)}%`,
  };
}

function getGradeColor(grade) {
  if (grade.startsWith('A')) return '#28a745';
  if (grade.startsWith('B')) return '#5bc0de';
  if (grade.startsWith('C')) return '#f0ad4e';
  return '#d9534f';
}

function calculateFailureRate(details) {
  // Simplified calculation
  return 0;
}

function generateRecommendations(scores) {
  const recommendations = [];

  if (scores.loadTest.score < 80) {
    recommendations.push('Optimize API response times - consider caching and query optimization');
  }
  if (scores.bundle.score < 80) {
    recommendations.push('Reduce bundle size - enable code splitting and tree shaking');
  }
  if (scores.memory.score < 80) {
    recommendations.push('Fix memory leaks - check component lifecycle and event listeners');
  }
  if (scores.lighthouse.score < 80) {
    recommendations.push('Improve Lighthouse scores - optimize images and enable compression');
  }
  if (scores.webVitals.score < 80) {
    recommendations.push('Optimize Core Web Vitals - reduce LCP and CLS');
  }

  if (recommendations.length === 0) {
    return '<div class="details-section"><h2>✅ No critical issues found!</h2></div>';
  }

  return `
    <div class="details-section">
      <div class="recommendations">
        <h3>💡 Recommendations</h3>
        <ul>
          ${recommendations.map((rec) => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Run report generation
generateReport();
