import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  displayName: string;
  photoURL?: string;
  email?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showTooltip?: boolean;
  className?: string;
  isAdmin?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl'
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName,
  photoURL,
  email,
  size = 'md',
  showName = false,
  showTooltip = true,
  className = '',
  isAdmin = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Get initials from display name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(displayName || 'Anonymous');
  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  const avatarContent = () => {
    if (photoURL && !imageError) {
      return (
        <img
          src={photoURL}
          alt={`${displayName}'s avatar`}
          className={`${sizeClass} rounded-full object-cover avatar-image ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      );
    }

    // Fallback to initials or icon
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-retro-purple to-retro-pink flex items-center justify-center text-white font-vhs font-bold ${textSizeClass}`}>
        {initials || <User className={`${size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />}
      </div>
    );
  };

  const avatarElement = (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Avatar with retro border effect */}
      <div className={`relative ${isAdmin ? 'ring-2 ring-retro-yellow ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''} rounded-full`}>
        {avatarContent()}
        
        {/* Admin badge */}
        {isAdmin && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-retro-yellow rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
            <span className="text-xs font-bold text-black">A</span>
          </div>
        )}
        
        {/* Retro glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-retro-purple/20 to-retro-pink/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Name display */}
      {showName && (
        <div className="ml-2 flex flex-col">
          <span className={`font-vhs font-medium text-gray-900 dark:text-gray-100 ${textSizeClass}`}>
            {displayName}
            {isAdmin && (
              <span className="ml-1 text-retro-yellow text-xs font-bold">ADMIN</span>
            )}
          </span>
          {email && size !== 'xs' && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-vhs">
              {email}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Wrap with tooltip if enabled
  if (showTooltip && !showName) {
    return (
      <div 
        className="group relative"
        title={`${displayName}${isAdmin ? ' (Admin)' : ''}${email ? ` - ${email}` : ''}`}
      >
        {avatarElement}
        
        {/* Custom tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {displayName}
          {isAdmin && <span className="text-retro-yellow ml-1">(Admin)</span>}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      </div>
    );
  }

  return avatarElement;
};

// Avatar group component for showing multiple users
export const UserAvatarGroup: React.FC<{
  users: Array<{
    displayName: string;
    photoURL?: string;
    email?: string;
    isAdmin?: boolean;
  }>;
  maxDisplay?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ users, maxDisplay = 3, size = 'sm', className = '' }) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <div key={index} className="relative">
            <UserAvatar
              displayName={user.displayName}
              photoURL={user.photoURL}
              email={user.email}
              size={size}
              isAdmin={user.isAdmin}
              className="border-2 border-white dark:border-gray-800"
            />
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-vhs font-bold ${textSizeClasses[size]} border-2 border-white dark:border-gray-800`}>
            +{remainingCount}
          </div>
        )}
      </div>
      
      {users.length > 0 && (
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-vhs">
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </span>
      )}
    </div>
  );
};
