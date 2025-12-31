import { readFileSync, writeFileSync } from 'fs';

const filePath = 'packages/ui/utils/storage.ts';

try {
  let content = readFileSync(filePath, 'utf8');

  // Add the new functions at the end of the file
  const newFunctions = `
// Helper function to get cookie value (uses existing getItem)
function getCookie(key: string): string | null {
  return getItem(key);
}

// Helper function to set cookie value (uses existing setItem)
function setCookie(key: string, value: string): void {
  setItem(key, value);
}

/**
 * Get vault path from storage
 */
export function getVaultPath(): string {
  return getCookie('vaultPath') ?? '';
}

/**
 * Set vault path in storage
 */
export function setVaultPath(path: string): void {
  setCookie('vaultPath', path);
}

/**
 * Get note path from storage
 */
export function getNotePath(): string {
  return getCookie('notePath') ?? '';
}

/**
 * Set note path in storage
 */
export function setNotePath(path: string): void {
  setCookie('notePath', path);
}
`;

  // Append before the final empty line
  content = content.trimEnd() + '\n' + newFunctions;

  writeFileSync(filePath, content, 'utf8');
  console.log('✓ storage.ts atualizado com funções de vault path');
} catch (err) {
  console.error('✗ Erro:', err.message);
  process.exit(1);
}
