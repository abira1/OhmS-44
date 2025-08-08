// Login screen component with calm, neumorphic styling
import React, { useState, useEffect } from 'react';
import { LogIn, Shield } from 'lucide-react';

interface LoginScreenProps {
  onGoogleSignIn: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  loading,
  error
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Signal that React has mounted successfully to prevent browser compatibility fallback
  useEffect(() => {
    const signalReactMounted = () => {
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('data-react-mounted', 'true');
        window.dispatchEvent(new CustomEvent('react-mounted'));
        console.log('React mounted from LoginScreen');
      }
    };

    signalReactMounted();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await onGoogleSignIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-cream dark:bg-retro-black flex items-center justify-center p-4">
      {/* Main login container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl neu-shadow mb-6">
            <Shield className="w-8 h-8 text-retro-purple dark:text-retro-teal" />
          </div>

          <h1 className="text-3xl font-vhs font-bold text-retro-purple dark:text-retro-teal mb-2">
            OhmS-44
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-vhs">
            Where Energy Meets Excellence
          </p>
        </div>

        {/* Login card */}
        <div className="neu-card p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-vhs font-bold text-gray-800 dark:text-gray-100 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sign in with your Google account to continue
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={loading || isSigningIn}
            className="w-full neu-button p-4 rounded-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                <span className="font-vhs text-gray-700 dark:text-gray-300">Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 text-retro-purple dark:text-retro-teal" />
                <span className="font-vhs text-gray-700 dark:text-gray-300">Continue with Google</span>
              </>
            )}
          </button>

          {/* Info section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                New users require admin approval before accessing content
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-vhs">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
