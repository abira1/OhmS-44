import { useEffect, useState, useCallback } from 'react';

export interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  focusVisible: boolean;
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    fontSize: 'medium',
    focusVisible: false
  });

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    setPreferences(prev => ({ ...prev, prefersReducedMotion: motionQuery.matches }));
    motionQuery.addEventListener('change', updateMotionPreference);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const updateContrastPreference = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, prefersHighContrast: e.matches }));
    };
    setPreferences(prev => ({ ...prev, prefersHighContrast: contrastQuery.matches }));
    contrastQuery.addEventListener('change', updateContrastPreference);

    // Check for dark mode preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateDarkModePreference = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, prefersDarkMode: e.matches }));
    };
    setPreferences(prev => ({ ...prev, prefersDarkMode: darkModeQuery.matches }));
    darkModeQuery.addEventListener('change', updateDarkModePreference);

    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse accessibility preferences:', error);
      }
    }

    // Cleanup
    return () => {
      motionQuery.removeEventListener('change', updateMotionPreference);
      contrastQuery.removeEventListener('change', updateContrastPreference);
      darkModeQuery.removeEventListener('change', updateDarkModePreference);
    };
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    const { prefersReducedMotion, prefersHighContrast, prefersDarkMode, ...userPreferences } = preferences;
    localStorage.setItem('accessibility-preferences', JSON.stringify(userPreferences));
  }, [preferences]);

  const updateFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    // Apply font size to document
    const root = document.documentElement;
    switch (size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  }, []);

  const toggleFocusVisible = useCallback(() => {
    setPreferences(prev => ({ ...prev, focusVisible: !prev.focusVisible }));
  }, []);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent, onEnter?: () => void, onEscape?: () => void) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, []);

  // Focus management
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-retro-purple focus:text-white focus:rounded';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return skipLink;
  }, []);

  return {
    preferences,
    updateFontSize,
    toggleFocusVisible,
    handleKeyboardNavigation,
    trapFocus,
    announceToScreenReader,
    createSkipLink
  };
};
