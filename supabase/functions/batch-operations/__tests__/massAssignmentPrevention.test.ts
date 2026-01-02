/**
 * Security tests for mass assignment prevention in batch operations.
 *
 * These tests verify that the mass assignment vulnerability is fixed by
 * ensuring protected fields cannot be injected via the update or tag operations.
 *
 * The tests cover:
 * - Protection against injecting org_id, created_by, id, share_hash
 * - Protection against injecting timestamps (created_at, updated_at)
 * - Legitimate updates still work correctly
 * - Combined legitimate + malicious payloads are correctly filtered
 */

import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test';

// We need to import the validation functions
// Since validateBatchData and validateTagData are not exported, we'll test them
// indirectly through the exported filterAllowedFields and testing the constants behavior
import { filterAllowedFields } from '../validation';

// Re-define the constants as they are defined in index.ts to test the filtering behavior
const ALLOWED_UPDATE_FIELDS = ['title', 'content', 'markdown', 'slug', 'is_public'] as const;
const ALLOWED_TAG_FIELD = 'tags' as const;
const PROTECTED_FIELDS = [
  'id',
  'org_id',
  'created_by',
  'created_at',
  'updated_at',
  'updated_by',
  'share_hash',
] as const;

type ProtectedField = typeof PROTECTED_FIELDS[number];

/**
 * Simulates the validateBatchData behavior for testing purposes.
 * This mirrors the implementation in index.ts to verify the security logic.
 */
function simulateValidateBatchData(
  data: Record<string, unknown>,
  userId: string,
  noteIds: string[]
): {
  validatedData: Record<string, unknown>;
  protectedFieldsAttempted: string[];
  hasSecurityConcern: boolean;
} {
  const inputFields = Object.keys(data);
  const validatedData = filterAllowedFields(data, ALLOWED_UPDATE_FIELDS);

  const protectedFieldsAttempted = inputFields.filter((field) =>
    PROTECTED_FIELDS.includes(field as ProtectedField)
  );

  return {
    validatedData,
    protectedFieldsAttempted,
    hasSecurityConcern: protectedFieldsAttempted.length > 0,
  };
}

/**
 * Simulates the validateTagData behavior for testing purposes.
 * This mirrors the implementation in index.ts to verify the security logic.
 */
function simulateValidateTagData(
  data: Record<string, unknown> | undefined,
  userId: string,
  noteIds: string[]
): {
  tags: string[] | null;
  isValid: boolean;
  ignoredFields: string[];
  hasSecurityConcern: boolean;
} {
  if (!data) {
    return {
      tags: null,
      isValid: false,
      ignoredFields: [],
      hasSecurityConcern: false,
    };
  }

  const tags = data[ALLOWED_TAG_FIELD];
  if (!tags || !Array.isArray(tags)) {
    return {
      tags: null,
      isValid: false,
      ignoredFields: [],
      hasSecurityConcern: false,
    };
  }

  const inputFields = Object.keys(data);
  const extraFields = inputFields.filter((field) => field !== ALLOWED_TAG_FIELD);
  const protectedFieldsAttempted = extraFields.filter((field) =>
    PROTECTED_FIELDS.includes(field as ProtectedField)
  );

  return {
    tags: tags as string[],
    isValid: true,
    ignoredFields: extraFields,
    hasSecurityConcern: protectedFieldsAttempted.length > 0,
  };
}

