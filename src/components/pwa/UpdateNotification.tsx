import React, { useState, useEffect } from 'react';
import { RefreshCwIcon, XIcon, DownloadIcon } from 'lucide-react';
import { swManager } from '../../utils/swRegistration';
import { RetroButton } from '../ui/RetroButton';

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    swManager.onUpdateAvailable(({ isUpdateAvailable }) => {
      if (isUpdateAvailable) {
        setShowUpdate(true);
      }
    });
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await swManager.checkForUpdates();
      // The page will reload automatically when the new SW takes control
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Don't show again for this session
    sessionStorage.setItem('update-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('update-dismissed')) {
    return null;
  }

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="neu-card p-4 bg-white dark:bg-gray-800 border-2 border-retro-purple">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCwIcon className="h-6 w-6 text-retro-purple" />
          </div>
          <div className="flex-1">
            <h3 className="font-vhs font-bold text-sm text-gray-900 dark:text-white">
              🚀 Update Available
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              A new version of OhmS-44 is available with improvements and bug fixes.
            </p>
            <div className="flex gap-2 mt-3">
              <RetroButton
                onClick={handleUpdate}
                disabled={isUpdating}
                variant="primary"
                size="sm"
                icon={isUpdating ? RefreshCwIcon : DownloadIcon}
                className={isUpdating ? 'animate-pulse' : ''}
              >
                {isUpdating ? 'Updating...' : 'Update Now'}
              </RetroButton>
              <RetroButton
                onClick={handleDismiss}
                variant="secondary"
                size="sm"
              >
                Later
              </RetroButton>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
            aria-label="Dismiss update notification"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Offline status indicator
export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <div className="neu-card p-3 bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-vhs text-yellow-800 dark:text-yellow-200">
            📴 You're offline - Using cached content
          </span>
        </div>
      </div>
    </div>
  );
};

// Download page link notification
export const DownloadPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Show download prompt after a delay
    const timer = setTimeout(() => {
      const hasSeenPrompt = localStorage.getItem('download-prompt-seen');
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    }, 15000); // Show after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadPage = () => {
    window.location.href = '/download';
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('download-prompt-seen', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="neu-card p-4 bg-gradient-to-r from-retro-purple to-retro-pink text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <DownloadIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-vhs font-bold text-sm">
              📱 Get OhmS-44 App
            </h3>
            <p className="text-xs opacity-90 mt-1">
              Install OhmS-44 for offline access, faster loading, and app-like experience!
            </p>
            <div className="flex gap-2 mt-3">
              <RetroButton
                onClick={handleDownloadPage}
                variant="secondary"
                size="sm"
                className="bg-white text-retro-purple hover:bg-gray-100"
              >
                Download App
              </RetroButton>
              <RetroButton
                onClick={handleDismiss}
                variant="secondary"
                size="sm"
                className="bg-transparent border border-white text-white hover:bg-white hover:text-retro-purple"
              >
                Not Now
              </RetroButton>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-white hover:text-gray-200 rounded"
            aria-label="Dismiss download prompt"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
