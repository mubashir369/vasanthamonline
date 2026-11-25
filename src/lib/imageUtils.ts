/**
 * Premium client-side image compression utility.
 * Converts, resizes, and optimizes images to WebP format with
 * smart quality control for minimum file size with premium visual quality.
 */

export interface CompressOptions {
  /** Maximum dimension (width or height) in pixels. Default: 2048 */
  maxDimension?: number;
  /** Initial quality (0-1). Default: 0.85 */
  initialQuality?: number;
  /** Minimum quality floor (0-1). Default: 0.6 */
  minQuality?: number;
  /** Target max file size in bytes. Default: 512000 (500KB) */
  targetSizeBytes?: number;
  /** Output format. Default: 'image/webp' */
  format?: string;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxDimension: 2048,
  initialQuality: 0.85,
  minQuality: 0.6,
  targetSizeBytes: 512000, // 500KB
  format: 'image/webp',
};

/**
 * Load an image File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Calculate resized dimensions maintaining aspect ratio.
 */
function calculateDimensions(
  width: number,
  height: number,
  maxDim: number
): { width: number; height: number } {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }

  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * Render image to canvas at specified dimensions and convert to blob at given quality.
 */
function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  format: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    // Enable high-quality image smoothing for downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob((blob) => resolve(blob), format, quality);
  });
}

/**
 * Premium image compression with smart quality ladder.
 *
 * Pipeline:
 * 1. Resize to max dimension while maintaining aspect ratio
 * 2. Convert to WebP format
 * 3. Iteratively reduce quality if file exceeds target size
 * 4. Return the best compression that meets the size target
 *
 * @param file - Input image File
 * @param options - Compression options
 * @returns Compressed File in WebP format
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Load the image
    const img = await loadImage(file);
    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    // Calculate target dimensions
    const { width, height } = calculateDimensions(
      origWidth,
      origHeight,
      opts.maxDimension
    );

    // Quality ladder: start high, step down until we hit target size
    let quality = opts.initialQuality;
    let bestBlob: Blob | null = null;

    while (quality >= opts.minQuality) {
      const blob = await canvasToBlob(img, width, height, opts.format, quality);

      if (!blob) {
        // Canvas failed, return original
        return file;
      }

      bestBlob = blob;

      // If within target size or at minimum quality, stop
      if (blob.size <= opts.targetSizeBytes || quality <= opts.minQuality) {
        break;
      }

      // Step down quality by 0.05
      quality = Math.round((quality - 0.05) * 100) / 100;
    }

    if (!bestBlob) return file;

    // Generate output filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';

    return new File([bestBlob], cleanName, {
      type: opts.format,
      lastModified: Date.now(),
    });
  } catch {
    // Graceful fallback to original file on any error
    return file;
  }
}

/**
 * Legacy function - converts image to WebP format.
 * @deprecated Use compressImage() instead for better compression with smart resizing.
 */
export async function convertToWebP(
  file: File,
  quality = 0.85
): Promise<File> {
  return compressImage(file, {
    initialQuality: quality,
    minQuality: quality,
    maxDimension: 4096, // Higher limit for backward compat
  });
}
