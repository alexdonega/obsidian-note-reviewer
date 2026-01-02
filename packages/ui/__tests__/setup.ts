// Test setup file
// This file is loaded before all tests

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_SENTRY_DSN = '';
process.env.VITE_LOG_LEVEL = 'silent';

// Mock import.meta.env for Vite
globalThis.import = globalThis.import || {};
(globalThis.import as any).meta = {
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_SENTRY_DSN: '',
    VITE_LOG_LEVEL: 'silent',
    MODE: 'test',
    DEV: false,
  },
};
