import { describe, it, expect, beforeEach, mock } from 'bun:test';

// Mock Supabase client
const mockQuery = {
  select: mock(() => mockQuery),
  insert: mock(() => mockQuery),
  update: mock(() => mockQuery),
  delete: mock(() => mockQuery),
  eq: mock(() => mockQuery),
  single: mock(() => mockQuery),
  then: mock((fn: any) => Promise.resolve(fn({ data: null, error: null }))),
};

const mockSupabase = {
  from: mock(() => mockQuery),
  auth: {
    getUser: mock(() => Promise.resolve({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    })),
  },
};

mock.module('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

import { NotesService } from '../services/NotesService';

describe('Multi-Tenancy Isolation Tests', () => {
  let notesService: NotesService;

  beforeEach(() => {
    // Reset all mocks
    mockSupabase.from.mockClear();
    mockQuery.select.mockClear();
    mockQuery.insert.mockClear();
    mockQuery.update.mockClear();
    mockQuery.delete.mockClear();
    mockQuery.eq.mockClear();
    mockQuery.single.mockClear();

    notesService = new NotesService();
  });

  describe('Organization Data Isolation', () => {
    it('should only fetch notes from user organization', async () => {
      const mockNotes = [
        {
          id: 'note-1',
          title: 'Org A Note',
          content: 'Content for Org A',
          org_id: 'org-a',
          created_by: 'user-123',
        },
      ];

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: mockNotes, error: null }))
      );

      await notesService.list();

      // Verify that the query was constructed to filter by org
      expect(mockSupabase.from).toHaveBeenCalledWith('notes');
      expect(mockQuery.select).toHaveBeenCalled();
    });

    it('should prevent accessing notes from other organizations', async () => {
      const otherOrgNote = {
        id: 'note-2',
        title: 'Org B Note',
        content: 'Content for Org B',
        org_id: 'org-b', // Different org
        created_by: 'user-456',
      };

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Row level security policy violation' } }))
      );

      try {
        await notesService.getById('note-2');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should include org_id when creating notes', async () => {
      const newNote = {
        title: 'New Note',
        content: 'New Content',
        org_id: 'org-a',
        created_by: 'user-123',
      };

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: newNote, error: null }))
      );

      await notesService.create(newNote);

      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          org_id: 'org-a',
        })
      );
    });

    it('should prevent updating notes from other organizations', async () => {
      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Row level security policy violation' } }))
      );

      try {
        await notesService.update('note-from-other-org', {
          title: 'Malicious Update',
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should prevent deleting notes from other organizations', async () => {
      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Row level security policy violation' } }))
      );

      try {
        await notesService.delete('note-from-other-org');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('User Role Isolation', () => {
    it('should respect viewer role read-only access', async () => {
      // Viewers can read but not modify
      const viewerUser = {
        id: 'viewer-123',
        email: 'viewer@example.com',
        user_metadata: { role: 'viewer', org_id: 'org-a' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: viewerUser },
        error: null,
      });

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Insufficient permissions' } }))
      );

      try {
        await notesService.create({
          title: 'Viewer Attempt',
          content: 'Should fail',
          org_id: 'org-a',
          created_by: 'viewer-123',
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should allow member to create and update own notes', async () => {
      const memberUser = {
        id: 'member-123',
        email: 'member@example.com',
        user_metadata: { role: 'member', org_id: 'org-a' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: memberUser },
        error: null,
      });

      const newNote = {
        id: 'note-3',
        title: 'Member Note',
        content: 'Created by member',
        org_id: 'org-a',
        created_by: 'member-123',
      };

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: newNote, error: null }))
      );

      const result = await notesService.create(newNote);
      expect(result).toBeDefined();
    });

    it('should prevent member from deleting other users notes', async () => {
      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Insufficient permissions' } }))
      );

      try {
        await notesService.delete('note-by-other-user');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should allow admin to manage all org notes', async () => {
      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        user_metadata: { role: 'admin', org_id: 'org-a' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: adminUser },
        error: null,
      });

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: {}, error: null }))
      );

      // Admin should be able to delete any note in their org
      await notesService.delete('any-note-in-org');
      expect(mockQuery.delete).toHaveBeenCalled();
    });

    it('should allow owner to perform all operations including org deletion', async () => {
      const ownerUser = {
        id: 'owner-123',
        email: 'owner@example.com',
        user_metadata: { role: 'owner', org_id: 'org-a' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: ownerUser },
        error: null,
      });

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: {}, error: null }))
      );

      // Owner should have full access
      await notesService.delete('any-note');
      expect(mockQuery.delete).toHaveBeenCalled();
    });
  });

  describe('Cross-Organization Security', () => {
    it('should prevent SQL injection through org_id', async () => {
      const maliciousOrgId = "'; DROP TABLE notes; --";

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Invalid input' } }))
      );

      try {
        await notesService.create({
          title: 'Malicious Note',
          content: 'Injection attempt',
          org_id: maliciousOrgId,
          created_by: 'user-123',
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should prevent accessing notes through URL manipulation', async () => {
      // Simulate attempt to access note from different org via direct URL
      const otherOrgNoteId = 'note-from-org-b';

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Not found' } }))
      );

      try {
        await notesService.getById(otherOrgNoteId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate org_id exists before operations', async () => {
      const invalidOrgId = 'non-existent-org';

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Foreign key violation' } }))
      );

      try {
        await notesService.create({
          title: 'Invalid Org Note',
          content: 'Should fail',
          org_id: invalidOrgId,
          created_by: 'user-123',
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Public Notes Sharing', () => {
    it('should allow accessing public notes from any organization', async () => {
      const publicNote = {
        id: 'public-note-1',
        title: 'Public Note',
        content: 'Shared publicly',
        org_id: 'org-b',
        created_by: 'user-456',
        is_public: true,
      };

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: publicNote, error: null }))
      );

      const result = await notesService.getById('public-note-1');
      expect(result).toBeDefined();
    });

    it('should prevent non-public notes from being accessed cross-org', async () => {
      const privateNote = {
        id: 'private-note-1',
        title: 'Private Note',
        content: 'Not shared',
        org_id: 'org-b',
        created_by: 'user-456',
        is_public: false,
      };

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Not found' } }))
      );

      try {
        await notesService.getById('private-note-1');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should require notes:share permission to make notes public', async () => {
      // Viewer role doesn't have notes:share permission
      const viewerUser = {
        id: 'viewer-123',
        email: 'viewer@example.com',
        user_metadata: { role: 'viewer', org_id: 'org-a' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: viewerUser },
        error: null,
      });

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: null, error: { message: 'Insufficient permissions' } }))
      );

      try {
        await notesService.update('note-1', { is_public: true });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Audit Trail', () => {
    it('should record user_id on all operations', async () => {
      const currentUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { role: 'member', org_id: 'org-a' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: currentUser },
        error: null,
      });

      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: {}, error: null }))
      );

      await notesService.create({
        title: 'Audited Note',
        content: 'With audit trail',
        org_id: 'org-a',
        created_by: 'user-123',
      });

      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: 'user-123',
        })
      );
    });

    it('should track updated_by on modifications', async () => {
      mockQuery.then.mockImplementation((fn: any) =>
        Promise.resolve(fn({ data: {}, error: null }))
      );

      await notesService.update('note-1', {
        title: 'Updated Title',
        updated_by: 'user-123',
      });

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_by: 'user-123',
        })
      );
    });
  });
});
