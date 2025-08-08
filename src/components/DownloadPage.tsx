import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Globe, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DownloadPage: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const downloadOptions = [
    {
      id: 'android-apk',
      title: 'Android APK',
      description: 'Direct download for Android devices',
      icon: <Smartphone className="h-8 w-8" />,
      downloadUrl: 'https://github.com/abira1/ohms-releases/releases/download/v1.0/OhmS-44.apk',
      available: true, // Set to true once APK is uploaded to releases
      instructions: [
        'Download the APK file from GitHub releases',
        'Enable "Install from unknown sources" in Android Settings → Security',
        'Open the downloaded APK file',
        'Follow installation prompts',
        'Grant necessary permissions for full functionality'
      ]
    },
    {
      id: 'pwa-install',
      title: 'Install as Web App',
      description: 'Install directly from browser (Recommended)',
      icon: <Globe className="h-8 w-8" />,
      available: isInstallable,
      installed: isInstalled,
      action: handleInstallPWA,
      instructions: [
        'Click "Install App" button below',
        'Confirm installation in browser prompt',
        'App will be added to your home screen',
        'Works offline with full functionality'
      ]
    },
    {
      id: 'browser',
      title: 'Use in Browser',
      description: 'Access directly without installation',
      icon: <Monitor className="h-8 w-8" />,
      available: true,
      url: window.location.origin,
      instructions: [
        'Bookmark this page for easy access',
        'Add to home screen on mobile',
        'Works in any modern browser',
        'No installation required'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-retro-dark via-retro-purple to-retro-pink p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
            <Download className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-vhs">
            Download OhmS App
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get the OhmS app on your device for the best experience. Choose your preferred installation method below.
          </p>
        </div>

        {/* Installation Status */}
        {isInstalled && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-green-400 font-semibold">App Already Installed</h3>
                <p className="text-green-300/80">OhmS is installed and ready to use!</p>
              </div>
            </div>
          </div>
        )}

        {/* Download Options */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {downloadOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-white">{option.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{option.title}</h3>
                  <p className="text-white/70">{option.description}</p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                {option.installed ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Installed</span>
                  </div>
                ) : option.available ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Coming Soon</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mb-4">
                {option.action && option.available && !option.installed && (
                  <button
                    onClick={option.action}
                    className="w-full bg-retro-purple hover:bg-retro-purple/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Install App
                  </button>
                )}
                {option.downloadUrl && option.available && (
                  <a
                    href={option.downloadUrl}
                    download
                    className="block w-full bg-retro-purple hover:bg-retro-purple/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    Download APK
                  </a>
                )}
                {option.url && (
                  <a
                    href={option.url}
                    className="block w-full bg-retro-purple hover:bg-retro-purple/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    Open in Browser
                  </a>
                )}
                {!option.available && !option.installed && (
                  <button
                    disabled
                    className="w-full bg-gray-500/50 text-gray-300 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Installation Steps:
                </h4>
                <ol className="text-sm text-white/70 space-y-1">
                  {option.instructions.map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-retro-purple font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Why Install the App?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">📱 Better Performance</h4>
              <p className="text-white/70 text-sm">Faster loading, smoother animations, and optimized for mobile devices.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">🔔 Push Notifications</h4>
              <p className="text-white/70 text-sm">Get instant notifications for important updates and announcements.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">📶 Offline Access</h4>
              <p className="text-white/70 text-sm">Access your data even when you're offline or have poor connectivity.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">🏠 Home Screen Access</h4>
              <p className="text-white/70 text-sm">Quick access from your device's home screen, just like any other app.</p>
            </div>
          </div>
        </div>

        {/* Back to App */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            ← Back to OhmS App
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
