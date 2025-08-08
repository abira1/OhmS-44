// Firebase Cloud Messaging Service Worker for OhmS-44
// This file handles background push notifications

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (same as in your main app)
const firebaseConfig = {
  apiKey: "AIzaSyBjV_ux7pGII6jAamSrdLYL2B7N5NhsTqk",
  authDomain: "ohms-44.firebaseapp.com",
  databaseURL: "https://ohms-44-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ohms-44",
  storageBucket: "ohms-44.firebasestorage.app",
  messagingSenderId: "334759968585",
  appId: "1:334759968585:web:c74bbd3f593c3423612498",
  measurementId: "G-FBWY25S5G1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message received:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'OhmS-44';
  const notificationOptions = {
    body: payload.notification?.body || 'New notification from OhmS-44',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data || {},
    requireInteraction: true,
    tag: 'ohms-44-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192x192.png'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate if needed
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'firebase-sync') {
    event.waitUntil(syncFirebaseData());
  } else if (event.tag === 'attendance-sync') {
    event.waitUntil(syncAttendanceData());
  } else if (event.tag === 'notice-sync') {
    event.waitUntil(syncNoticeData());
  }
});

// Sync functions for background sync
async function syncFirebaseData() {
  try {
    console.log('🔄 Syncing Firebase data...');

    // Get pending data from localStorage
    const pendingData = JSON.parse(localStorage.getItem('ohms_pending_sync') || '[]');

    if (pendingData && pendingData.length > 0) {
      console.log(`📤 Syncing ${pendingData.length} pending items`);

      // Sync each pending item
      for (const item of pendingData) {
        await syncDataItem(item);
      }

      // Clear pending data after successful sync
      localStorage.removeItem('ohms_pending_sync');

      // Show success notification
      self.registration.showNotification('OhmS-44 Sync Complete', {
        body: 'Your offline changes have been synchronized',
        icon: '/icon-192.png',
        tag: 'sync-complete',
        requireInteraction: false
      });
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

async function syncAttendanceData() {
  console.log('📊 Syncing attendance data...');
  // Sync attendance-specific data
}

async function syncNoticeData() {
  console.log('📢 Syncing notice data...');
  // Sync notice-specific data
}

async function syncDataItem(item) {
  console.log('📤 Syncing item:', item);
  // Implementation to sync individual data item to Firebase
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync triggered:', event.tag);

  if (event.tag === 'routine-update') {
    event.waitUntil(updateRoutineData());
  } else if (event.tag === 'notice-check') {
    event.waitUntil(checkForNewNotices());
  }
});

async function updateRoutineData() {
  console.log('📅 Updating routine data in background...');
  // Implementation for periodic routine updates
}

async function checkForNewNotices() {
  console.log('🔍 Checking for new notices...');
  // Implementation for periodic notice checks
}

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('🔔 Notification closed:', event);
  
  // Track notification dismissal if needed
  // You can send analytics data here
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('🔧 Firebase messaging service worker installed');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('🔧 Firebase messaging service worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle push events (fallback)
self.addEventListener('push', (event) => {
  if (event.data) {
    console.log('📨 Push event received:', event.data.text());
    
    try {
      const payload = event.data.json();
      const title = payload.notification?.title || 'OhmS-44';
      const options = {
        body: payload.notification?.body || 'New notification',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: payload.data || {}
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (error) {
      console.error('❌ Error handling push event:', error);
    }
  }
});
