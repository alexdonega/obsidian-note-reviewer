/**
 * Comprehensive unit tests for the pathValidation module.
 * Tests various path traversal attack vectors (CWE-22).
 */

import { describe, test, expect } from 'bun:test';
import {
  isPathTraversal,
  normalizePath,
  validatePath,
  validatePathWithAllowedDirs
} from '../pathValidation';

describe('pathValidation', () => {
  describe('isPathTraversal', () => {
    describe('simple traversal patterns', () => {
      test('detects simple ../ traversal', () => {
        expect(isPathTraversal('../')).toBe(true);
        expect(isPathTraversal('../file.txt')).toBe(true);
        expect(isPathTraversal('../../etc/passwd')).toBe(true);
        expect(isPathTraversal('a/../b')).toBe(true);
        expect(isPathTraversal('foo/bar/../../../etc/passwd')).toBe(true);
      });

      test('detects simple ..\\ Windows traversal', () => {
        expect(isPathTraversal('..\\')).toBe(true);
        expect(isPathTraversal('..\\file.txt')).toBe(true);
        expect(isPathTraversal('..\\..\\Windows\\System32')).toBe(true);
        expect(isPathTraversal('a\\..\\b')).toBe(true);
      });

      test('detects mixed separator traversal', () => {
        expect(isPathTraversal('..\\../')).toBe(true);
        expect(isPathTraversal('../..\\')).toBe(true);
        expect(isPathTraversal('foo/..\\bar')).toBe(true);
        expect(isPathTraversal('foo\\../bar')).toBe(true);
      });
    });

    describe('URL encoded traversal patterns', () => {
      test('detects URL encoded ../ (%2e%2e%2f)', () => {
        expect(isPathTraversal('%2e%2e%2f')).toBe(true);
        expect(isPathTraversal('%2e%2e/')).toBe(true);
        expect(isPathTraversal('..%2f')).toBe(true);
        expect(isPathTraversal('%2e%2e%5c')).toBe(true); // Windows
      });

      test('detects mixed encoded patterns', () => {
        expect(isPathTraversal('.%2e/')).toBe(true);
        expect(isPathTraversal('%2e./')).toBe(true);
        expect(isPathTraversal('.%2e%2f')).toBe(true);
        expect(isPathTraversal('%2e.%2f')).toBe(true);
      });

      test('detects case variations in encoding', () => {
        expect(isPathTraversal('%2E%2E%2F')).toBe(true);
        expect(isPathTraversal('%2E%2e%2f')).toBe(true);
        expect(isPathTraversal('%2e%2E%2F')).toBe(true);
      });
    });

    describe('double-encoded traversal patterns', () => {
      test('detects double-encoded ../ (%252e%252e%252f)', () => {
        expect(isPathTraversal('%252e%252e%252f')).toBe(true);
        expect(isPathTraversal('%252e%252e/')).toBe(true);
        expect(isPathTraversal('..%252f')).toBe(true);
      });

      test('detects triple-encoded patterns', () => {
        // Triple-encoded dot: %25252e
        expect(isPathTraversal('%25252e%25252e%25252f')).toBe(true);
      });
    });

    describe('Unicode normalization attacks', () => {
      test('detects Unicode overlong encoding for dot (C0 AF)', () => {
        expect(isPathTraversal('%c0%ae%c0%ae/')).toBe(true);
        expect(isPathTraversal('.%c0%ae/')).toBe(true);
        expect(isPathTraversal('%c0%ae./')).toBe(true);
      });

      test('detects 3-byte Unicode overlong encoding (E0 80 AE)', () => {
        expect(isPathTraversal('%e0%80%ae%e0%80%ae/')).toBe(true);
        expect(isPathTraversal('.%e0%80%ae/')).toBe(true);
        expect(isPathTraversal('%e0%80%ae./')).toBe(true);
      });
    });

    describe('null byte injection', () => {
      test('detects null byte in path', () => {
        expect(isPathTraversal('file.txt\0.jpg')).toBe(true);
        expect(isPathTraversal('file\0.txt')).toBe(true);
        expect(isPathTraversal('\0../etc/passwd')).toBe(true);
      });

      test('detects URL-encoded null byte', () => {
        expect(isPathTraversal('file.txt%00.jpg')).toBe(true);
        expect(isPathTraversal('%00file.txt')).toBe(true);
        expect(isPathTraversal('../%00../etc/passwd')).toBe(true);
      });
    });

    describe('valid paths (should not be detected as traversal)', () => {
      test('allows simple file names', () => {
        expect(isPathTraversal('file.txt')).toBe(false);
        expect(isPathTraversal('document.md')).toBe(false);
        expect(isPathTraversal('my-note.txt')).toBe(false);
      });

      test('allows paths with directories', () => {
        expect(isPathTraversal('/home/user/documents/file.txt')).toBe(false);
        expect(isPathTraversal('folder/subfolder/file.md')).toBe(false);
        expect(isPathTraversal('C:\\Users\\name\\Documents\\file.txt')).toBe(false);
      });

      test('allows single dot in path', () => {
        expect(isPathTraversal('./file.txt')).toBe(false);
        expect(isPathTraversal('/home/./user/file.txt')).toBe(false);
      });

      test('allows dots in filenames', () => {
        expect(isPathTraversal('file.backup.txt')).toBe(false);
        expect(isPathTraversal('document.v2.draft.md')).toBe(false);
        expect(isPathTraversal('.hidden')).toBe(false);
        expect(isPathTraversal('.hiddenfile.txt')).toBe(false);
      });

      test('handles empty and invalid inputs gracefully', () => {
        expect(isPathTraversal('')).toBe(false);
        expect(isPathTraversal(null as unknown as string)).toBe(false);
        expect(isPathTraversal(undefined as unknown as string)).toBe(false);
      });
    });
  });

  describe('normalizePath', () => {
    test('normalizes relative paths to absolute', () => {
      const result = normalizePath('file.txt');
      expect(result).not.toBe('');
      // Should be an absolute path
      expect(result.startsWith('/') || /^[A-Z]:\\/i.test(result)).toBe(true);
    });

    test('normalizes Windows-style separators', () => {
      const result = normalizePath('folder\\subfolder\\file.txt');
      expect(result).toContain('subfolder');
      expect(result).toContain('file.txt');
    });

    test('resolves redundant path components', () => {
      const result = normalizePath('/foo/bar//baz');
      // Should normalize double slashes
      expect(result).not.toContain('//');
    });

    test('handles empty and invalid inputs', () => {
      expect(normalizePath('')).toBe('');
      expect(normalizePath(null as unknown as string)).toBe('');
      expect(normalizePath(undefined as unknown as string)).toBe('');
    });
  });

  describe('validatePath', () => {
    describe('basic validation', () => {
      test('accepts valid file paths', () => {
        const result = validatePath('/home/user/documents/file.txt');
        expect(result.valid).toBe(true);
        expect(result.normalizedPath).toBeDefined();
        expect(result.error).toBeUndefined();
      });

      test('rejects paths with traversal sequences', () => {
        const result = validatePath('../../../etc/passwd');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Path traversal detected');
      });

      test('rejects paths with null bytes', () => {
        const result = validatePath('file.txt\0.jpg');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid characters in path');
      });

      test('rejects paths with URL-encoded null bytes', () => {
        const result = validatePath('file.txt%00.jpg');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid characters in path');
      });

      test('rejects empty paths', () => {
        const result = validatePath('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Path is required');
      });

      test('rejects invalid input types', () => {
        const result = validatePath(null as unknown as string);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Path is required');
      });
    });

    describe('base directory restriction', () => {
      test('accepts paths within base directory', () => {
        const result = validatePath('/home/user/vault/note.md', '/home/user/vault');
        expect(result.valid).toBe(true);
        expect(result.normalizedPath).toBeDefined();
      });

      test('accepts path equal to base directory', () => {
        const result = validatePath('/home/user/vault', '/home/user/vault');
        expect(result.valid).toBe(true);
      });

      test('rejects paths outside base directory', () => {
        const result = validatePath('/etc/passwd', '/home/user/vault');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Path is outside allowed directory');
      });

      test('rejects partial path matches', () => {
        // /home/user/vaultbackup should NOT be valid for base /home/user/vault
        const result = validatePath('/home/user/vaultbackup/file.txt', '/home/user/vault');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Path is outside allowed directory');
      });

      test('handles Windows paths with base directory', () => {
        const result = validatePath(
          'C:\\Users\\name\\Documents\\vault\\note.md',
          'C:\\Users\\name\\Documents\\vault'
        );
        expect(result.valid).toBe(true);
      });
    });

    describe('attack vector coverage', () => {
      test('blocks URL-encoded traversal attacks', () => {
        expect(validatePath('%2e%2e%2fetc/passwd').valid).toBe(false);
        expect(validatePath('..%2fetc/passwd').valid).toBe(false);
        expect(validatePath('%2e%2e/etc/passwd').valid).toBe(false);
      });

      test('blocks double-encoded traversal attacks', () => {
        expect(validatePath('%252e%252e/etc/passwd').valid).toBe(false);
        expect(validatePath('%252e%252e%252fetc/passwd').valid).toBe(false);
      });

      test('blocks Unicode overlong encoding attacks', () => {
        expect(validatePath('%c0%ae%c0%ae/etc/passwd').valid).toBe(false);
        expect(validatePath('%e0%80%ae%e0%80%ae/etc/passwd').valid).toBe(false);
      });

      test('blocks mixed separator attacks', () => {
        expect(validatePath('..\\../etc/passwd').valid).toBe(false);
        expect(validatePath('../..\\etc/passwd').valid).toBe(false);
      });

      test('blocks deeply nested traversal', () => {
        expect(validatePath('a/b/c/../../../../etc/passwd').valid).toBe(false);
        expect(validatePath('a/b/c/d/e/../../../../../etc/passwd').valid).toBe(false);
      });
    });
  });

  describe('validatePathWithAllowedDirs', () => {
    const allowedDirs = ['/home/user/vault1', '/home/user/vault2', '/data/shared'];

    test('accepts paths in first allowed directory', () => {
      const result = validatePathWithAllowedDirs('/home/user/vault1/note.md', allowedDirs);
      expect(result.valid).toBe(true);
    });

    test('accepts paths in second allowed directory', () => {
      const result = validatePathWithAllowedDirs('/home/user/vault2/note.md', allowedDirs);
      expect(result.valid).toBe(true);
    });

    test('accepts paths in any allowed directory', () => {
      const result = validatePathWithAllowedDirs('/data/shared/file.txt', allowedDirs);
      expect(result.valid).toBe(true);
    });

    test('rejects paths outside all allowed directories', () => {
      const result = validatePathWithAllowedDirs('/etc/passwd', allowedDirs);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path is not within any allowed directory');
    });

    test('still detects traversal attacks', () => {
      const result = validatePathWithAllowedDirs('../../../etc/passwd', allowedDirs);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path traversal detected');
    });

    test('handles empty allowed directories array', () => {
      const result = validatePathWithAllowedDirs('/any/path/file.txt', []);
      expect(result.valid).toBe(true);
    });

    test('handles undefined allowed directories', () => {
      const result = validatePathWithAllowedDirs('/any/path/file.txt', undefined as unknown as string[]);
      expect(result.valid).toBe(true);
    });

    test('Windows paths with multiple allowed directories', () => {
      const windowsDirs = ['C:\\Users\\name\\Vault1', 'D:\\Backup\\Vault2'];

      const result1 = validatePathWithAllowedDirs('C:\\Users\\name\\Vault1\\note.md', windowsDirs);
      expect(result1.valid).toBe(true);

      const result2 = validatePathWithAllowedDirs('D:\\Backup\\Vault2\\note.md', windowsDirs);
      expect(result2.valid).toBe(true);

      const result3 = validatePathWithAllowedDirs('E:\\Other\\file.txt', windowsDirs);
      expect(result3.valid).toBe(false);
    });
  });

  describe('real-world attack scenarios', () => {
    test('blocks /api/save style path traversal to /etc/passwd', () => {
      const maliciousPaths = [
        '../../etc/passwd',
        '../../../etc/passwd',
        '..\\..\\etc\\passwd',
        '%2e%2e/%2e%2e/etc/passwd',
        '....//....//etc/passwd',
        'vault/../../../etc/passwd'
      ];

      for (const path of maliciousPaths) {
        const result = validatePath(path);
        expect(result.valid).toBe(false);
      }
    });

    test('blocks Windows system file access attempts', () => {
      const maliciousPaths = [
        '..\\..\\Windows\\System32\\config\\SAM',
        '%2e%2e\\%2e%2e\\Windows\\win.ini',
        '../..\\Windows\\System32\\drivers\\etc\\hosts',
        'C:\\..\\..\\Windows\\System32\\config'
      ];

      for (const path of maliciousPaths) {
        const result = validatePath(path);
        expect(result.valid).toBe(false);
      }
    });

    test('blocks symlink escape attempts via traversal', () => {
      const maliciousPaths = [
        'folder/../../../sensitive',
        './folder/../../secret',
        'a/b/c/../../../..'
      ];

      for (const path of maliciousPaths) {
        const result = validatePath(path);
        expect(result.valid).toBe(false);
      }
    });

    test('allows legitimate Obsidian vault paths', () => {
      const legitimatePaths = [
        '/home/user/ObsidianVault/notes/daily/2024-01-01.md',
        'C:\\Users\\name\\Documents\\MyVault\\Projects\\note.md',
        '/Users/name/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault/note.md',
        'subfolder/nested/deeply/note.md'
      ];

      for (const path of legitimatePaths) {
        const result = validatePath(path);
        expect(result.valid).toBe(true);
      }
    });

    test('allows paths with special but safe characters', () => {
      const legitimatePaths = [
        '/vault/Note with spaces.md',
        '/vault/Note_underscore.md',
        '/vault/Note-dash.md',
        '/vault/Note (parentheses).md',
        '/vault/Nota em Portugues com acentuacao.md',
        '/vault/Notes/2024.01.01 Daily.md'
      ];

      for (const path of legitimatePaths) {
        const result = validatePath(path);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    test('handles very long paths', () => {
      const longPath = '/vault/' + 'a'.repeat(500) + '/note.md';
      const result = validatePath(longPath);
      expect(result.valid).toBe(true);
    });

    test('handles paths with only dots', () => {
      expect(validatePath('..').valid).toBe(false);
      expect(validatePath('...').valid).toBe(true); // three dots is not traversal
      expect(validatePath('....').valid).toBe(true);
    });

    test('handles paths with consecutive separators', () => {
      const result = validatePath('/vault//subfolder///note.md');
      expect(result.valid).toBe(true);
    });

    test('handles relative current directory', () => {
      const result = validatePath('./note.md');
      expect(result.valid).toBe(true);
    });

    test('handles whitespace in paths', () => {
      expect(validatePath('   ').valid).toBe(true); // Just whitespace is technically valid
      expect(validatePath('/vault/file   .md').valid).toBe(true);
    });
  });
});
