'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import showToast from '@/lib/toast';
import ProgressBar from './ProgressBar';
import ImageCropModal from './ImageCropModal';

export interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
}

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  enableCrop?: boolean;
  aspectRatio?: number;
  onUpload: (files: File[]) => Promise<void>;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  multiple = true,
  enableCrop = false,
  aspectRatio = 1,
  onUpload,
  onProgress,
  onError,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentCropFile, setCurrentCropFile] = useState<FileWithPreview | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejection) => {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          showToast.error(`File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
        } else if (error.code === 'file-invalid-type') {
          showToast.error('Invalid file type');
        } else {
          showToast.error(error.message);
        }
      });
    }

    // Check max files limit
    if (files.length + acceptedFiles.length > maxFiles) {
      showToast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add preview URLs to images
    const filesWithPreview = acceptedFiles.map(file =>
      Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: 'uploading' as const
      })
    );

    setFiles(prev => [...prev, ...filesWithPreview]);

    // If crop enabled and it's an image, show crop modal for first image
    if (enableCrop && filesWithPreview.length > 0 && filesWithPreview[0].type.startsWith('image/')) {
      setCurrentCropFile(filesWithPreview[0]);
    } else {
      // Upload directly without crop
      handleUpload(filesWithPreview);
    }
  }, [files, maxFiles, maxSize, enableCrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {}),
    maxSize,
    maxFiles,
    multiple,
    disabled: disabled || isUploading,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  const handleUpload = async (filesToUpload: FileWithPreview[]) => {
    setIsUploading(true);
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setFiles(prev => prev.map(f => {
          if (filesToUpload.includes(f)) {
            return { ...f, progress: i };
          }
          return f;
        }));

        onProgress?.(i);
      }

      // Call the upload callback
      await onUpload(filesToUpload);

      // Mark as success
      setFiles(prev => prev.map(f => {
        if (filesToUpload.includes(f)) {
          return { ...f, status: 'success' as const, progress: 100 };
        }
        return f;
      }));

      showToast.success(`${filesToUpload.length} file(s) uploaded successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev => prev.map(f => {
        if (filesToUpload.includes(f)) {
          return { ...f, status: 'error' as const, error: errorMessage };
        }
        return f;
      }));

      onError?.(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const clearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!currentCropFile) return;

    // Replace the original file with cropped version
    setFiles(prev => prev.map(f => 
      f === currentCropFile 
        ? Object.assign(croppedFile, { 
            preview: URL.createObjectURL(croppedFile),
            progress: 0,
            status: 'uploading' as const
          })
        : f
    ));

    setCurrentCropFile(null);

    // Upload the cropped file
    const croppedFileWithPreview: FileWithPreview = Object.assign(croppedFile, {
      preview: URL.createObjectURL(croppedFile),
      progress: 0,
      status: 'uploading' as const
    });
    
    handleUpload([croppedFileWithPreview]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive || isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          {isDragActive ? (
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              {t('common.dropFilesHere')}
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {t('common.dragFilesOr')} <span className="text-blue-600">{t('common.clickToBrowse')}</span>
              </p>
              <p className="text-sm text-gray-500">
                {accept === 'image/*' ? t('common.supportedImages') : t('common.supportedFiles')}
              </p>
              <p className="text-xs text-gray-400">
                Max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </h4>
            {files.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>

          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start space-x-3">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <button
                        onClick={() => removeFile(file)}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <ProgressBar progress={file.progress || 0} className="mt-2" />
                    )}

                    {/* Status */}
                    {file.status === 'success' && (
                      <div className="flex items-center mt-2 text-green-600">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs">Uploaded</span>
                      </div>
                    )}

                    {file.status === 'error' && (
                      <div className="flex items-center mt-2 text-red-600">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs">{file.error || 'Upload failed'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Image Crop Modal */}
      {currentCropFile && currentCropFile.preview && (
        <ImageCropModal
          image={currentCropFile.preview}
          aspectRatio={aspectRatio}
          onComplete={handleCropComplete}
          onCancel={() => setCurrentCropFile(null)}
        />
      )}
    </div>
  );
};

export default FileUpload;
