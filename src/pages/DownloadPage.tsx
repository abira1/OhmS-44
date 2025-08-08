import React, { useState, useEffect } from 'react';
import { Download, Smartphone, ArrowLeftIcon, ExternalLink } from 'lucide-react';
import { RetroButton } from '../components/ui/RetroButton';
import { releaseManager, ReleaseInfo } from '../utils/releaseManager';

export const DownloadPage: React.FC = () => {
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReleaseInfo = async () => {
      try {
        const info = await releaseManager.getLatestRelease();
        setReleaseInfo(info);
      } catch (error) {
        console.error('Failed to load release info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReleaseInfo();
  }, []);

  const handleDownloadAPK = async () => {
    try {
      await releaseManager.downloadAPK('page');
    } catch (error) {
      // Fallback to releases page
      const message = `APK download will be available soon!\n\nTo set up the APK download:\n\n1. Build the APK using: npm run mobile:android\n2. Create a release on GitHub: https://github.com/abira1/ohms-releases/releases/new\n3. Upload the APK file as a release asset\n\nWould you like to see the releases page?`;

      if (confirm(message)) {
        window.open('https://github.com/abira1/ohms-releases/releases', '_blank');
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-retro-dark via-retro-purple to-retro-pink p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <RetroButton
            onClick={() => window.history.back()}
            variant="secondary"
            size="sm"
            icon={ArrowLeftIcon}
          >
            Back
          </RetroButton>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
            <Smartphone className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-vhs">
            Download OhmS APK
          </h1>
          <p className="text-xl text-white/80">
            Get the Android APK file for OhmS app
          </p>
        </div>

        {/* APK Download Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
          <div className="mb-6">
            <Smartphone className="h-16 w-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">OhmS Android APK</h2>
            {isLoading ? (
              <p className="text-white/70 mb-4">Loading release info...</p>
            ) : releaseInfo ? (
              <p className="text-white/70 mb-4">
                Version {releaseInfo.version} • {releaseInfo.fileSize} • {releaseInfo.isAvailable ? 'Ready to Install' : 'Coming Soon'}
              </p>
            ) : (
              <p className="text-white/70 mb-4">Version 1.0 • ~3.5 MB • Coming Soon</p>
            )}
          </div>

          <div className="mb-6 space-y-3">
            <RetroButton
              onClick={handleDownloadAPK}
              className={`text-white text-lg px-8 py-4 w-full flex items-center justify-center gap-2 ${
                releaseInfo?.isAvailable
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>⏳ Loading...</>
              ) : releaseInfo?.isAvailable ? (
                <>
                  <Download className="h-5 w-5" />
                  Download APK
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  View Releases
                </>
              )}
            </RetroButton>
            <p className="text-white/60 text-sm">
              {releaseInfo?.isAvailable
                ? 'Direct download from GitHub releases'
                : 'APK will be available soon - click to see setup instructions'
              }
            </p>
          </div>

          <div className="text-left bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Installation Steps:</h3>
            <ol className="text-white/80 space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">1.</span>
                <span>Download the APK file</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">2.</span>
                <span>Enable "Unknown Sources" in Android Settings → Security</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">3.</span>
                <span>Open the downloaded APK file</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">4.</span>
                <span>Follow installation prompts</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">5.</span>
                <span>Launch OhmS app from your home screen</span>
              </li>
            </ol>
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
