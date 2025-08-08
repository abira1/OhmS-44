import React from 'react';
import { Heart, MessageCircle, Eye, TrendingUp } from 'lucide-react';
import { UserLike, Comment } from '../../types';
import { UserAvatarGroup } from './UserAvatar';

interface InteractionStatsProps {
  likes: Record<string, UserLike>;
  comments: Record<string, Comment>;
  viewCount?: number;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  showAvatars?: boolean;
}

export const InteractionStats: React.FC<InteractionStatsProps> = ({
  likes,
  comments,
  viewCount,
  className = '',
  variant = 'full',
  showAvatars = true
}) => {
  const likeCount = Object.keys(likes).length;
  const commentCount = Object.values(comments).filter(c => !c.isDeleted).length;
  
  // Get unique users for avatars
  const likeUsers = Object.values(likes).map(like => ({
    displayName: like.userDisplayName,
    photoURL: like.userPhotoURL,
    email: like.userEmail,
    isAdmin: like.userEmail?.includes('admin') || false
  }));

  const commentUsers = Object.values(comments)
    .filter(c => !c.isDeleted)
    .reduce((acc, comment) => {
      if (!acc.find(u => u.email === comment.userEmail)) {
        acc.push({
          displayName: comment.userDisplayName,
          photoURL: comment.userPhotoURL,
          email: comment.userEmail,
          isAdmin: comment.userEmail?.includes('admin') || false
        });
      }
      return acc;
    }, [] as Array<{displayName: string; photoURL?: string; email?: string; isAdmin?: boolean}>);

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-vhs ${className}`}>
        {likeCount > 0 && (
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{likeCount}</span>
          </div>
        )}
        {commentCount > 0 && (
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>{commentCount}</span>
          </div>
        )}
        {viewCount && viewCount > 0 && (
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{viewCount}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-4">
          {likeCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-retro-pink">
                <Heart className="h-4 w-4" />
                <span className="font-vhs text-sm">{likeCount}</span>
              </div>
              {showAvatars && likeUsers.length > 0 && (
                <UserAvatarGroup users={likeUsers} maxDisplay={3} size="xs" />
              )}
            </div>
          )}
          
          {commentCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-retro-blue">
                <MessageCircle className="h-4 w-4" />
                <span className="font-vhs text-sm">{commentCount}</span>
              </div>
              {showAvatars && commentUsers.length > 0 && (
                <UserAvatarGroup users={commentUsers} maxDisplay={3} size="xs" />
              )}
            </div>
          )}
        </div>

        {viewCount && viewCount > 0 && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Eye className="h-4 w-4" />
            <span className="font-vhs text-sm">{viewCount} views</span>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Like stats */}
      {likeCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-retro-pink/10 to-retro-purple/10 rounded-lg border border-retro-pink/20">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-retro-pink" />
            <div>
              <span className="font-vhs text-sm font-medium text-gray-900 dark:text-gray-100">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-vhs">
                {likeUsers.slice(0, 3).map(u => u.displayName).join(', ')}
                {likeUsers.length > 3 && ` and ${likeUsers.length - 3} others`}
              </p>
            </div>
          </div>
          {showAvatars && likeUsers.length > 0 && (
            <UserAvatarGroup users={likeUsers} maxDisplay={5} size="sm" />
          )}
        </div>
      )}

      {/* Comment stats */}
      {commentCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-retro-blue/10 to-retro-teal/10 rounded-lg border border-retro-blue/20">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-retro-blue" />
            <div>
              <span className="font-vhs text-sm font-medium text-gray-900 dark:text-gray-100">
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-vhs">
                {commentUsers.slice(0, 3).map(u => u.displayName).join(', ')}
                {commentUsers.length > 3 && ` and ${commentUsers.length - 3} others`}
              </p>
            </div>
          </div>
          {showAvatars && commentUsers.length > 0 && (
            <UserAvatarGroup users={commentUsers} maxDisplay={5} size="sm" />
          )}
        </div>
      )}

      {/* View stats */}
      {viewCount && viewCount > 0 && (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Eye className="h-4 w-4" />
          <span className="font-vhs text-sm">{viewCount} views</span>
          {viewCount > 100 && (
            <div className="flex items-center gap-1 text-retro-yellow">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-vhs">Popular</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {likeCount === 0 && commentCount === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p className="font-vhs text-sm">Be the first to interact with this note!</p>
        </div>
      )}
    </div>
  );
};

// Quick stats for note cards
export const QuickInteractionStats: React.FC<{
  likeCount: number;
  commentCount: number;
  className?: string;
}> = ({ likeCount, commentCount, className = '' }) => {
  if (likeCount === 0 && commentCount === 0) return null;

  return (
    <div className={`flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-vhs ${className}`}>
      {likeCount > 0 && (
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3 text-retro-pink" />
          <span>{likeCount}</span>
        </div>
      )}
      {commentCount > 0 && (
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3 text-retro-blue" />
          <span>{commentCount}</span>
        </div>
      )}
    </div>
  );
};
