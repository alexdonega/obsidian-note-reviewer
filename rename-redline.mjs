import { readFileSync, writeFileSync } from 'fs';

console.log('🔄 Renomeando "Redline" para "Exclusão"...\n');

const file = 'packages/ui/components/ModeSwitcher.tsx';
let content = readFileSync(file, 'utf8');

// Substituir
content = content.replace('label="Redline"', 'label="Exclusão"');

writeFileSync(file, content, 'utf8');
console.log('✅ "Redline" renomeado para "Exclusão"!\n');
