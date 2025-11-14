/**
 * Robust Service Worker for Vite/React PWA
 * Implements multiple caching strategies, offline support, and proper cache management
 */

// Version - increment this when you want to force a cache update
const VERSION = '1.0.2';
const CACHE_NAME = `healthintegrityproject-v${VERSION}`;
const RUNTIME_CACHE = `healthintegrityproject-runtime-v${VERSION}`;
const MAX_RUNTIME_CACHE_SIZE = 50; // Maximum number of items in runtime cache

// Critical assets to precache during installation
const PRECACHE_URLS = [
  '/',
  '/workflow',
  '/claims',
  '/community',
  '/offline.html', // You should create this fallback page
];

// URLs that should never be cached
const NETWORK_ONLY_PATTERNS = [
  /\/api\//,
  /supabase\.co/,
  /\/auth\//,
  /accounts\.google\.com/,
  /oauth/,
  /token/,
];

// URLs that should use cache-first strategy (static assets)
const CACHE_FIRST_PATTERNS = [
  /\.(?:js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/,
  /\/assets\//,
  /\/static\//,
];

/**
 * Check if a URL matches network-only patterns
 */
function isNetworkOnly(url) {
  return NETWORK_ONLY_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Check if a URL should use cache-first strategy
 */
function isCacheFirst(url) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Limit the size of a cache by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Delete oldest entries (FIFO)
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`Trimmed ${keysToDelete.length} items from ${cacheName}`);
  }
}

/**
 * Install event - precache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing, version:', VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Precaching critical assets');
        // Use addAll for atomic operation - either all succeed or all fail
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('Precaching complete');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Precaching failed:', error);
        // If precaching fails, the service worker won't install
        throw error;
      })
  );
});

/**
 * Activate event - clean up old caches and take control
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating, version:', VERSION);

  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Delete any cache that doesn't match current version
              return cacheName.startsWith('healthintegrityproject-') &&
                     cacheName !== CACHE_NAME &&
                     cacheName !== RUNTIME_CACHE;
            })
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated and ready');
    })
  );
});

/**
 * Message event - handle commands from the page
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Received CLEAR_CACHE message');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

/**
 * Cache-first strategy: Check cache first, fallback to network
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());

      // Limit cache size in background
      limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache-first fetch failed:', error);
    throw error;
  }
}

/**
 * Network-first strategy: Try network, fallback to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());

      // Limit cache size in background
      limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's a navigation request and we have an offline page, show it
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

/**
 * Fetch event - route requests to appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests and GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // Network-only for API calls and auth
  if (isNetworkOnly(url.href)) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first for static assets
  if (isCacheFirst(url.href)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for HTML pages (navigation)
  event.respondWith(networkFirst(request));
});

/**
 * Periodic cache cleanup (runs in background)
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE)
  );
});

console.log('Service Worker loaded, version:', VERSION);
