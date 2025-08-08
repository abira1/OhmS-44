// Authentication context for managing user state across the application
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { User, AuthState, getUserPermissions, isUserAdmin } from '../types';

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  permissions: ReturnType<typeof getUserPermissions>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Initialize authentication state
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setAuthState(prev => ({
        ...prev,
        user,
        loading: false,
        error: null
      }));
    });

    return unsubscribe;
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signInWithGoogle();
      
      if (!result.success) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Sign-in failed'
        }));
      }
      // Success case is handled by onAuthStateChanged
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred'
      }));
    }
  };

  // Sign out
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signOut();
      
      if (!result.success) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Sign-out failed'
        }));
      }
      // Success case is handled by onAuthStateChanged
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred'
      }));
    }
  };

  // Clear error
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Compute derived values
  const isAdmin = isUserAdmin(authState.user);
  const permissions = getUserPermissions(authState.user);

  const contextValue: AuthContextType = {
    ...authState,
    signInWithGoogle,
    signOut,
    isAdmin,
    permissions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for authentication operations
export const useAuthOperations = () => {
  const { signInWithGoogle, signOut, loading, error } = useAuth();
  
  return {
    signInWithGoogle,
    signOut,
    loading,
    error
  };
};

// Custom hook for user permissions
export const usePermissions = () => {
  const { permissions, isAdmin, user } = useAuth();
  
  return {
    permissions,
    isAdmin,
    isAuthenticated: !!user
  };
};
