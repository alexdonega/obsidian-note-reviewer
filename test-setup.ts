// Using happy-dom global registrator for full DOM support in tests
import { GlobalRegistrator } from '@happy-dom/global-registrator';

// Register all browser globals
GlobalRegistrator.register({
  url: 'https://localhost:3000',
  width: 1024,
  height: 768,
});

// Set secure context (needed for some storage operations)
Object.defineProperty(window, 'isSecureContext', {
  value: true,
  writable: false,
  configurable: true,
});

// Polyfill for TextEncoder/TextDecoder if not available
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
