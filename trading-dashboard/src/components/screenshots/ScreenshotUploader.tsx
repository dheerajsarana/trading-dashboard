import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, FileImage, AlertCircle, Clipboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  uploadScreenshots,
  selectIsUploading,
  selectUploadProgress,
  selectError,
  clearError,
} from '../../store/screenshotSlice';

interface ScreenshotUploaderProps {
  tradeId?: string;
  mt5TradeId?: string;
  onUploadComplete?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  tradeId,
  mt5TradeId,
  onUploadComplete,
}) => {
  const dispatch = useAppDispatch();
  const isUploading = useAppSelector(selectIsUploading);
  const uploadProgress = useAppSelector(selectUploadProgress);
  const error = useAppSelector(selectError);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 5MB.`;
    }
    return null;
  }, []);

  // Add files (shared by file input and paste)
  const addFiles = useCallback(
    (files: File[]) => {
      setValidationError(null);
      dispatch(clearError());

      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of files) {
        const err = validateFile(file);
        if (err) {
          errors.push(err);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        setValidationError(errors.join('\n'));
      }

      if (validFiles.length === 0) return;

      const totalFiles = selectedFiles.length + validFiles.length;
      if (totalFiles > MAX_FILES) {
        setValidationError(`Maximum ${MAX_FILES} files allowed. Please remove some files.`);
        return;
      }

      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    },
    [selectedFiles, validateFile, dispatch]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isUploading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        addFiles(imageFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [addFiles, isUploading]);

  // Remove file from selection
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    URL.revokeObjectURL(previewUrls[index]);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviews);

    setValidationError(null);
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setValidationError('Please select at least one file to upload.');
      return;
    }

    try {
      await dispatch(
        uploadScreenshots({
          tradeId,
          mt5TradeId,
          files: selectedFiles,
        })
      ).unwrap();

      // Clear selections and previews on success
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setValidationError(null);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      // Error handled by Redux
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          border-gray-300 dark:border-gray-600
          ${isUploading ? 'opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <Clipboard className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Paste an image from clipboard
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">or</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Choose Files
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          JPEG, PNG, WebP (max 5MB, up to {MAX_FILES} files)
        </p>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{validationError}</p>
        </div>
      )}

      {/* Redux Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Files ({selectedFiles.length}/{MAX_FILES})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-1 flex items-center gap-1">
                  <FileImage className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !isUploading && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Screenshot' : 'Screenshots'}
        </button>
      )}
    </div>
  );
};
