// Authentication guard component that manages access control flow
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isUserAdmin, isUserApproved, isUserPending, isUserDenied } from '../../types';
import { UserApprovalService } from '../../services/userApprovalService';
import LoginScreen from './LoginScreen';
import WaitingForApprovalPage from './WaitingForApprovalPage';
import AccessDeniedPage from './AccessDeniedPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth();
  const [approvalStatusLoading, setApprovalStatusLoading] = useState(false);
  const [denialReason, setDenialReason] = useState<string | undefined>();

  // Signal React mount for all AuthGuard states
  useEffect(() => {
    const signalReactMounted = () => {
      const root = document.getElementById('root');
      if (root && !root.getAttribute('data-react-mounted')) {
        root.setAttribute('data-react-mounted', 'true');
        window.dispatchEvent(new CustomEvent('react-mounted'));
        console.log('React mounted from AuthGuard');
      }
    };

    // Signal mount when AuthGuard renders any content
    if (!loading && !approvalStatusLoading) {
      signalReactMounted();
    }
  }, [loading, approvalStatusLoading]);

  // Listen for approval status changes for non-admin users
  useEffect(() => {
    if (user && !isUserAdmin(user)) {
      setApprovalStatusLoading(true);
      
      const unsubscribe = UserApprovalService.onApprovalStatusChanged(
        user.uid,
        (status) => {
          if (status) {
            // Update user approval status
            user.approvalStatus = status.status;
            setDenialReason(status.reason);
          }
          setApprovalStatusLoading(false);
        }
      );

      return unsubscribe;
    }
  }, [user]);

  // Handle refresh for waiting page
  const handleRefresh = async () => {
    if (user && !isUserAdmin(user)) {
      setApprovalStatusLoading(true);
      try {
        const result = await UserApprovalService.getUserApprovalStatus(user.uid);
        if (result.success && result.data) {
          user.approvalStatus = result.data.status;
          setDenialReason(result.data.reason);
        }
      } catch (error) {
        console.error('Error refreshing approval status:', error);
      } finally {
        setApprovalStatusLoading(false);
      }
    }
  };

  // Show simple loading indicator while authentication is initializing
  if (loading || approvalStatusLoading) {
    return (
      <div className="min-h-screen bg-retro-cream dark:bg-retro-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-retro-purple border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-retro-purple dark:text-retro-teal font-vhs">
            {loading ? 'Authenticating...' : 'Checking permissions...'}
          </div>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return (
      <LoginScreen
        onGoogleSignIn={signInWithGoogle}
        loading={loading}
        error={error}
      />
    );
  }

  // Admin users get immediate access
  if (isUserAdmin(user)) {
    return <>{children}</>;
  }

  // Check approval status for regular users
  if (isUserApproved(user)) {
    // User is approved, grant access
    return <>{children}</>;
  }

  if (isUserDenied(user)) {
    // User was denied access
    return (
      <AccessDeniedPage
        user={user}
        onSignOut={signOut}
        reason={denialReason}
      />
    );
  }

  if (isUserPending(user)) {
    // User is waiting for approval
    return (
      <WaitingForApprovalPage
        user={user}
        onSignOut={signOut}
        onRefresh={handleRefresh}
      />
    );
  }

  // Fallback to waiting page if status is unclear
  return (
    <WaitingForApprovalPage
      user={user}
      onSignOut={signOut}
      onRefresh={handleRefresh}
    />
  );
};

export default AuthGuard;
