'use client';

/**
 * Pull to Refresh
 * 下拉刷新组件
 */

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;
      
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) return;

      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || disabled || isRefreshing) return;

      const container = containerRef.current;
      if (!container || container.scrollTop > 0) {
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, (currentY - startY.current) * 0.5);
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    },
    [isPulling, disabled, isRefreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 刷新指示器 */}
      <div
        className={cn(
          'absolute left-0 right-0 flex items-center justify-center',
          'transition-transform duration-200',
          isRefreshing && 'transition-none'
        )}
        style={{
          top: -threshold,
          height: threshold,
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {isRefreshing ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <ArrowDown
              className={cn(
                'w-6 h-6 transition-transform duration-200',
                shouldTrigger && 'rotate-180'
              )}
              style={{ opacity: progress }}
            />
          )}
          <span className="text-xs text-muted-foreground">
            {isRefreshing
              ? '刷新中...'
              : shouldTrigger
              ? '释放刷新'
              : '下拉刷新'}
          </span>
        </div>
      </div>

      {/* 内容 */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;
