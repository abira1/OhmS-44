import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  variant?: 'default' | 'card' | 'list';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  lines = 3,
  avatar = false,
  variant = 'default'
}) => {
  const renderDefault = () => (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="skeleton rounded-full h-12 w-12 mb-4"></div>
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`skeleton h-4 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );

  const renderCard = () => (
    <div className={`animate-pulse neu-card p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {avatar && <div className="skeleton rounded-full h-10 w-10"></div>}
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded w-3/4"></div>
          <div className="skeleton h-4 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`skeleton h-3 rounded ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );

  const renderList = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="animate-pulse flex items-center space-x-3">
          <div className="skeleton rounded-full h-8 w-8"></div>
          <div className="flex-1 space-y-1">
            <div className="skeleton h-3 rounded w-1/2"></div>
            <div className="skeleton h-3 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  switch (variant) {
    case 'card':
      return renderCard();
    case 'list':
      return renderList();
    default:
      return renderDefault();
  }
};

// Specialized skeleton components
export const RoutineSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="animate-pulse">
      <div className="skeleton h-6 rounded w-1/3 mb-4"></div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="neu-card p-4 mb-3">
          <div className="flex justify-between items-center">
            <div className="skeleton h-4 rounded w-1/4"></div>
            <div className="skeleton h-4 rounded w-1/6"></div>
          </div>
          <div className="skeleton h-5 rounded w-1/2 mt-2"></div>
          <div className="skeleton h-3 rounded w-1/3 mt-1"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ClassmatesSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="animate-pulse neu-card p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="skeleton rounded-full h-12 w-12"></div>
          <div className="flex-1">
            <div className="skeleton h-4 rounded w-3/4 mb-1"></div>
            <div className="skeleton h-3 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 rounded w-full"></div>
          <div className="skeleton h-3 rounded w-2/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export const AttendanceSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="animate-pulse">
      <div className="skeleton h-6 rounded w-1/4 mb-4"></div>
      <div className="neu-card p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="skeleton h-8 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="skeleton h-6 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const NoticesSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="animate-pulse neu-card p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="skeleton h-5 rounded w-1/2"></div>
          <div className="skeleton h-4 rounded w-1/6"></div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 rounded w-full"></div>
          <div className="skeleton h-3 rounded w-4/5"></div>
          <div className="skeleton h-3 rounded w-3/5"></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="skeleton h-3 rounded w-1/4"></div>
          <div className="skeleton h-6 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
);
