"use client";

import { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /** 是否显示骨架屏占位符 */
  showSkeleton?: boolean;
  /** 骨架屏的自定义类名 */
  skeletonClassName?: string;
  /** 图片加载完成后的回调 */
  onLoadComplete?: () => void;
  /** 图片加载失败后的回调 */
  onLoadError?: () => void;
  /** 是否启用渐进式加载效果 */
  progressive?: boolean;
  /** 模糊占位符的数据URL */
  blurPlaceholder?: string;
  /** 是否为首屏图片（优先加载） */
  priority?: boolean;
  /** 图片加载失败时的备用图片 */
  fallbackSrc?: string;
}

// 默认的模糊占位符（1x1 灰色像素）
const DEFAULT_BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwYABQoBfqVKqQAAAABJRU5ErkJggg==";

// 骨架屏组件
function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-muted animate-pulse rounded-inherit",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent skeleton-shimmer" />
    </div>
  );
}

export function LazyImage({
  src,
  alt,
  className,
  showSkeleton = true,
  skeletonClassName,
  onLoadComplete,
  onLoadError,
  progressive = true,
  blurPlaceholder,
  priority = false,
  fallbackSrc,
  fill,
  width,
  height,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 Intersection Observer 检测图片是否进入视口
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // 提前100px开始加载
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    onLoadError?.();
  };

  // 确定实际显示的图片源
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  // 确定占位符
  const placeholder = progressive ? "blur" : "empty";
  const blurDataURL = blurPlaceholder || DEFAULT_BLUR_PLACEHOLDER;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={!fill ? { width, height } : undefined}
    >
      {/* 骨架屏占位符 */}
      {showSkeleton && !isLoaded && !hasError && (
        <ImageSkeleton className={skeletonClassName} />
      )}

      {/* 实际图片 */}
      {isInView && (
        <Image
          src={imageSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={cn(
            "transition-opacity duration-500",
            progressive && !isLoaded ? "opacity-0" : "opacity-100",
            fill && "object-cover"
          )}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* 加载失败时的备用显示 */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-8 h-8 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">{alt || "Image"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 导出一个简化版本用于背景图片
export function LazyBackgroundImage({
  src,
  alt,
  className,
  children,
  priority = false,
  overlay = false,
  overlayClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
  overlay?: boolean;
  overlayClassName?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px", threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* 背景图片 */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          priority={priority}
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* 骨架屏 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* 遮罩层 */}
      {overlay && (
        <div
          className={cn(
            "absolute inset-0 bg-black/40",
            overlayClassName
          )}
        />
      )}

      {/* 内容 */}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
