import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Implementando melhorias do upstream...\n');

// 1. Update version to 0.2.1 in package.json
console.log('1️⃣ Atualizando versão para 0.2.1...');
const pkgPath = 'package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.version = '0.2.1';
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('   ✓ package.json atualizado\n');

// 2. Update App.tsx to use dynamic version
console.log('2️⃣ Atualizando App.tsx para versão dinâmica...');
const appPath = 'packages/editor/App.tsx';
let appContent = readFileSync(appPath, 'utf8');

// Replace hardcoded version with dynamic version
appContent = appContent.replace(
  /<span className="text-xs text-muted-foreground font-mono opacity-60 hidden md:inline">v0\.1<\/span>/,
  `<span className="text-xs text-muted-foreground font-mono opacity-60 hidden md:inline">
              v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}
            </span>`
);

writeFileSync(appPath, appContent, 'utf8');
console.log('   ✓ App.tsx atualizado com versão dinâmica\n');

// 3. Update vite.config.ts to inject version
console.log('3️⃣ Atualizando vite.config.ts para injetar versão...');
const viteConfigPath = 'apps/hook/vite.config.ts';
let viteContent = readFileSync(viteConfigPath, 'utf8');

// Add import if not exists
if (!viteContent.includes('import pkg from')) {
  viteContent = viteContent.replace(
    /import \{ defineConfig \} from ['"]vite['"];/,
    `import { defineConfig } from 'vite';\nimport pkg from '../../package.json';`
  );
}

// Add define to config if not exists
if (!viteContent.includes('define:')) {
  viteContent = viteContent.replace(
    /export default defineConfig\(\{/,
    `export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },`
  );
}

writeFileSync(viteConfigPath, viteContent, 'utf8');
console.log('   ✓ vite.config.ts configurado com injeção de versão\n');

// 4. Fix share URL to use localhost (since we don't have plannotator.ai domain)
console.log('4️⃣ Corrigindo Share URL...');
const sharingPath = 'packages/ui/utils/sharing.ts';
let sharingContent = readFileSync(sharingPath, 'utf8');

// Add SHARE_BASE_URL constant if not exists
if (!sharingContent.includes('SHARE_BASE_URL')) {
  // Find the line before the return statement in generateShareUrl
  sharingContent = sharingContent.replace(
    /(function generateShareUrl[^{]*\{[^}]*)(return \`\$\{window\.location\.origin\}\$\{window\.location\.pathname\}#\$\{hash\}\`;)/,
    `$1const SHARE_BASE_URL = window.location.origin;
  $2`
  );

  // Replace the return statement to use SHARE_BASE_URL
  sharingContent = sharingContent.replace(
    /return \`\$\{window\.location\.origin\}\$\{window\.location\.pathname\}#\$\{hash\}\`;/,
    `return \`\${SHARE_BASE_URL}/\${window.location.pathname.split('/').pop()}#\${hash}\`;`
  );
}

writeFileSync(sharingPath, sharingContent, 'utf8');
console.log('   ✓ sharing.ts atualizado\n');

console.log('✅ Todas as melhorias básicas implementadas!');
console.log('\n📝 Próximos passos:');
console.log('   - Criar componentes UpdateBanner e useUpdateCheck');
console.log('   - Implementar fix de annotation restoration');
console.log('   - Rebuild e testar');
