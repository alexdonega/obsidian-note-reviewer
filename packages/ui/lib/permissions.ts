export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type Permission =
  | 'notes:create'
  | 'notes:read'
  | 'notes:update'
  | 'notes:delete'
  | 'notes:share'
  | 'annotations:create'
  | 'annotations:read'
  | 'annotations:update'
  | 'annotations:delete'
  | 'users:invite'
  | 'users:remove'
  | 'users:update-role'
  | 'org:update'
  | 'org:delete';

const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    // Full access
    'notes:create',
    'notes:read',
    'notes:update',
    'notes:delete',
    'notes:share',
    'annotations:create',
    'annotations:read',
    'annotations:update',
    'annotations:delete',
    'users:invite',
    'users:remove',
    'users:update-role',
    'org:update',
    'org:delete',
  ],
  admin: [
    // Everything except org deletion
    'notes:create',
    'notes:read',
    'notes:update',
    'notes:delete',
    'notes:share',
    'annotations:create',
    'annotations:read',
    'annotations:update',
    'annotations:delete',
    'users:invite',
    'users:remove',
    'users:update-role',
    'org:update',
  ],
  member: [
    // Can create and manage own content
    'notes:create',
    'notes:read',
    'notes:update',
    'notes:delete',
    'notes:share',
    'annotations:create',
    'annotations:read',
    'annotations:update',
    'annotations:delete',
  ],
  viewer: [
    // Read-only access
    'notes:read',
    'annotations:read',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'users:invite');
}

export function canDeleteOrg(role: UserRole): boolean {
  return hasPermission(role, 'org:delete');
}

export function canUpdateOrg(role: UserRole): boolean {
  return hasPermission(role, 'org:update');
}
