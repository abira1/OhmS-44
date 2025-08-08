import React from 'react';
import { Download, Smartphone, ArrowLeftIcon } from 'lucide-react';
import { RetroButton } from '../components/ui/RetroButton';

export const DownloadPage: React.FC = () => {

  const handleDownloadAPK = () => {
    // Replace with your actual GitHub release URL
    const githubReleaseUrl = 'https://github.com/yourusername/ohms-releases/releases/download/v1.0/OhmS-44.apk';

    // For now, show instructions to set up GitHub releases
    const message = `To enable direct APK download:\n\n1. Create a GitHub repository (e.g., 'ohms-releases')\n2. Create a new release (tag: v1.0)\n3. Upload OhmS-44.apk as release asset\n4. Replace the URL in the code\n\nWould you like to see the setup instructions?`;

    if (confirm(message)) {
      window.open('https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository', '_blank');
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
            <p className="text-white/70 mb-4">Version 1.0 • 2.85 MB • Ready to Install</p>
          </div>

          <div className="mb-6 space-y-3">
            <RetroButton
              onClick={handleDownloadAPK}
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 w-full"
            >
              📱 Download APK
            </RetroButton>
            <p className="text-white/60 text-sm">
              Click above to get download instructions or contact developer
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
