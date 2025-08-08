import { Workbox } from 'workbox-window';

interface SWUpdateInfo {
  isUpdateAvailable: boolean;
  updateSW: () => Promise<void>;
}

export class ServiceWorkerManager {
  private wb: Workbox | null = null;
  private updateCallback: ((info: SWUpdateInfo) => void) | null = null;
  private installCallback: (() => void) | null = null;

  constructor() {
    if ('serviceWorker' in navigator) {
      // Check if service worker file exists before registering
      this.checkServiceWorkerExists().then((exists) => {
        if (exists) {
          this.wb = new Workbox('/sw.js');
          this.setupEventListeners();
        } else {
          console.log('📱 Service Worker file not found, skipping registration');
        }
      });
    }
  }

  private async checkServiceWorkerExists(): Promise<boolean> {
    try {
      const response = await fetch('/sw.js', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private setupEventListeners() {
    if (!this.wb) return;

    // Service worker installed for the first time
    this.wb.addEventListener('installed', (event) => {
      console.log('🔧 Service Worker installed:', event);
      if (!event.isUpdate) {
        this.showInstallNotification();
        this.installCallback?.();
      }
    });

    // Service worker update available
    this.wb.addEventListener('waiting', (event) => {
      console.log('🔄 Service Worker update available:', event);
      if (this.updateCallback) {
        this.updateCallback({
          isUpdateAvailable: true,
          updateSW: () => this.updateServiceWorker()
        });
      }
    });

    // Service worker controlling the page
    this.wb.addEventListener('controlling', (event) => {
      console.log('✅ Service Worker controlling:', event);
      window.location.reload();
    });

    // Service worker activated
    this.wb.addEventListener('activated', (event) => {
      console.log('🚀 Service Worker activated:', event);
    });
  }

  public async register(): Promise<void> {
    if (!this.wb) {
      console.log('📱 Service Worker not available or not supported');
      return;
    }

    try {
      await this.wb.register();
      console.log('✅ Service Worker registered successfully');
    } catch (error) {
      console.log('📱 Service Worker registration skipped:', error.message);
    }
  }

  public onUpdateAvailable(callback: (info: SWUpdateInfo) => void): void {
    this.updateCallback = callback;
  }

  public onInstalled(callback: () => void): void {
    this.installCallback = callback;
  }

  private async updateServiceWorker(): Promise<void> {
    if (!this.wb) return;

    // Send message to skip waiting
    this.wb.messageSkipWaiting();
  }

  private showInstallNotification(): void {
    // Show a notification that the app is ready for offline use
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 OhmS-44 is ready for offline use!', {
        body: 'The app has been cached and will work offline.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
      });
    }
  }

  public async checkForUpdates(): Promise<void> {
    if (!this.wb) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.error('❌ Failed to check for updates:', error);
    }
  }

  // Check if app is running in standalone mode (installed as PWA)
  public isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Check if app can be installed
  public canInstall(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  // Get installation status
  public getInstallationStatus(): 'not-supported' | 'installable' | 'installed' {
    if (!this.canInstall()) return 'not-supported';
    if (this.isStandalone()) return 'installed';
    return 'installable';
  }
}

// Singleton instance
export const swManager = new ServiceWorkerManager();

// PWA Install Manager
export class PWAInstallManager {
  private deferredPrompt: any = null;
  private installCallback: ((canInstall: boolean) => void) | null = null;

  constructor() {
    this.setupInstallPrompt();
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.installCallback?.(true);
    });

    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA installed successfully');
      this.deferredPrompt = null;
      this.installCallback?.(false);
    });
  }

  public onInstallAvailable(callback: (canInstall: boolean) => void): void {
    this.installCallback = callback;
  }

  public async promptInstall(): Promise<boolean> {
    // Check if we have a deferred prompt (Chrome/Edge)
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('✅ User accepted PWA install');
          return true;
        } else {
          console.log('❌ User dismissed PWA install');
          return false;
        }
      } catch (error) {
        console.error('❌ PWA install failed:', error);
        return false;
      } finally {
        this.deferredPrompt = null;
      }
    }

    // Fallback for browsers without beforeinstallprompt (Safari, Firefox)
    return this.showManualInstallInstructions();
  }

  private showManualInstallInstructions(): boolean {
    // Return false to indicate manual installation is needed
    // The UI component will handle showing instructions
    return false;
  }

  public canPromptInstall(): boolean {
    return this.deferredPrompt !== null || this.canInstallManually();
  }

  private canInstallManually(): boolean {
    // Check if we're in a browser that supports PWA installation
    return 'serviceWorker' in navigator && !this.isStandalone();
  }

  private isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Get device-specific install availability
  public getInstallMethod(): 'prompt' | 'manual' | 'installed' | 'unsupported' {
    if (this.isStandalone()) return 'installed';
    if (this.deferredPrompt) return 'prompt';
    if (this.canInstallManually()) return 'manual';
    return 'unsupported';
  }
}

// Singleton instance
export const pwaInstallManager = new PWAInstallManager();

// Offline status manager
export class OfflineManager {
  private isOnline = navigator.onLine;
  private callbacks: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.setupOnlineListeners();
  }

  private setupOnlineListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 App is online');
      this.isOnline = true;
      this.notifyCallbacks();
    });

    window.addEventListener('offline', () => {
      console.log('📴 App is offline');
      this.isOnline = false;
      this.notifyCallbacks();
    });
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.isOnline));
  }

  public onStatusChange(callback: (isOnline: boolean) => void): void {
    this.callbacks.push(callback);
  }

  public getStatus(): boolean {
    return this.isOnline;
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();
