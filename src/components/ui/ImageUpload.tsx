import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check, Cloud } from 'lucide-react';
import { processImageFile, validateImageFile, createPlaceholderImage } from '../../utils/imageOptimization';
import { uploadProcessedImageToImageBB } from '../../services/imageBBService';
import { EnhancedAvatarImage } from './OptimizedImage';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onFileChange?: (file: File) => void;
  onUploadComplete?: (data: { url: string; originalFile: File; uploadData: any }) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  placeholder?: string;
  disabled?: boolean;
  accept?: string;
  maxSizeText?: string;
  studentName?: string; // For generating meaningful filenames
  useCloudUpload?: boolean; // Whether to upload to ImageBB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onFileChange,
  onUploadComplete,
  className = '',
  size = 'lg',
  placeholder = 'Upload profile image',
  disabled = false,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSizeText = 'Max 10MB',
  studentName,
  useCloudUpload = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeConfig = {
    sm: { preview: 'w-16 h-16', container: 'w-20 h-20' },
    md: { preview: 'w-20 h-20', container: 'w-24 h-24' },
    lg: { preview: 'w-24 h-24', container: 'w-28 h-28' },
    xl: { preview: 'w-32 h-32', container: 'w-36 h-36' }
  };

  const config = sizeConfig[size];

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setIsUploading(false);
    setSuccess(false);
    setUploadProgress('');

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      setUploadProgress('Processing image...');

      // Process image for optimal size and quality
      const processed = await processImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        format: 'jpeg',
        maintainAspectRatio: true
      });

      // If cloud upload is enabled, upload to ImageBB
      if (useCloudUpload) {
        setIsProcessing(false);
        setIsUploading(true);
        setUploadProgress('Uploading to cloud...');

        const uploadResult = await uploadProcessedImageToImageBB(
          processed.dataUrl,
          file.name,
          studentName
        );

        if (uploadResult.success) {
          // Use the cloud URL
          onChange(uploadResult.url);

          // Notify parent of successful upload
          if (onUploadComplete) {
            onUploadComplete({
              url: uploadResult.url,
              originalFile: file,
              uploadData: uploadResult.data
            });
          }

          setUploadProgress('Upload complete!');
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            setUploadProgress('');
          }, 3000);
        } else {
          // Fallback to local data URL if upload fails
          setError(`Cloud upload failed: ${uploadResult.error}. Using local preview.`);
          onChange(processed.dataUrl);

          // Clear error after showing it briefly
          setTimeout(() => setError(null), 5000);
        }
      } else {
        // Use local data URL
        onChange(processed.dataUrl);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }

      // If parent wants the file, provide the processed file
      if (onFileChange) {
        onFileChange(processed.file);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
    }
  }, [onChange, onFileChange, onUploadComplete, studentName, useCloudUpload]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [disabled, handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setError(null);
    setSuccess(false);
    setUploadProgress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const placeholderImage = createPlaceholderImage(200, 200, '#f3f4f6', '#9ca3af', '📷');

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${config.container} relative rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-retro-purple bg-retro-purple/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-retro-purple dark:hover:border-retro-teal'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
          ${success ? 'border-green-500' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        {/* Image preview or upload area */}
        {value ? (
          <div className="relative w-full h-full">
            <EnhancedAvatarImage
              src={value}
              alt="Profile preview"
              size={size}
              className="w-full h-full"
            />
            
            {/* Remove button */}
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Success indicator */}
            {success && (
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            {isProcessing || isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin w-6 h-6 border-2 border-retro-purple border-t-transparent rounded-full mb-1" />
                {uploadProgress && (
                  <span className="text-xs text-center px-1">
                    {uploadProgress}
                  </span>
                )}
              </div>
            ) : (
              <>
                {useCloudUpload ? (
                  <Cloud className="w-6 h-6 mb-1" />
                ) : (
                  <Upload className="w-6 h-6 mb-1" />
                )}
                <span className="text-xs text-center px-1">
                  {isDragging ? 'Drop here' : useCloudUpload ? 'Upload to cloud' : 'Upload'}
                </span>
              </>
            )}
          </div>
        )}

        {/* Processing/Upload overlay */}
        {(isProcessing || isUploading) && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mb-2" />
            {uploadProgress && (
              <span className="text-xs text-white text-center px-2">
                {uploadProgress}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {placeholder}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {maxSizeText} • JPG, PNG, WebP
          {useCloudUpload && (
            <span className="ml-1">• Cloud Storage</span>
          )}
        </p>
        {uploadProgress && !error && !success && (
          <p className="text-xs text-retro-purple dark:text-retro-teal mt-1">
            {uploadProgress}
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-1 text-red-500 text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mt-2 flex items-center gap-1 text-green-500 text-xs">
          <Check className="w-3 h-3" />
          <span>Image optimized successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
