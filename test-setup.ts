import '@testing-library/jest-dom';
import { Window } from 'happy-dom';

// Mock environment variables for Supabase
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key-12345';
process.env.VITE_SENTRY_DSN = '';
process.env.VITE_LOG_LEVEL = 'silent';
process.env.NODE_ENV = 'test';

// Setup DOM para testes
const window = new Window();
global.document = window.document;
global.window = window as any;
global.navigator = window.navigator;

// Mock import.meta.env for Vite
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key-12345',
  VITE_SENTRY_DSN: '',
  VITE_LOG_LEVEL: 'silent',
  MODE: 'test',
  DEV: false,
  PROD: false,
};

// Make import.meta.env available globally
(global as any).importMetaEnv = mockEnv;