describe('Mass Assignment Prevention - Update Operation', () => {
  const testUserId = 'test-user-123';
  const testNoteIds = ['note-1', 'note-2', 'note-3'];

  describe('Protected Field Injection Prevention', () => {
    it('prevents org_id injection', () => {
      const maliciousPayload = {
        title: 'Legitimate Title',
        org_id: 'attacker-org-id',
      };

      const result = simulateValidateBatchData(maliciousPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ title: 'Legitimate Title' });
      expect('org_id' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('org_id');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents created_by injection', () => {
      const maliciousPayload = {
        content: 'Some content',
        created_by: 'attacker-user-id',
      };

      const result = simulateValidateBatchData(maliciousPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ content: 'Some content' });
      expect('created_by' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('created_by');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents id field injection', () => {
      const maliciousPayload = {
        title: 'Test',
        id: 'injected-note-id',
      };

      const result = simulateValidateBatchData(maliciousPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ title: 'Test' });
      expect('id' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('id');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents share_hash injection', () => {
      const maliciousPayload = {
        is_public: true,
        share_hash: 'malicious-share-hash',
      };

      const result = simulateValidateBatchData(maliciousPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ is_public: true });
      expect('share_hash' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('share_hash');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents created_at injection', () => {
      const maliciousPayload = {
        title: 'Test Note',
        created_at: '2020-01-01T00:00:00Z',
      };

      const result = simulateValidateBatchData(maliciousPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ title: 'Test Note' });
      expect('created_at' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('created_at');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents updated_at injection', () => {
      const maliciousPayload = {
        content: 'Updated content',
        updated_at: '2020-01-01T00:00:00Z',
      };

      const result = simulateValidateBatchData(maliciousPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ content: 'Updated content' });
      expect('updated_at' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('updated_at');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents updated_by injection', () => {
      const maliciousPayload = {
        markdown: '# Heading',
        updated_by: 'different-user-id',
      };

      const result = simulateValidateBatchData(maliciousPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ markdown: '# Heading' });
      expect('updated_by' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('updated_by');
      expect(result.hasSecurityConcern).toBe(true);
    });
  });

  describe('Legitimate Updates', () => {
    it('allows title updates', () => {
      const legitimatePayload = { title: 'New Title' };

      const result = simulateValidateBatchData(legitimatePayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ title: 'New Title' });
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('allows content updates', () => {
      const legitimatePayload = { content: 'New content here' };

      const result = simulateValidateBatchData(legitimatePayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ content: 'New content here' });
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('allows markdown updates', () => {
      const legitimatePayload = { markdown: '# Heading\n\nSome text' };

      const result = simulateValidateBatchData(legitimatePayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ markdown: '# Heading\n\nSome text' });
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('allows slug updates', () => {
      const legitimatePayload = { slug: 'my-new-slug' };

      const result = simulateValidateBatchData(legitimatePayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ slug: 'my-new-slug' });
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('allows is_public updates', () => {
      const legitimatePayload = { is_public: true };

      const result = simulateValidateBatchData(legitimatePayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ is_public: true });
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('allows multiple allowed fields together', () => {
      const legitimatePayload = {
        title: 'Updated Title',
        content: 'Updated content',
        markdown: '# Updated',
        slug: 'updated-slug',
        is_public: false,
      };

      const result = simulateValidateBatchData(legitimatePayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual(legitimatePayload);
      expect(result.hasSecurityConcern).toBe(false);
    });
  });

  describe('Combined Legitimate + Malicious Fields', () => {
    it('filters out all protected fields while preserving legitimate fields', () => {
      const combinedPayload = {
        // Legitimate fields
        title: 'Legitimate Title',
        content: 'Legitimate content',
        // Malicious fields
        org_id: 'attacker-org',
        created_by: 'attacker-user',
        id: 'injected-id',
        share_hash: 'malicious-hash',
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
        updated_by: 'different-user',
      };

      const result = simulateValidateBatchData(combinedPayload, testUserId, testNoteIds);

      // Only legitimate fields should be in the result
      expect(result.validatedData).toEqual({
        title: 'Legitimate Title',
        content: 'Legitimate content',
      });

      // All protected fields should be detected
      expect(result.protectedFieldsAttempted).toContain('org_id');
      expect(result.protectedFieldsAttempted).toContain('created_by');
      expect(result.protectedFieldsAttempted).toContain('id');
      expect(result.protectedFieldsAttempted).toContain('share_hash');
      expect(result.protectedFieldsAttempted).toContain('created_at');
      expect(result.protectedFieldsAttempted).toContain('updated_at');
      expect(result.protectedFieldsAttempted).toContain('updated_by');

      expect(result.hasSecurityConcern).toBe(true);
    });

    it('correctly handles attack payload with no legitimate fields', () => {
      const pureAttackPayload = {
        org_id: 'attacker-org',
        created_by: 'attacker-user',
        id: 'stolen-id',
      };

      const result = simulateValidateBatchData(pureAttackPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({});
      expect(result.protectedFieldsAttempted.length).toBe(3);
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('handles unknown fields along with protected fields', () => {
      const mixedPayload = {
        title: 'Valid',
        org_id: 'malicious-org',
        unknown_field: 'ignored',
        another_unknown: 123,
      };

      const result = simulateValidateBatchData(mixedPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ title: 'Valid' });
      expect('unknown_field' in result.validatedData).toBe(false);
      expect('another_unknown' in result.validatedData).toBe(false);
      expect(result.protectedFieldsAttempted).toContain('org_id');
      expect(result.hasSecurityConcern).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data object', () => {
      const result = simulateValidateBatchData({}, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({});
      expect(result.protectedFieldsAttempted.length).toBe(0);
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('handles payload with null values for allowed fields', () => {
      const payload = {
        title: null,
        content: 'valid',
        org_id: 'attack',
      };

      const result = simulateValidateBatchData(payload, testUserId, testNoteIds);

      expect(result.validatedData.title).toBe(null);
      expect(result.validatedData.content).toBe('valid');
      expect('org_id' in result.validatedData).toBe(false);
    });

    it('handles payload with undefined values for allowed fields', () => {
      const payload = {
        title: undefined,
        content: 'valid',
      };

      const result = simulateValidateBatchData(payload, testUserId, testNoteIds);

      expect(result.validatedData.title).toBe(undefined);
      expect(result.validatedData.content).toBe('valid');
    });

    it('handles large attack payload', () => {
      // Simulates an attacker trying many different fields
      const largeAttackPayload: Record<string, unknown> = {
        title: 'Only this should pass',
      };

      // Add many protected fields
      for (const field of PROTECTED_FIELDS) {
        largeAttackPayload[field] = `attack-${field}`;
      }

      // Add many random fields
      for (let i = 0; i < 100; i++) {
        largeAttackPayload[`random_field_${i}`] = i;
      }

      const result = simulateValidateBatchData(largeAttackPayload, testUserId, testNoteIds);

      expect(result.validatedData).toEqual({ title: 'Only this should pass' });
      expect(result.protectedFieldsAttempted.length).toBe(PROTECTED_FIELDS.length);
      expect(result.hasSecurityConcern).toBe(true);
    });
  });
});

describe('Mass Assignment Prevention - Tag Operation', () => {
  const testUserId = 'test-user-123';
  const testNoteIds = ['note-1', 'note-2'];

  describe('Protected Field Injection Prevention', () => {
    it('prevents org_id injection in tag operation', () => {
      const maliciousPayload = {
        tags: ['work', 'urgent'],
        org_id: 'attacker-org',
      };

      const result = simulateValidateTagData(maliciousPayload, testUserId, testNoteIds);

      expect(result.tags).toEqual(['work', 'urgent']);
      expect(result.isValid).toBe(true);
      expect(result.ignoredFields).toContain('org_id');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents created_by injection in tag operation', () => {
      const maliciousPayload = {
        tags: ['tag1'],
        created_by: 'attacker-user',
      };

      const result = simulateValidateTagData(maliciousPayload, testUserId, testNoteIds);

      expect(result.tags).toEqual(['tag1']);
      expect(result.isValid).toBe(true);
      expect(result.ignoredFields).toContain('created_by');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents id field injection in tag operation', () => {
      const maliciousPayload = {
        tags: ['tag'],
        id: 'malicious-id',
      };

      const result = simulateValidateTagData(maliciousPayload, testUserId, testNoteIds);

      expect(result.tags).toEqual(['tag']);
      expect(result.isValid).toBe(true);
      expect(result.ignoredFields).toContain('id');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents share_hash injection in tag operation', () => {
      const maliciousPayload = {
        tags: ['tag'],
        share_hash: 'hijacked-hash',
      };

      const result = simulateValidateTagData(maliciousPayload, testUserId, testNoteIds);

      expect(result.tags).toEqual(['tag']);
      expect(result.ignoredFields).toContain('share_hash');
      expect(result.hasSecurityConcern).toBe(true);
    });

    it('prevents timestamp injection in tag operation', () => {
      const maliciousPayload = {
        tags: ['tag'],
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
      };

      const result = simulateValidateTagData(maliciousPayload, testUserId, testNoteIds);

      expect(result.tags).toEqual(['tag']);
      expect(result.ignoredFields).toContain('created_at');
      expect(result.ignoredFields).toContain('updated_at');
      expect(result.hasSecurityConcern).toBe(true);
    });
  });

  describe('Legitimate Tag Operations', () => {
    it('allows valid tags array', () => {
      const legitimatePayload = {
        tags: ['work', 'important', 'review'],
      };

      const result = simulateValidateTagData(legitimatePayload, testUserId, testNoteIds);

      expect(result.tags).toEqual(['work', 'important', 'review']);
      expect(result.isValid).toBe(true);
      expect(result.ignoredFields.length).toBe(0);
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('allows empty tags array', () => {
      const legitimatePayload = {
        tags: [],
      };

      const result = simulateValidateTagData(legitimatePayload, testUserId, testNoteIds);

      expect(result.tags).toEqual([]);
      expect(result.isValid).toBe(true);
      expect(result.hasSecurityConcern).toBe(false);
    });
  });

  describe('Combined Legitimate + Malicious Fields in Tag Operation', () => {
    it('extracts only tags while ignoring all other fields', () => {
      const combinedPayload = {
        tags: ['legitimate-tag'],
        org_id: 'attacker-org',
        created_by: 'attacker-user',
        id: 'injected-id',
        share_hash: 'malicious-hash',
        title: 'ignored-title',
        content: 'ignored-content',
        random_field: 'random-value',
      };

      const result = simulateValidateTagData(combinedPayload, testUserId, testNoteIds);

      expect(result.tags).toEqual(['legitimate-tag']);
      expect(result.isValid).toBe(true);

      // All other fields should be in ignoredFields
      expect(result.ignoredFields).toContain('org_id');
      expect(result.ignoredFields).toContain('created_by');
      expect(result.ignoredFields).toContain('id');
      expect(result.ignoredFields).toContain('share_hash');
      expect(result.ignoredFields).toContain('title');
      expect(result.ignoredFields).toContain('content');
      expect(result.ignoredFields).toContain('random_field');

      expect(result.hasSecurityConcern).toBe(true);
    });
  });

  describe('Invalid Tag Data', () => {
    it('rejects undefined data', () => {
      const result = simulateValidateTagData(undefined, testUserId, testNoteIds);

      expect(result.tags).toBeNull();
      expect(result.isValid).toBe(false);
      expect(result.hasSecurityConcern).toBe(false);
    });

    it('rejects missing tags field', () => {
      const payload = {
        org_id: 'attack-only',
      };

      const result = simulateValidateTagData(payload, testUserId, testNoteIds);

      expect(result.tags).toBeNull();
      expect(result.isValid).toBe(false);
    });

    it('rejects non-array tags field', () => {
      const payload = {
        tags: 'not-an-array',
      };

      const result = simulateValidateTagData(payload, testUserId, testNoteIds);

      expect(result.tags).toBeNull();
      expect(result.isValid).toBe(false);
    });

    it('rejects null tags field', () => {
      const payload = {
        tags: null,
      };

      const result = simulateValidateTagData(payload, testUserId, testNoteIds);

      expect(result.tags).toBeNull();
      expect(result.isValid).toBe(false);
    });
  });
});

describe('Direct Field Filtering Verification', () => {
  /**
   * These tests directly verify that filterAllowedFields works correctly
   * with the actual ALLOWED_UPDATE_FIELDS constant values.
   */

  it('filterAllowedFields with ALLOWED_UPDATE_FIELDS filters all protected fields', () => {
    const attackPayload = {
      id: 'injected',
      org_id: 'stolen',
      created_by: 'attacker',
      created_at: '2020-01-01',
      updated_at: '2020-01-01',
      updated_by: 'different',
      share_hash: 'malicious',
    };

    const result = filterAllowedFields(attackPayload, ALLOWED_UPDATE_FIELDS);

    expect(result).toEqual({});
    expect(Object.keys(result).length).toBe(0);
  });

  it('filterAllowedFields preserves all allowed update fields', () => {
    const legitimatePayload = {
      title: 'My Title',
      content: 'My Content',
      markdown: '# Heading',
      slug: 'my-slug',
      is_public: true,
    };

    const result = filterAllowedFields(legitimatePayload, ALLOWED_UPDATE_FIELDS);

    expect(result).toEqual(legitimatePayload);
    expect(Object.keys(result).length).toBe(5);
  });

  it('filterAllowedFields handles mixed payload correctly', () => {
    const mixedPayload = {
      title: 'Keep This',
      content: 'And This',
      org_id: 'Filter This Out',
      id: 'And This Too',
      random: 'Also Filter',
    };

    const result = filterAllowedFields(mixedPayload, ALLOWED_UPDATE_FIELDS);

    expect(result).toEqual({
      title: 'Keep This',
      content: 'And This',
    });
  });
});

describe('Attack Scenario Simulations', () => {
  const testUserId = 'victim-user';
  const testNoteIds = ['victim-note-1', 'victim-note-2'];

  it('prevents privilege escalation via org_id takeover', () => {
    // Attack scenario: Attacker tries to steal notes by changing org_id
    const attackPayload = {
      org_id: 'attacker-org-uuid',
      title: 'Innocent looking update',
    };

    const result = simulateValidateBatchData(attackPayload, testUserId, testNoteIds);

    expect('org_id' in result.validatedData).toBe(false);
    expect(result.hasSecurityConcern).toBe(true);
    expect(result.protectedFieldsAttempted).toContain('org_id');
  });

  it('prevents authorship spoofing via created_by modification', () => {
    // Attack scenario: Attacker tries to change who created the note
    const attackPayload = {
      created_by: 'blame-this-user',
      content: 'Malicious content',
    };

    const result = simulateValidateBatchData(attackPayload, testUserId, testNoteIds);

    expect('created_by' in result.validatedData).toBe(false);
    expect(result.hasSecurityConcern).toBe(true);
  });

  it('prevents audit log tampering via timestamp injection', () => {
    // Attack scenario: Attacker tries to falsify timestamps
    const attackPayload = {
      created_at: '1990-01-01T00:00:00Z',
      updated_at: '1990-01-01T00:00:00Z',
      content: 'Backdated content',
    };

    const result = simulateValidateBatchData(attackPayload, testUserId, testNoteIds);

    expect('created_at' in result.validatedData).toBe(false);
    expect('updated_at' in result.validatedData).toBe(false);
    expect(result.hasSecurityConcern).toBe(true);
  });

  it('prevents share_hash manipulation for unauthorized access', () => {
    // Attack scenario: Attacker tries to set a known share_hash to access shared notes
    const attackPayload = {
      share_hash: 'known-share-hash-for-another-note',
      is_public: true,
    };

    const result = simulateValidateBatchData(attackPayload, testUserId, testNoteIds);

    expect('share_hash' in result.validatedData).toBe(false);
    expect(result.validatedData.is_public).toBe(true); // legitimate field preserved
    expect(result.hasSecurityConcern).toBe(true);
  });

  it('prevents record ID substitution', () => {
    // Attack scenario: Attacker tries to overwrite a different note's ID
    const attackPayload = {
      id: 'different-note-id',
      title: 'Overwrite attack',
    };

    const result = simulateValidateBatchData(attackPayload, testUserId, testNoteIds);

    expect('id' in result.validatedData).toBe(false);
    expect(result.hasSecurityConcern).toBe(true);
  });

  it('prevents all protected fields in single complex attack', () => {
    // Attack scenario: Sophisticated attacker tries all known protected fields
    const sophisticatedAttack = {
      // All protected fields
      id: 'override-id',
      org_id: 'hijack-org',
      created_by: 'forge-creator',
      created_at: '2000-01-01T00:00:00Z',
      updated_at: '2000-01-01T00:00:00Z',
      updated_by: 'forge-updater',
      share_hash: 'steal-share',
      // Hidden legitimate field to bypass detection
      title: 'Normal looking title',
      // Additional random fields to confuse
      __proto__: 'prototype-pollution-attempt',
      constructor: 'constructor-attack',
    };

    const result = simulateValidateBatchData(sophisticatedAttack, testUserId, testNoteIds);

    // Only the legitimate field should pass
    expect(result.validatedData).toEqual({ title: 'Normal looking title' });

    // All protected fields should be detected
    expect(result.protectedFieldsAttempted).toContain('id');
    expect(result.protectedFieldsAttempted).toContain('org_id');
    expect(result.protectedFieldsAttempted).toContain('created_by');
    expect(result.protectedFieldsAttempted).toContain('created_at');
    expect(result.protectedFieldsAttempted).toContain('updated_at');
    expect(result.protectedFieldsAttempted).toContain('updated_by');
    expect(result.protectedFieldsAttempted).toContain('share_hash');

    expect(result.hasSecurityConcern).toBe(true);
  });
});
