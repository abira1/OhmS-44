import React, { useState, useCallback } from 'react';
import { Heart, ThumbsUp, Star, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserLike } from '../../types';
import { AuthService } from '../../services/auth';
import { InteractionPermissions } from '../../utils/permissions';

interface NoteLikeButtonProps {
  noteId: string;
  likes: Record<string, UserLike>;
  onToggleLike: (userLike: UserLike) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  className?: string;
  showCount?: boolean;
  reactionType?: 'like' | 'love' | 'helpful' | 'important';
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  helpful: Star,
  important: Zap
};

const reactionColors = {
  like: 'text-retro-blue hover:text-retro-teal',
  love: 'text-retro-pink hover:text-red-500',
  helpful: 'text-retro-yellow hover:text-yellow-400',
  important: 'text-retro-purple hover:text-purple-400'
};

export const NoteLikeButton: React.FC<NoteLikeButtonProps> = ({
  noteId,
  likes,
  onToggleLike,
  className = '',
  showCount = true,
  reactionType = 'like'
}) => {
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const Icon = reactionIcons[reactionType];
  const colorClass = reactionColors[reactionType];

  // Check if current user has liked this note
  const userHasLiked = user ? likes[user.uid] : false;
  const likeCount = Object.keys(likes).length;

  const handleToggleLike = useCallback(async () => {
    if (!user) {
      // Could show a sign-in prompt here
      return;
    }

    // Check permissions
    const permissionCheck = InteractionPermissions.checkInteractionLimits(user, 'like');
    if (!permissionCheck.allowed) {
      console.warn('Like action not allowed:', permissionCheck.reason);
      // Could show a toast notification here
      return;
    }

    setIsLoading(true);
    setAnimating(true);

    try {
      // Get user data for the like
      const userDataResponse = await AuthService.getUserForInteraction(user.uid);
      if (!userDataResponse.success) {
        console.error('Failed to get user data:', userDataResponse.error);
        return;
      }

      const userLike: UserLike = {
        ...userDataResponse.data!,
        timestamp: Date.now(),
        reactionType
      };

      const result = await onToggleLike(userLike);
      if (!result.success) {
        console.error('Failed to toggle like:', result.error);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
      // Keep animation for a bit longer for visual feedback
      setTimeout(() => setAnimating(false), 300);
    }
  }, [user, onToggleLike, reactionType]);

  const buttonClasses = `
    retro-btn-enhanced
    flex items-center gap-2 px-3 py-2
    font-vhs text-sm
    transition-all duration-200
    transform hover:scale-105
    ${userHasLiked 
      ? `bg-gradient-to-r from-retro-purple to-retro-pink text-white shadow-lg` 
      : `bg-white dark:bg-gray-800 ${colorClass} hover:bg-retro-cream dark:hover:bg-gray-700`
    }
    ${isLoading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}
    ${animating ? 'animate-pulse-glow' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading || !user}
      className={buttonClasses}
      title={user ? `${userHasLiked ? 'Remove' : 'Add'} ${reactionType}` : 'Sign in to react'}
      aria-label={`${userHasLiked ? 'Remove' : 'Add'} ${reactionType}. Current count: ${likeCount}`}
    >
      <Icon 
        className={`h-4 w-4 transition-transform duration-200 ${
          animating ? 'scale-125' : userHasLiked ? 'scale-110' : 'scale-100'
        }`}
        fill={userHasLiked ? 'currentColor' : 'none'}
      />
      {showCount && (
        <span className={`font-vhs text-xs ${userHasLiked ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {likeCount}
        </span>
      )}
      {isLoading && (
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </button>
  );
};

// Multi-reaction component for different types of reactions
export const NoteReactionBar: React.FC<{
  noteId: string;
  likes: Record<string, UserLike>;
  onToggleLike: (userLike: UserLike) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  className?: string;
}> = ({ noteId, likes, onToggleLike, className = '' }) => {
  // Group likes by reaction type
  const likesByType = Object.values(likes).reduce((acc, like) => {
    const type = like.reactionType || 'like';
    if (!acc[type]) acc[type] = {};
    acc[type][like.userId] = like;
    return acc;
  }, {} as Record<string, Record<string, UserLike>>);

  const reactionTypes: Array<'like' | 'love' | 'helpful' | 'important'> = ['like', 'love', 'helpful', 'important'];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {reactionTypes.map((type) => {
        const typeLikes = likesByType[type] || {};
        const count = Object.keys(typeLikes).length;
        
        // Only show reactions that have at least one like or the basic 'like' type
        if (count === 0 && type !== 'like') return null;
        
        return (
          <NoteLikeButton
            key={type}
            noteId={noteId}
            likes={typeLikes}
            onToggleLike={onToggleLike}
            reactionType={type}
            showCount={count > 0}
            className="text-xs"
          />
        );
      })}
    </div>
  );
};

// Simple like count display component
export const LikeCountDisplay: React.FC<{
  likes: Record<string, UserLike>;
  className?: string;
}> = ({ likes, className = '' }) => {
  const likeCount = Object.keys(likes).length;
  
  if (likeCount === 0) return null;
  
  return (
    <div className={`flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-vhs ${className}`}>
      <Heart className="h-3 w-3" />
      <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
    </div>
  );
};
