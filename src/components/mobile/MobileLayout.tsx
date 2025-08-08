import React, { useState, useEffect, useRef } from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { usePullToRefresh } from '../../hooks/useTouchGestures';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  const { bindPullToRefresh } = usePullToRefresh(handleRefresh);

  useEffect(() => {
    if (!showRefresh) return;
    const cleanup = bindPullToRefresh(containerRef.current);
    return cleanup;
  }, [bindPullToRefresh, showRefresh]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-retro-cream dark:bg-gray-900 transition-colors duration-400"
    >
      {/* Pull to Refresh Indicator */}
      {showRefresh && pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4"
          style={{ transform: `translateY(${Math.min(pullDistance - 100, 50)}px)` }}
        >
          <div className="bg-retro-purple text-white px-4 py-2 rounded-full flex items-center gap-2">
            <RefreshCwIcon 
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            <span className="text-sm font-vhs">
              {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        {children}
      </div>
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
