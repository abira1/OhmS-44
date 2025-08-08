// Waiting for approval page component with calm, neumorphic styling
import React, { useEffect, useState } from 'react';
import { Clock, User, Mail, LogOut, RefreshCw } from 'lucide-react';
import { User as UserType } from '../../types';

interface WaitingForApprovalPageProps {
  user: UserType;
  onSignOut: () => Promise<void>;
  onRefresh?: () => void;
}

export const WaitingForApprovalPage: React.FC<WaitingForApprovalPageProps> = ({
  user,
  onSignOut,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Signal that React has mounted successfully to prevent browser compatibility fallback
  useEffect(() => {
    const signalReactMounted = () => {
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('data-react-mounted', 'true');
        window.dispatchEvent(new CustomEvent('react-mounted'));
        console.log('React mounted from WaitingForApprovalPage');
      }
    };

    signalReactMounted();
  }, []);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-retro-cream dark:bg-retro-black flex items-center justify-center p-4">
      {/* Main container */}
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl neu-shadow mb-6">
            <Clock className="w-8 h-8 text-orange-500 dark:text-orange-400" />
          </div>

          <h1 className="text-3xl font-vhs font-bold text-orange-600 dark:text-orange-400 mb-2">
            Pending Approval
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-vhs">
            Your access request is being reviewed
          </p>
        </div>

        {/* Status card */}
        <div className="neu-card p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-vhs font-bold text-gray-800 dark:text-gray-100 mb-2">
              Request Submitted
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              An administrator will review your request shortly
            </p>
          </div>

          {/* User info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl neu-shadow-sm flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-vhs text-sm font-bold">Name</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {user.displayName || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl neu-shadow-sm flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-vhs text-sm font-bold">Email</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl neu-shadow-sm flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-vhs text-sm font-bold">Requested</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-600 dark:text-orange-400 font-vhs text-sm">
                Pending Review
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-gray-800 dark:text-gray-200 font-vhs text-sm font-bold mb-3 text-center">
              What happens next?
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Your request has been sent to administrators</p>
              <p>• You'll be notified when it's reviewed</p>
              <p>• Approval typically takes 24-48 hours</p>
              <p>• You can safely close this page and return later</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full neu-button p-4 rounded-xl flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-retro-purple dark:text-retro-teal ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-vhs text-gray-700 dark:text-gray-300">
              {isRefreshing ? 'Checking...' : 'Check Status'}
            </span>
          </button>

          <button
            onClick={onSignOut}
            className="w-full neu-button p-4 rounded-xl flex items-center justify-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-vhs">Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-vhs">
            Request ID: {user.uid.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingForApprovalPage;
