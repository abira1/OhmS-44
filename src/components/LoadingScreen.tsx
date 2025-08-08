import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { OptimizedImage } from './ui/OptimizedImage';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onLoadingComplete
}) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Show content with a small delay for better effect
    const contentTimer = setTimeout(() => setShowContent(true), 500);

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);

    // Complete loading after progress reaches 100%
    const completeTimer = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      // Add a small delay before calling onLoadingComplete
      setTimeout(() => {
        if (!hasCompleted) {
          setHasCompleted(true);
          onLoadingComplete();
        }
      }, 800);
    }, 2500);

    return () => {
      clearTimeout(contentTimer);
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete, hasCompleted]);
  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-retro-black' : 'bg-retro-cream'} transition-all duration-500`}>
      <div className="retro-scanline"></div>
      <div className="retro-noise"></div>
      <div className={`transform transition-all duration-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <OptimizedImage
              src="https://i.postimg.cc/sg4z0qBN/a-modern-logo-design-featuring-the-ohm-s-u15c-EDB4-RQu-RJu4y-FAXImw-j-Jr-Xa-M7-BQo-KPk5-Nv-Wb-Zp6-Q.png"
              alt="OhmS-44 Logo"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain retro-glitch neu-shadow-sm rounded-xl p-2 bg-white dark:bg-gray-800"
              lazy={false}
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-retro-purple via-retro-pink to-retro-teal dark:from-retro-blue dark:via-retro-teal dark:to-retro-green opacity-50 rounded-xl animate-pulse -z-10"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-retro mt-6 text-retro-purple dark:text-retro-teal" style={{
            textShadow: '3px 3px 0px rgba(0,0,0,0.5)'
          }}>
            OhmS-44
          </h1>
          <p className="text-lg font-vhs text-gray-700 dark:text-gray-300 mt-2">
            Where Energy Meets Excellence.
          </p>
        </div>
        <div className="w-64 sm:w-80 h-8 neu-shadow-inner bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-black dark:border-gray-600 relative">
          <div
            className="h-full bg-gradient-to-r from-retro-purple to-retro-pink dark:from-retro-blue dark:to-retro-teal transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-vhs text-sm text-black dark:text-white">
              LOADING {Math.floor(progress)}%
            </span>
          </div>
        </div>
        <div className="mt-4 font-vhs text-xs text-center text-gray-600 dark:text-gray-400 animate-pulse">
          <span className="inline-block mx-1">INITIALIZING</span>
          <span className="inline-block mx-1 animate-blink">_</span>
        </div>
      </div>
    </div>
  );
};
export default LoadingScreen;