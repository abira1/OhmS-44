// User profile component for displaying current user and authentication status
import React, { useState } from 'react';
import { UserIcon, LogOutIcon, ShieldIcon, ChevronDownIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
      setIsDropdownOpen(false);
    }
  };

  // Don't show anything if no user is authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* User Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        disabled={loading}
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="w-8 h-8 rounded-full neu-shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center neu-shadow-sm">
            <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-24">
            {user.displayName || 'User'}
          </p>
          <div className="flex items-center gap-1">
            {isAdmin ? (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <ShieldIcon className="h-3 w-3" />
                Admin
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <UserIcon className="h-3 w-3" />
                User
              </div>
            )}
          </div>
        </div>
        
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 neu-shadow">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-12 h-12 rounded-full neu-shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center neu-shadow-sm">
                    <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {isAdmin ? (
                      <div className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        <ShieldIcon className="h-3 w-3" />
                        Admin
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        <UserIcon className="h-3 w-3" />
                        User
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-600 mb-4"></div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSigningOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                ) : (
                  <LogOutIcon className="h-4 w-4" />
                )}
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
