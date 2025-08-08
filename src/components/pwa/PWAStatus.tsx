import React, { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  WifiOffIcon, 
  DownloadIcon, 
  CheckCircleIcon, 
  SmartphoneIcon,
  RefreshCwIcon 
} from 'lucide-react';
import { swManager, pwaInstallManager, offlineManager } from '../../utils/swRegistration';
import { RetroButton } from '../ui/RetroButton';

interface PWAStatusState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  hasUpdate: boolean;
  swRegistered: boolean;
}

export const PWAStatus: React.FC = () => {
  const [status, setStatus] = useState<PWAStatusState>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    hasUpdate: false,
    swRegistered: false
  });

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;

    setStatus(prev => ({
      ...prev,
      isInstalled: isStandalone,
      swRegistered: 'serviceWorker' in navigator
    }));

    // Listen for online/offline changes
    offlineManager.onStatusChange((isOnline) => {
      setStatus(prev => ({ ...prev, isOnline }));
    });

    // Listen for install availability
    pwaInstallManager.onInstallAvailable((canInstall) => {
      setStatus(prev => ({ ...prev, canInstall }));
    });

    // Listen for SW updates
    swManager.onUpdateAvailable(() => {
      setStatus(prev => ({ ...prev, hasUpdate: true }));
    });

    // Register service worker
    swManager.register();
  }, []);

  const handleInstall = async () => {
    const success = await pwaInstallManager.promptInstall();
    if (success) {
      setStatus(prev => ({ ...prev, canInstall: false, isInstalled: true }));
    }
  };

  const handleUpdate = async () => {
    await swManager.checkForUpdates();
    setStatus(prev => ({ ...prev, hasUpdate: false }));
  };

  return (
    <div className="fixed top-4 right-4 z-30 hidden md:block">
      <div className="neu-card p-3 bg-white dark:bg-gray-800 min-w-[200px]">
        <h4 className="font-vhs font-bold text-xs text-gray-700 dark:text-gray-300 mb-2">
          PWA Status
        </h4>
        
        <div className="space-y-2">
          {/* Online Status */}
          <div className="flex items-center gap-2">
            {status.isOnline ? (
              <WifiIcon className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOffIcon className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs">
              {status.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Service Worker Status */}
          <div className="flex items-center gap-2">
            {status.swRegistered ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <XIcon className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs">
              Service Worker {status.swRegistered ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Installation Status */}
          <div className="flex items-center gap-2">
            {status.isInstalled ? (
              <SmartphoneIcon className="h-4 w-4 text-green-500" />
            ) : (
              <DownloadIcon className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-xs">
              {status.isInstalled ? 'Installed' : 'Web Version'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-1">
            {status.canInstall && !status.isInstalled && (
              <RetroButton
                onClick={handleInstall}
                variant="accent"
                size="sm"
                icon={DownloadIcon}
                className="w-full text-xs"
              >
                Install App
              </RetroButton>
            )}

            {status.hasUpdate && (
              <RetroButton
                onClick={handleUpdate}
                variant="primary"
                size="sm"
                icon={RefreshCwIcon}
                className="w-full text-xs"
              >
                Update Available
              </RetroButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact PWA indicator for mobile
export const PWAIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for online/offline changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-4 left-4 z-30 md:hidden">
      <div className="flex items-center gap-1">
        {/* Online/Offline indicator */}
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        
        {/* PWA indicator */}
        {isInstalled && (
          <div className="w-2 h-2 rounded-full bg-retro-purple" />
        )}
      </div>
    </div>
  );
};

// PWA features showcase
export const PWAFeatures: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [features, setFeatures] = useState({
    offline: false,
    installable: false,
    notifications: false,
    backgroundSync: false
  });

  useEffect(() => {
    // Check PWA features support
    setFeatures({
      offline: 'serviceWorker' in navigator,
      installable: 'serviceWorker' in navigator && 'PushManager' in window,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    });
  }, []);

  const featureList = [
    { key: 'offline', label: 'Offline Support', icon: WifiOffIcon },
    { key: 'installable', label: 'App Installation', icon: DownloadIcon },
    { key: 'notifications', label: 'Push Notifications', icon: BellIcon },
    { key: 'backgroundSync', label: 'Background Sync', icon: RefreshCwIcon }
  ];

  return (
    <div className={`neu-card p-4 ${className}`}>
      <h3 className="font-vhs font-bold text-lg mb-3 text-gray-900 dark:text-white">
        🚀 PWA Features
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {featureList.map(({ key, label, icon: Icon }) => (
          <div 
            key={key}
            className={`flex items-center gap-2 p-2 rounded-lg ${
              features[key as keyof typeof features]
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-vhs">{label}</span>
            {features[key as keyof typeof features] && (
              <CheckCircleIcon className="h-3 w-3 ml-auto" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
