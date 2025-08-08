// Push Notification Service for OhmS-44
import { messaging, VAPID_KEY, isMessagingSupported, getToken, onMessage } from '../config/firebase';
import logger from '../utils/logger';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize the notification service
  public async initialize(): Promise<boolean> {
    try {
      if (!isMessagingSupported || !messaging) {
        logger.notification('Push notifications not supported');
        return false;
      }

      // Request notification permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        logger.notification('Notification permission denied');
        return false;
      }

      // Get FCM token
      await this.getFCMToken();

      // Set up message listener
      this.setupMessageListener();

      this.isInitialized = true;
      logger.notification('Notification service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  // Request notification permission
  private async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      logger.notification('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission;
  }

  // Get FCM registration token
  private async getFCMToken(): Promise<string | null> {
    try {
      if (!messaging) return null;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        this.fcmToken = token;
        logger.notification('FCM Token obtained:', token.substring(0, 20) + '...');

        // Store token in localStorage for persistence
        localStorage.setItem('fcm_token', token);

        // TODO: Send token to your server to store in database
        // await this.sendTokenToServer(token);

        return token;
      } else {
        logger.notification('No registration token available');
        return null;
      }
    } catch (error) {
      logger.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Set up foreground message listener
  private setupMessageListener(): void {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      logger.notification('Message received in foreground:', payload);

      // Show notification when app is in foreground
      this.showNotification({
        title: payload.notification?.title || 'OhmS-44',
        body: payload.notification?.body || 'New notification',
        icon: payload.notification?.icon || '/icon-192x192.png',
        data: payload.data
      });
    });
  }

  // Show local notification
  public showNotification(payload: NotificationPayload): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      logger.notification('Cannot show notification - permission not granted');
      return;
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      data: payload.data,
      requireInteraction: true,
      tag: 'ohms-44-notification'
    });

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      // Handle navigation based on notification data
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      }
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }

  // Get current FCM token
  public getToken(): string | null {
    return this.fcmToken || localStorage.getItem('fcm_token');
  }

  // Check if notifications are enabled
  public isEnabled(): boolean {
    return this.isInitialized && 
           Notification.permission === 'granted' && 
           this.fcmToken !== null;
  }

  // Get notification permission status
  public getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  // Send token to server (implement based on your backend)
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Implement your server endpoint
      // const response = await fetch('/api/fcm-tokens', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ token, userId: 'current-user-id' })
      // });

      logger.notification('Token would be sent to server:', token.substring(0, 20) + '...');
    } catch (error) {
      logger.error('Failed to send token to server:', error);
    }
  }

  // Test notification (for development)
  public testNotification(): void {
    this.showNotification({
      title: '🎓 OhmS-44 Test',
      body: 'Push notifications are working! You\'ll receive updates about classes, assignments, and announcements.',
      icon: '/icon-192x192.png',
      data: { test: true }
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Notification types for OhmS-44
export const NotificationTypes = {
  CLASS_UPDATE: 'class_update',
  ASSIGNMENT: 'assignment',
  ATTENDANCE: 'attendance',
  ANNOUNCEMENT: 'announcement',
  SCHEDULE_CHANGE: 'schedule_change'
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];
