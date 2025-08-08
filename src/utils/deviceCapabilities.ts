import React from 'react';

/**
 * Device capabilities detection and browser compatibility utilities
 * Provides comprehensive device and browser feature detection
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  hasMouse: boolean;
  hasKeyboard: boolean;
  supportsVibration: boolean;
  supportsHaptics: boolean;
  supportsServiceWorker: boolean;
  supportsPWA: boolean;
  isOnline: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  platform: string;
  browser: string;
  browserVersion: string;
}

export interface TouchCapabilities {
  supportsTouchEvents: boolean;
  supportsPointerEvents: boolean;
  maxTouchPoints: number;
  touchType: 'none' | 'stylus' | 'finger' | 'unknown';
}

export interface RefreshCapabilities {
  canUsePullToRefresh: boolean;
  shouldShowRefreshButton: boolean;
  preferredRefreshMethod: 'pull' | 'button' | 'keyboard';
  supportsGestures: boolean;
}

class DeviceCapabilityDetector {
  private static instance: DeviceCapabilityDetector;
  private capabilities: DeviceCapabilities | null = null;
  private touchCapabilities: TouchCapabilities | null = null;

  static getInstance(): DeviceCapabilityDetector {
    if (!DeviceCapabilityDetector.instance) {
      DeviceCapabilityDetector.instance = new DeviceCapabilityDetector();
    }
    return DeviceCapabilityDetector.instance;
  }

  /**
   * Detect comprehensive device capabilities
   */
  detectCapabilities(): DeviceCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Screen size detection
    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenSize = this.getScreenSize(width);
    
    // Device type detection
    const isMobile = this.isMobileDevice(userAgent, width);
    const isTablet = this.isTabletDevice(userAgent, width);
    const isDesktop = !isMobile && !isTablet;
    
    // Input capabilities
    const hasTouch = this.detectTouchSupport();
    const hasMouse = this.detectMouseSupport();
    const hasKeyboard = this.detectKeyboardSupport();
    
    // Feature support
    const supportsVibration = 'vibrate' in navigator;
    const supportsHaptics = this.detectHapticsSupport();
    const supportsServiceWorker = 'serviceWorker' in navigator;
    const supportsPWA = this.detectPWASupport();
    
    // Network status
    const isOnline = navigator.onLine;
    
    // Display properties
    const orientation = height > width ? 'portrait' : 'landscape';
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Browser detection
    const { browser, version } = this.detectBrowser(userAgent);

    this.capabilities = {
      isMobile,
      isTablet,
      isDesktop,
      hasTouch,
      hasMouse,
      hasKeyboard,
      supportsVibration,
      supportsHaptics,
      supportsServiceWorker,
      supportsPWA,
      isOnline,
      screenSize,
      orientation,
      pixelRatio,
      platform,
      browser,
      browserVersion: version
    };

    return this.capabilities;
  }

  /**
   * Detect touch-specific capabilities
   */
  detectTouchCapabilities(): TouchCapabilities {
    if (this.touchCapabilities) {
      return this.touchCapabilities;
    }

    const supportsTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsPointerEvents = 'onpointerdown' in window;
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    
    // Determine touch type
    let touchType: TouchCapabilities['touchType'] = 'none';
    if (maxTouchPoints > 0) {
      // Heuristic: stylus typically has 1 touch point, finger has multiple
      touchType = maxTouchPoints === 1 ? 'stylus' : 'finger';
    }

    this.touchCapabilities = {
      supportsTouchEvents,
      supportsPointerEvents,
      maxTouchPoints,
      touchType
    };

    return this.touchCapabilities;
  }

  /**
   * Determine refresh capabilities based on device and browser
   */
  getRefreshCapabilities(): RefreshCapabilities {
    const deviceCaps = this.detectCapabilities();
    const touchCaps = this.detectTouchCapabilities();

    const canUsePullToRefresh = deviceCaps.hasTouch && 
                               touchCaps.supportsTouchEvents && 
                               (deviceCaps.isMobile || deviceCaps.isTablet);

    const shouldShowRefreshButton = !canUsePullToRefresh || deviceCaps.isDesktop;
    
    const preferredRefreshMethod = canUsePullToRefresh ? 'pull' : 
                                  deviceCaps.hasKeyboard ? 'keyboard' : 'button';

    const supportsGestures = touchCaps.supportsTouchEvents && deviceCaps.hasTouch;

    return {
      canUsePullToRefresh,
      shouldShowRefreshButton,
      preferredRefreshMethod,
      supportsGestures
    };
  }

  private isMobileDevice(userAgent: string, width: number): boolean {
    const mobileKeywords = [
      'mobile', 'android', 'iphone', 'ipod', 'blackberry', 
      'windows phone', 'opera mini', 'iemobile'
    ];
    
    const hasMobileKeyword = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const hasSmallScreen = width < 768;
    
    return hasMobileKeyword || hasSmallScreen;
  }

  private isTabletDevice(userAgent: string, width: number): boolean {
    const tabletKeywords = ['ipad', 'tablet', 'kindle', 'silk', 'playbook'];
    const hasTabletKeyword = tabletKeywords.some(keyword => userAgent.includes(keyword));
    const hasTabletScreen = width >= 768 && width < 1024;
    
    return hasTabletKeyword || (hasTabletScreen && 'ontouchstart' in window);
  }

  private detectTouchSupport(): boolean {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch;
  }

  private detectMouseSupport(): boolean {
    return window.matchMedia('(pointer: fine)').matches;
  }

  private detectKeyboardSupport(): boolean {
    // Assume keyboard support unless explicitly a touch-only device
    return !this.isMobileDevice(navigator.userAgent.toLowerCase(), window.innerWidth) ||
           window.matchMedia('(pointer: fine)').matches;
  }

  private detectHapticsSupport(): boolean {
    // Check for Capacitor Haptics or Web Vibration API
    return 'vibrate' in navigator || 
           (window as any).Capacitor?.isPluginAvailable?.('Haptics') === true;
  }

  private detectPWASupport(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  private getScreenSize(width: number): DeviceCapabilities['screenSize'] {
    if (width < 640) return 'small';
    if (width < 1024) return 'medium';
    if (width < 1280) return 'large';
    return 'xlarge';
  }

  private detectBrowser(userAgent: string): { browser: string; version: string } {
    const browsers = [
      { name: 'Chrome', pattern: /chrome\/(\d+)/ },
      { name: 'Firefox', pattern: /firefox\/(\d+)/ },
      { name: 'Safari', pattern: /safari\/(\d+)/ },
      { name: 'Edge', pattern: /edge\/(\d+)/ },
      { name: 'Opera', pattern: /opera\/(\d+)/ },
      { name: 'Samsung', pattern: /samsungbrowser\/(\d+)/ }
    ];

    for (const browser of browsers) {
      const match = userAgent.match(browser.pattern);
      if (match) {
        return { browser: browser.name, version: match[1] };
      }
    }

    return { browser: 'Unknown', version: '0' };
  }

  /**
   * Reset cached capabilities (useful for testing or orientation changes)
   */
  reset(): void {
    this.capabilities = null;
    this.touchCapabilities = null;
  }

  /**
   * Listen for capability changes (orientation, online status, etc.)
   */
  onCapabilityChange(callback: (capabilities: DeviceCapabilities) => void): () => void {
    const handleChange = () => {
      this.reset();
      callback(this.detectCapabilities());
    };

    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);
    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
    };
  }
}

// Export singleton instance
export const deviceCapabilities = DeviceCapabilityDetector.getInstance();

// Convenience functions
export const getDeviceCapabilities = () => deviceCapabilities.detectCapabilities();
export const getTouchCapabilities = () => deviceCapabilities.detectTouchCapabilities();
export const getRefreshCapabilities = () => deviceCapabilities.getRefreshCapabilities();

// React hook for device capabilities
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = React.useState<DeviceCapabilities>(
    () => deviceCapabilities.detectCapabilities()
  );

  React.useEffect(() => {
    const unsubscribe = deviceCapabilities.onCapabilityChange(setCapabilities);
    return unsubscribe;
  }, []);

  return capabilities;
};
