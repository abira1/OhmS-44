import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCwIcon, ChevronDownIcon, CheckCircleIcon, RotateCcwIcon } from 'lucide-react';
import { usePullToRefresh, PullToRefreshState } from '../../hooks/useTouchGestures';
import { pullToRefreshHaptics, HapticFeedbackType } from '../../utils/hapticFeedback';
import { getRefreshCapabilities, useDeviceCapabilities } from '../../utils/deviceCapabilities';

interface MobileLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  showRefresh?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  onRefresh,
  showRefresh = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const deviceCapabilities = useDeviceCapabilities();
  const refreshCapabilities = getRefreshCapabilities();

  const [refreshState, setRefreshState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false,
    refreshTriggered: false
  });

  // Enhanced haptic feedback handler with Capacitor integration
  const handleHapticFeedback = useCallback(async (type: 'light' | 'medium' | 'heavy') => {
    try {
      switch (type) {
        case 'light':
          await pullToRefreshHaptics.start();
          break;
        case 'medium':
          await pullToRefreshHaptics.threshold();
          break;
        case 'heavy':
          await pullToRefreshHaptics.release();
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, []);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    try {
      await onRefresh();
      await pullToRefreshHaptics.success();
    } catch (error) {
      console.error('Refresh failed:', error);
      await pullToRefreshHaptics.error();
    }
  };

  const handleStateChange = useCallback((state: PullToRefreshState) => {
    setRefreshState(state);
  }, []);

  const { bindPullToRefresh, state } = usePullToRefresh(handleRefresh, {
    threshold: 80,
    maxPullDistance: 120,
    resistance: 0.6,
    onStateChange: handleStateChange,
    onHapticFeedback: handleHapticFeedback,
    disabled: !showRefresh || !refreshCapabilities.canUsePullToRefresh
  });

  // Handle keyboard shortcuts for refresh (desktop fallback)
  useEffect(() => {
    if (!refreshCapabilities.shouldShowRefreshButton) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+R or Cmd+R for refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !state.isRefreshing) {
        e.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [refreshCapabilities.shouldShowRefreshButton, state.isRefreshing, handleRefresh]);

  useEffect(() => {
    if (!showRefresh || !refreshCapabilities.canUsePullToRefresh) return;
    const cleanup = bindPullToRefresh(containerRef.current);
    return cleanup;
  }, [bindPullToRefresh, showRefresh, refreshCapabilities.canUsePullToRefresh]);

  // Calculate indicator position and opacity
  const indicatorTransform = Math.min(state.pullDistance * 0.8, 100);
  const indicatorOpacity = Math.min(state.pullDistance / 40, 1);
  const progressPercentage = Math.min((state.pullDistance / 80) * 100, 100);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-retro-cream dark:bg-gray-900 transition-colors duration-400 relative overflow-hidden"
      style={{
        transform: state.isPulling ? `translateY(${Math.min(state.pullDistance * 0.3, 40)}px)` : 'translateY(0)',
        transition: state.isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Enhanced Pull to Refresh Indicator */}
      {showRefresh && (state.isPulling || state.isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center"
          style={{
            transform: `translateY(${indicatorTransform - 60}px)`,
            opacity: indicatorOpacity,
            transition: state.isPulling ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Main Indicator Container */}
          <div className="relative">
            {/* Retro-styled background with CRT effect */}
            <div
              className="bg-retro-purple dark:bg-retro-green text-white px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm border-2 border-white/20"
              style={{
                background: state.canRefresh
                  ? 'linear-gradient(135deg, #9D4EDD 0%, #C77DFF 100%)'
                  : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
                boxShadow: state.canRefresh
                  ? '0 8px 32px rgba(157, 78, 221, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transform: state.canRefresh ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease-out'
              }}
            >
              <div className="flex items-center gap-3">
                {/* Icon with rotation animation */}
                <div className="relative">
                  {state.isRefreshing ? (
                    <RefreshCwIcon
                      className="h-5 w-5 animate-spin"
                      style={{ animationDuration: '1s' }}
                    />
                  ) : state.canRefresh ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-300" />
                  ) : (
                    <ChevronDownIcon
                      className="h-5 w-5 transition-transform duration-200"
                      style={{
                        transform: `rotate(${Math.min(state.pullDistance * 2, 180)}deg)`
                      }}
                    />
                  )}
                </div>

                {/* Status Text */}
                <span className="text-sm font-vhs font-bold tracking-wide">
                  {state.isRefreshing
                    ? 'REFRESHING...'
                    : state.canRefresh
                      ? 'RELEASE TO REFRESH'
                      : 'PULL TO REFRESH'
                  }
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-100 ease-out"
                  style={{
                    width: `${progressPercentage}%`,
                    background: state.canRefresh
                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                      : 'linear-gradient(90deg, #F3F4F6, #E5E7EB)'
                  }}
                />
              </div>
            </div>

            {/* Retro scanlines effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 1px,
                  rgba(255, 255, 255, 0.1) 1px,
                  rgba(255, 255, 255, 0.1) 2px
                )`
              }}
            />
          </div>

          {/* Ripple effect for successful refresh */}
          {state.refreshTriggered && (
            <div className="absolute inset-0 rounded-2xl border-2 border-retro-purple animate-ping opacity-75" />
          )}
        </div>
      )}

      {/* Main Content with smooth transition */}
      <div
        className="relative"
        style={{
          filter: state.isRefreshing ? 'blur(0.5px)' : 'none',
          transition: 'filter 0.3s ease-out'
        }}
      >
        {children}
      </div>

      {/* Fallback refresh button for non-touch devices */}
      {showRefresh && refreshCapabilities.shouldShowRefreshButton && (
        <button
          onClick={handleRefresh}
          disabled={state.isRefreshing}
          className="fixed top-4 right-4 z-50 bg-retro-purple hover:bg-retro-purple/90 disabled:bg-gray-400 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          title="Refresh content (Ctrl+R)"
          aria-label="Refresh content"
        >
          <RotateCcwIcon
            className={`h-5 w-5 ${state.isRefreshing ? 'animate-spin' : ''}`}
            style={{ animationDuration: state.isRefreshing ? '1s' : undefined }}
          />
        </button>
      )}

      {/* Subtle overlay during refresh */}
      {state.isRefreshing && (
        <div className="fixed inset-0 bg-black/5 pointer-events-none z-40 transition-opacity duration-300" />
      )}
    </div>
  );
};

// Mobile-optimized container
export const MobileContainer: React.FC<{ 
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2',
    md: 'px-4 py-4',
    lg: 'px-6 py-6'
  };

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-optimized grid
export const MobileGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  children,
  columns = 1,
  gap = 'md',
  className = ''
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-optimized card
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
}> = ({
  children,
  className = '',
  padding = 'md',
  clickable = false,
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div 
      className={`
        neu-card rounded-xl transition-all duration-200
        ${paddingClasses[padding]}
        ${clickable ? 'cursor-pointer hover:shadow-lg active:scale-95' : ''}
        ${className}
      `}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

// Mobile-optimized list
export const MobileList: React.FC<{
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}> = ({
  children,
  className = '',
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-optimized section header
export const MobileSectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({
  title,
  subtitle,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h2 className="text-xl font-vhs font-bold text-gray-900 dark:text-white retro-heading">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized bottom sheet
export const MobileBottomSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({
  isOpen,
  onClose,
  children,
  title
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl max-h-[80vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-vhs font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
