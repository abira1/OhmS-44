import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, UsersIcon, ClipboardCheckIcon, BellIcon, BookOpenIcon, Shield } from 'lucide-react';
import { useSwipeNavigation } from '../../hooks/useTouchGestures';
import { useAuth } from '../../context/AuthContext';
import { isUserAdmin } from '../../types';



// CRT-Style Retro Navigation with 80s/90s aesthetic
const MobileNavigation: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);

  const baseTabs = [
    { id: 'routine', label: 'ROUTINE', icon: CalendarIcon, color: '#9D4EDD' },
    { id: 'classmates', label: 'CLASSMATES', icon: UsersIcon, color: '#00F5D4' },
    { id: 'attendance', label: 'ATTENDANCE', icon: ClipboardCheckIcon, color: '#FF6B6B' },
    { id: 'notice', label: 'NOTICE', icon: BellIcon, color: '#4ECDC4' },
    { id: 'notes', label: 'NOTES', icon: BookOpenIcon, color: '#FFB800' }
  ];

  // Add admin tab for admin users
  const tabs = React.useMemo(() => {
    return (user && isUserAdmin(user))
      ? [...baseTabs, { id: 'admin', label: 'ADMIN', icon: Shield, color: '#FF9500' }]
      : baseTabs;
  }, [user]);
  
  const { bindTouchEvents } = useSwipeNavigation(
    tabs.map(tab => tab.id),
    activeTab,
    setActiveTab
  );

  useEffect(() => {
    const cleanup = bindTouchEvents(navigationRef.current);
    return cleanup;
  }, [bindTouchEvents]);

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('swipe-hint-seen');
    if (!hasSeenHint) {
      setShowSwipeHint(true);
      setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('swipe-hint-seen', 'true');
      }, 3000);
    }
  }, []);

  // Track theme changes
  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Trigger random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 3 seconds
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);



  return (
    <div className="relative">
      {showSwipeHint && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 animate-fadeIn">
          <div
            className={`px-4 py-2 text-sm font-mono border ${
              isDarkMode
                ? 'bg-gray-900 text-cyan-400 border-cyan-400'
                : 'bg-white text-purple-600 border-purple-400'
            }`}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: isDarkMode
                ? '0 0 10px #00F5D4'
                : '0 0 10px #9D4EDD',
              boxShadow: isDarkMode
                ? '0 0 20px rgba(0, 245, 212, 0.3)'
                : '0 0 20px rgba(157, 78, 221, 0.3)',
              background: isDarkMode
                ? 'linear-gradient(45deg, rgba(0,0,0,0.9), rgba(13,13,35,0.9))'
                : 'linear-gradient(45deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))'
            }}
          >
            &gt; SWIPE_TO_NAVIGATE
          </div>
        </div>
      )}

      {/* CRT Monitor Navigation Container */}
      <nav
        ref={navigationRef}
        className={`mobile-navbar-fixed mobile-navbar-safe transition-all duration-500 overflow-hidden ${
          glitchEffect ? 'animate-pulse' : ''
        }`}
        role="navigation"
        aria-label="Main navigation"
        style={{
          background: isDarkMode
            ? `
                linear-gradient(180deg,
                  rgba(30, 41, 59, 0.95) 0%,
                  rgba(15, 23, 42, 0.98) 50%,
                  rgba(2, 6, 23, 1) 100%
                ),
                radial-gradient(circle at 50% 0%, rgba(157, 78, 221, 0.08) 0%, transparent 70%)
              `
            : `
                linear-gradient(180deg,
                  rgba(255, 255, 255, 0.95) 0%,
                  rgba(248, 250, 252, 0.98) 50%,
                  rgba(241, 245, 249, 1) 100%
                ),
                radial-gradient(circle at 50% 0%, rgba(157, 78, 221, 0.03) 0%, transparent 70%)
              `,
          borderTop: isDarkMode
            ? '1px solid rgba(0, 245, 212, 0.3)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: isDarkMode
            ? `
                0 -1px 0 rgba(157, 78, 221, 0.2),
                0 -8px 32px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `
            : `
                0 -1px 0 rgba(0, 0, 0, 0.05),
                0 -8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `,
          filter: glitchEffect ? 'hue-rotate(180deg) saturate(2)' : 'none',
          backdropFilter: 'blur(20px)',
          // Mobile-specific positioning fixes
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          // Safe area support for modern mobile devices
          paddingBottom: 'env(safe-area-inset-bottom)',
          // Prevent mobile browser from hiding the navbar
          minHeight: 'calc(60px + env(safe-area-inset-bottom))',
          // Ensure it stays visible during scroll
          transform: 'translateZ(0)', // Force hardware acceleration
          willChange: 'transform', // Optimize for animations
          // Prevent touch events from interfering
          touchAction: 'manipulation'
        }}
      >
        {/* CRT Scanlines Effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 245, 212, 0.1) 2px,
              rgba(0, 245, 212, 0.1) 4px
            )`
          }}
        />
        
        {/* Retro Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(157, 78, 221, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(157, 78, 221, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* VHS Noise Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5 animate-pulse">
          <div 
            className="w-full h-full"
            style={{
              background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
            }}
          />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">


          {/* Modern Rounded Navigation Buttons */}
          <div className="flex justify-center gap-3 py-2 px-3" role="tablist">
            {tabs.map((tab) => {
              // Safety check to prevent undefined icon errors
              if (!tab || !tab.icon || !tab.id || !tab.label) {
                console.warn('Invalid tab detected:', tab);
                return null;
              }

              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center relative transition-all duration-300 rounded-2xl group overflow-hidden ${
                    isActive ? 'scale-105' : 'scale-100 hover:scale-102'
                  }`}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${tab.color}, ${tab.color}CC)`
                      : isDarkMode
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(255,255,255,0.8)',
                    border: `2px solid ${isActive ? tab.color : isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: isActive
                      ? `
                          0 0 25px ${tab.color}60,
                          0 8px 16px rgba(0,0,0,0.3),
                          inset 0 1px 0 rgba(255,255,255,0.2)
                        `
                      : isDarkMode
                        ? '0 4px 8px rgba(0,0,0,0.2)'
                        : '0 4px 8px rgba(0,0,0,0.1)',
                    textShadow: isActive ? `0 0 10px ${tab.color}` : 'none',
                    filter: glitchEffect ? 'hue-rotate(45deg) saturate(1.5)' : 'none',
                    width: '75px',
                    height: '50px',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 6px'
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="main-content"
                >
                  <Icon
                    className={`transition-all duration-300 flex-shrink-0 ${
                      isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'
                    }`}
                    style={{
                      width: '18px',
                      height: '18px',
                      color: isActive
                        ? '#FFFFFF'
                        : isDarkMode
                          ? 'rgba(255,255,255,0.8)'
                          : 'rgba(0,0,0,0.7)',
                      filter: isActive ? `drop-shadow(0 0 8px ${tab.color})` : 'none',
                      marginBottom: '3px'
                    }}
                  />
                  <span
                    className={`transition-all duration-300 text-center leading-tight ${
                      isActive ? 'font-bold' : 'font-normal'
                    }`}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      color: isActive
                        ? '#FFFFFF'
                        : isDarkMode
                          ? 'rgba(255,255,255,0.8)'
                          : 'rgba(0,0,0,0.7)',
                      fontSize: '7px',
                      letterSpacing: '0.3px',
                      lineHeight: '1.1',
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </span>

                  {/* Subtle Glow Effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                    }`}
                    style={{
                      background: `radial-gradient(circle at center, ${tab.color}30, transparent 70%)`,
                      filter: 'blur(15px)'
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

// Mobile Tab Content Wrapper with swipe support
interface MobileTabContentProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

export const MobileTabContent: React.FC<MobileTabContentProps> = ({
  children,
  activeTab,
  setActiveTab,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'routine', label: 'ROUTINE', icon: CalendarIcon, color: '#9D4EDD' },
    { id: 'classmates', label: 'CLASSMATES', icon: UsersIcon, color: '#00F5D4' },
    { id: 'attendance', label: 'ATTENDANCE', icon: ClipboardCheckIcon, color: '#FF6B6B' },
    { id: 'notice', label: 'NOTICE', icon: BellIcon, color: '#4ECDC4' },
    { id: 'notes', label: 'NOTES', icon: BookOpenIcon, color: '#FFB800' },
    { id: 'admin', label: 'ADMIN', icon: Shield, color: '#FF9500' }
  ];

  const { bindTouchEvents } = useSwipeNavigation(
    tabs.map(tab => tab.id),
    activeTab,
    setActiveTab
  );

  useEffect(() => {
    const cleanup = bindTouchEvents(contentRef.current);
    return cleanup;
  }, [bindTouchEvents]);

  return (
    <div
      ref={contentRef}
      className={`touch-pan-y ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};

export default MobileNavigation;
