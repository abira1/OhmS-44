import React, { useState } from 'react';
import { Copy, ExternalLink, Check, Info } from 'lucide-react';
import ImageUpload from '../ui/ImageUpload';
import { EnhancedAvatarImage } from '../ui/OptimizedImage';

const ImageUploadDemo: React.FC = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadData, setUploadData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleUploadComplete = (data: { url: string; originalFile: File; uploadData: any }) => {
    setUploadData(data.uploadData);
    console.log('Upload complete:', data);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          ImageBB Upload Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the cloud image upload functionality with ImageBB integration
        </p>
      </div>

      {/* Upload Section */}
      <div className="neu-card p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Upload Image
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Component */}
          <div>
            <ImageUpload
              value={uploadedImageUrl}
              onChange={setUploadedImageUrl}
              onUploadComplete={handleUploadComplete}
              size="xl"
              placeholder="Upload test image"
              studentName="Demo User"
              useCloudUpload={true}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
              Preview
            </h3>
            {uploadedImageUrl ? (
              <div className="space-y-4">
                <EnhancedAvatarImage
                  src={uploadedImageUrl}
                  alt="Uploaded preview"
                  size="xl"
                  fallbackInitials="DU"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Image uploaded successfully!
                </p>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {uploadedImageUrl && (
        <div className="neu-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Upload Results
          </h2>

          {/* Image URL */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={uploadedImageUrl}
                  readOnly
                  className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(uploadedImageUrl)}
                  className="p-3 rounded-xl bg-retro-purple hover:bg-retro-purple/90 text-white transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={uploadedImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-retro-teal hover:bg-retro-teal/90 text-white transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Upload Details */}
            {uploadData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Details
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">File Size:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {(uploadData.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Dimensions:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {uploadData.width} × {uploadData.height}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Format:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {uploadData.image.extension.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Upload Time:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {new Date(uploadData.time * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="neu-card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              How it works
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Images are automatically resized to 400×400px for optimal quality</li>
              <li>• Files are compressed to ~85% quality for perfect balance of size/quality</li>
              <li>• Images are uploaded to ImageBB cloud storage for reliable hosting</li>
              <li>• Fallback to local preview if cloud upload fails</li>
              <li>• Supports drag & drop, paste, and traditional file selection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadDemo;
