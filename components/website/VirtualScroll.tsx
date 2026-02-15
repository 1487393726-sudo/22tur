/**
 * Virtual Scrolling Component
 * Efficiently renders large lists by only rendering visible items
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { calculateVisibleRange, VirtualScrollConfig } from '@/lib/website/performance';

export interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  bufferSize?: number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

/**
 * VirtualScroll component for efficient rendering of large lists
 */
export const VirtualScroll = React.forwardRef<HTMLDivElement, VirtualScrollProps<any>>(
  (
    {
      items,
      itemHeight,
      containerHeight,
      renderItem,
      className = '',
      bufferSize = 5,
      overscan = 3,
      onScroll,
    },
    ref
  ) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const config: VirtualScrollConfig = {
      itemHeight,
      containerHeight,
      bufferSize,
      overscan,
    };

    const { startIndex, endIndex, offsetY } = calculateVisibleRange(scrollTop, config);
    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const newScrollTop = target.scrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(newScrollTop);
      },
      [onScroll]
    );

    // Merge refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(containerRef.current);
        } else {
          ref.current = containerRef.current;
        }
      }
    }, [ref]);

    return (
      <div
        ref={containerRef}
        className={`overflow-y-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((item, index) => (
              <div
                key={startIndex + index}
                style={{
                  height: itemHeight,
                  overflow: 'hidden',
                }}
              >
                {renderItem(item, startIndex + index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

VirtualScroll.displayName = 'VirtualScroll';
