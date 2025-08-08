import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { NoteLikeButton } from '../components/ui/NoteLikeButton';
import { CommentInput } from '../components/ui/CommentInput';
import { CommentCard } from '../components/ui/CommentCard';
import { UserAvatar } from '../components/ui/UserAvatar';
import { InteractionPermissions } from '../utils/permissions';
import { UserLike, Comment, User } from '../types';

// Mock Firebase
jest.mock('../config/firebase', () => ({
  database: {},
  auth: {},
  googleProvider: {}
}));

// Mock hooks
jest.mock('../hooks/useFirebase', () => ({
  useNoteInteractions: () => ({
    likes: {},
    comments: {},
    loading: false,
    error: null,
    toggleLike: jest.fn(),
    addComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn()
  })
}));

// Mock auth context
const mockUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  role: 'user',
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
  approvalStatus: 'approved'
};

const mockAdminUser: User = {
  ...mockUser,
  email: 'admin@example.com',
  role: 'admin'
};

const MockAuthProvider: React.FC<{ user?: User | null; children: React.ReactNode }> = ({ 
  user = mockUser, 
  children 
}) => {
  const mockAuthContext = {
    user,
    loading: false,
    error: null,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    isAdmin: user?.role === 'admin',
    permissions: {
      canRead: true,
      canWrite: user?.role === 'admin',
      canDelete: user?.role === 'admin',
      canManageUsers: user?.role === 'admin'
    }
  };

  return (
    <AuthProvider value={mockAuthContext as any}>
      {children}
    </AuthProvider>
  );
};

describe('Interactive Notes Features', () => {
  describe('Permission System', () => {
    test('should allow approved users to like notes', () => {
      const canLike = InteractionPermissions.canLikeNotes(mockUser);
      expect(canLike).toBe(true);
    });

    test('should not allow unapproved users to like notes', () => {
      const unapprovedUser = { ...mockUser, approvalStatus: 'pending' as const };
      const canLike = InteractionPermissions.canLikeNotes(unapprovedUser);
      expect(canLike).toBe(false);
    });

    test('should allow users to edit their own comments', () => {
      const canEdit = InteractionPermissions.canEditComment(mockUser, mockUser.uid);
      expect(canEdit).toBe(true);
    });

    test('should not allow users to edit others comments', () => {
      const canEdit = InteractionPermissions.canEditComment(mockUser, 'other-user-id');
      expect(canEdit).toBe(false);
    });

    test('should allow admins to delete any comment', () => {
      const canDelete = InteractionPermissions.canDeleteComment(mockAdminUser, 'any-user-id');
      expect(canDelete).toBe(true);
    });

    test('should only allow admins to pin comments', () => {
      const userCanPin = InteractionPermissions.canPinComment(mockUser);
      const adminCanPin = InteractionPermissions.canPinComment(mockAdminUser);
      
      expect(userCanPin).toBe(false);
      expect(adminCanPin).toBe(true);
    });
  });

  describe('NoteLikeButton Component', () => {
    const mockLikes: Record<string, UserLike> = {
      'user1': {
        userId: 'user1',
        userEmail: 'user1@example.com',
        userDisplayName: 'User One',
        timestamp: Date.now(),
        reactionType: 'like'
      }
    };

    test('should render like button with count', () => {
      render(
        <MockAuthProvider>
          <NoteLikeButton
            noteId="test-note"
            likes={mockLikes}
            onToggleLike={jest.fn()}
          />
        </MockAuthProvider>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('should show sign-in message for unauthenticated users', () => {
      render(
        <MockAuthProvider user={null}>
          <NoteLikeButton
            noteId="test-note"
            likes={mockLikes}
            onToggleLike={jest.fn()}
          />
        </MockAuthProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Sign in to react');
    });
  });

  describe('UserAvatar Component', () => {
    test('should render user avatar with name', () => {
      render(
        <UserAvatar
          displayName="Test User"
          email="test@example.com"
          showName={true}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('should show admin badge for admin users', () => {
      render(
        <UserAvatar
          displayName="Admin User"
          email="admin@example.com"
          isAdmin={true}
          showName={true}
        />
      );

      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    test('should show initials when no photo provided', () => {
      render(
        <UserAvatar
          displayName="Test User"
          email="test@example.com"
        />
      );

      expect(screen.getByText('TU')).toBeInTheDocument();
    });
  });

  describe('CommentInput Component', () => {
    test('should render comment input for authenticated users', () => {
      render(
        <MockAuthProvider>
          <CommentInput
            noteId="test-note"
            onAddComment={jest.fn()}
          />
        </MockAuthProvider>
      );

      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    });

    test('should show sign-in message for unauthenticated users', () => {
      render(
        <MockAuthProvider user={null}>
          <CommentInput
            noteId="test-note"
            onAddComment={jest.fn()}
          />
        </MockAuthProvider>
      );

      expect(screen.getByText('Sign in to add comments')).toBeInTheDocument();
    });
  });

  describe('CommentCard Component', () => {
    const mockComment: Comment = {
      id: 'comment-1',
      userId: 'user-1',
      userEmail: 'user@example.com',
      userDisplayName: 'Test User',
      content: 'This is a test comment',
      timestamp: Date.now(),
      isEdited: false,
      isDeleted: false
    };

    test('should render comment content', () => {
      render(
        <MockAuthProvider>
          <CommentCard
            comment={mockComment}
            noteId="test-note"
          />
        </MockAuthProvider>
      );

      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('should show edit button for comment owner', () => {
      const userComment = { ...mockComment, userId: mockUser.uid };
      
      render(
        <MockAuthProvider>
          <CommentCard
            comment={userComment}
            noteId="test-note"
          />
        </MockAuthProvider>
      );

      // Click the menu button to show actions
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    test('should not render deleted comments for regular users', () => {
      const deletedComment = { ...mockComment, isDeleted: true };
      
      const { container } = render(
        <MockAuthProvider>
          <CommentCard
            comment={deletedComment}
            noteId="test-note"
          />
        </MockAuthProvider>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Content Moderation', () => {
    test('should flag inappropriate content', () => {
      const inappropriateContent = 'This is spam content';
      const isAppropriate = InteractionPermissions.isContentAppropriate(inappropriateContent);
      expect(isAppropriate).toBe(false);
    });

    test('should allow appropriate content', () => {
      const appropriateContent = 'This is a helpful comment';
      const isAppropriate = InteractionPermissions.isContentAppropriate(appropriateContent);
      expect(isAppropriate).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('should allow first action', () => {
      const allowed = InteractionPermissions.checkRateLimit('user-123', 'like');
      expect(allowed).toBe(true);
    });

    test('should block rapid successive actions', () => {
      InteractionPermissions.checkRateLimit('user-123', 'like');
      const blocked = InteractionPermissions.checkRateLimit('user-123', 'like');
      expect(blocked).toBe(false);
    });
  });
});
