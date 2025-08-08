import { useCallback, useRef, useEffect, useState } from 'react';

// Performance utility: throttle function for smooth animations
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useTouchGestures = (options: TouchGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventScroll = false
  } = options;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchEnd.current = null;

    if (preventScroll) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Prevent scroll during swipe if enabled
    if (preventScroll) {
      const deltaX = Math.abs(touch.clientX - touchStart.current.x);
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);
      
      // If horizontal swipe is more prominent, prevent vertical scroll
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  }, [preventScroll]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    // Ignore if touch was too slow (likely not a swipe)
    if (deltaTime > 500) return;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (absDeltaX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (absDeltaY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    // Reset
    touchStart.current = null;
    touchEnd.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const bindTouchEvents = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return { bindTouchEvents };
};

// Hook for swipeable navigation
export const useSwipeNavigation = (
  tabs: string[],
  activeTab: string,
  setActiveTab: (tab: string) => void
) => {
  const currentIndex = tabs.indexOf(activeTab);

  const goToNextTab = useCallback(() => {
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  }, [currentIndex, tabs, setActiveTab]);

  const goToPrevTab = useCallback(() => {
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[prevIndex]);
  }, [currentIndex, tabs, setActiveTab]);

  const { bindTouchEvents } = useTouchGestures({
    onSwipeLeft: goToNextTab,
    onSwipeRight: goToPrevTab,
    threshold: 75,
    preventScroll: false
  });

  return { bindTouchEvents, goToNextTab, goToPrevTab };
};

// Enhanced pull-to-refresh functionality with visual feedback and haptic support
export interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
  refreshTriggered: boolean;
}

export interface PullToRefreshOptions {
  threshold?: number;
  maxPullDistance?: number;
  resistance?: number;
  onStateChange?: (state: PullToRefreshState) => void;
  onHapticFeedback?: (type: 'light' | 'medium' | 'heavy') => void;
  disabled?: boolean;
}

export const usePullToRefresh = (
  onRefresh: () => void | Promise<void>,
  options: PullToRefreshOptions = {}
) => {
  const {
    threshold = 80,
    maxPullDistance = 150,
    resistance = 0.5,
    onStateChange,
    onHapticFeedback,
    disabled = false
  } = options;

  // Touch tracking refs
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const lastY = useRef<number>(0);
  const startTime = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const hasTriggeredHaptic = useRef<boolean>(false);
  const animationFrame = useRef<number | null>(null);

  // State management with performance optimization
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false,
    refreshTriggered: false
  });

  // Throttle state updates for better performance
  const throttledUpdateState = useCallback(
    throttle((newState: Partial<PullToRefreshState>) => {
      setState(prevState => {
        const updatedState = { ...prevState, ...newState };
        onStateChange?.(updatedState);
        return updatedState;
      });
    }, 16), // ~60fps
    [onStateChange]
  );

  // Utility functions
  const isAtTop = useCallback(() => {
    return window.scrollY <= 5; // Small tolerance for scroll position
  }, []);

  const calculatePullDistance = useCallback((currentY: number, startY: number) => {
    const rawDistance = currentY - startY;
    if (rawDistance <= 0) return 0;

    // Apply resistance curve for more natural feel
    const resistanceDistance = rawDistance * resistance;
    return Math.min(resistanceDistance, maxPullDistance);
  }, [resistance, maxPullDistance]);

  // Immediate state updates for critical changes
  const updateState = useCallback((newState: Partial<PullToRefreshState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      onStateChange?.(updatedState);
      return updatedState;
    });
  }, [onStateChange]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !isAtTop()) return;

    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
    lastY.current = touch.clientY;
    startTime.current = Date.now();
    hasTriggeredHaptic.current = false;

    updateState({
      isPulling: false,
      pullDistance: 0,
      canRefresh: false,
      refreshTriggered: false
    });
  }, [disabled, isAtTop, updateState]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing.current) return;

    const touch = e.touches[0];
    currentY.current = touch.clientY;

    // Only process if we're at the top and pulling down
    if (!isAtTop() || currentY.current <= startY.current) {
      if (state.isPulling) {
        updateState({
          isPulling: false,
          pullDistance: 0,
          canRefresh: false
        });
      }
      return;
    }

    const pullDistance = calculatePullDistance(currentY.current, startY.current);
    const canRefresh = pullDistance >= threshold;
    const isPulling = pullDistance > 0;

    // Trigger haptic feedback when threshold is reached
    if (canRefresh && !hasTriggeredHaptic.current) {
      onHapticFeedback?.('medium');
      hasTriggeredHaptic.current = true;
    }

    // Prevent default scrolling when pulling
    if (isPulling) {
      e.preventDefault();
    }

    // Use throttled updates for smooth pull animations
    throttledUpdateState({
      isPulling,
      pullDistance,
      canRefresh,
      refreshTriggered: false
    });

    lastY.current = currentY.current;
  }, [disabled, isAtTop, calculatePullDistance, threshold, state.isPulling, updateState, onHapticFeedback]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing.current) return;

    const pullDistance = calculatePullDistance(currentY.current, startY.current);
    const shouldRefresh = pullDistance >= threshold && isAtTop();

    if (shouldRefresh) {
      isRefreshing.current = true;
      onHapticFeedback?.('heavy');

      updateState({
        isPulling: false,
        isRefreshing: true,
        refreshTriggered: true,
        canRefresh: false
      });

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      } finally {
        isRefreshing.current = false;
        updateState({
          isRefreshing: false,
          pullDistance: 0,
          refreshTriggered: false
        });
      }
    } else {
      // Reset state if refresh wasn't triggered
      updateState({
        isPulling: false,
        pullDistance: 0,
        canRefresh: false,
        refreshTriggered: false
      });
    }

    // Reset tracking values
    startY.current = 0;
    currentY.current = 0;
    lastY.current = 0;
    hasTriggeredHaptic.current = false;
  }, [disabled, calculatePullDistance, threshold, isAtTop, onRefresh, onHapticFeedback, updateState]);

  const bindPullToRefresh = useCallback((element: HTMLElement | null) => {
    if (!element || disabled) return;

    // Use passive: false for touchmove to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  return {
    bindPullToRefresh,
    state,
    isRefreshing: state.isRefreshing,
    pullDistance: state.pullDistance,
    canRefresh: state.canRefresh
  };
};
