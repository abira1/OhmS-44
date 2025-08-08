/**
 * Image optimization utilities for better performance and quality
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

/**
 * Compress and resize an image file
 */
export const processImageFile = (
  file: File,
  options: ImageProcessingOptions = {}
): Promise<{ file: File; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 400,
      maxHeight = 400,
      quality = 0.8,
      format = 'jpeg',
      maintainAspectRatio = true
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        let { width, height } = img;

        // Calculate new dimensions
        if (maintainAspectRatio) {
          const aspectRatio = width / height;
          
          if (width > height) {
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
          } else {
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }
        } else {
          width = Math.min(width, maxWidth);
          height = Math.min(height, maxHeight);
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: `image/${format}`,
                  lastModified: Date.now()
                });

                // Create data URL for preview
                const reader = new FileReader();
                reader.onload = (e) => {
                  resolve({
                    file: processedFile,
                    dataUrl: e.target?.result as string
                  });
                };
                reader.readAsDataURL(processedFile);
              } else {
                reject(new Error('Failed to process image'));
              }
            },
            `image/${format}`,
            quality
          );
        } else {
          reject(new Error('Canvas context not available'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image file size must be less than 10MB'
    };
  }

  return { isValid: true };
};

/**
 * Generate multiple sizes for responsive images
 */
export const generateResponsiveSizes = (
  file: File,
  sizes: number[] = [96, 192, 384]
): Promise<{ size: number; file: File; dataUrl: string }[]> => {
  const promises = sizes.map(size =>
    processImageFile(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.85,
      format: 'jpeg'
    }).then(result => ({
      size,
      file: result.file,
      dataUrl: result.dataUrl
    }))
  );

  return Promise.all(promises);
};

/**
 * Create a placeholder image data URL
 */
export const createPlaceholderImage = (
  width: number = 200,
  height: number = 200,
  backgroundColor: string = '#f3f4f6',
  textColor: string = '#9ca3af',
  text: string = '?'
): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.3}" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Extract dominant color from image for better placeholders
 */
export const extractDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('#f3f4f6');
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch {
        resolve('#f3f4f6');
      }
    };
    
    img.onerror = () => resolve('#f3f4f6');
    img.src = imageUrl;
  });
};

/**
 * Check if WebP is supported
 */
export const isWebPSupported = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalImageFormat = (): 'webp' | 'jpeg' => {
  return isWebPSupported() ? 'webp' : 'jpeg';
};
