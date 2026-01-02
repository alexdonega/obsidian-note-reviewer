import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { hasPermission, hasAnyPermission, hasAllPermissions, type Permission, type UserRole } from '../lib/permissions';
import { log } from '../lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    log.info('Unauthorized access attempt - redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  // Check permissions if required
  if (user && (requiredPermission || requiredPermissions)) {
    const userRole = (user.user_metadata?.role || 'viewer') as UserRole;

    let hasAccess = true;

    if (requiredPermission) {
      hasAccess = hasPermission(userRole, requiredPermission);
    } else if (requiredPermissions) {
      hasAccess = requireAll
        ? hasAllPermissions(userRole, requiredPermissions)
        : hasAnyPermission(userRole, requiredPermissions);
    }

    if (!hasAccess) {
      log.warn('Insufficient permissions', {
        userId: user.id,
        userRole,
        requiredPermission,
        requiredPermissions,
      });

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="max-w-md p-8 bg-card border border-border rounded-xl text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this resource.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Convenience components for common permission checks
export function OwnerOnlyRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) {
  return (
    <ProtectedRoute requiredPermission="org:delete" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) {
  return (
    <ProtectedRoute requiredPermission="org:update" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function MemberRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) {
  return (
    <ProtectedRoute requiredPermission="notes:create" {...props}>
      {children}
    </ProtectedRoute>
  );
}
