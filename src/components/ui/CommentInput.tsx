import React, { useState, useRef, useCallback } from 'react';
import { Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { RetroButton } from './RetroButton';
import { Comment } from '../../types';
import { AuthService } from '../../services/auth';
import { InteractionPermissions } from '../../utils/permissions';

interface CommentInputProps {
  noteId: string;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => Promise<{ success: boolean; data?: Comment; error?: string }>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  parentCommentId?: string; // For threaded comments (future feature)
}

export const CommentInput: React.FC<CommentInputProps> = ({
  noteId,
  onAddComment,
  onCancel,
  placeholder = "Add a comment...",
  autoFocus = false,
  className = '',
  parentCommentId
}) => {
  const { user, isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !content.trim()) return;

    // Check permissions and rate limits
    const permissionCheck = InteractionPermissions.checkInteractionLimits(user, 'comment');
    if (!permissionCheck.allowed) {
      console.warn('Comment action not allowed:', permissionCheck.reason);
      // Could show a toast notification here
      return;
    }

    // Check content appropriateness
    if (!InteractionPermissions.isContentAppropriate(content.trim())) {
      console.warn('Content flagged as inappropriate');
      // Could show a warning to the user
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user data for the comment
      const userDataResponse = await AuthService.getUserForInteraction(user.uid);
      if (!userDataResponse.success) {
        console.error('Failed to get user data for comment:', userDataResponse.error);
        return;
      }

      const commentData: Omit<Comment, 'id' | 'timestamp'> = {
        ...userDataResponse.data!,
        content: content.trim(),
        isEdited: false,
        isDeleted: false,
        ...(parentCommentId && { parentCommentId })
      };

      const result = await onAddComment(commentData);

      if (result.success) {
        setContent('');
        setIsFocused(false);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } else {
        console.error('Failed to add comment:', result.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!user) {
    return (
      <div className={`neu-card p-4 text-center ${className}`}>
        <p className="text-gray-600 dark:text-gray-400 font-vhs text-sm">
          Sign in to add comments
        </p>
      </div>
    );
  }

  return (
    <div className={`neu-card p-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* User info and input area */}
        <div className="flex gap-3">
          <UserAvatar
            displayName={user.displayName || 'Anonymous'}
            photoURL={user.photoURL}
            email={user.email}
            size="sm"
            isAdmin={isAdmin}
          />
          
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus={autoFocus}
              disabled={isSubmitting}
              className={`
                w-full p-3 rounded-lg border-2 resize-none
                bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                font-vhs text-sm
                focus:border-retro-purple dark:focus:border-retro-teal
                focus:ring-2 focus:ring-retro-purple/20 dark:focus:ring-retro-teal/20
                transition-all duration-200
                ${isFocused ? 'min-h-[80px]' : 'min-h-[40px]'}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ maxHeight: '120px' }}
            />
            
            {/* Character count and hints */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400 font-vhs">
              <span>
                {content.length > 0 && `${content.length} characters`}
              </span>
              <span>
                {isFocused && 'Ctrl+Enter to submit, Esc to cancel'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons - only show when focused or has content */}
        {(isFocused || content.trim()) && (
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <RetroButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-3 w-3" />
              Cancel
            </RetroButton>
            
            <RetroButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={!content.trim() || isSubmitting}
              loading={isSubmitting}
              icon={Send}
              iconPosition="right"
            >
              Comment
            </RetroButton>
          </div>
        )}
      </form>
    </div>
  );
};

// Compact comment input for inline replies
export const CompactCommentInput: React.FC<Omit<CommentInputProps, 'className'> & { 
  onToggle?: () => void;
  isVisible?: boolean;
}> = ({ onToggle, isVisible = true, ...props }) => {
  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="text-sm text-retro-purple dark:text-retro-teal hover:underline font-vhs"
      >
        Reply
      </button>
    );
  }

  return (
    <CommentInput
      {...props}
      className="mt-2 ml-8"
      placeholder="Write a reply..."
      onCancel={() => {
        props.onCancel?.();
        onToggle?.();
      }}
    />
  );
};
