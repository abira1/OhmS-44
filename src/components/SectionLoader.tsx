// Section-specific loading component for individual sections
import React from 'react';
import { CalendarIcon, UsersIcon, ClipboardCheckIcon, BellIcon, BookOpenIcon, DatabaseIcon, WifiIcon } from 'lucide-react';

export type LoadingSection = 'app' | 'routine' | 'classmates' | 'attendance' | 'notices' | 'notes' | 'firebase';

interface SectionLoaderProps {
  section: LoadingSection;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
}

const sectionConfig = {
  routine: {
    icon: CalendarIcon,
    title: 'Loading Routine',
    color: 'text-retro-purple dark:text-retro-teal',
    bgColor: 'bg-retro-purple/10 dark:bg-retro-blue/10',
    gradientColor: 'from-retro-purple to-retro-pink dark:from-retro-blue dark:to-retro-teal'
  },
  classmates: {
    icon: UsersIcon,
    title: 'Loading Classmates',
    color: 'text-retro-pink dark:text-retro-teal',
    bgColor: 'bg-retro-pink/10 dark:bg-retro-teal/10',
    gradientColor: 'from-retro-pink to-retro-coral dark:from-retro-teal dark:to-retro-green'
  },
  attendance: {
    icon: ClipboardCheckIcon,
    title: 'Loading Attendance',
    color: 'text-retro-coral dark:text-retro-green',
    bgColor: 'bg-retro-coral/10 dark:bg-retro-green/10',
    gradientColor: 'from-retro-coral to-retro-yellow dark:from-retro-green dark:to-retro-blue'
  },
  notices: {
    icon: BellIcon,
    title: 'Loading Notices',
    color: 'text-retro-yellow dark:text-retro-blue',
    bgColor: 'bg-retro-yellow/10 dark:bg-retro-blue/10',
    gradientColor: 'from-retro-yellow to-retro-purple dark:from-retro-blue dark:to-retro-purple'
  },
  notes: {
    icon: BookOpenIcon,
    title: 'Loading Notes',
    color: 'text-retro-orange dark:text-retro-yellow',
    bgColor: 'bg-retro-orange/10 dark:bg-retro-yellow/10',
    gradientColor: 'from-retro-orange to-retro-coral dark:from-retro-yellow dark:to-retro-orange'
  },
  firebase: {
    icon: WifiIcon,
    title: 'Connecting',
    color: 'text-retro-teal dark:text-retro-green',
    bgColor: 'bg-retro-teal/10 dark:bg-retro-green/10',
    gradientColor: 'from-retro-teal to-retro-blue dark:from-retro-green dark:to-retro-teal'
  },
  app: {
    icon: DatabaseIcon,
    title: 'Loading',
    color: 'text-retro-purple dark:text-retro-teal',
    bgColor: 'bg-retro-purple/10 dark:bg-retro-blue/10',
    gradientColor: 'from-retro-purple to-retro-pink dark:from-retro-blue dark:to-retro-teal'
  }
};

const SectionLoader: React.FC<SectionLoaderProps> = ({
  section,
  message,
  size = 'medium',
  showProgress = false,
  progress = 0
}) => {
  const config = sectionConfig[section];
  const IconComponent = config.icon;

  const sizeClasses = {
    small: {
      container: 'py-8',
      icon: 'h-8 w-8',
      iconContainer: 'p-3',
      title: 'text-lg',
      message: 'text-sm'
    },
    medium: {
      container: 'py-12',
      icon: 'h-12 w-12',
      iconContainer: 'p-4',
      title: 'text-xl',
      message: 'text-base'
    },
    large: {
      container: 'py-16',
      icon: 'h-16 w-16',
      iconContainer: 'p-6',
      title: 'text-2xl',
      message: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${classes.container}`}>
      {/* Animated icon */}
      <div className="relative mb-6">
        <div className={`${config.bgColor} ${classes.iconContainer} rounded-2xl neu-shadow-lg`}>
          <IconComponent className={`${classes.icon} ${config.color} animate-pulse`} />
        </div>
        <div className={`absolute -inset-2 bg-gradient-to-r ${config.gradientColor} opacity-20 rounded-2xl animate-pulse -z-10`}></div>
      </div>

      {/* Title */}
      <h3 className={`${classes.title} font-bold text-gray-800 dark:text-gray-100 mb-2`}>
        {config.title}
      </h3>

      {/* Message */}
      {message && (
        <p className={`${classes.message} text-gray-600 dark:text-gray-400 text-center max-w-md mb-4`}>
          {message}
        </p>
      )}

      {/* Progress bar */}
      {showProgress && (
        <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden neu-shadow-inner">
          <div 
            className={`h-full bg-gradient-to-r ${config.gradientColor} transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Loading dots animation */}
      <div className="flex space-x-1 mt-4">
        <div className={`w-2 h-2 ${config.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`w-2 h-2 ${config.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`w-2 h-2 ${config.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default SectionLoader;
