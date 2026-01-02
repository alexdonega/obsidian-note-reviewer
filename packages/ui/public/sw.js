// Service Worker for Obsidian Note Reviewer
// Version: 1.0.0

const CACHE_VERSION = 'v1.0.0';
const CACHE_STATIC = `static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `dynamic-${CACHE_VERSION}`;
const CACHE_API = `api-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_API_CACHE_SIZE = 30;

// Cache-first patterns (fonts, images, etc)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
  /\.(?:woff|woff2|ttf|eot)$/,
  /\.(?:css|js)$/,
];

// Network-first patterns (API calls)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /supabase\.co/,
];

// Stale-while-revalidate patterns (data that can be slightly outdated)
const STALE_WHILE_REVALIDATE_PATTERNS = [
  /\/notes\//,
  /\/annotations\//,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('static-') ||
                   cacheName.startsWith('dynamic-') ||
                   cacheName.startsWith('api-');
          })
          .filter((cacheName) => {
            return !cacheName.includes(CACHE_VERSION);
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and browser internal requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'about:') {
    return;
  }

  // Determine caching strategy
  if (shouldCacheFirst(url.href)) {
    event.respondWith(cacheFirst(request));
  } else if (shouldNetworkFirst(url.href)) {
    event.respondWith(networkFirst(request));
  } else if (shouldStaleWhileRevalidate(url.href)) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Cache-First Strategy (for static assets)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_STATIC);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-First Strategy (for API calls)
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_API);
      cache.put(request, response.clone());

      // Limit cache size
      limitCacheSize(CACHE_API, MAX_API_CACHE_SIZE);
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(CACHE_API);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page or error
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No network connection' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale-While-Revalidate Strategy (for data that can be slightly outdated)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
      limitCacheSize(CACHE_DYNAMIC, MAX_DYNAMIC_CACHE_SIZE);
    }
    return response;
  }).catch(() => {
    // Network failed, but we might have cache
    return cached || new Response('Offline', { status: 503 });
  });

  // Return cached version immediately if available, otherwise wait for network
  return cached || fetchPromise;
}

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Delete oldest entries (FIFO)
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Helper: Check if URL should use cache-first
function shouldCacheFirst(url) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url));
}

// Helper: Check if URL should use network-first
function shouldNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url));
}

// Helper: Check if URL should use stale-while-revalidate
function shouldStaleWhileRevalidate(url) {
  return STALE_WHILE_REVALIDATE_PATTERNS.some(pattern => pattern.test(url));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

async function syncNotes() {
  // Retrieve pending actions from IndexedDB and sync
  console.log('[SW] Syncing notes...');

  try {
    // This would connect to your actual sync logic
    const response = await fetch('/api/notes/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      console.log('[SW] Notes synced successfully');
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error; // Retry sync
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Obsidian Note Reviewer';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Message from client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_DYNAMIC).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded', CACHE_VERSION);
