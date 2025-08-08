// PWA Features Implementation for OhmS-44
// Background sync, periodic sync, and push notifications

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app, { VAPID_KEY } from '../config/firebase';

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// VAPID key is imported from Firebase config

export class PWAFeatures {
  private static instance: PWAFeatures;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PWAFeatures {
    if (!PWAFeatures.instance) {
      PWAFeatures.instance = new PWAFeatures();
    }
    return PWAFeatures.instance;
  }

  // Initialize all PWA features
  async initialize(): Promise<void> {
    try {
      await this.registerServiceWorker();
      await this.setupPushNotifications();
      await this.setupBackgroundSync();
      await this.setupPeriodicSync();
      console.log('🚀 PWA features initialized successfully');
    } catch (error) {
      console.error('❌ PWA features initialization failed:', error);
    }
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', this.registration);
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  // Setup push notifications
  async setupPushNotifications(): Promise<void> {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: this.registration || undefined
        });
        
        if (token) {
          console.log('📱 FCM Token:', token);
          // Store token for server-side use
          localStorage.setItem('ohms_fcm_token', token);
          
          // Send token to your server
          await this.sendTokenToServer(token);
        }
        
        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log('📨 Foreground message received:', payload);
          this.showForegroundNotification(payload);
        });
        
      } else {
        console.log('❌ Notification permission denied');
      }
    } catch (error) {
      console.error('❌ Push notification setup failed:', error);
    }
  }

  // Setup background sync
  async setupBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        // Register background sync
        if (this.registration) {
          await this.registration.sync.register('ohms-sync-queue');
          console.log('✅ Background sync registered');
        }
        
        // Listen for online events to trigger sync
        window.addEventListener('online', () => {
          this.triggerBackgroundSync();
        });
        
      } catch (error) {
        console.error('❌ Background sync setup failed:', error);
      }
    } else {
      console.log('❌ Background sync not supported');
    }
  }

  // Setup periodic sync
  async setupPeriodicSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
      try {
        if (this.registration) {
          // Register periodic sync for routine updates (every 6 hours)
          await this.registration.periodicSync.register('routine-update', {
            minInterval: 6 * 60 * 60 * 1000 // 6 hours
          });
          
          // Register periodic sync for notice checks (every 2 hours)
          await this.registration.periodicSync.register('notice-check', {
            minInterval: 2 * 60 * 60 * 1000 // 2 hours
          });
          
          // Register periodic sync for attendance reminders (daily)
          await this.registration.periodicSync.register('attendance-reminder', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          });
          
          console.log('✅ Periodic sync registered');
        }
      } catch (error) {
        console.error('❌ Periodic sync setup failed:', error);
      }
    } else {
      console.log('❌ Periodic sync not supported');
    }
  }

  // Trigger background sync manually
  async triggerBackgroundSync(): Promise<void> {
    try {
      if (this.registration) {
        await this.registration.sync.register('ohms-sync-queue');
        console.log('🔄 Background sync triggered');
      }
    } catch (error) {
      console.error('❌ Failed to trigger background sync:', error);
    }
  }

  // Add data to sync queue for offline actions
  addToSyncQueue(data: any): void {
    try {
      const pendingData = JSON.parse(localStorage.getItem('ohms_pending_sync') || '[]');
      pendingData.push({
        ...data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      });
      localStorage.setItem('ohms_pending_sync', JSON.stringify(pendingData));
      
      // Trigger sync if online
      if (navigator.onLine) {
        this.triggerBackgroundSync();
      }
      
      console.log('📤 Data added to sync queue:', data);
    } catch (error) {
      console.error('❌ Failed to add data to sync queue:', error);
    }
  }

  // Send FCM token to server
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // Replace with your actual server endpoint
      const response = await fetch('/api/fcm/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, userId: 'current-user-id' })
      });
      
      if (response.ok) {
        console.log('✅ FCM token sent to server');
      }
    } catch (error) {
      console.error('❌ Failed to send FCM token to server:', error);
    }
  }

  // Show foreground notification
  private showForegroundNotification(payload: any): void {
    const { title, body, icon } = payload.notification || {};
    
    if (Notification.permission === 'granted') {
      new Notification(title || 'OhmS-44', {
        body: body || 'New notification',
        icon: icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'ohms-foreground'
      });
    }
  }

  // Send push notification (for testing)
  async sendTestNotification(): Promise<void> {
    try {
      const token = localStorage.getItem('ohms_fcm_token');
      if (!token) {
        console.error('❌ No FCM token available');
        return;
      }
      
      // This would typically be done from your server
      console.log('📨 Test notification would be sent with token:', token);
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
    }
  }

  // Check if PWA features are supported
  static checkSupport(): {
    serviceWorker: boolean;
    backgroundSync: boolean;
    periodicSync: boolean;
    pushNotifications: boolean;
  } {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      periodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
      pushNotifications: 'Notification' in window && 'PushManager' in window
    };
  }
}

// Export singleton instance
export const pwaFeatures = PWAFeatures.getInstance();

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  pwaFeatures.initialize();
}
