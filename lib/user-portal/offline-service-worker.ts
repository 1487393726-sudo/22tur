/**
 * Offline Service Worker Utilities for User Portal
 * Handles offline functionality and service worker registration
 */

export interface ServiceWorkerConfig {
  scriptPath?: string;
  scope?: string;
  updateInterval?: number;
}

export interface CacheConfig {
  name: string;
  version?: number;
  urls?: string[];
}

export interface OfflineRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
}

export interface OfflineResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(
  config: ServiceWorkerConfig = {}
): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  const { scriptPath = '/sw.js', scope = '/', updateInterval = 3600000 } = config;

  try {
    const registration = await navigator.serviceWorker.register(scriptPath, { scope });
    console.log('Service Worker registered successfully');

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, updateInterval);

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Worker unregistered successfully');
    return true;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if service worker is active
 */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.length > 0 && registrations[0].active !== undefined;
  } catch (error) {
    console.error('Error checking service worker status:', error);
    return false;
  }
}

/**
 * Cache API utilities
 */
export async function openCache(name: string): Promise<Cache | null> {
  if (typeof caches === 'undefined') {
    return null;
  }

  try {
    return await caches.open(name);
  } catch (error) {
    console.error('Error opening cache:', error);
    return null;
  }
}

/**
 * Add URLs to cache
 */
export async function addToCache(cacheName: string, urls: string[]): Promise<boolean> {
  const cache = await openCache(cacheName);
  if (!cache) return false;

  try {
    await cache.addAll(urls);
    return true;
  } catch (error) {
    console.error('Error adding to cache:', error);
    return false;
  }
}

/**
 * Get cached response
 */
export async function getCachedResponse(
  cacheName: string,
  url: string
): Promise<Response | null> {
  const cache = await openCache(cacheName);
  if (!cache) return null;

  try {
    return await cache.match(url);
  } catch (error) {
    console.error('Error getting cached response:', error);
    return null;
  }
}

/**
 * Cache response
 */
export async function cacheResponse(
  cacheName: string,
  url: string,
  response: Response
): Promise<boolean> {
  const cache = await openCache(cacheName);
  if (!cache) return false;

  try {
    await cache.put(url, response.clone());
    return true;
  } catch (error) {
    console.error('Error caching response:', error);
    return false;
  }
}

/**
 * Delete cache
 */
export async function deleteCache(cacheName: string): Promise<boolean> {
  if (typeof caches === 'undefined') {
    return false;
  }

  try {
    return await caches.delete(cacheName);
  } catch (error) {
    console.error('Error deleting cache:', error);
    return false;
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<boolean> {
  if (typeof caches === 'undefined') {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    return true;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(cacheName: string): Promise<number> {
  const cache = await openCache(cacheName);
  if (!cache) return 0;

  try {
    const keys = await cache.keys();
    let size = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        size += blob.size;
      }
    }

    return size;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}

/**
 * Store offline request
 */
export function storeOfflineRequest(request: OfflineRequest): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const requests = JSON.parse(localStorage.getItem('offline_requests') || '[]');
    requests.push(request);
    localStorage.setItem('offline_requests', JSON.stringify(requests));
  } catch (error) {
    console.error('Error storing offline request:', error);
  }
}

/**
 * Get offline requests
 */
export function getOfflineRequests(): OfflineRequest[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem('offline_requests') || '[]');
  } catch (error) {
    console.error('Error getting offline requests:', error);
    return [];
  }
}

/**
 * Clear offline requests
 */
export function clearOfflineRequests(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('offline_requests');
  } catch (error) {
    console.error('Error clearing offline requests:', error);
  }
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function listenToOnlineOfflineEvents(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Sync offline requests when online
 */
export async function syncOfflineRequests(): Promise<boolean> {
  if (!isOnline()) {
    return false;
  }

  const requests = getOfflineRequests();
  let successCount = 0;

  for (const request of requests) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      if (response.ok) {
        successCount++;
      }
    } catch (error) {
      console.error('Error syncing offline request:', error);
    }
  }

  if (successCount === requests.length) {
    clearOfflineRequests();
  }

  return successCount > 0;
}

/**
 * Offline functionality configuration
 */
export const OFFLINE_CONFIG = {
  CACHE_NAME: 'user-portal-cache-v1',
  RUNTIME_CACHE_NAME: 'user-portal-runtime-cache-v1',
  OFFLINE_PAGE: '/offline.html',
  OFFLINE_TIMEOUT: 5000,
  MAX_OFFLINE_REQUESTS: 50,
  SYNC_INTERVAL: 30000,
};

/**
 * Service Worker script template
 */
export const SERVICE_WORKER_TEMPLATE = `
const CACHE_NAME = 'user-portal-cache-v1';
const RUNTIME_CACHE_NAME = 'user-portal-runtime-cache-v1';
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        return caches.match(OFFLINE_PAGE);
      });
    })
  );
});
`;
