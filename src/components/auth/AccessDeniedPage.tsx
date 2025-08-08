// Access denied page component with calm, neumorphic styling
import React, { useEffect } from 'react';
import { XCircle, LogOut, AlertTriangle, Mail } from 'lucide-react';
import { User as UserType } from '../../types';

interface AccessDeniedPageProps {
  user: UserType;
  onSignOut: () => Promise<void>;
  reason?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  user,
  onSignOut,
  reason
}) => {
  // Signal that React has mounted successfully to prevent browser compatibility fallback
  useEffect(() => {
    const signalReactMounted = () => {
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('data-react-mounted', 'true');
        window.dispatchEvent(new CustomEvent('react-mounted'));
        console.log('React mounted from AccessDeniedPage');
      }
    };

    signalReactMounted();
  }, []);

  return (
    <div className="min-h-screen bg-retro-cream dark:bg-retro-black flex items-center justify-center p-4">
      {/* Main container */}
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl neu-shadow mb-6">
            <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-vhs font-bold text-red-600 dark:text-red-400 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-vhs">
            Your request has been reviewed
          </p>
        </div>

        {/* Status card */}
        <div className="neu-card p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-vhs font-bold text-gray-800 dark:text-gray-100 mb-2">
              Request Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              An administrator has reviewed and denied your access request
            </p>
          </div>

          {/* Status info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl neu-shadow-sm flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-vhs text-sm font-bold">Status</p>
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Access request denied
                </p>
              </div>
            </div>

            {reason && (
              <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl neu-shadow-sm flex items-center justify-center mt-0.5">
                  <Mail className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 font-vhs text-sm font-bold">Reason</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {reason}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-gray-800 dark:text-gray-200 font-vhs text-sm font-bold mb-3 text-center">
              What can you do?
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Contact the administrator for more information</p>
              <p>• Review the reason for denial if provided above</p>
              <p>• You may request access again in the future</p>
              <p>• Sign out and try with a different account if needed</p>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h4 className="text-blue-700 dark:text-blue-300 font-vhs text-sm font-bold mb-2">
              Contact Administrator
            </h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>Email: ohms1384@gmail.com</p>
              <p>Include your request ID: {user.uid.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="space-y-3">
          <button
            onClick={onSignOut}
            className="w-full neu-button p-4 rounded-xl flex items-center justify-center space-x-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
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

export default AccessDeniedPage;
