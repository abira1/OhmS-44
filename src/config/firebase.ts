// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration object
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
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database: Database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize Firebase Cloud Messaging
let messaging: any = null;
let isMessagingSupported = false;

// VAPID Key for web push notifications
// From Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = "BH5QJjFR_HvddFk4ZOq7uFf7pX4Js_piUPBvNweilMbNIEZeoIW8EMCQZ4BUfz7WvBeEaMygW3MI_a-nCfRcBmU";

// Initialize messaging
const initializeMessaging = async () => {
  try {
    isMessagingSupported = await isSupported();
    if (isMessagingSupported && typeof window !== 'undefined') {
      messaging = getMessaging(app);
      console.log('🔔 Firebase Cloud Messaging initialized');
    } else {
      console.log('📱 FCM not supported in this environment');
    }
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
  }
};

// Initialize messaging
initializeMessaging();

// Initialize Analytics (optional, only in production)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    // Only log in development - analytics failures are not critical
    if (import.meta.env.DEV) {
      console.warn('Analytics initialization failed:', error);
    }
  }
}

export {
  analytics,
  messaging,
  VAPID_KEY,
  isMessagingSupported,
  getToken,
  onMessage
};

// Export the app instance for other Firebase services if needed
export default app;
