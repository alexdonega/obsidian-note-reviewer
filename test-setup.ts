// Note: Using minimal DOM setup for cookie tests
// happy-dom's cookie implementation doesn't fully support all cookie attributes

// Minimal DOM setup for cookie-based tests
// This provides just enough to test document.cookie operations
const minimalDocument = {
  _cookies: {} as Record<string, string>,
  get cookie(): string {
    return Object.entries(this._cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  },
  set cookie(value: string) {
    // Parse cookie string
    const parts = value.split(';').map(p => p.trim());
    const [keyValue, ...attrs] = parts;
    const eqIndex = keyValue.indexOf('=');
    const key = keyValue.substring(0, eqIndex);
    const val = keyValue.substring(eqIndex + 1);

    // Check for max-age=0 (deletion)
    const isDelete = attrs.some(a => a.toLowerCase().startsWith('max-age=0'));

    if (isDelete) {
      delete this._cookies[key];
    } else if (key) {
      this._cookies[key] = val;
    }
  }
};

const minimalWindow = {
  isSecureContext: true, // Assume secure context for testing
  location: {
    protocol: 'https:',
    hostname: 'localhost'
  },
  document: minimalDocument,
  navigator: {}
};

// @ts-ignore - Minimal implementation for testing
global.document = minimalDocument as any;
// @ts-ignore
global.window = minimalWindow as any;
// @ts-ignore
global.navigator = minimalWindow.navigator as any;
