// Authentication service for Firebase Auth with Google OAuth
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { auth, googleProvider, database } from '../config/firebase';
import { User, ADMIN_EMAILS, FirebaseResponse, UserProfile } from '../types';
import { UserApprovalService } from './userApprovalService';
import { UserProfileService } from './firebase';

export class AuthService {
  // Sign in with Google
  static async signInWithGoogle(): Promise<FirebaseResponse<User>> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      if (!firebaseUser.email) {
        return {
          success: false,
          error: 'No email found in Google account'
        };
      }

      // Determine user role based on email
      const role = ADMIN_EMAILS.includes(firebaseUser.email) ? 'admin' : 'user';
      
      // Create user object
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };

      // Save/update user in database
      await this.saveUserToDatabase(user);

      // Create/update user profile for interactions
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Anonymous User',
        photoURL: user.photoURL,
        role: user.role,
        lastActive: Date.now(),
        interactionStats: {
          totalLikes: 0,
          totalComments: 0,
          joinedAt: Date.now()
        }
      };

      // Check if profile exists, if not create it, otherwise just update lastActive
      const existingProfile = await UserProfileService.getUserProfile(user.uid);
      if (!existingProfile.success) {
        await UserProfileService.saveUserProfile(userProfile);
      } else {
        await UserProfileService.updateUserInteractionStats(user.uid, {
          lastActive: Date.now()
        });
      }

      // For non-admin users, check/create approval request
      if (role === 'user') {
        const approvalStatus = await UserApprovalService.getUserApprovalStatus(user.uid);
        if (!approvalStatus.success) {
          // First time user - submit approval request
          await UserApprovalService.submitApprovalRequest(user);
          user.approvalStatus = 'pending';
        } else {
          user.approvalStatus = approvalStatus.data?.status;
        }
      } else {
        // Admin users are automatically approved
        user.approvalStatus = 'approved';
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getAuthErrorMessage(authError)
      };
    }
  }

  // Sign out
  static async signOut(): Promise<FirebaseResponse<void>> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Failed to sign out'
      };
    }
  }

  // Get current user from database
  static async getCurrentUser(uid: string): Promise<FirebaseResponse<User>> {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val() as User
        };
      } else {
        return {
          success: false,
          error: 'User not found in database'
        };
      }
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: 'Failed to get user data'
      };
    }
  }

  // Save user to database
  static async saveUserToDatabase(user: User): Promise<FirebaseResponse<void>> {
    try {
      const userRef = ref(database, `users/${user.uid}`);
      
      // Check if user already exists
      const snapshot = await get(userRef);
      const existingUser = snapshot.exists() ? snapshot.val() as User : null;
      
      // Preserve creation date if user exists
      const userData = {
        ...user,
        createdAt: existingUser?.createdAt || user.createdAt,
        lastLoginAt: Date.now()
      };

      await set(userRef, userData);
      
      return { success: true };
    } catch (error) {
      console.error('Save user error:', error);
      return {
        success: false,
        error: 'Failed to save user data'
      };
    }
  }

  // Listen to authentication state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        // Get user data from database
        const result = await this.getCurrentUser(firebaseUser.uid);
        if (result.success && result.data) {
          const user = result.data;

          // Get current approval status for non-admin users
          if (user.role === 'user') {
            const approvalStatus = await UserApprovalService.getUserApprovalStatus(user.uid);
            if (approvalStatus.success && approvalStatus.data) {
              user.approvalStatus = approvalStatus.data.status;
            } else {
              user.approvalStatus = 'pending';
            }
          } else {
            user.approvalStatus = 'approved';
          }

          callback(user);
        } else {
          // Create user if not exists
          const role = ADMIN_EMAILS.includes(firebaseUser.email) ? 'admin' : 'user';
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role,
            createdAt: Date.now(),
            lastLoginAt: Date.now()
          };

          await this.saveUserToDatabase(user);

          // Handle approval status for new users
          if (role === 'user') {
            await UserApprovalService.submitApprovalRequest(user);
            user.approvalStatus = 'pending';
          } else {
            user.approvalStatus = 'approved';
          }

          callback(user);
        }
      } else {
        callback(null);
      }
    });
  }

  // Get user-friendly error messages
  private static getAuthErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by browser. Please allow pop-ups and try again';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method';
      default:
        return error.message || 'An error occurred during sign-in';
    }
  }

  // Get user data for interactions (likes, comments)
  static async getUserForInteraction(uid: string): Promise<FirebaseResponse<{
    userId: string;
    userEmail: string;
    userDisplayName: string;
    userPhotoURL?: string;
  }>> {
    try {
      // First try to get existing user profile
      let userProfile = await UserProfileService.getUserProfile(uid);

      if (!userProfile.success || !userProfile.data) {
        // If profile doesn't exist, try to get current user from auth and create profile
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
          console.log('Creating user profile for interaction:', currentUser.email);

          // Create user profile from current auth user
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Anonymous User',
            photoURL: currentUser.photoURL,
            role: this.isAdminEmail(currentUser.email || '') ? 'admin' : 'user',
            lastActive: Date.now(),
            interactionStats: {
              totalLikes: 0,
              totalComments: 0,
              joinedAt: Date.now()
            }
          };

          // Try to save the new profile
          try {
            const saveResult = await UserProfileService.saveUserProfile(newProfile);
            if (saveResult.success) {
              userProfile = { success: true, data: newProfile };
              console.log('✅ User profile created successfully');
            } else {
              console.error('❌ Failed to save user profile:', saveResult.error);
              // If we can't save to database, return the profile data anyway for interactions
              // This allows interactions to work even if profile saving fails
              userProfile = { success: true, data: newProfile };
              console.log('⚠️ Using temporary profile for interactions');
            }
          } catch (error) {
            console.error('❌ Error saving user profile:', error);
            // Fallback: use the profile data anyway
            userProfile = { success: true, data: newProfile };
            console.log('⚠️ Using temporary profile for interactions (fallback)');
          }
        }
      }

      if (userProfile.success && userProfile.data) {
        return {
          success: true,
          data: {
            userId: userProfile.data.uid,
            userEmail: userProfile.data.email,
            userDisplayName: userProfile.data.displayName,
            userPhotoURL: userProfile.data.photoURL
          }
        };
      } else {
        return {
          success: false,
          error: 'User profile not found and could not be created'
        };
      }
    } catch (error) {
      console.error('Error getting user for interaction:', error);
      return {
        success: false,
        error: 'Failed to get user data'
      };
    }
  }

  // Helper method to check if email is admin
  private static isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.includes(email);
  }
}
