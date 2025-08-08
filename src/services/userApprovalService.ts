// User approval service for managing approval requests and status
import { ref, set, get, update, push, onValue, off, serverTimestamp } from 'firebase/database';
import { database } from '../config/firebase';
import { UserApprovalRequest, UserApprovalStatus, User, FirebaseResponse } from '../types';
import { notificationService } from './notificationService';

export class UserApprovalService {
  // Submit a new approval request
  static async submitApprovalRequest(user: User): Promise<FirebaseResponse<void>> {
    try {
      const approvalRequest: UserApprovalRequest = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        status: 'pending',
        requestedAt: Date.now()
      };

      // Save approval request
      const requestRef = ref(database, `userApprovalRequests/${user.uid}`);
      await set(requestRef, approvalRequest);

      // Set initial approval status
      const statusRef = ref(database, `userApprovalStatus/${user.uid}`);
      const approvalStatus: UserApprovalStatus = {
        uid: user.uid,
        status: 'pending',
        updatedAt: Date.now()
      };
      await set(statusRef, approvalStatus);

      return { success: true };
    } catch (error) {
      console.error('Error submitting approval request:', error);
      return {
        success: false,
        error: 'Failed to submit approval request'
      };
    }
  }

  // Get user's approval status
  static async getUserApprovalStatus(uid: string): Promise<FirebaseResponse<UserApprovalStatus>> {
    try {
      const statusRef = ref(database, `userApprovalStatus/${uid}`);
      const snapshot = await get(statusRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val() as UserApprovalStatus
        };
      } else {
        return {
          success: false,
          error: 'No approval status found'
        };
      }
    } catch (error) {
      console.error('Error getting approval status:', error);
      return {
        success: false,
        error: 'Failed to get approval status'
      };
    }
  }

  // Get all pending approval requests (admin only)
  static async getPendingApprovalRequests(): Promise<FirebaseResponse<UserApprovalRequest[]>> {
    try {
      const requestsRef = ref(database, 'userApprovalRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests = snapshot.val();
        const pendingRequests = Object.values(requests).filter(
          (request: any) => request.status === 'pending'
        ) as UserApprovalRequest[];
        
        return {
          success: true,
          data: pendingRequests
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return {
        success: false,
        error: 'Failed to get pending requests'
      };
    }
  }

  // Approve a user (admin only)
  static async approveUser(uid: string, adminEmail: string): Promise<FirebaseResponse<void>> {
    try {
      const updates: any = {};
      
      // Update approval request
      updates[`userApprovalRequests/${uid}/status`] = 'approved';
      updates[`userApprovalRequests/${uid}/reviewedAt`] = Date.now();
      updates[`userApprovalRequests/${uid}/reviewedBy`] = adminEmail;
      
      // Update approval status
      updates[`userApprovalStatus/${uid}/status`] = 'approved';
      updates[`userApprovalStatus/${uid}/updatedAt`] = Date.now();
      updates[`userApprovalStatus/${uid}/updatedBy`] = adminEmail;

      await update(ref(database), updates);

      // Send approval notification
      try {
        await notificationService.sendNotification(
          'Access Approved! 🎉',
          'Your access request to OhmS has been approved. You can now access the platform.',
          'approval'
        );
      } catch (error) {
        console.warn('Failed to send approval notification:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error approving user:', error);
      return {
        success: false,
        error: 'Failed to approve user'
      };
    }
  }

  // Deny a user (admin only)
  static async denyUser(uid: string, adminEmail: string, reason?: string): Promise<FirebaseResponse<void>> {
    try {
      const updates: any = {};
      
      // Update approval request
      updates[`userApprovalRequests/${uid}/status`] = 'denied';
      updates[`userApprovalRequests/${uid}/reviewedAt`] = Date.now();
      updates[`userApprovalRequests/${uid}/reviewedBy`] = adminEmail;
      if (reason) {
        updates[`userApprovalRequests/${uid}/reason`] = reason;
      }
      
      // Update approval status
      updates[`userApprovalStatus/${uid}/status`] = 'denied';
      updates[`userApprovalStatus/${uid}/updatedAt`] = Date.now();
      updates[`userApprovalStatus/${uid}/updatedBy`] = adminEmail;
      if (reason) {
        updates[`userApprovalStatus/${uid}/reason`] = reason;
      }

      await update(ref(database), updates);

      // Send denial notification
      try {
        const message = reason
          ? `Your access request to OhmS has been denied. Reason: ${reason}`
          : 'Your access request to OhmS has been denied. Contact the administrator for more information.';

        await notificationService.sendNotification(
          'Access Request Denied',
          message,
          'denial'
        );
      } catch (error) {
        console.warn('Failed to send denial notification:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error denying user:', error);
      return {
        success: false,
        error: 'Failed to deny user'
      };
    }
  }

  // Listen to approval status changes
  static onApprovalStatusChanged(uid: string, callback: (status: UserApprovalStatus | null) => void): () => void {
    const statusRef = ref(database, `userApprovalStatus/${uid}`);
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as UserApprovalStatus);
      } else {
        callback(null);
      }
    });

    return () => off(statusRef, 'value', unsubscribe);
  }

  // Listen to pending requests changes (admin only)
  static onPendingRequestsChanged(callback: (requests: UserApprovalRequest[]) => void): () => void {
    const requestsRef = ref(database, 'userApprovalRequests');
    
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const requests = snapshot.val();
        const pendingRequests = Object.values(requests).filter(
          (request: any) => request.status === 'pending'
        ) as UserApprovalRequest[];
        callback(pendingRequests);
      } else {
        callback([]);
      }
    });

    return () => off(requestsRef, 'value', unsubscribe);
  }
}
