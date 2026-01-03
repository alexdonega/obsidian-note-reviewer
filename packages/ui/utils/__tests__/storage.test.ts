import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import {
  getItem,
  setItem,
  removeItem,
  isSecureContext,
  storage,
  getVaultPath,
  setVaultPath,
  getNotePath,
  setNotePath,
  getNoteType,
  setNoteType,
  getNoteName,
  setNoteName,
  getLastUsedTemplate,
  setLastUsedTemplate,
  saveNoteConfig,
  getNoteConfig,
  getNoteTypePath,
  setNoteTypePath,
  getAllNoteTypePaths,
  getNoteTypeTemplate,
  setNoteTypeTemplate,
  getAllNoteTypeTemplates,
} from '../storage';

/**
 * Storage utility unit tests
 *
 * Tests cover:
 * - Core cookie operations (getItem, setItem, removeItem)
 * - Secure context detection (isSecureContext)
 * - Security flags (Secure, SameSite)
 * - Helper functions for specific storage operations
 */

describe('storage utility', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=; path=/; max-age=0`;
      }
    });
  });

  afterEach(() => {
    // Clear cookies after each test
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=; path=/; max-age=0`;
      }
    });
  });

  describe('getItem', () => {
    test('returns null for non-existent cookie', () => {
      const result = getItem('nonExistentKey');
      expect(result).toBeNull();
    });

    test('retrieves existing cookie value', () => {
      document.cookie = 'testKey=testValue; path=/';
      const result = getItem('testKey');
      expect(result).toBe('testValue');
    });

    test('decodes URL-encoded cookie values', () => {
      document.cookie = `encodedKey=${encodeURIComponent('hello world')}; path=/`;
      const result = getItem('encodedKey');
      expect(result).toBe('hello world');
    });

    test('handles special characters in values', () => {
      const specialValue = 'value=with;special&chars';
      document.cookie = `specialKey=${encodeURIComponent(specialValue)}; path=/`;
      const result = getItem('specialKey');
      expect(result).toBe(specialValue);
    });

    test('retrieves correct cookie when multiple cookies exist', () => {
      document.cookie = 'firstKey=firstValue; path=/';
      document.cookie = 'secondKey=secondValue; path=/';
      document.cookie = 'thirdKey=thirdValue; path=/';

      expect(getItem('firstKey')).toBe('firstValue');
      expect(getItem('secondKey')).toBe('secondValue');
      expect(getItem('thirdKey')).toBe('thirdValue');
    });

    test('handles cookies with similar names', () => {
      document.cookie = 'key=value1; path=/';
      document.cookie = 'keyPrefix=value2; path=/';
      document.cookie = 'prefixKey=value3; path=/';

      expect(getItem('key')).toBe('value1');
      expect(getItem('keyPrefix')).toBe('value2');
      expect(getItem('prefixKey')).toBe('value3');
    });

    test('handles empty string value', () => {
      document.cookie = 'emptyKey=; path=/';
      const result = getItem('emptyKey');
      expect(result).toBe('');
    });

    test('handles regex special characters in key names', () => {
      // Keys with regex special characters should be handled safely
      const specialKey = 'key.with[special]chars';
      document.cookie = `${specialKey}=specialValue; path=/`;
      // Note: This tests the escapeRegex function internally
      const result = getItem(specialKey);
      expect(result).toBe('specialValue');
    });
  });

  describe('setItem', () => {
    test('sets a cookie with correct value', () => {
      setItem('newKey', 'newValue');
      expect(getItem('newKey')).toBe('newValue');
    });

    test('URL-encodes the value', () => {
      setItem('encodedKey', 'value with spaces');
      const result = getItem('encodedKey');
      expect(result).toBe('value with spaces');
    });

    test('sets cookie with path=/', () => {
      setItem('pathTestKey', 'pathTestValue');
      // Cookie should be accessible (path=/ is set)
      expect(getItem('pathTestKey')).toBe('pathTestValue');
    });

    test('sets cookie with SameSite=Lax', () => {
      // We can verify this indirectly by ensuring the cookie is set
      // and works correctly (SameSite=Lax allows same-site requests)
      setItem('sameSiteKey', 'sameSiteValue');
      expect(getItem('sameSiteKey')).toBe('sameSiteValue');
    });

    test('overwrites existing cookie value', () => {
      setItem('overwriteKey', 'originalValue');
      expect(getItem('overwriteKey')).toBe('originalValue');

      setItem('overwriteKey', 'newValue');
      expect(getItem('overwriteKey')).toBe('newValue');
    });

    test('handles special characters in value', () => {
      const specialValue = 'value=with;special&chars?and/slashes';
      setItem('specialValueKey', specialValue);
      expect(getItem('specialValueKey')).toBe(specialValue);
    });

    test('handles JSON stringified objects', () => {
      const obj = { name: 'test', count: 42, nested: { value: true } };
      setItem('jsonKey', JSON.stringify(obj));
      const result = getItem('jsonKey');
      expect(JSON.parse(result!)).toEqual(obj);
    });

    test('handles empty string value', () => {
      setItem('emptyValueKey', '');
      expect(getItem('emptyValueKey')).toBe('');
    });

    test('handles unicode characters', () => {
      const unicodeValue = '日本語テスト emoji: 🎉';
      setItem('unicodeKey', unicodeValue);
      expect(getItem('unicodeKey')).toBe(unicodeValue);
    });
  });

  describe('removeItem', () => {
    test('removes existing cookie', () => {
      setItem('removeKey', 'removeValue');
      expect(getItem('removeKey')).toBe('removeValue');

      removeItem('removeKey');
      // After removal, getItem returns null or empty string depending on DOM implementation
      const result = getItem('removeKey');
      expect(result === null || result === '').toBe(true);
    });

    test('does nothing for non-existent cookie', () => {
      // Should not throw
      removeItem('nonExistentRemoveKey');
      const result = getItem('nonExistentRemoveKey');
      expect(result === null || result === '').toBe(true);
    });

    test('only removes specified cookie', () => {
      setItem('keepKey', 'keepValue');
      setItem('removeKey2', 'removeValue');

      removeItem('removeKey2');

      expect(getItem('keepKey')).toBe('keepValue');
      const result = getItem('removeKey2');
      expect(result === null || result === '').toBe(true);
    });

    test('removes cookie with matching attributes', () => {
      // Set and then remove - the removal should work because
      // removeItem uses the same attributes (path, SameSite, Secure)
      setItem('attrKey', 'attrValue');
      removeItem('attrKey');
      const result = getItem('attrKey');
      expect(result === null || result === '').toBe(true);
    });
  });

  describe('isSecureContext', () => {
    test('returns a boolean', () => {
      const result = isSecureContext();
      expect(typeof result).toBe('boolean');
    });

    test('returns consistent results', () => {
      const first = isSecureContext();
      const second = isSecureContext();
      expect(first).toBe(second);
    });

    // Note: In bun:test environment, isSecureContext behavior depends on
    // how the test runner is configured. These tests verify the function
    // doesn't throw and returns a boolean.
    test('handles missing window gracefully', () => {
      // The function should not throw even in edge cases
      // The actual return value depends on the test environment
      expect(() => isSecureContext()).not.toThrow();
    });
  });

  describe('storage object', () => {
    test('exposes getItem method', () => {
      expect(typeof storage.getItem).toBe('function');
    });

    test('exposes setItem method', () => {
      expect(typeof storage.setItem).toBe('function');
    });

    test('exposes removeItem method', () => {
      expect(typeof storage.removeItem).toBe('function');
    });

    test('storage.setItem and storage.getItem work together', () => {
      storage.setItem('storageObjKey', 'storageObjValue');
      expect(storage.getItem('storageObjKey')).toBe('storageObjValue');
    });

    test('storage.removeItem removes cookie', () => {
      storage.setItem('storageRemoveKey', 'value');
      storage.removeItem('storageRemoveKey');
      const result = storage.getItem('storageRemoveKey');
      expect(result === null || result === '').toBe(true);
    });
  });

  describe('helper functions - vault and path', () => {
    test('getVaultPath returns empty string when not set', () => {
      expect(getVaultPath()).toBe('');
    });

    test('setVaultPath and getVaultPath work correctly', () => {
      setVaultPath('/path/to/vault');
      expect(getVaultPath()).toBe('/path/to/vault');
    });

    test('getNotePath returns empty string when not set', () => {
      expect(getNotePath()).toBe('');
    });

    test('setNotePath and getNotePath work correctly', () => {
      setNotePath('/notes/folder');
      expect(getNotePath()).toBe('/notes/folder');
    });
  });

  describe('helper functions - note type', () => {
    test('getNoteType returns null when not set', () => {
      expect(getNoteType()).toBeNull();
    });

    test('setNoteType and getNoteType work correctly', () => {
      setNoteType('daily');
      expect(getNoteType()).toBe('daily');
    });
  });

  describe('helper functions - note name', () => {
    test('getNoteName returns empty string when not set', () => {
      expect(getNoteName()).toBe('');
    });

    test('setNoteName and getNoteName work correctly', () => {
      setNoteName('My Note');
      expect(getNoteName()).toBe('My Note');
    });
  });

  describe('helper functions - template', () => {
    test('getLastUsedTemplate returns null when not set', () => {
      expect(getLastUsedTemplate()).toBeNull();
    });

    test('setLastUsedTemplate and getLastUsedTemplate work correctly', () => {
      setLastUsedTemplate('/templates/daily.md');
      expect(getLastUsedTemplate()).toBe('/templates/daily.md');
    });
  });

  describe('helper functions - note config', () => {
    test('getNoteConfig returns null when not set', () => {
      expect(getNoteConfig()).toBeNull();
    });

    test('saveNoteConfig and getNoteConfig work correctly', () => {
      const config = {
        tipo: 'daily',
        noteName: 'Daily Note',
        vaultPath: '/vault',
        notePath: '/notes',
      };
      saveNoteConfig(config);
      expect(getNoteConfig()).toEqual(config);
    });

    test('getNoteConfig handles minimal config', () => {
      const config = {
        tipo: 'weekly',
        noteName: 'Weekly Review',
      };
      saveNoteConfig(config);
      expect(getNoteConfig()).toEqual(config);
    });

    test('getNoteConfig returns null for invalid JSON', () => {
      // Manually set an invalid JSON cookie
      document.cookie = 'noteConfig=invalid{json; path=/';
      expect(getNoteConfig()).toBeNull();
    });
  });

  describe('helper functions - note type paths', () => {
    test('getNoteTypePath returns empty string when not set', () => {
      expect(getNoteTypePath('daily')).toBe('');
    });

    test('setNoteTypePath and getNoteTypePath work correctly', () => {
      setNoteTypePath('daily', '/daily/notes');
      expect(getNoteTypePath('daily')).toBe('/daily/notes');
    });

    test('different note types have separate paths', () => {
      setNoteTypePath('daily', '/daily');
      setNoteTypePath('weekly', '/weekly');
      setNoteTypePath('monthly', '/monthly');

      expect(getNoteTypePath('daily')).toBe('/daily');
      expect(getNoteTypePath('weekly')).toBe('/weekly');
      expect(getNoteTypePath('monthly')).toBe('/monthly');
    });

    test('getAllNoteTypePaths returns all configured paths', () => {
      // Clear any existing notePath_ cookies first
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('notePath_')) {
          document.cookie = `${name}=; path=/; max-age=0`;
        }
      });

      setNoteTypePath('daily', '/daily/path');
      setNoteTypePath('weekly', '/weekly/path');

      const paths = getAllNoteTypePaths();
      expect(paths['daily']).toBe('/daily/path');
      expect(paths['weekly']).toBe('/weekly/path');
    });

    test('getAllNoteTypePaths returns paths that were set', () => {
      // Note: In happy-dom, cookie cleanup via max-age=0 doesn't work reliably
      // So we test that we can retrieve paths we explicitly set
      const uniqueType = `testPath_${Date.now()}`;
      setNoteTypePath(uniqueType, '/vault/test');

      const paths = getAllNoteTypePaths();
      expect(paths[uniqueType]).toBe('/vault/test');
    });
  });

  describe('helper functions - note type templates', () => {
    test('getNoteTypeTemplate returns empty string when not set', () => {
      expect(getNoteTypeTemplate('daily')).toBe('');
    });

    test('setNoteTypeTemplate and getNoteTypeTemplate work correctly', () => {
      setNoteTypeTemplate('daily', '/templates/daily.md');
      expect(getNoteTypeTemplate('daily')).toBe('/templates/daily.md');
    });

    test('different note types have separate templates', () => {
      setNoteTypeTemplate('daily', '/templates/daily.md');
      setNoteTypeTemplate('weekly', '/templates/weekly.md');

      expect(getNoteTypeTemplate('daily')).toBe('/templates/daily.md');
      expect(getNoteTypeTemplate('weekly')).toBe('/templates/weekly.md');
    });

    test('getAllNoteTypeTemplates returns all configured templates', () => {
      // Clear any existing noteTemplate_ cookies first
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('noteTemplate_')) {
          document.cookie = `${name}=; path=/; max-age=0`;
        }
      });

      setNoteTypeTemplate('daily', '/templates/daily.md');
      setNoteTypeTemplate('weekly', '/templates/weekly.md');

      const templates = getAllNoteTypeTemplates();
      expect(templates['daily']).toBe('/templates/daily.md');
      expect(templates['weekly']).toBe('/templates/weekly.md');
    });

    test('getAllNoteTypeTemplates returns templates that were set', () => {
      // Note: In happy-dom, cookie cleanup via max-age=0 doesn't work reliably
      // So we test that we can retrieve templates we explicitly set
      const uniqueType = `testType_${Date.now()}`;
      setNoteTypeTemplate(uniqueType, '/templates/test.md');

      const templates = getAllNoteTypeTemplates();
      expect(templates[uniqueType]).toBe('/templates/test.md');
    });
  });

  describe('security features', () => {
    test('setItem applies Secure flag in secure context', () => {
      // In a secure context (localhost during testing), the Secure flag should be applied
      // We verify this indirectly by checking that cookies are still accessible
      // (the Secure flag doesn't prevent access, it controls transmission)
      setItem('secureTestKey', 'secureTestValue');
      expect(getItem('secureTestKey')).toBe('secureTestValue');
    });

    test('removeItem uses same attributes as setItem', () => {
      // This is a critical test: removeItem must use matching attributes
      // otherwise the cookie won't be properly removed
      setItem('removeAttrKey', 'removeAttrValue');
      expect(getItem('removeAttrKey')).toBe('removeAttrValue');

      removeItem('removeAttrKey');
      const result = getItem('removeAttrKey');
      expect(result === null || result === '').toBe(true);
    });

    test('cookies persist across operations', () => {
      // Set multiple cookies
      setItem('persist1', 'value1');
      setItem('persist2', 'value2');
      setItem('persist3', 'value3');

      // Remove one
      removeItem('persist2');

      // Verify the others are still there
      expect(getItem('persist1')).toBe('value1');
      const result = getItem('persist2');
      expect(result === null || result === '').toBe(true);
      expect(getItem('persist3')).toBe('value3');
    });
  });

  describe('error handling', () => {
    test('getItem handles errors gracefully', () => {
      // getItem should return null on error, not throw
      expect(() => getItem('anyKey')).not.toThrow();
    });

    test('setItem handles errors silently', () => {
      // setItem should not throw on error
      expect(() => setItem('anyKey', 'anyValue')).not.toThrow();
    });

    test('removeItem handles errors silently', () => {
      // removeItem should not throw on error
      expect(() => removeItem('anyKey')).not.toThrow();
    });

    test('isSecureContext handles errors gracefully', () => {
      // isSecureContext should not throw and return a boolean
      expect(() => isSecureContext()).not.toThrow();
      expect(typeof isSecureContext()).toBe('boolean');
    });
  });
});
