import { log } from './logger';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Check if app is already installed
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      log.info('PWA install prompt ready');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      log.info('PWA installed successfully');
    });

    // Register service worker
    this.registerServiceWorker();
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      log.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.serviceWorkerRegistration = registration;

      log.info('Service Worker registered', {
        scope: registration.scope,
        active: !!registration.active,
      });

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            log.info('New service worker available');
            this.notifyUpdate();
          }
        });
      });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        log.info('Service worker controller changed - reloading');
        window.location.reload();
      });
    } catch (error) {
      log.error('Service Worker registration failed', error);
    }
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      log.warn('Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      log.info('Install prompt result', { outcome });

      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      log.error('Install prompt failed', error);
      return false;
    }
  }

  canInstall(): boolean {
    return !this.isInstalled && this.deferredPrompt !== null;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      log.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    log.info('Notification permission', { permission });
    return permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      log.warn('Service Worker not registered');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        return null;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      });

      log.info('Push subscription created');
      return subscription;
    } catch (error) {
      log.error('Push subscription failed', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (!subscription) {
        return true;
      }

      const success = await subscription.unsubscribe();
      log.info('Push subscription removed', { success });
      return success;
    } catch (error) {
      log.error('Unsubscribe failed', error);
      return false;
    }
  }

  async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      log.info('All caches cleared');
    } catch (error) {
      log.error('Clear caches failed', error);
    }
  }

  async sendMessageToSW(message: any): Promise<void> {
    if (!this.serviceWorkerRegistration?.active) {
      log.warn('No active service worker');
      return;
    }

    this.serviceWorkerRegistration.active.postMessage(message);
  }

  async skipWaiting(): Promise<void> {
    await this.sendMessageToSW({ type: 'SKIP_WAITING' });
  }

  private notifyUpdate() {
    // Dispatch custom event for UI to handle
    const event = new CustomEvent('swupdate', {
      detail: { registration: this.serviceWorkerRegistration },
    });
    window.dispatchEvent(event);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Offline sync utilities
  async syncWhenOnline(callback: () => Promise<void>): Promise<void> {
    if (navigator.onLine) {
      await callback();
    } else {
      const handleOnline = async () => {
        window.removeEventListener('online', handleOnline);
        await callback();
      };
      window.addEventListener('online', handleOnline);
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

export const pwa = new PWAManager();

// Export utility functions
export const registerServiceWorker = () => pwa.registerServiceWorker();
export const showInstallPrompt = () => pwa.showInstallPrompt();
export const canInstall = () => pwa.canInstall();
export const isAppInstalled = () => pwa.isAppInstalled();
export const requestNotificationPermission = () => pwa.requestNotificationPermission();
export const subscribeToPush = () => pwa.subscribeToPush();
export const clearAllCaches = () => pwa.clearAllCaches();
export const isOnline = () => pwa.isOnline();
