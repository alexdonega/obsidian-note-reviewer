#!/usr/bin/env node
// Bundle Analysis Script
// Analyzes bundle size, identifies large dependencies, and checks performance budgets

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync, brotliCompressSync } from 'zlib';

const DIST_DIR = './packages/ui/dist';
const BUDGETS = {
  js: {
    max: 500 * 1024, // 500KB
    warn: 400 * 1024, // 400KB
  },
  css: {
    max: 100 * 1024, // 100KB
    warn: 80 * 1024, // 80KB
  },
  total: {
    max: 2 * 1024 * 1024, // 2MB
    warn: 1.5 * 1024 * 1024, // 1.5MB
  },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function formatSize(bytes) {
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

function getStatus(size, budget) {
  if (size > budget.max) return { color: colors.red, icon: '❌', status: 'FAIL' };
  if (size > budget.warn) return { color: colors.yellow, icon: '⚠️ ', status: 'WARN' };
  return { color: colors.green, icon: '✅', status: 'PASS' };
}

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath);
  const originalSize = content.length;
  const gzipSize = gzipSync(content).length;
  const brotliSize = brotliCompressSync(content).length;

  return {
    path: filePath,
    original: originalSize,
    gzip: gzipSize,
    brotli: brotliSize,
    compression: {
      gzip: ((1 - gzipSize / originalSize) * 100).toFixed(1),
      brotli: ((1 - brotliSize / originalSize) * 100).toFixed(1),
    },
  };
}

function analyzeBundle() {
  console.log(`${colors.cyan}📦 Bundle Analysis${colors.reset}\n`);
  console.log('='.repeat(80));

  const files = getAllFiles(DIST_DIR);
  const jsFiles = files.filter((f) => f.endsWith('.js'));
  const cssFiles = files.filter((f) => f.endsWith('.css'));
  const assetFiles = files.filter((f) => !f.endsWith('.js') && !f.endsWith('.css') && !f.endsWith('.html'));

  const stats = {
    js: jsFiles.map(analyzeFile),
    css: cssFiles.map(analyzeFile),
    assets: assetFiles.map(analyzeFile),
  };

  // Total sizes
  const totalJS = stats.js.reduce((sum, file) => sum + file.original, 0);
  const totalCSS = stats.css.reduce((sum, file) => sum + file.original, 0);
  const totalAssets = stats.assets.reduce((sum, file) => sum + file.original, 0);
  const totalSize = totalJS + totalCSS + totalAssets;

  const totalGzip = stats.js.reduce((sum, file) => sum + file.gzip, 0) +
                    stats.css.reduce((sum, file) => sum + file.gzip, 0) +
                    stats.assets.reduce((sum, file) => sum + file.gzip, 0);

  const totalBrotli = stats.js.reduce((sum, file) => sum + file.brotli, 0) +
                      stats.css.reduce((sum, file) => sum + file.brotli, 0) +
                      stats.assets.reduce((sum, file) => sum + file.brotli, 0);

  // Performance Budget Check
  console.log(`\n${colors.blue}📊 Performance Budget${colors.reset}\n`);

  const jsStatus = getStatus(totalJS, BUDGETS.js);
  const cssStatus = getStatus(totalCSS, BUDGETS.css);
  const totalStatus = getStatus(totalSize, BUDGETS.total);

  console.log(`${jsStatus.icon} JavaScript: ${jsStatus.color}${formatSize(totalJS)}${colors.reset} / ${formatSize(BUDGETS.js.max)} (${jsStatus.status})`);
  console.log(`${cssStatus.icon} CSS:        ${cssStatus.color}${formatSize(totalCSS)}${colors.reset} / ${formatSize(BUDGETS.css.max)} (${cssStatus.status})`);
  console.log(`${totalStatus.icon} Total:      ${totalStatus.color}${formatSize(totalSize)}${colors.reset} / ${formatSize(BUDGETS.total.max)} (${totalStatus.status})`);

  // Size breakdown
  console.log(`\n${colors.blue}📈 Size Breakdown${colors.reset}\n`);
  console.log(`Original:  ${formatSize(totalSize)}`);
  console.log(`Gzip:      ${formatSize(totalGzip)} (${((1 - totalGzip / totalSize) * 100).toFixed(1)}% reduction)`);
  console.log(`Brotli:    ${formatSize(totalBrotli)} (${((1 - totalBrotli / totalSize) * 100).toFixed(1)}% reduction)`);

  // Largest files
  console.log(`\n${colors.blue}📁 Top 10 Largest Files${colors.reset}\n`);

  const allFiles = [...stats.js, ...stats.css, ...stats.assets]
    .sort((a, b) => b.original - a.original)
    .slice(0, 10);

  allFiles.forEach((file, index) => {
    const relativePath = file.path.replace(DIST_DIR, '');
    console.log(`${index + 1}. ${relativePath}`);
    console.log(`   Original: ${formatSize(file.original)} | Gzip: ${formatSize(file.gzip)} | Brotli: ${formatSize(file.brotli)}`);
  });

  // JavaScript chunks analysis
  if (stats.js.length > 0) {
    console.log(`\n${colors.blue}🔍 JavaScript Chunks${colors.reset}\n`);

    const chunks = stats.js
      .sort((a, b) => b.original - a.original)
      .map((file) => {
        const name = file.path.split('/').pop();
        return { name, ...file };
      });

    chunks.forEach((chunk) => {
      const status = chunk.original > 200 * 1024 ? '⚠️ ' : '✅';
      console.log(`${status} ${chunk.name}`);
      console.log(`   ${formatSize(chunk.original)} → ${formatSize(chunk.gzip)} (gzip) | ${formatSize(chunk.brotli)} (br)`);
    });
  }

  // Recommendations
  console.log(`\n${colors.blue}💡 Recommendations${colors.reset}\n`);

  const recommendations = [];

  if (totalJS > BUDGETS.js.warn) {
    recommendations.push('• Consider code splitting to reduce initial JS bundle size');
    recommendations.push('• Use dynamic imports for rarely-used features');
  }

  if (totalCSS > BUDGETS.css.warn) {
    recommendations.push('• Remove unused CSS with PurgeCSS or similar tools');
    recommendations.push('• Consider extracting critical CSS');
  }

  const largeAssets = stats.assets.filter((f) => f.original > 100 * 1024);
  if (largeAssets.length > 0) {
    recommendations.push(`• Optimize ${largeAssets.length} large asset(s) (images, fonts, etc.)`);
  }

  const poorCompression = [...stats.js, ...stats.css].filter(
    (f) => parseFloat(f.compression.gzip) < 50
  );
  if (poorCompression.length > 0) {
    recommendations.push(`• ${poorCompression.length} file(s) have poor compression ratios`);
  }

  if (recommendations.length === 0) {
    console.log(`${colors.green}✅ Bundle is well optimized!${colors.reset}`);
  } else {
    recommendations.forEach((rec) => console.log(rec));
  }

  console.log('\n' + '='.repeat(80));

  // Exit with error if budget exceeded
  if (jsStatus.status === 'FAIL' || cssStatus.status === 'FAIL' || totalStatus.status === 'FAIL') {
    console.log(`\n${colors.red}❌ Performance budget exceeded!${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.green}✅ Bundle analysis complete${colors.reset}\n`);
}

// Run analysis
try {
  analyzeBundle();
} catch (error) {
  console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error);
  process.exit(1);
}
