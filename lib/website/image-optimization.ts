/**
 * Website System Image Optimization
 * Implements WebP format support, lazy loading, responsive image serving, compression
 */

/**
 * Image format
 */
export type ImageFormat = 'webp' | 'jpeg' | 'png' | 'gif' | 'avif';

/**
 * Image metadata
 */
export interface ImageMetadata {
  src: string;
  alt: string;
  width: number;
  height: number;
  formats?: Record<ImageFormat, string>;
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  priority?: boolean;
}

/**
 * Responsive image size
 */
export interface ResponsiveImageSize {
  width: number;
  height: number;
  srcSet: string;
  sizes: string;
}

/**
 * Image optimization config
 */
export interface ImageOptimizationConfig {
  formats: ImageFormat[];
  sizes: Record<string, number>;
  quality: number;
  enableWebP: boolean;
  enableAVIF: boolean;
}

/**
 * Default image optimization config
 */
export const DEFAULT_IMAGE_CONFIG: ImageOptimizationConfig = {
  formats: ['webp', 'jpeg'],
  sizes: {
    sm: 320,
    md: 640,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  quality: 80,
  enableWebP: true,
  enableAVIF: false,
};

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  try {
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  } catch {
    return false;
  }
}

/**
 * Check if browser supports AVIF
 */
export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  try {
    return canvas.toDataURL('image/avif').indexOf('image/avif') === 5;
  } catch {
    return false;
  }
}

/**
 * Get supported image formats
 */
export function getSupportedFormats(config: ImageOptimizationConfig): ImageFormat[] {
  const supported: ImageFormat[] = [];

  if (config.formats.includes('avif') && supportsAVIF()) {
    supported.push('avif');
  }

  if (config.formats.includes('webp') && supportsWebP()) {
    supported.push('webp');
  }

  // Always include fallback formats
  if (config.formats.includes('jpeg')) {
    supported.push('jpeg');
  }

  if (config.formats.includes('png')) {
    supported.push('png');
  }

  return supported;
}

/**
 * Generate image URL with format
 */
export function generateImageUrl(
  basePath: string,
  format: ImageFormat,
  width?: number,
  quality?: number
): string {
  const params = new URLSearchParams();

  if (width) {
    params.append('w', String(width));
  }

  if (quality) {
    params.append('q', String(quality));
  }

  params.append('f', format);

  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}${params.toString()}`;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  basePath: string,
  sizes: Record<string, number>,
  format: ImageFormat,
  quality?: number
): string {
  return Object.entries(sizes)
    .map(([_, width]) => {
      const url = generateImageUrl(basePath, format, width, quality);
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute
 */
export function generateSizes(breakpoints: Record<string, number>): string {
  const entries = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);

  return entries
    .map(([name, width], index) => {
      if (index === entries.length - 1) {
        return `${width}px`;
      }
      return `(max-width: ${width}px) ${width}px`;
    })
    .join(', ');
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Calculate responsive dimensions
 */
export function calculateResponsiveDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);
  return {
    width: targetWidth,
    height: Math.round(targetWidth / aspectRatio),
  };
}

/**
 * Estimate image file size
 */
export function estimateImageFileSize(
  width: number,
  height: number,
  quality: number = 80,
  format: ImageFormat = 'jpeg'
): number {
  const pixels = width * height;
  const baseSize = pixels * 0.5; // Base size in bytes

  // Adjust for quality
  const qualityFactor = quality / 100;

  // Adjust for format
  let formatFactor = 1;
  switch (format) {
    case 'webp':
      formatFactor = 0.7;
      break;
    case 'avif':
      formatFactor = 0.5;
      break;
    case 'png':
      formatFactor = 1.5;
      break;
    case 'jpeg':
    default:
      formatFactor = 1;
  }

  return Math.round(baseSize * qualityFactor * formatFactor);
}

/**
 * Check if image should be lazy loaded
 */
export function shouldLazyLoad(priority: boolean = false): boolean {
  return !priority;
}

/**
 * Generate picture element HTML
 */
export function generatePictureHTML(
  metadata: ImageMetadata,
  config: ImageOptimizationConfig
): string {
  const formats = getSupportedFormats(config);
  const quality = metadata.quality || config.quality;

  let html = '<picture>';

  // Add source elements for each format
  for (const format of formats) {
    if (format === 'jpeg') continue; // Skip jpeg as fallback

    const srcSet = generateSrcSet(metadata.src, config.sizes, format, quality);
    const type = `image/${format}`;

    html += `\n  <source srcset="${srcSet}" type="${type}" />`;
  }

  // Add img element as fallback
  const fallbackSrcSet = generateSrcSet(
    metadata.src,
    config.sizes,
    'jpeg',
    quality
  );
  const sizes = metadata.sizes || generateSizes(config.sizes);
  const loading = metadata.loading || 'lazy';

  html += `\n  <img src="${metadata.src}" srcset="${fallbackSrcSet}" sizes="${sizes}" alt="${metadata.alt}" loading="${loading}" width="${metadata.width}" height="${metadata.height}" />`;
  html += '\n</picture>';

  return html;
}

/**
 * Validate image alt text
 */
export function validateImageAltText(alt: string): boolean {
  return alt !== undefined && alt !== null && alt.trim().length > 0;
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(width: number, height: number): boolean {
  return width > 0 && height > 0 && width <= 10000 && height <= 10000;
}

/**
 * Validate image quality
 */
export function validateImageQuality(quality: number): boolean {
  return quality >= 1 && quality <= 100;
}

/**
 * Get image loading strategy
 */
export function getImageLoadingStrategy(
  priority: boolean,
  isAboveTheFold: boolean
): 'eager' | 'lazy' {
  if (priority || isAboveTheFold) {
    return 'eager';
  }
  return 'lazy';
}

/**
 * Optimize image metadata
 */
export function optimizeImageMetadata(
  metadata: Partial<ImageMetadata>,
  config: ImageOptimizationConfig
): ImageMetadata {
  const src = metadata.src || '';
  const alt = metadata.alt || '';
  const width = metadata.width || 1200;
  const height = metadata.height || 800;
  const quality = metadata.quality || config.quality;
  const priority = metadata.priority || false;
  const loading = metadata.loading || getImageLoadingStrategy(priority, false);

  return {
    src,
    alt,
    width,
    height,
    quality,
    priority,
    loading,
    formats: metadata.formats,
    sizes: metadata.sizes || generateSizes(config.sizes),
    srcSet: metadata.srcSet || generateSrcSet(src, config.sizes, 'jpeg', quality),
  };
}

/**
 * Calculate image compression savings
 */
export function calculateCompressionSavings(
  originalSize: number,
  compressedSize: number
): { bytes: number; percentage: number } {
  const bytes = originalSize - compressedSize;
  const percentage = (bytes / originalSize) * 100;

  return {
    bytes,
    percentage: Math.round(percentage * 100) / 100,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Intersection Observer for lazy loading
 */
export function observeImageLazyLoading(
  img: HTMLImageElement,
  callback?: () => void
): IntersectionObserver {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const src = img.dataset.src;
        const srcSet = img.dataset.srcset;

        if (src) {
          img.src = src;
        }

        if (srcSet) {
          img.srcset = srcSet;
        }

        img.classList.add('loaded');
        observer.unobserve(img);
        callback?.();
      }
    },
    {
      threshold: 0.1,
      rootMargin: '50px',
    }
  );

  observer.observe(img);
  return observer;
}
