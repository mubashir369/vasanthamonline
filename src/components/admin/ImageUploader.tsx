'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Link as LinkIcon,
  X,
  Loader2,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react';
import { compressImage } from '@/lib/imageUtils';

interface ImageUploaderProps {
  /** Section label displayed above the uploader */
  label?: string;
  /** Allow multiple image uploads. Default: true */
  multiple?: boolean;
  /** Maximum number of images allowed. Default: 20 */
  maxFiles?: number;
  /** Currently selected image URLs */
  images: string[];
  /** Callback when images array changes (add/remove) */
  onImagesChange: (images: string[]) => void;
  /** Compact mode for inline/variant usage */
  compact?: boolean;
}

export default function ImageUploader({
  label,
  multiple = true,
  maxFiles = 20,
  images,
  onImagesChange,
  compact = false,
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveMaxFiles = multiple ? maxFiles : 1;

  // Handle file upload with compression
  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      const remainingSlots = effectiveMaxFiles - images.length;
      if (remainingSlots <= 0) {
        setError(`Maximum ${effectiveMaxFiles} image(s) allowed`);
        return;
      }

      const filesToUpload = files.slice(0, remainingSlots);

      setUploading(true);
      setError('');
      setUploadProgress(`Compressing ${filesToUpload.length} image(s)...`);

      try {
        const formData = new FormData();

        for (let i = 0; i < filesToUpload.length; i++) {
          setUploadProgress(
            `Compressing image ${i + 1} of ${filesToUpload.length}...`
          );
          const compressed = await compressImage(filesToUpload[i]);
          formData.append('files', compressed);
        }

        setUploadProgress('Uploading to cloud...');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.urls) {
          if (multiple) {
            onImagesChange([...images, ...data.urls]);
          } else {
            // Single mode: replace existing image
            onImagesChange([data.urls[0]]);
          }
        } else {
          setError(data.error || 'Upload failed');
        }
      } catch (err: any) {
        setError(err.message || 'Upload error');
      } finally {
        setUploading(false);
        setUploadProgress('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [images, effectiveMaxFiles, multiple, onImagesChange]
  );

  // Handle adding URL
  const handleAddUrl = useCallback(() => {
    const url = urlInput.trim();
    if (!url) return;

    if (!url.match(/^https?:\/\/.+/)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (images.length >= effectiveMaxFiles) {
      setError(`Maximum ${effectiveMaxFiles} image(s) allowed`);
      return;
    }

    if (multiple) {
      onImagesChange([...images, url]);
    } else {
      onImagesChange([url]);
    }
    setUrlInput('');
    setError('');
  }, [urlInput, images, effectiveMaxFiles, multiple, onImagesChange]);

  // Handle removing image
  const handleRemove = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, onImagesChange]
  );

  // Drag & drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  // Handle Enter key in URL input
  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const tabBaseClass =
    'px-3 py-1.5 text-[11px] font-semibold rounded-md flex items-center gap-1.5 transition-all';
  const tabActiveClass =
    'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm';
  const tabInactiveClass =
    'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200';

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {/* Label */}
      {label && (
        <label className="block font-semibold text-neutral-700 dark:text-neutral-300 text-xs">
          {label}
        </label>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`${tabBaseClass} ${activeTab === 'upload' ? tabActiveClass : tabInactiveClass}`}
        >
          <Upload className="w-3 h-3" />
          <span>Upload Image</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`${tabBaseClass} ${activeTab === 'url' ? tabActiveClass : tabInactiveClass}`}
        >
          <LinkIcon className="w-3 h-3" />
          <span>Paste URL</span>
        </button>
      </div>

      {/* Upload Tab Content */}
      {activeTab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
            compact ? 'p-4' : 'p-6'
          } ${
            dragActive
              ? 'border-crimson-500 bg-crimson-50/50 dark:bg-crimson-950/20'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-crimson-400 dark:hover:border-crimson-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-crimson-600 dark:text-gold-400" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {uploadProgress}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Upload className="w-5 h-5 text-crimson-600 dark:text-gold-400" />
              </div>
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {dragActive
                  ? 'Drop images here'
                  : 'Drag & drop images or click to browse'}
              </p>
              <p className="text-[10px] text-neutral-400">
                Auto-compressed to optimal WebP • Max 10MB per file
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* URL Tab Content */}
      {activeTab === 'url' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setError('');
            }}
            onKeyDown={handleUrlKeyDown}
            placeholder="Paste image URL (https://...)"
            className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:ring-1 focus:ring-crimson-500 focus:border-crimson-500 outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded-lg font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <LinkIcon className="w-3 h-3" />
            Add URL
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div
          className={`flex flex-wrap gap-2.5 ${
            compact
              ? ''
              : 'p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={`relative group overflow-hidden border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 ${
                compact
                  ? 'w-11 h-12 rounded'
                  : 'w-20 h-24 rounded-lg'
              }`}
            >
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).alt = '⚠️';
                }}
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className={`absolute top-0.5 right-0.5 rounded-full bg-red-600 text-white opacity-80 hover:opacity-100 transition shadow ${
                  compact ? 'p-0.5' : 'p-1'
                }`}
                title="Remove image"
              >
                <X className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              </button>

              {/* Primary badge (first image) */}
              {idx === 0 && !compact && (
                <span className="absolute bottom-1 inset-x-1 bg-black/75 text-gold-300 text-[9px] font-bold text-center py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
