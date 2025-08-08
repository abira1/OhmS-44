import React, { useState, useCallback } from 'react';
import { Edit2, Trash2, Pin, MoreVertical, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { RetroButton } from './RetroButton';
import { Comment } from '../../types';
import { InteractionPermissions } from '../../utils/permissions';

interface CommentCardProps {
  comment: Comment;
  noteId: string;
  onUpdateComment?: (commentId: string, content: string) => Promise<{ success: boolean; data?: Comment; error?: string }>;
  onDeleteComment?: (commentId: string, deletedBy: string) => Promise<{ success: boolean; error?: string }>;
  onPinComment?: (commentId: string) => Promise<{ success: boolean; error?: string }>;
  className?: string;
  showActions?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  noteId,
  onUpdateComment,
  onDeleteComment,
  onPinComment,
  className = '',
  showActions = true
}) => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Check permissions using the permission system
  const canEdit = InteractionPermissions.canEditComment(user, comment.userId);
  const canDelete = InteractionPermissions.canDeleteComment(user, comment.userId);
  const canPin = InteractionPermissions.canPinComment(user);
  const canViewDeleted = InteractionPermissions.canViewDeletedComments(user);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSaveEdit = useCallback(async () => {
    if (!onUpdateComment || !editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await onUpdateComment(comment.id, editContent.trim());
      if (result.success) {
        setIsEditing(false);
      } else {
        console.error('Failed to update comment:', result.error);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [comment.id, editContent, onUpdateComment]);

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = useCallback(async () => {
    if (!onDeleteComment || !user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    try {
      const result = await onDeleteComment(comment.id, user.uid);
      if (!result.success) {
        console.error('Failed to delete comment:', result.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [comment.id, onDeleteComment, user]);

  const handlePin = useCallback(async () => {
    if (!onPinComment) return;

    try {
      const result = await onPinComment(comment.id);
      if (!result.success) {
        console.error('Failed to pin comment:', result.error);
      }
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  }, [comment.id, onPinComment]);

  // Don't render deleted comments for users without permission
  if (comment.isDeleted && !canViewDeleted) {
    return null;
  }

  return (
    <div className={`neu-card p-4 ${comment.isPinned ? 'ring-2 ring-retro-yellow' : ''} ${className}`}>
      {/* Pinned indicator */}
      {comment.isPinned && (
        <div className="flex items-center gap-1 mb-2 text-retro-yellow text-xs font-vhs">
          <Pin className="h-3 w-3" />
          <span>Pinned by admin</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* User avatar */}
        <UserAvatar
          displayName={comment.userDisplayName}
          photoURL={comment.userPhotoURL}
          email={comment.userEmail}
          size="sm"
          isAdmin={comment.userEmail ? comment.userEmail.includes('admin') : false} // Simple admin check
        />

        <div className="flex-1 min-w-0">
          {/* Header with user info and timestamp */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-vhs font-medium text-gray-900 dark:text-gray-100 text-sm">
                {comment.userDisplayName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-vhs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(comment.timestamp)}
                {comment.isEdited && (
                  <span className="text-retro-purple dark:text-retro-teal">(edited)</span>
                )}
              </span>
            </div>

            {/* Actions menu */}
            {showActions && (canEdit || canDelete || canPin) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                    {canPin && (
                      <button
                        onClick={() => {
                          handlePin();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Pin className="h-3 w-3" />
                        {comment.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-vhs text-sm resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <RetroButton
                  size="sm"
                  variant="primary"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || isSubmitting}
                  loading={isSubmitting}
                >
                  Save
                </RetroButton>
                <RetroButton
                  size="sm"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </RetroButton>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 dark:text-gray-200 font-vhs text-sm leading-relaxed">
              {comment.isDeleted ? (
                <span className="italic text-gray-500 dark:text-gray-400">
                  [Comment deleted by {comment.deletedBy === comment.userId ? 'user' : 'admin'}]
                </span>
              ) : (
                <p className="whitespace-pre-wrap break-words">{comment.content}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
