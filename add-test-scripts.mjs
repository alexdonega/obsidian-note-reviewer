import { readFileSync, writeFileSync } from 'fs';

const filePath = 'package.json';

try {
  let content = readFileSync(filePath, 'utf8');
  const pkg = JSON.parse(content);

  // Add test scripts
  pkg.scripts.test = 'bun test';
  pkg.scripts['test:watch'] = 'bun test --watch';
  pkg.scripts['test:coverage'] = 'bun test --coverage';

  // Write back with proper formatting
  writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  console.log('✓ Scripts de teste adicionados ao package.json');
  console.log('  - test: bun test');
  console.log('  - test:watch: bun test --watch');
  console.log('  - test:coverage: bun test --coverage');
} catch (err) {
  console.error('✗ Erro:', err.message);
  process.exit(1);
}
