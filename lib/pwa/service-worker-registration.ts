/**
 * Service Worker Registration
 * Service Worker 注册和管理
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * 注册 Service Worker
 */
export async function registerServiceWorker(config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported');
    return null;
  }

  // 仅在生产环境注册
  if (process.env.NODE_ENV !== 'production') {
    console.log('[PWA] Service Worker disabled in development');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered:', registration.scope);

    // 检查更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 有新版本可用
              console.log('[PWA] New content available');
              config?.onUpdate?.(registration);
            } else {
              // 首次安装
              console.log('[PWA] Content cached for offline use');
              config?.onSuccess?.(registration);
            }
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    config?.onError?.(error as Error);
    return null;
  }
}

/**
 * 注销 Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    console.log('[PWA] Service Worker unregistered:', success);
    return success;
  } catch (error) {
    console.error('[PWA] Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * 检查 Service Worker 更新
 */
export async function checkForUpdates(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('[PWA] Checked for updates');
  } catch (error) {
    console.error('[PWA] Update check failed:', error);
  }
}

/**
 * 跳过等待，立即激活新版本
 */
export function skipWaiting(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
}
