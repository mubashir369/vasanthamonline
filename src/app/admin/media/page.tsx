'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface UploadedImage {
  url: string;
  timestamp: number;
}

export default function AdminMediaPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploaderImages, setUploaderImages] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // When images are added via the uploader, track them in history
  const handleImagesChange = (newImages: string[]) => {
    // Find newly added images
    const existing = new Set(uploaderImages);
    const added = newImages.filter((url) => !existing.has(url));

    // Add new images to history
    if (added.length > 0) {
      setUploadedImages((prev) => [
        ...added.map((url) => ({ url, timestamp: Date.now() })),
        ...prev,
      ]);
    }

    setUploaderImages(newImages);
  };

  // Copy URL to clipboard
  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  // Remove from history
  const handleRemoveFromHistory = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear uploader preview
  const clearUploader = () => {
    setUploaderImages([]);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-crimson-700 dark:text-gold-400" />
          Media Library & Image Link Generator
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Upload images to Cloudinary and generate shareable links. Images are
          auto-compressed to premium WebP format for fastest loading.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Upload className="w-4 h-4 text-gold-500" />
            Upload New Images
          </h2>
          {uploaderImages.length > 0 && (
            <button
              type="button"
              onClick={clearUploader}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
            >
              Clear preview
            </button>
          )}
        </div>

        <ImageUploader
          multiple={true}
          maxFiles={20}
          images={uploaderImages}
          onImagesChange={handleImagesChange}
        />
      </div>

      {/* Generated Links History */}
      {uploadedImages.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h2 className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-gold-500" />
              Generated Image Links ({uploadedImages.length})
            </h2>
            <span className="text-[10px] text-neutral-400 font-mono">
              Session history — links persist in Cloudinary permanently
            </span>
          </div>

          <div className="space-y-3">
            {uploadedImages.map((img, idx) => (
              <div
                key={`${img.url}-${img.timestamp}`}
                className="flex items-start gap-4 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700 group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  <img
                    src={img.url}
                    alt={`Uploaded ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* URL and actions */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Full URL */}
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 truncate select-all">
                      {img.url}
                    </code>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(img.url)}
                      className={`px-3 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition ${
                        copiedUrl === img.url
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                      }`}
                    >
                      {copiedUrl === img.url ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy URL
                        </>
                      )}
                    </button>

                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-md text-[11px] font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromHistory(idx)}
                      className="px-3 py-1 rounded-md text-[11px] font-semibold text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>

                    <span className="text-[10px] text-neutral-400 font-mono ml-auto">
                      {new Date(img.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadedImages.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No images uploaded yet</p>
          <p className="text-xs mt-1">
            Upload images above to generate Cloudinary links
          </p>
        </div>
      )}
    </div>
  );
}
