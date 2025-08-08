import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  glowEffect?: boolean;
}

export const RetroButton = forwardRef<HTMLButtonElement, RetroButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  glowEffect = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'retro-btn-enhanced font-vhs transform transition-all duration-200 micro-bounce focus-visible rounded-lg border border-gray-400 dark:border-gray-600';
  
  const variantClasses = {
    primary: 'bg-retro-purple text-white hover:bg-retro-pink shadow-lg hover:shadow-xl',
    secondary: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-retro-cream dark:hover:bg-gray-700',
    accent: 'bg-retro-teal text-black hover:bg-retro-yellow shadow-lg hover:shadow-xl',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${glowEffect ? 'pulse-glow' : ''}
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const LoadingSpinner = () => (
    <div className="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner />
          <span>Loading...</span>
        </div>
      );
    }

    const iconElement = Icon && (
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
    );

    if (iconPosition === 'right') {
      return (
        <div className="flex items-center justify-center gap-2">
          <span>{children}</span>
          {iconElement}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        {iconElement}
        <span>{children}</span>
      </div>
    );
  };

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

RetroButton.displayName = 'RetroButton';

// Specialized button variants
export const RetroIconButton = forwardRef<HTMLButtonElement, Omit<RetroButtonProps, 'children'> & { icon: LucideIcon; 'aria-label': string }>(({
  icon: Icon,
  size = 'md',
  variant = 'secondary',
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <RetroButton
      ref={ref}
      variant={variant}
      className={`${sizeClasses[size]} ${className}`}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </RetroButton>
  );
});

RetroIconButton.displayName = 'RetroIconButton';

export const RetroFloatingActionButton = forwardRef<HTMLButtonElement, RetroButtonProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <RetroButton
      ref={ref}
      variant="primary"
      size="lg"
      glowEffect
      className={`fixed bottom-6 right-6 rounded-full shadow-lg z-40 ${className}`}
      {...props}
    >
      {children}
    </RetroButton>
  );
});

RetroFloatingActionButton.displayName = 'RetroFloatingActionButton';
