/**
 * ResponsiveImage Component
 * An image component that serves appropriately sized images based on viewport
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { getResponsiveImageSizes, getResponsiveImageSrcset } from '@/lib/website/responsive';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
  priority?: boolean;
  onError?: () => void;
}

/**
 * ResponsiveImage component
 * Serves appropriately sized images with srcset and sizes attributes
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  loading = 'lazy',
  className = '',
  priority = false,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        data-testid="responsive-image-fallback"
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }

  const imageSizes = sizes || getResponsiveImageSizes();
  const imageSrcSet = srcSet || getResponsiveImageSrcset(src);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      data-testid="responsive-image-container"
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        srcSet={imageSrcSet}
        sizes={imageSizes}
        loading={loading}
        priority={priority}
        onError={handleError}
        className="w-full h-full object-cover"
        data-testid="responsive-image"
      />
    </div>
  );
};

export default ResponsiveImage;
