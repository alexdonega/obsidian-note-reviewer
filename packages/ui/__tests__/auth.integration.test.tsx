import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { LoginForm } from '../components/LoginForm';
import { SignupForm } from '../components/SignupForm';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';
import type { UserRole, Permission } from '../lib/permissions';

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: mock(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: mock(() => Promise.resolve({ data: { user: { id: '123', email: 'test@example.com' } }, error: null })),
    signInWithOAuth: mock(() => Promise.resolve({ data: {}, error: null })),
    signOut: mock(() => Promise.resolve({ error: null })),
    getUser: mock(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: mock(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: mock(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
    resetPasswordForEmail: mock(() => Promise.resolve({ error: null })),
    updateUser: mock(() => Promise.resolve({ error: null })),
  },
};

mock.module('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSupabase.auth.signUp.mockClear();
    mockSupabase.auth.signInWithPassword.mockClear();
    mockSupabase.auth.signInWithOAuth.mockClear();
    mockSupabase.auth.signOut.mockClear();
  });

  describe('SignupForm', () => {
    it('should render signup form with all fields', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <SignupForm />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/name/i)).toBeDefined();
      expect(screen.getByLabelText(/email/i)).toBeDefined();
      expect(screen.getByLabelText(/^password/i)).toBeDefined();
      expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeDefined();
    });

    it('should validate password requirements', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <SignupForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeDefined();
      });
    });

    it('should validate password confirmation match', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <SignupForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPass123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeDefined();
      });
    });

    it('should call signUp with correct data on valid submission', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <SignupForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
      fireEvent.change(confirmInput, { target: { value: 'StrongPass123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'StrongPass123',
            options: expect.objectContaining({
              data: { name: 'Test User' },
            }),
          })
        );
      });
    });

    it('should handle OAuth signup for Google', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <SignupForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByText(/google/i).closest('button');
      if (googleButton) {
        fireEvent.click(googleButton);

        await waitFor(() => {
          expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith(
            expect.objectContaining({
              provider: 'google',
            })
          );
        });
      }
    });
  });

  describe('LoginForm', () => {
    it('should render login form with email and password fields', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeDefined();
      expect(screen.getByLabelText(/password/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
    });

    it('should call signIn with correct credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should display error message on failed login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeDefined();
      });
    });

    it('should handle OAuth login for GitHub', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const githubButton = screen.getByText(/github/i).closest('button');
      if (githubButton) {
        fireEvent.click(githubButton);

        await waitFor(() => {
          expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith(
            expect.objectContaining({
              provider: 'github',
            })
          );
        });
      }
    });
  });

  describe('RBAC Permissions', () => {
    it('should grant all permissions to owner role', () => {
      const role: UserRole = 'owner';
      expect(hasPermission(role, 'notes:create')).toBe(true);
      expect(hasPermission(role, 'notes:delete')).toBe(true);
      expect(hasPermission(role, 'users:invite')).toBe(true);
      expect(hasPermission(role, 'org:delete')).toBe(true);
    });

    it('should deny org deletion to admin role', () => {
      const role: UserRole = 'admin';
      expect(hasPermission(role, 'notes:create')).toBe(true);
      expect(hasPermission(role, 'org:update')).toBe(true);
      expect(hasPermission(role, 'org:delete')).toBe(false);
    });

    it('should limit member to content permissions only', () => {
      const role: UserRole = 'member';
      expect(hasPermission(role, 'notes:create')).toBe(true);
      expect(hasPermission(role, 'notes:read')).toBe(true);
      expect(hasPermission(role, 'users:invite')).toBe(false);
      expect(hasPermission(role, 'org:update')).toBe(false);
    });

    it('should restrict viewer to read-only permissions', () => {
      const role: UserRole = 'viewer';
      expect(hasPermission(role, 'notes:read')).toBe(true);
      expect(hasPermission(role, 'annotations:read')).toBe(true);
      expect(hasPermission(role, 'notes:create')).toBe(false);
      expect(hasPermission(role, 'notes:delete')).toBe(false);
    });

    it('should check if user has any of the required permissions', () => {
      const role: UserRole = 'member';
      const permissions: Permission[] = ['users:invite', 'notes:create'];
      expect(hasAnyPermission(role, permissions)).toBe(true);
    });

    it('should check if user has all required permissions', () => {
      const role: UserRole = 'member';
      const permissions: Permission[] = ['notes:create', 'notes:read'];
      expect(hasAllPermissions(role, permissions)).toBe(true);

      const restrictedPermissions: Permission[] = ['notes:create', 'users:invite'];
      expect(hasAllPermissions(role, restrictedPermissions)).toBe(false);
    });
  });

  describe('ProtectedRoute', () => {
    const TestComponent = () => <div>Protected Content</div>;

    it('should show loading state while checking auth', () => {
      mockSupabase.auth.getUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it('should redirect to login when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).toBeNull();
      });
    });

    it('should render children when user is authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            user_metadata: { role: 'member' },
          },
        },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeDefined();
      });
    });

    it('should deny access when user lacks required permission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            user_metadata: { role: 'viewer' },
          },
        },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute requiredPermission="notes:create">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeDefined();
        expect(screen.queryByText('Protected Content')).toBeNull();
      });
    });

    it('should grant access when user has required permission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            user_metadata: { role: 'member' },
          },
        },
        error: null,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute requiredPermission="notes:create">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeDefined();
      });
    });
  });
});
