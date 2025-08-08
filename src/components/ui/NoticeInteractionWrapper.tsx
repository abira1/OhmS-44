import React, { memo, useMemo } from 'react';
import { useNoticeInteractions } from '../../hooks/useFirebase';
import { NoteLikeButton } from './NoteLikeButton';
import { NoteCommentSection } from './NoteCommentSection';
import { Notice } from '../../types';
import { performanceMonitor } from '../../utils/performance';

interface NoticeInteractionWrapperProps {
  notice: Notice;
  children?: React.ReactNode;
  variant?: 'compact' | 'full';
}

export const NoticeInteractionWrapper: React.FC<NoticeInteractionWrapperProps> = memo(({
  notice,
  children,
  variant = 'compact'
}) => {
  const endTiming = performanceMonitor.startTiming(`notice-interactions-${variant}`);
  
  const {
    likes,
    comments,
    loading,
    error,
    toggleLike,
    addComment,
    updateComment,
    deleteComment
  } = useNoticeInteractions(notice.id);



  // Memoize expensive calculations
  const memoizedLikes = useMemo(() => likes, [likes]);
  const memoizedComments = useMemo(() => comments, [comments]);

  React.useEffect(() => {
    endTiming();
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading notice interactions:', error);
    return (
      <div className="text-red-500 text-xs font-vhs">
        Failed to load interactions
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <NoteLikeButton
          noteId={notice.id}
          likes={memoizedLikes}
          onToggleLike={toggleLike}
          showCount={true}
          className="text-xs"
        />
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Like Section */}
      <div className="flex items-center gap-4">
        <NoteLikeButton
          noteId={notice.id}
          likes={memoizedLikes}
          onToggleLike={toggleLike}
          showCount={true}
          className="text-base"
        />
      </div>

      {/* Comments Section */}
      <NoteCommentSection
        noteId={notice.id}
        comments={memoizedComments}
        onAddComment={addComment}
        onUpdateComment={updateComment}
        onDeleteComment={deleteComment}
        defaultExpanded={true}
        commentsPerPage={10}
        enableVirtualization={Object.keys(memoizedComments).length > 50}
      />

      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.notice.id === nextProps.notice.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.notice.createdAt === nextProps.notice.createdAt
  );
});
