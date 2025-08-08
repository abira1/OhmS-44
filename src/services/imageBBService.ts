/**
 * ImageBB API service for uploading images to cloud storage
 */

const IMGBB_API_KEY = '62bec5d65ad1400d9a54192fcaf03654';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export interface ImageBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export interface ImageBBError {
  error: {
    message: string;
    code: number;
    context: string;
  };
  status_code: number;
  status_txt: string;
}

/**
 * Upload image file to ImageBB
 */
export const uploadToImageBB = async (
  file: File,
  name?: string
): Promise<{ success: true; data: ImageBBResponse['data'] } | { success: false; error: string }> => {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Check file size (ImageBB has 32MB limit)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 32MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload an image file.' };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', file);
    
    if (name) {
      formData.append('name', name);
    }

    // Set expiration to 0 (never expire)
    formData.append('expiration', '0');

    // Upload to ImageBB
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      const error = result as ImageBBError;
      return { 
        success: false, 
        error: error.error?.message || `Upload failed: ${response.status}` 
      };
    }

    if (!result.success) {
      return { 
        success: false, 
        error: result.error?.message || 'Upload failed' 
      };
    }

    return { success: true, data: result.data };

  } catch (error) {
    console.error('ImageBB upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
};

/**
 * Upload image with automatic retry
 */
export const uploadToImageBBWithRetry = async (
  file: File,
  name?: string,
  maxRetries: number = 3
): Promise<{ success: true; data: ImageBBResponse['data'] } | { success: false; error: string }> => {
  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uploadToImageBB(file, name);
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error;
      
      // If it's a client error (4xx), don't retry
      if (result.error.includes('Invalid') || result.error.includes('file type') || result.error.includes('size')) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  return { success: false, error: `Upload failed after ${maxRetries} attempts: ${lastError}` };
};

/**
 * Convert base64 data URL to File object
 */
export const dataURLToFile = (dataURL: string, filename: string): File => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * Upload processed image data URL to ImageBB
 */
export const uploadProcessedImageToImageBB = async (
  dataURL: string,
  originalFileName: string,
  studentName?: string
): Promise<{ success: true; url: string; data: ImageBBResponse['data'] } | { success: false; error: string }> => {
  try {
    // Convert data URL to File
    const file = dataURLToFile(dataURL, originalFileName);
    
    // Generate a meaningful name
    const name = studentName 
      ? `${studentName.replace(/\s+/g, '_')}_profile_${Date.now()}`
      : `profile_${Date.now()}`;

    // Upload to ImageBB
    const result = await uploadToImageBBWithRetry(file, name);
    
    if (result.success) {
      return {
        success: true,
        url: result.data.display_url,
        data: result.data
      };
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image upload'
    };
  }
};

/**
 * Get image info from ImageBB URL
 */
export const getImageInfoFromURL = (url: string): { isImageBB: boolean; imageId?: string } => {
  try {
    // Check if URL is from ImageBB
    const imageBBPattern = /https?:\/\/i\.ibb\.co\/[a-zA-Z0-9]+\/[^\/]+/;
    const isImageBB = imageBBPattern.test(url);
    
    if (isImageBB) {
      // Extract image ID from URL
      const matches = url.match(/\/([a-zA-Z0-9]+)\//);
      const imageId = matches?.[1];
      
      return { isImageBB: true, imageId };
    }
    
    return { isImageBB: false };
  } catch {
    return { isImageBB: false };
  }
};

/**
 * Validate ImageBB URL
 */
export const validateImageBBURL = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};
