"use client";

/**
 * 懒加载图片组件
 * 支持图片懒加载、占位符、错误处理、渐进式加载
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /** 占位符图片 */
  placeholder?: string;
  /** 占位符模糊数据URL */
  blurDataURL?: string;
  /** 加载失败时显示的图片 */
  fallbackSrc?: string;
  /** 是否启用懒加载 */
  lazy?: boolean;
  /** 懒加载阈值（像素） */
  threshold?: number;
  /** 加载完成回调 */
  onLoadComplete?: () => void;
  /** 加载失败回调 */
  onLoadError?: (error: Error) => void;
  /** 容器类名 */
  containerClassName?: string;
  /** 是否显示加载动画 */
  showLoadingAnimation?: boolean;
  /** 图片宽高比 */
  aspectRatio?: number;
}

/**
 * 默认占位符（灰色背景）
 */
const DEFAULT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3C/svg%3E";

/**
 * 默认错误图片
 */
const DEFAULT_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3E图片加载失败%3C/text%3E%3C/svg%3E";

export function LazyImage({
  src,
  alt,
  placeholder = DEFAULT_PLACEHOLDER,
  blurDataURL,
  fallbackSrc = DEFAULT_FALLBACK,
  lazy = true,
  threshold = 200,
  onLoadComplete,
  onLoadError,
  containerClassName,
  showLoadingAnimation = true,
  aspectRatio,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [currentSrc, setCurrentSrc] = useState<string | typeof src>(
    lazy ? placeholder : src
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 Intersection Observer 实现懒加载
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setCurrentSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, threshold, src, isInView]);

  // 处理图片加载完成
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoadComplete?.();
  }, [onLoadComplete]);

  // 处理图片加载失败
  const handleError = useCallback(() => {
    setIsError(true);
    setCurrentSrc(fallbackSrc);
    onLoadError?.(new Error("Image failed to load"));
  }, [fallbackSrc, onLoadError]);

  // 计算容器样式
  const containerStyle: React.CSSProperties = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : {};

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        aspectRatio && "w-full h-0",
        containerClassName
      )}
      style={containerStyle}
    >
      {/* 加载动画 */}
      {showLoadingAnimation && !isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* 图片 */}
      {isInView && (
        <Image
          src={currentSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            aspectRatio && "absolute inset-0 w-full h-full object-cover",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          {...props}
        />
      )}

      {/* 占位符（懒加载时显示） */}
      {!isInView && (
        <div
          className={cn(
            "bg-gray-100",
            aspectRatio && "absolute inset-0 w-full h-full"
          )}
        />
      )}
    </div>
  );
}

/**
 * 响应式图片组件
 * 根据屏幕尺寸加载不同大小的图片
 */
interface ResponsiveImageProps extends Omit<LazyImageProps, "src"> {
  /** 图片源（不同尺寸） */
  sources: {
    src: string;
    width: number;
  }[];
  /** 默认图片源 */
  defaultSrc: string;
}

export function ResponsiveImage({
  sources,
  defaultSrc,
  ...props
}: ResponsiveImageProps) {
  // 按宽度排序
  const sortedSources = [...sources].sort((a, b) => a.width - b.width);

  // 生成 srcSet
  const srcSet = sortedSources
    .map((s) => `${s.src} ${s.width}w`)
    .join(", ");

  // 生成 sizes
  const sizes = sortedSources
    .map((s, i) => {
      if (i === sortedSources.length - 1) {
        return `${s.width}px`;
      }
      return `(max-width: ${s.width}px) ${s.width}px`;
    })
    .join(", ");

  return (
    <LazyImage
      src={defaultSrc}
      {...props}
    />
  );
}

/**
 * 图片画廊组件
 * 支持图片预览、缩放、导航
 */
interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
    thumbnail?: string;
  }[];
  className?: string;
  thumbnailClassName?: string;
  onImageClick?: (index: number) => void;
}

export function ImageGallery({
  images,
  className,
  thumbnailClassName,
  onImageClick,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    onImageClick?.(index);
  };

  if (images.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 主图 */}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <LazyImage
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 缩略图列表 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300",
                thumbnailClassName
              )}
            >
              <LazyImage
                src={image.thumbnail || image.src}
                alt={`${image.alt} 缩略图`}
                fill
                className="object-cover"
                threshold={0}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 头像组件
 * 带有懒加载和回退功能
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackText?: string;
  className?: string;
}

const AVATAR_SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function AvatarImage({
  src,
  alt,
  size = "md",
  fallbackText,
  className,
}: AvatarImageProps) {
  const [isError, setIsError] = useState(false);

  // 获取首字母作为回退
  const initials = fallbackText
    ? fallbackText.slice(0, 2).toUpperCase()
    : alt.slice(0, 2).toUpperCase();

  if (!src || isError) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium",
          AVATAR_SIZES[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden",
        AVATAR_SIZES[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setIsError(true)}
      />
    </div>
  );
}

export default LazyImage;
