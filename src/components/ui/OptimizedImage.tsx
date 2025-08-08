import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  srcSet?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  lazy = true,
  onLoad,
  onError,
  sizes,
  srcSet
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback avatar for when image fails to load
  const fallbackAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Cpath d='M100 90c-16.569 0-30-13.431-30-30s13.431-30 30-30 30 13.431 30 30-13.431 30-30 30zm0 20c-33.137 0-60 26.863-60 60v20h120v-20c0-33.137-26.863-60-60-60z' fill='%239ca3af'/%3E%3C/svg%3E";

  return (
    <img
      src={hasError ? fallbackAvatar : src}
      alt={alt}
      className={`transition-all duration-500 ${isLoaded ? 'blur-0 opacity-100' : 'blur-sm opacity-70'} ${className}`}
      loading={lazy ? 'lazy' : 'eager'}
      onLoad={handleLoad}
      onError={handleError}
      sizes={sizes}
      srcSet={srcSet}
    />
  );
};

// Utility function to generate responsive image URLs
const generateResponsiveImageUrl = (originalUrl: string, width: number): string => {
  // For external URLs, we'll use the original URL
  // In a real app, you'd integrate with a service like Cloudinary, ImageKit, or similar
  if (originalUrl.startsWith('http')) {
    return originalUrl;
  }

  // For local images, you could append size parameters
  return originalUrl;
};

// Generate srcSet for responsive images
const generateSrcSet = (src: string, sizes: number[]): string => {
  return sizes
    .map(size => `${generateResponsiveImageUrl(src, size)} ${size}w`)
    .join(', ');
};

// Specialized image components
export const AvatarImage: React.FC<{
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  highQuality?: boolean;
}> = ({ src, alt, size = 'md', className = '', highQuality = false }) => {
  const sizeConfig = {
    sm: { class: 'w-8 h-8', width: 32, sizes: [32, 64] },
    md: { class: 'w-12 h-12', width: 48, sizes: [48, 96] },
    lg: { class: 'w-16 h-16', width: 64, sizes: [64, 128] },
    xl: { class: 'w-24 h-24', width: 96, sizes: [96, 192] }
  };

  const config = sizeConfig[size];

  // Generate responsive image attributes
  const srcSet = highQuality ? generateSrcSet(src, config.sizes) : undefined;
  const sizes = highQuality ? `${config.width}px` : undefined;

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${config.class} rounded-full object-cover ${className}`}
      lazy={true}
      srcSet={srcSet}
      sizes={sizes}
    />
  );
};

// Enhanced Avatar with better image processing
export const EnhancedAvatarImage: React.FC<{
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackInitials?: string;
}> = ({ src, alt, size = 'md', className = '', fallbackInitials }) => {
  const [imageError, setImageError] = useState(false);

  const sizeConfig = {
    sm: { class: 'w-8 h-8', textSize: 'text-xs' },
    md: { class: 'w-12 h-12', textSize: 'text-sm' },
    lg: { class: 'w-16 h-16', textSize: 'text-lg' },
    xl: { class: 'w-24 h-24', textSize: 'text-xl' }
  };

  const config = sizeConfig[size];

  // Generate initials from name if not provided
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = fallbackInitials || getInitials(alt);

  if (imageError || !src) {
    return (
      <div className={`${config.class} rounded-full bg-gradient-to-br from-retro-purple to-retro-teal flex items-center justify-center ${className}`}>
        <span className={`${config.textSize} font-bold text-white`}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <AvatarImage
      src={src}
      alt={alt}
      size={size}
      className={className}
      highQuality={true}
    />
  );
};


