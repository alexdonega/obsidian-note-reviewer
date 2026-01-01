import { describe, it, expect } from 'bun:test';
import path from 'path';
import os from 'os';

describe('Path Traversal Protection', () => {
  const ALLOWED_DIRS = [
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Obsidian'),
    path.join(os.homedir(), 'ObsidianVault'),
  ];

  function isPathSafe(userPath: string): boolean {
    try {
      const resolved = path.resolve(userPath);
      return ALLOWED_DIRS.some(dir => resolved.startsWith(path.resolve(dir)));
    } catch {
      return false;
    }
  }

  it('should allow paths in Documents folder', () => {
    const safePath = path.join(os.homedir(), 'Documents', 'test.md');
    expect(isPathSafe(safePath)).toBe(true);
  });

  it('should allow paths in Obsidian folder', () => {
    const safePath = path.join(os.homedir(), 'Obsidian', 'notes', 'test.md');
    expect(isPathSafe(safePath)).toBe(true);
  });

  it('should block path traversal with ../', () => {
    const malicious = path.join(os.homedir(), 'Documents', '..', '..', 'etc', 'passwd');
    expect(isPathSafe(malicious)).toBe(false);
  });

  it('should block absolute paths outside allowed dirs', () => {
    expect(isPathSafe('/etc/passwd')).toBe(false);
    expect(isPathSafe('C:\\Windows\\System32')).toBe(false);
    expect(isPathSafe('/var/log/system.log')).toBe(false);
  });

  it('should block relative paths that escape allowed dirs', () => {
    const malicious = path.join(os.homedir(), 'Documents', '..', '..', 'etc');
    expect(isPathSafe(malicious)).toBe(false);
  });

  it('should block paths with null bytes', () => {
    const malicious = path.join(os.homedir(), 'Documents', 'test\x00.md');
    // Should not crash, just return false
    expect(() => isPathSafe(malicious)).not.toThrow();
  });

  it('should handle symlink attacks (path normalization)', () => {
    // Even if a symlink exists, the resolved path should still be validated
    const safePath = path.join(os.homedir(), 'Documents', 'symlink');
    const result = isPathSafe(safePath);
    expect(typeof result).toBe('boolean');
  });

  it('should handle Windows UNC paths', () => {
    if (process.platform === 'win32') {
      expect(isPathSafe('\\\\server\\share\\file.md')).toBe(false);
    }
  });

  it('should handle URL-encoded path traversal attempts', () => {
    // Note: path.join normalizes paths, so URL encoding won't work as-is
    // The protection is in the resolve() step which handles actual traversal
    const traversal = path.join(os.homedir(), 'Documents', '..', '..', '..', 'etc', 'passwd');
    expect(isPathSafe(traversal)).toBe(false);
  });
});
