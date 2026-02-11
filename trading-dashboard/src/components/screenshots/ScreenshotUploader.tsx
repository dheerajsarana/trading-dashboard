import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';
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
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

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

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return `${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 5MB.`;
    }
    return null;
  }, []);

  // Handle file drop or selection
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setValidationError(null);
      dispatch(clearError());

      // Check rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((rejected) => {
          if (rejected.errors?.[0]?.code === 'file-too-large') {
            return `${rejected.file.name}: File too large (max 5MB)`;
          }
          if (rejected.errors?.[0]?.code === 'file-invalid-type') {
            return `${rejected.file.name}: Invalid file type`;
          }
          return `${rejected.file.name}: Invalid file`;
        });
        setValidationError(errors.join('\n'));
        return;
      }

      // Validate each file
      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of acceptedFiles) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        setValidationError(errors.join('\n'));
      }

      // Check total count
      const totalFiles = selectedFiles.length + validFiles.length;
      if (totalFiles > MAX_FILES) {
        setValidationError(`Maximum ${MAX_FILES} files allowed. Please remove some files.`);
        return;
      }

      // Update selected files
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);

      // Generate preview URLs
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviews]);
    },
    [selectedFiles, previewUrls, validateFile, dispatch]
  );

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    multiple: true,
    disabled: isUploading,
  });

  // Remove file from selection
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    // Revoke and remove preview URL
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
      selectedFiles.forEach((_, index) => {
        URL.revokeObjectURL(previewUrls[index]);
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setValidationError(null);

      // Callback
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      // Error handled by Redux
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 dark:hover:border-blue-500'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {isDragActive ? (
            'Drop the files here...'
          ) : (
            <>
              Drag and drop screenshots here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
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
