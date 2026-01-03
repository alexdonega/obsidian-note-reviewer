import { describe, it, expect } from 'bun:test';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canManageUsers,
  canDeleteOrg,
  canUpdateOrg,
  type UserRole,
  type Permission,
} from '../lib/permissions';

describe('RBAC Permissions System', () => {
  describe('Owner Role', () => {
    const role: UserRole = 'owner';

    it('should have all permissions', () => {
      expect(hasPermission(role, 'notes:create')).toBe(true);
      expect(hasPermission(role, 'notes:read')).toBe(true);
      expect(hasPermission(role, 'notes:update')).toBe(true);
      expect(hasPermission(role, 'notes:delete')).toBe(true);
      expect(hasPermission(role, 'notes:share')).toBe(true);
      expect(hasPermission(role, 'annotations:create')).toBe(true);
      expect(hasPermission(role, 'annotations:read')).toBe(true);
      expect(hasPermission(role, 'annotations:update')).toBe(true);
      expect(hasPermission(role, 'annotations:delete')).toBe(true);
      expect(hasPermission(role, 'users:invite')).toBe(true);
      expect(hasPermission(role, 'users:remove')).toBe(true);
      expect(hasPermission(role, 'users:update-role')).toBe(true);
      expect(hasPermission(role, 'org:update')).toBe(true);
      expect(hasPermission(role, 'org:delete')).toBe(true);
    });

    it('should be able to manage users', () => {
      expect(canManageUsers(role)).toBe(true);
    });

    it('should be able to delete organization', () => {
      expect(canDeleteOrg(role)).toBe(true);
    });

    it('should be able to update organization', () => {
      expect(canUpdateOrg(role)).toBe(true);
    });
  });

  describe('Admin Role', () => {
    const role: UserRole = 'admin';

    it('should have all permissions except org deletion', () => {
      expect(hasPermission(role, 'notes:create')).toBe(true);
      expect(hasPermission(role, 'notes:delete')).toBe(true);
      expect(hasPermission(role, 'users:invite')).toBe(true);
      expect(hasPermission(role, 'org:update')).toBe(true);
      expect(hasPermission(role, 'org:delete')).toBe(false);
    });

    it('should be able to manage users', () => {
      expect(canManageUsers(role)).toBe(true);
    });

    it('should NOT be able to delete organization', () => {
      expect(canDeleteOrg(role)).toBe(false);
    });

    it('should be able to update organization', () => {
      expect(canUpdateOrg(role)).toBe(true);
    });
  });

  describe('Member Role', () => {
    const role: UserRole = 'member';

    it('should have content management permissions only', () => {
      expect(hasPermission(role, 'notes:create')).toBe(true);
      expect(hasPermission(role, 'notes:read')).toBe(true);
      expect(hasPermission(role, 'notes:update')).toBe(true);
      expect(hasPermission(role, 'notes:delete')).toBe(true);
      expect(hasPermission(role, 'notes:share')).toBe(true);
      expect(hasPermission(role, 'annotations:create')).toBe(true);
      expect(hasPermission(role, 'annotations:read')).toBe(true);
      expect(hasPermission(role, 'annotations:update')).toBe(true);
      expect(hasPermission(role, 'annotations:delete')).toBe(true);
    });

    it('should NOT have user management permissions', () => {
      expect(hasPermission(role, 'users:invite')).toBe(false);
      expect(hasPermission(role, 'users:remove')).toBe(false);
      expect(hasPermission(role, 'users:update-role')).toBe(false);
    });

    it('should NOT have org management permissions', () => {
      expect(hasPermission(role, 'org:update')).toBe(false);
      expect(hasPermission(role, 'org:delete')).toBe(false);
    });

    it('should NOT be able to manage users', () => {
      expect(canManageUsers(role)).toBe(false);
    });

    it('should NOT be able to delete organization', () => {
      expect(canDeleteOrg(role)).toBe(false);
    });

    it('should NOT be able to update organization', () => {
      expect(canUpdateOrg(role)).toBe(false);
    });
  });

  describe('Viewer Role', () => {
    const role: UserRole = 'viewer';

    it('should have read-only permissions', () => {
      expect(hasPermission(role, 'notes:read')).toBe(true);
      expect(hasPermission(role, 'annotations:read')).toBe(true);
    });

    it('should NOT have write permissions', () => {
      expect(hasPermission(role, 'notes:create')).toBe(false);
      expect(hasPermission(role, 'notes:update')).toBe(false);
      expect(hasPermission(role, 'notes:delete')).toBe(false);
      expect(hasPermission(role, 'notes:share')).toBe(false);
      expect(hasPermission(role, 'annotations:create')).toBe(false);
      expect(hasPermission(role, 'annotations:update')).toBe(false);
      expect(hasPermission(role, 'annotations:delete')).toBe(false);
    });

    it('should NOT have any management permissions', () => {
      expect(hasPermission(role, 'users:invite')).toBe(false);
      expect(hasPermission(role, 'users:remove')).toBe(false);
      expect(hasPermission(role, 'users:update-role')).toBe(false);
      expect(hasPermission(role, 'org:update')).toBe(false);
      expect(hasPermission(role, 'org:delete')).toBe(false);
    });

    it('should NOT be able to manage users', () => {
      expect(canManageUsers(role)).toBe(false);
    });

    it('should NOT be able to delete organization', () => {
      expect(canDeleteOrg(role)).toBe(false);
    });

    it('should NOT be able to update organization', () => {
      expect(canUpdateOrg(role)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has ANY of the required permissions', () => {
      const memberRole: UserRole = 'member';
      const permissions: Permission[] = ['users:invite', 'notes:create'];
      expect(hasAnyPermission(memberRole, permissions)).toBe(true);
    });

    it('should return false if user has NONE of the required permissions', () => {
      const viewerRole: UserRole = 'viewer';
      const permissions: Permission[] = ['users:invite', 'notes:create'];
      expect(hasAnyPermission(viewerRole, permissions)).toBe(false);
    });

    it('should return true if user has all requested permissions', () => {
      const ownerRole: UserRole = 'owner';
      const permissions: Permission[] = ['users:invite', 'notes:create', 'org:delete'];
      expect(hasAnyPermission(ownerRole, permissions)).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has ALL required permissions', () => {
      const memberRole: UserRole = 'member';
      const permissions: Permission[] = ['notes:create', 'notes:read', 'notes:update'];
      expect(hasAllPermissions(memberRole, permissions)).toBe(true);
    });

    it('should return false if user is missing ANY required permission', () => {
      const memberRole: UserRole = 'member';
      const permissions: Permission[] = ['notes:create', 'users:invite'];
      expect(hasAllPermissions(memberRole, permissions)).toBe(false);
    });

    it('should return true for owner with any permissions', () => {
      const ownerRole: UserRole = 'owner';
      const permissions: Permission[] = [
        'notes:create',
        'users:invite',
        'org:delete',
        'annotations:update',
      ];
      expect(hasAllPermissions(ownerRole, permissions)).toBe(true);
    });

    it('should return false for viewer with write permissions', () => {
      const viewerRole: UserRole = 'viewer';
      const permissions: Permission[] = ['notes:read', 'notes:create'];
      expect(hasAllPermissions(viewerRole, permissions)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return false for invalid role', () => {
      const invalidRole = 'invalid' as UserRole;
      expect(hasPermission(invalidRole, 'notes:create')).toBe(false);
    });

    it('should handle empty permissions array in hasAnyPermission', () => {
      const memberRole: UserRole = 'member';
      expect(hasAnyPermission(memberRole, [])).toBe(false);
    });

    it('should handle empty permissions array in hasAllPermissions', () => {
      const memberRole: UserRole = 'member';
      expect(hasAllPermissions(memberRole, [])).toBe(true);
    });

    it('should return false for permission not in system', () => {
      const ownerRole: UserRole = 'owner';
      const fakePermission = 'fake:permission' as Permission;
      expect(hasPermission(ownerRole, fakePermission)).toBe(false);
    });
  });

  describe('Permission Hierarchy', () => {
    it('should verify owner > admin > member > viewer hierarchy', () => {
      const testPermission: Permission = 'org:delete';

      expect(hasPermission('owner', testPermission)).toBe(true);
      expect(hasPermission('admin', testPermission)).toBe(false);
      expect(hasPermission('member', testPermission)).toBe(false);
      expect(hasPermission('viewer', testPermission)).toBe(false);
    });

    it('should verify admin can do everything except delete org', () => {
      const adminRole: UserRole = 'admin';

      expect(hasPermission(adminRole, 'notes:create')).toBe(true);
      expect(hasPermission(adminRole, 'users:invite')).toBe(true);
      expect(hasPermission(adminRole, 'org:update')).toBe(true);
      expect(hasPermission(adminRole, 'org:delete')).toBe(false);
    });

    it('should verify member has subset of admin permissions', () => {
      const memberRole: UserRole = 'member';

      // Member can manage content
      expect(hasPermission(memberRole, 'notes:create')).toBe(true);
      expect(hasPermission(memberRole, 'annotations:create')).toBe(true);

      // But cannot manage users or org
      expect(hasPermission(memberRole, 'users:invite')).toBe(false);
      expect(hasPermission(memberRole, 'org:update')).toBe(false);
    });

    it('should verify viewer has most restrictive permissions', () => {
      const viewerRole: UserRole = 'viewer';

      // Viewer can only read
      expect(hasPermission(viewerRole, 'notes:read')).toBe(true);
      expect(hasPermission(viewerRole, 'annotations:read')).toBe(true);

      // Viewer cannot write
      expect(hasPermission(viewerRole, 'notes:create')).toBe(false);
      expect(hasPermission(viewerRole, 'annotations:create')).toBe(false);
    });
  });
});
