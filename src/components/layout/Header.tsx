import React, { useState } from 'react';
import { SunIcon, MoonIcon, DownloadIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import DeveloperModal from '../modals/DeveloperModal';
import UserProfile from '../UserProfile';
import { OptimizedImage } from '../ui/OptimizedImage';
import { RetroIconButton } from '../ui/RetroButton';
import { useAccessibility } from '../../hooks/useAccessibility';

// BACKUP: Original Header component saved for easy restoration
const OriginalHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  const handleLogoClick = () => {
    setShowDeveloperModal(true);
    announceToScreenReader('Developer information panel opened');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    announceToScreenReader(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm py-2 transition-colors duration-400 z-30"
      role="banner"
      aria-label="Site header"
    >
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 max-w-5xl flex justify-between items-center neu-card retro-border">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            className="p-1 sm:p-2 rounded-xl neu-shadow-sm cursor-pointer micro-bounce focus-visible"
            onClick={handleLogoClick}
            aria-label="Open developer information panel"
            aria-describedby="dev-button-desc"
          >
            <span id="dev-button-desc" className="sr-only">
              Click to view developer information and system details
            </span>
            <OptimizedImage
              src="https://i.postimg.cc/sg4z0qBN/a-modern-logo-design-featuring-the-ohm-s-u15c-EDB4-RQu-RJu4y-FAXImw-j-Jr-Xa-M7-BQo-KPk5-Nv-Wb-Zp6-Q.png"
              alt="OhmS-44 Logo"
              className="h-7 w-7 sm:h-9 sm:w-9 object-contain"
              lazy={false}
            />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-vhs font-bold text-retro-purple dark:text-retro-teal">
              OhmS-44
            </h1>
            <p className="text-xs font-vhs text-gray-500 dark:text-gray-400">
              Where Energy Meets Excellence.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UserProfile />
          <RetroIconButton
            icon={DownloadIcon}
            onClick={() => window.location.href = '/download'}
            variant="accent"
            size="md"
            aria-label="Download OhmS-44 App"
            className="text-retro-purple dark:text-retro-teal hidden sm:flex"
            title="Download App"
          />
          <RetroIconButton
            icon={theme === 'dark' ? SunIcon : MoonIcon}
            onClick={handleThemeToggle}
            variant="secondary"
            size="md"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'dark'}
            className="text-gray-500 dark:text-gray-300"
          />
        </div>
      </div>
      {showDeveloperModal && <DeveloperModal onClose={() => setShowDeveloperModal(false)} />}
    </header>
  );
};
const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  const handleLogoClick = () => {
    setShowDeveloperModal(true);
    announceToScreenReader('Developer information panel opened');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    announceToScreenReader(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 transition-all duration-400"
      role="banner"
      aria-label="Site header"
      style={{ backgroundColor: 'red' }} // TEMPORARY TEST - Should make header red
    >
      {/* Retro Background with Gradient and Effects */}
      <div className="relative bg-gradient-to-r from-retro-purple via-retro-pink to-retro-purple dark:from-retro-blue dark:via-retro-teal dark:to-retro-blue">
        {/* Retro Scanlines Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="retro-scanline h-full"></div>
        </div>

        {/* Retro Grid Pattern */}
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
               `,
               backgroundSize: '20px 20px'
             }}>
        </div>

        {/* Main Header Content */}
        <div className="relative container mx-auto px-3 sm:px-6 py-3 sm:py-4 max-w-5xl">
          <div className="flex justify-between items-center">
            {/* Left Side - Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                className="group relative p-2 sm:p-3 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 micro-bounce focus-visible retro-btn"
                onClick={handleLogoClick}
                aria-label="Open developer information panel"
                aria-describedby="dev-button-desc"
              >
                <span id="dev-button-desc" className="sr-only">
                  Click to view developer information and system details
                </span>
                <OptimizedImage
                  src="https://i.postimg.cc/sg4z0qBN/a-modern-logo-design-featuring-the-ohm-s-u15c-EDB4-RQu-RJu4y-FAXImw-j-Jr-Xa-M7-BQo-KPk5-Nv-Wb-Zp6-Q.png"
                  alt="OhmS-44 Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  lazy={false}
                />
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>

              <div className="relative">
                <h1 className="text-xl sm:text-2xl font-vhs font-bold text-white drop-shadow-lg tracking-wider">
                  <span className="relative">
                    OhmS-44
                    {/* Retro Glow Effect */}
                    <span className="absolute inset-0 text-retro-yellow opacity-50 blur-sm animate-pulse">
                      OhmS-44
                    </span>
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-vhs text-white/80 drop-shadow tracking-wide">
                  Where Energy Meets Excellence.
                </p>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <UserProfile />

              {/* Download Button */}
              <button
                onClick={() => window.location.href = '/download'}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20 text-white hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 retro-btn group"
                aria-label="Download OhmS-44 App"
                title="Download App"
              >
                <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-vhs tracking-wide">Download</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={handleThemeToggle}
                className="relative p-2 sm:p-2.5 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20 text-white hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 retro-btn group"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={theme === 'dark'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
                ) : (
                  <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
                )}
                {/* Button Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-retro-yellow/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Border with Retro Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>

      {showDeveloperModal && <DeveloperModal onClose={() => setShowDeveloperModal(false)} />}
    </header>
  );
};

// RESTORED: Using original header as requested
export default OriginalHeader;

/*
BACKUP RESTORATION INSTRUCTIONS:
If you want to go back to the original header design:
1. Change the export line above to: export default OriginalHeader;
2. Or replace the entire Header component with the OriginalHeader component
3. The original design is preserved in the OriginalHeader component above
*/