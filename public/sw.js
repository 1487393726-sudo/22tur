/**
 * Service Worker
 * PWA 离线缓存和推送通知
 */

const CACHE_NAME = 'creative-journey-v1';
const STATIC_CACHE_NAME = 'creative-journey-static-v1';
const DYNAMIC_CACHE_NAME = 'creative-journey-dynamic-v1';

// 静态资源缓存列表
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API 缓存配置
const API_CACHE_CONFIG = {
  // 缓存优先的 API
  cacheFirst: [
    '/api/settings',
    '/api/user/profile',
  ],
  // 网络优先的 API
  networkFirst: [
    '/api/notifications',
    '/api/messages',
  ],
  // 不缓存的 API
  noCache: [
    '/api/auth',
    '/api/payment',
    '/api/kyc',
  ],
};

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== STATIC_CACHE_NAME && 
                     name !== DYNAMIC_CACHE_NAME &&
                     name.startsWith('creative-journey-');
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 跳过 WebSocket 请求
  if (url.pathname.startsWith('/api/ws')) {
    return;
  }

  // API 请求处理
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 静态资源和页面请求
  event.respondWith(handleStaticRequest(request));
});

// 处理 API 请求
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 检查是否不缓存
  if (API_CACHE_CONFIG.noCache.some(path => pathname.startsWith(path))) {
    return fetch(request);
  }

  // 缓存优先策略
  if (API_CACHE_CONFIG.cacheFirst.some(path => pathname.startsWith(path))) {
    return cacheFirst(request, DYNAMIC_CACHE_NAME);
  }

  // 网络优先策略（默认）
  return networkFirst(request, DYNAMIC_CACHE_NAME);
}

// 处理静态资源请求
async function handleStaticRequest(request) {
  // 导航请求使用网络优先
  if (request.mode === 'navigate') {
    return networkFirst(request, STATIC_CACHE_NAME, '/offline');
  }

  // 其他静态资源使用缓存优先
  return cacheFirst(request, STATIC_CACHE_NAME);
}

// 缓存优先策略
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // 后台更新缓存
    updateCache(request, cacheName);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// 网络优先策略
async function networkFirst(request, cacheName, fallbackUrl = null) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // 返回离线页面
    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    return new Response('Offline', { status: 503 });
  }
}

// 后台更新缓存
async function updateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // 静默失败
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: '创意之旅',
    body: '您有新的消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 查找已打开的窗口
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // 打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 同步数据
async function syncData() {
  try {
    // 获取待同步的数据
    const db = await openIndexedDB();
    const pendingData = await getPendingData(db);

    for (const item of pendingData) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });

        if (response.ok) {
          await removePendingData(db, item.id);
        }
      } catch (error) {
        console.error('[SW] Sync failed for item:', item.id);
      }
    }
  } catch (error) {
    console.error('[SW] Sync data failed:', error);
  }
}

// IndexedDB 操作
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('creative-journey-sw', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingData(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-requests'], 'readonly');
    const store = transaction.objectStore('pending-requests');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingData(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-requests'], 'readwrite');
    const store = transaction.objectStore('pending-requests');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// 消息处理
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

console.log('[SW] Service Worker loaded');
