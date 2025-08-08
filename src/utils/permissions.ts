import { User, ADMIN_EMAILS } from '../types';

// Permission utilities for note interactions
export class InteractionPermissions {
  // Check if user can like notes
  static canLikeNotes(user: User | null): boolean {
    return !!user && user.approvalStatus === 'approved';
  }

  // Check if user can comment on notes
  static canCommentOnNotes(user: User | null): boolean {
    return !!user && user.approvalStatus === 'approved';
  }

  // Check if user can edit their own comment
  static canEditComment(user: User | null, commentUserId: string): boolean {
    return !!user && user.uid === commentUserId;
  }

  // Check if user can delete a comment
  static canDeleteComment(user: User | null, commentUserId: string): boolean {
    if (!user) return false;
    
    // User can delete their own comment or admin can delete any comment
    return user.uid === commentUserId || this.isAdmin(user);
  }

  // Check if user can pin/unpin comments
  static canPinComment(user: User | null): boolean {
    return !!user && this.isAdmin(user);
  }

  // Check if user can moderate interactions
  static canModerateInteractions(user: User | null): boolean {
    return !!user && this.isAdmin(user);
  }

  // Check if user is admin
  static isAdmin(user: User | null): boolean {
    return !!user && user.role === 'admin';
  }

  // Check if user can view deleted comments
  static canViewDeletedComments(user: User | null): boolean {
    return this.isAdmin(user);
  }

  // Get user's interaction capabilities
  static getUserCapabilities(user: User | null) {
    return {
      canLike: this.canLikeNotes(user),
      canComment: this.canCommentOnNotes(user),
      canModerate: this.canModerateInteractions(user),
      canPin: this.canPinComment(user),
      canViewDeleted: this.canViewDeletedComments(user),
      isAdmin: this.isAdmin(user),
      isAuthenticated: !!user,
      isApproved: user?.approvalStatus === 'approved'
    };
  }

  // Check if email is admin email
  static isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.includes(email);
  }

  // Get permission error message
  static getPermissionErrorMessage(action: string, user: User | null): string {
    if (!user) {
      return `Please sign in to ${action}.`;
    }
    
    if (user.approvalStatus === 'pending') {
      return `Your account is pending approval. You cannot ${action} yet.`;
    }
    
    if (user.approvalStatus === 'denied') {
      return `Your account access has been denied. You cannot ${action}.`;
    }
    
    return `You don't have permission to ${action}.`;
  }

  // Rate limiting check (simple implementation)
  static checkRateLimit(userId: string, action: 'like' | 'comment', timeWindow: number = 60000): boolean {
    const key = `${userId}_${action}_rate_limit`;
    const now = Date.now();
    const lastAction = localStorage.getItem(key);
    
    if (lastAction) {
      const timeDiff = now - parseInt(lastAction);
      if (timeDiff < timeWindow) {
        return false; // Rate limited
      }
    }
    
    localStorage.setItem(key, now.toString());
    return true; // Not rate limited
  }

  // Content moderation helpers
  static isContentAppropriate(content: string): boolean {
    // Simple content filtering - in production, use a proper content moderation service
    const inappropriateWords = ['spam', 'abuse', 'inappropriate']; // Add more as needed
    const lowerContent = content.toLowerCase();
    
    return !inappropriateWords.some(word => lowerContent.includes(word));
  }

  // Check if user can perform bulk actions
  static canPerformBulkActions(user: User | null): boolean {
    return this.isAdmin(user);
  }

  // Check interaction limits
  static checkInteractionLimits(user: User | null, action: 'like' | 'comment'): {
    allowed: boolean;
    reason?: string;
    limit?: number;
  } {
    if (!user) {
      return { allowed: false, reason: 'Not authenticated' };
    }

    if (user.approvalStatus !== 'approved') {
      return { allowed: false, reason: 'Account not approved' };
    }

    // Admin users have no limits
    if (this.isAdmin(user)) {
      return { allowed: true };
    }

    // Regular users have rate limits
    const rateLimitPassed = this.checkRateLimit(user.uid, action);
    if (!rateLimitPassed) {
      return { 
        allowed: false, 
        reason: 'Rate limit exceeded', 
        limit: action === 'like' ? 10 : 5 // likes per minute vs comments per minute
      };
    }

    return { allowed: true };
  }
}

// Hook-like function for getting user permissions in components
export const useInteractionPermissions = (user: User | null) => {
  return InteractionPermissions.getUserCapabilities(user);
};
