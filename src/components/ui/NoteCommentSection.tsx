import React, { useState, useMemo, useCallback } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CommentInput } from './CommentInput';
import { CommentCard } from './CommentCard';
import { UserAvatarGroup } from './UserAvatar';
import { Comment } from '../../types';

interface NoteCommentSectionProps {
  noteId: string;
  comments: Record<string, Comment>;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => Promise<{ success: boolean; data?: Comment; error?: string }>;
  onUpdateComment?: (commentId: string, content: string) => Promise<{ success: boolean; data?: Comment; error?: string }>;
  onDeleteComment?: (commentId: string, deletedBy: string) => Promise<{ success: boolean; error?: string }>;
  onPinComment?: (commentId: string) => Promise<{ success: boolean; error?: string }>;
  className?: string;
  defaultExpanded?: boolean;
  maxInitialComments?: number;
  commentsPerPage?: number;
  enableVirtualization?: boolean;
}

export const NoteCommentSection: React.FC<NoteCommentSectionProps> = ({
  noteId,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onPinComment,
  className = '',
  defaultExpanded = false,
  maxInitialComments = 3,
  commentsPerPage = 10,
  enableVirtualization = false
}) => {
  const { user, isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAllComments, setShowAllComments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Process and sort comments
  const processedComments = useMemo(() => {
    const commentArray = Object.values(comments).filter(comment => !comment.isDeleted || isAdmin);
    
    // Sort: pinned first, then by timestamp (newest first)
    return commentArray.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp - a.timestamp;
    });
  }, [comments, isAdmin]);

  // Get unique commenters for avatar display
  const uniqueCommenters = useMemo(() => {
    const commenters = new Map();
    processedComments.forEach(comment => {
      if (!comment.isDeleted && !commenters.has(comment.userId)) {
        commenters.set(comment.userId, {
          displayName: comment.userDisplayName,
          photoURL: comment.userPhotoURL,
          email: comment.userEmail,
          isAdmin: comment.userEmail?.includes('admin') || false // Simple admin check
        });
      }
    });
    return Array.from(commenters.values());
  }, [processedComments]);

  // Pagination logic
  const totalComments = processedComments.length;
  const totalPages = Math.ceil(totalComments / commentsPerPage);

  const visibleComments = useMemo(() => {
    if (!isExpanded) return [];

    if (showAllComments) {
      // Show all comments up to current page
      return processedComments.slice(0, currentPage * commentsPerPage);
    } else {
      // Show only initial comments
      return processedComments.slice(0, maxInitialComments);
    }
  }, [processedComments, isExpanded, showAllComments, currentPage, commentsPerPage, maxInitialComments]);

  const hasMoreComments = totalComments > maxInitialComments;
  const hasMorePages = currentPage < totalPages;

  // Load more comments function
  const loadMoreComments = useCallback(async () => {
    if (loadingMore || !hasMorePages) return;

    setLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentPage(prev => prev + 1);
    setLoadingMore(false);
  }, [loadingMore, hasMorePages]);
  const commentCount = processedComments.filter(c => !c.isDeleted).length;

  if (commentCount === 0 && !user) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <MessageCircle className="h-4 w-4" />
          <span className="font-vhs text-sm">No comments yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Comment header with count and avatars */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-retro-purple dark:hover:text-retro-teal transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="font-vhs text-sm">
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Show commenter avatars when collapsed */}
        {!isExpanded && uniqueCommenters.length > 0 && (
          <UserAvatarGroup
            users={uniqueCommenters}
            maxDisplay={3}
            size="xs"
          />
        )}
      </div>

      {/* Expanded comment section */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Comment input */}
          {user && (
            <CommentInput
              noteId={noteId}
              onAddComment={onAddComment}
              placeholder="Share your thoughts..."
            />
          )}

          {/* Comments list */}
          {processedComments.length > 0 && (
            <div className="space-y-3">
              {visibleComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  noteId={noteId}
                  onUpdateComment={onUpdateComment}
                  onDeleteComment={onDeleteComment}
                  onPinComment={onPinComment}
                />
              ))}

              {/* Pagination controls */}
              {hasMoreComments && !showAllComments && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="text-retro-purple dark:text-retro-teal hover:underline font-vhs text-sm"
                  >
                    Show {totalComments - maxInitialComments} more comments
                  </button>
                </div>
              )}

              {showAllComments && hasMorePages && (
                <div className="text-center">
                  <button
                    onClick={loadMoreComments}
                    disabled={loadingMore}
                    className="text-retro-purple dark:text-retro-teal hover:underline font-vhs text-sm disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : `Load more comments (${totalComments - visibleComments.length} remaining)`}
                  </button>
                </div>
              )}

              {showAllComments && !hasMorePages && totalComments > maxInitialComments && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowAllComments(false);
                      setCurrentPage(1);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:underline font-vhs text-sm"
                  >
                    Show less comments
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty state when expanded */}
          {processedComments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-vhs text-sm">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}

          {/* Sign in prompt for non-authenticated users */}
          {!user && processedComments.length > 0 && (
            <div className="neu-card p-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 font-vhs text-sm">
                Sign in to join the conversation
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact comment section for note cards
export const CompactCommentSection: React.FC<{
  commentCount: number;
  recentCommenters: Array<{
    displayName: string;
    photoURL?: string;
    email?: string;
    isAdmin?: boolean;
  }>;
  onClick?: () => void;
  className?: string;
}> = ({ commentCount, recentCommenters, onClick, className = '' }) => {
  if (commentCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-retro-purple dark:hover:text-retro-teal transition-colors ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      <span className="font-vhs text-xs">
        {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
      </span>
      {recentCommenters.length > 0 && (
        <UserAvatarGroup
          users={recentCommenters}
          maxDisplay={2}
          size="xs"
        />
      )}
    </button>
  );
};
