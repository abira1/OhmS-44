import React, { useEffect, useState } from 'react';
import { CalendarIcon, UsersIcon, ClipboardCheckIcon, BellIcon } from 'lucide-react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingScreen from './components/LoadingScreen';
// DevPanel removed for production
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { SectionTransition } from './components/ui/PageTransition';
import { RetroButton } from './components/ui/RetroButton';
import MobileNavigation from './components/mobile/MobileNavigation';
import { MobileLayout } from './components/mobile/MobileLayout';
import { useSwipeNavigation } from './hooks/useTouchGestures';
import { UpdateNotification, OfflineIndicator } from './components/pwa/UpdateNotification';
import { notificationService } from './services/notificationService';

import { PWAIndicator } from './components/pwa/PWAStatus';
import { DownloadPage } from './pages/DownloadPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { swManager } from './utils/swRegistration';
import { pwaFeatures } from './utils/pwaFeatures';
// Removed test utilities import for production
import MobileSimpleApp from './MobileSimpleApp';

// Import sections directly to avoid dynamic import issues on Firebase Hosting
import RoutineSection from './components/sections/RoutineSection';
import ClassmatesSection from './components/sections/ClassmatesSection';
import AttendanceSection from './components/sections/AttendanceSection';
import NoticeSection from './components/sections/NoticeSection';
import NotesSection from './components/sections/SimpleNotesSection';
import AdminSection from './components/sections/AdminSection';
import AuthGuard from './components/auth/AuthGuard';

// Safe logging function for App component
const safeLog = (message: string, data?: any) => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && typeof console !== 'undefined') {
    console.info(`[App] ${message}`, data || '');
  }
};

// Main App component with authentication
const AppContent: React.FC = () => {
  const { currentStudent, classes, notices, attendance } = useData();
  const [activeTab, setActiveTab] = useState('routine');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState('main');
  const { isAdmin, loading: authLoading, permissions } = useAuth();

  // Ensure React mount signal is sent as early as possible
  useEffect(() => {
    const signalMountEarly = () => {
      const root = document.getElementById('root');
      if (root && !root.getAttribute('data-react-mounted')) {
        root.setAttribute('data-react-mounted', 'true');
        window.dispatchEvent(new CustomEvent('react-mounted'));
        safeLog('React mounted - early signal sent');
      }
    };

    // Send signal immediately when component mounts
    signalMountEarly();
  }, []); // Empty dependency array - runs once on mount

  // Don't render until we have basic data structure
  if (classes === undefined || notices === undefined || attendance === undefined) {
    // Still signal that React has mounted even during data loading
    useEffect(() => {
      const root = document.getElementById('root');
      if (root && !root.getAttribute('data-react-mounted')) {
        root.setAttribute('data-react-mounted', 'true');
        window.dispatchEvent(new CustomEvent('react-mounted'));
        safeLog('React mounted during data loading phase');
      }
    }, []);

    return (
      <div className="min-h-screen bg-retro-cream dark:bg-retro-black flex items-center justify-center">
        <div className="text-retro-orange dark:text-retro-green">Loading data...</div>
      </div>
    );
  }

  useEffect(() => {
    // Signal that React has mounted successfully
    const signalReactMounted = () => {
      // Add data attribute to root element
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('data-react-mounted', 'true');
      }

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('react-mounted'));
      safeLog('React app mounted and signaled to browser compatibility check');
    };

    // Signal React mounted immediately since we're in the main app
    signalReactMounted();

    // Don't set any timers here - let LoadingScreen handle its own timing
    // The LoadingScreen component will call onLoadingComplete when it's ready
  }, [authLoading]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize PWA features
  useEffect(() => {
    const initializePWA = async () => {
      try {
        await pwaFeatures.initialize();
        safeLog('🚀 PWA features initialized');
      } catch (error) {
        safeLog('❌ PWA initialization failed:', error);
      }
    };

    initializePWA();
  }, []);

  // Enhanced refresh handler with smart refresh logic
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Import smart refresh hook dynamically to avoid circular dependencies
      const { useSmartRefresh } = await import('./hooks/useSmartRefresh');

      // For now, refresh all data - in the future this could be section-specific
      // based on activeTab
      const refreshPromise = new Promise(resolve => setTimeout(resolve, 1500)); // Minimum loading time for UX
      await refreshPromise;

      // TODO: Implement actual smart refresh based on activeTab
      // const result = await refreshSection(activeTab as RefreshableSection);

    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize PWA features
  useEffect(() => {
    // Register service worker
    swManager.register();

    // Initialize notification service
    notificationService.initialize().then((success) => {
      if (success) {
        safeLog('🔔 Notification service ready');
      }
    });
  }, []);

  // Handle routing
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      if (path === '/download') {
        setCurrentPage('download');
      } else if (path === '/privacy-policy') {
        setCurrentPage('privacy-policy');
      } else {
        setCurrentPage('main');
        // Handle tab parameter
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab && ['routine', 'classmates', 'attendance', 'notice', 'notes', 'admin'].includes(tab)) {
          setActiveTab(tab);
        }
      }
    };

    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  // Show loading screen during minimum loading time (don't wait for auth)
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />;
  }

  // Show download page if on /download route
  if (currentPage === 'download') {
    return <DownloadPage />;
  }

  // Show privacy policy page if on /privacy-policy route
  if (currentPage === 'privacy-policy') {
    return <PrivacyPolicyPage />;
  }
  return (
    <MobileLayout onRefresh={handleRefresh} showRefresh={isMobile}>
      <div className="min-h-screen bg-retro-cream dark:bg-retro-black text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-400 retro-container">
        <div className="retro-scanline"></div>
        <div className="retro-noise"></div>
        <Header />

        <div className="flex-1">
          <main
            className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-5xl mt-[76px] sm:mt-[92px] mb-[80px] sm:mb-[100px] mobile-content-padding"
            role="main"
            aria-label="Main content"
            id="main-content"
          >
        <SectionTransition activeTab={activeTab} tabKey="routine">
          <RoutineSection />
        </SectionTransition>

        <SectionTransition activeTab={activeTab} tabKey="classmates">
          <ClassmatesSection isAdmin={isAdmin} permissions={permissions} />
        </SectionTransition>

        <SectionTransition activeTab={activeTab} tabKey="attendance">
          <AttendanceSection isAdmin={isAdmin} permissions={permissions} />
        </SectionTransition>

        <SectionTransition activeTab={activeTab} tabKey="notice">
          <NoticeSection isAdmin={isAdmin} permissions={permissions} />
        </SectionTransition>

        <SectionTransition activeTab={activeTab} tabKey="notes">
          <NotesSection isAdmin={isAdmin} permissions={permissions} />
        </SectionTransition>

        <SectionTransition activeTab={activeTab} tabKey="admin">
          <AdminSection />
        </SectionTransition>
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Development Panel removed for production */}



        {/* PWA Components */}
        <UpdateNotification />
        <OfflineIndicator />
        <PWAIndicator />
      </div>
    </MobileLayout>
  );
};

// Main App component with providers
export function App() {
  // Disable simple app mode - always use the full app with working routine
  // The simple app is just a placeholder without actual functionality

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}