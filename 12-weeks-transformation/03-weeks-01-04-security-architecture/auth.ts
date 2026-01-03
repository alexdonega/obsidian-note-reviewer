import { supabase } from './supabase';
import { log } from './logger';

export const auth = {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: { name?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      log.info('User signed up successfully', { email });
      return data;
    } catch (error) {
      log.error('Sign up failed', error, { email });
      throw error;
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      log.info('User signed in successfully', { email });
      return data;
    } catch (error) {
      log.error('Sign in failed', error, { email });
      throw error;
    }
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'github') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      log.info('OAuth sign in initiated', { provider });
      return data;
    } catch (error) {
      log.error('OAuth sign in failed', error, { provider });
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      log.info('User signed out successfully');
    } catch (error) {
      log.error('Sign out failed', error);
      throw error;
    }
  },

  /**
   * Get current user
   */
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      log.error('Get user failed', error);
      throw error;
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      log.error('Get session failed', error);
      throw error;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      log.debug('Auth state changed', { event });
      callback(session?.user ?? null);
    });
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      log.info('Password reset email sent', { email });
    } catch (error) {
      log.error('Password reset failed', error, { email });
      throw error;
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      log.info('Password updated successfully');
    } catch (error) {
      log.error('Password update failed', error);
      throw error;
    }
  }
};
