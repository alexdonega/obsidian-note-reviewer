import { describe, test, expect, beforeEach } from 'bun:test';
import {
  validateSettingsImport,
  SettingsExport,
} from '../storage';

// Mock document.cookie for testing
let mockCookies: Record<string, string> = {};

// Override document.cookie in the global scope
Object.defineProperty(globalThis, 'document', {
  value: {
    get cookie() {
      return Object.entries(mockCookies)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('; ');
    },
    set cookie(value: string) {
      // Parse the cookie string
      const match = value.match(/^([^=]+)=([^;]*)/);
      if (match) {
        const [, key, val] = match;
        if (value.includes('max-age=0')) {
          delete mockCookies[key];
        } else {
          mockCookies[key] = decodeURIComponent(val);
        }
      }
    },
  },
  writable: true,
  configurable: true,
});

describe('validateSettingsImport', () => {
  test('accepts valid settings object', () => {
    const validSettings: SettingsExport = {
      version: 1,
      identity: 'swift-falcon-tater',
      notePaths: {
        daily: '/path/to/daily',
        weekly: '/path/to/weekly',
      },
      noteTemplates: {
        daily: '/templates/daily.md',
        weekly: '/templates/weekly.md',
      },
    };

    const result = validateSettingsImport(validSettings);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('accepts settings with empty paths and templates', () => {
    const validSettings: SettingsExport = {
      version: 1,
      identity: 'swift-falcon-tater',
      notePaths: {},
      noteTemplates: {},
    };

    const result = validateSettingsImport(validSettings);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('rejects null data', () => {
    const result = validateSettingsImport(null);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Settings must be a valid JSON object');
  });

  test('rejects non-object data', () => {
    const result = validateSettingsImport('not an object');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Settings must be a valid JSON object');
  });

  test('rejects missing version field', () => {
    const invalid = {
      identity: 'swift-falcon-tater',
      notePaths: {},
      noteTemplates: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "version" field (must be a number)');
  });

  test('rejects non-number version', () => {
    const invalid = {
      version: '1',
      identity: 'swift-falcon-tater',
      notePaths: {},
      noteTemplates: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "version" field (must be a number)');
  });

  test('rejects missing identity field', () => {
    const invalid = {
      version: 1,
      notePaths: {},
      noteTemplates: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "identity" field (must be a string)');
  });

  test('rejects non-string identity', () => {
    const invalid = {
      version: 1,
      identity: 123,
      notePaths: {},
      noteTemplates: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "identity" field (must be a string)');
  });

  test('rejects missing notePaths field', () => {
    const invalid = {
      version: 1,
      identity: 'swift-falcon-tater',
      noteTemplates: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "notePaths" field (must be an object)');
  });

  test('rejects array notePaths', () => {
    const invalid = {
      version: 1,
      identity: 'swift-falcon-tater',
      notePaths: ['/path/to/daily'],
      noteTemplates: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "notePaths" field (must be an object)');
  });

  test('rejects missing noteTemplates field', () => {
    const invalid = {
      version: 1,
      identity: 'swift-falcon-tater',
      notePaths: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "noteTemplates" field (must be an object)');
  });

  test('rejects array noteTemplates', () => {
    const invalid = {
      version: 1,
      identity: 'swift-falcon-tater',
      notePaths: {},
      noteTemplates: ['/templates/daily.md'],
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Missing or invalid "noteTemplates" field (must be an object)');
  });

  test('rejects non-string notePaths entries', () => {
    const invalid = {
      version: 1,
      identity: 'swift-falcon-tater',
      notePaths: {
        daily: 123,
      },
      noteTemplates: {},
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid notePaths entry "daily" (value must be a string)');
  });

  test('rejects non-string noteTemplates entries', () => {
    const invalid = {
      version: 1,
      identity: 'swift-falcon-tater',
      notePaths: {},
      noteTemplates: {
        daily: { path: '/templates/daily.md' },
      },
    };

    const result = validateSettingsImport(invalid);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid noteTemplates entry "daily" (value must be a string)');
  });

  test('accepts version 0', () => {
    const validSettings = {
      version: 0,
      identity: 'swift-falcon-tater',
      notePaths: {},
      noteTemplates: {},
    };

    const result = validateSettingsImport(validSettings);

    expect(result.valid).toBe(true);
  });

  test('accepts future version numbers', () => {
    const validSettings = {
      version: 99,
      identity: 'swift-falcon-tater',
      notePaths: {},
      noteTemplates: {},
    };

    const result = validateSettingsImport(validSettings);

    expect(result.valid).toBe(true);
  });
});

describe('exportAllSettings', () => {
  beforeEach(() => {
    // Reset mock cookies
    mockCookies = {};
  });

  test('returns correct structure with version', async () => {
    // Import dynamically to pick up the mocked document
    const { exportAllSettings } = await import('../storage');

    const result = exportAllSettings();

    expect(result).toHaveProperty('version');
    expect(result.version).toBe(1);
    expect(result).toHaveProperty('identity');
    expect(result).toHaveProperty('notePaths');
    expect(result).toHaveProperty('noteTemplates');
  });

  test('includes note paths from storage', async () => {
    // Set up mock cookies with note paths
    mockCookies['notePath_daily'] = '/vault/Daily Notes';
    mockCookies['notePath_weekly'] = '/vault/Weekly Reviews';

    const { exportAllSettings } = await import('../storage');
    const result = exportAllSettings();

    expect(result.notePaths).toEqual({
      daily: '/vault/Daily Notes',
      weekly: '/vault/Weekly Reviews',
    });
  });

  test('includes note templates from storage', async () => {
    // Set up mock cookies with note templates
    mockCookies['noteTemplate_daily'] = '/templates/Daily.md';
    mockCookies['noteTemplate_project'] = '/templates/Project.md';

    const { exportAllSettings } = await import('../storage');
    const result = exportAllSettings();

    expect(result.noteTemplates).toEqual({
      daily: '/templates/Daily.md',
      project: '/templates/Project.md',
    });
  });

  test('returns empty objects when no paths or templates exist', async () => {
    const { exportAllSettings } = await import('../storage');
    const result = exportAllSettings();

    expect(result.notePaths).toEqual({});
    expect(result.noteTemplates).toEqual({});
  });
});

describe('importAllSettings', () => {
  beforeEach(() => {
    // Reset mock cookies
    mockCookies = {};
  });

  test('applies settings to storage', async () => {
    const settings: SettingsExport = {
      version: 1,
      identity: 'gentle-crystal-tater',
      notePaths: {
        daily: '/imported/Daily',
        meeting: '/imported/Meetings',
      },
      noteTemplates: {
        daily: '/templates/ImportedDaily.md',
        meeting: '/templates/ImportedMeeting.md',
      },
    };

    const { importAllSettings } = await import('../storage');
    const result = importAllSettings(settings);

    expect(result).toBe(true);

    // Verify note paths were set
    expect(mockCookies['notePath_daily']).toBe('/imported/Daily');
    expect(mockCookies['notePath_meeting']).toBe('/imported/Meetings');

    // Verify note templates were set
    expect(mockCookies['noteTemplate_daily']).toBe('/templates/ImportedDaily.md');
    expect(mockCookies['noteTemplate_meeting']).toBe('/templates/ImportedMeeting.md');

    // Verify identity was set
    expect(mockCookies['plannotator-identity']).toBe('gentle-crystal-tater');
  });

  test('returns true for current version', async () => {
    const settings: SettingsExport = {
      version: 1,
      identity: 'test-tater',
      notePaths: {},
      noteTemplates: {},
    };

    const { importAllSettings } = await import('../storage');
    const result = importAllSettings(settings);

    expect(result).toBe(true);
  });

  test('handles future version gracefully', async () => {
    const settings: SettingsExport = {
      version: 99,
      identity: 'future-tater',
      notePaths: { daily: '/future/path' },
      noteTemplates: {},
    };

    const { importAllSettings } = await import('../storage');
    const result = importAllSettings(settings);

    // Should still import successfully (graceful degradation)
    expect(result).toBe(true);
    expect(mockCookies['notePath_daily']).toBe('/future/path');
  });

  test('imports empty settings without error', async () => {
    const settings: SettingsExport = {
      version: 1,
      identity: 'empty-tater',
      notePaths: {},
      noteTemplates: {},
    };

    const { importAllSettings } = await import('../storage');
    const result = importAllSettings(settings);

    expect(result).toBe(true);
    expect(mockCookies['plannotator-identity']).toBe('empty-tater');
  });

  test('overwrites existing settings', async () => {
    // Set up existing cookies
    mockCookies['notePath_daily'] = '/old/Daily';
    mockCookies['noteTemplate_daily'] = '/old/template.md';
    mockCookies['plannotator-identity'] = 'old-tater';

    const settings: SettingsExport = {
      version: 1,
      identity: 'new-tater',
      notePaths: { daily: '/new/Daily' },
      noteTemplates: { daily: '/new/template.md' },
    };

    const { importAllSettings } = await import('../storage');
    importAllSettings(settings);

    expect(mockCookies['notePath_daily']).toBe('/new/Daily');
    expect(mockCookies['noteTemplate_daily']).toBe('/new/template.md');
    expect(mockCookies['plannotator-identity']).toBe('new-tater');
  });
});
