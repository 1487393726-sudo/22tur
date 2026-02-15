/**
 * GlassModal Component
 * 玻璃态模态框组件
 * 
 * A modal component with glassmorphism effects including:
 * - Semi-transparent background with backdrop blur (Req 5.1, 5.2)
 * - Blurred overlay background (Req 5.3)
 * - Gradient borders and layered shadows (Req 5.4)
 * - Smooth open/close animations (Req 5.6)
 * 
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 5.6
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface GlassModalProps {
  /** Modal content - 模态框内容 */
  children: React.ReactNode;
  
  /** Whether the modal is open - 模态框是否打开 */
  isOpen: boolean;
  
  /** Callback when modal should close - 关闭模态框的回调 */
  onClose: () => void;
  
  /** Additional CSS classes for modal container - 模态框容器的额外CSS类 */
  className?: string;
  
  /** Additional CSS classes for overlay - 遮罩层的额外CSS类 */
  overlayClassName?: string;
  
  /** Whether clicking overlay closes modal - 点击遮罩层是否关闭模态框 */
  closeOnOverlayClick?: boolean;
  
  /** Whether pressing Escape closes modal - 按Escape键是否关闭模态框 */
  closeOnEscape?: boolean;
  
  /** Modal title for accessibility - 模态框标题（用于可访问性） */
  ariaLabel?: string;
}

/**
 * GlassModal component with glassmorphism effects
 * 
 * Features:
 * - Semi-transparent background with backdrop blur 12-20px (Req 5.1, 5.2)
 * - Blurred overlay with backdrop blur 4-8px (Req 5.3)
 * - Gradient borders and layered shadows for floating effect (Req 5.4)
 * - Smooth fade-in/fade-out animations (Req 5.6)
 * - Keyboard navigation support (Escape to close)
 * - Focus trap for accessibility
 * - Click outside to close
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <GlassModal 
 *   isOpen={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   ariaLabel="Example Modal"
 * >
 *   <h2>Modal Title</h2>
 *   <p>Modal content goes here</p>
 * </GlassModal>
 * ```
 */
export function GlassModal({
  children,
  isOpen,
  onClose,
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ariaLabel,
}: GlassModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle Escape key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus modal container
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previous element
      previousActiveElement.current?.focus();
      
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        // Fixed positioning - 固定定位
        'fixed inset-0 z-50',
        // Flex centering - 弹性居中
        'flex items-center justify-center',
        // Padding for mobile - 移动端内边距
        'p-4',
        // Animation - 动画
        'animate-in fade-in duration-300',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={handleOverlayClick}
    >
      {/* Background Overlay with Blur (Req 5.3) - 带模糊的背景遮罩 */}
      <div
        className={cn(
          // Full coverage - 全覆盖
          'absolute inset-0',
          // Semi-transparent dark background - 半透明深色背景
          'bg-black/40 dark:bg-black/60',
          // Backdrop blur 4-8px (Req 5.3) - 背景模糊4-8px
          'backdrop-blur-[6px]',
          '-webkit-backdrop-filter: blur(6px)',
          // Performance optimization - 性能优化
          'will-change-[backdrop-filter]',
          overlayClassName,
        )}
        aria-hidden="true"
      />

      {/* Modal Content Container (Req 5.1, 5.2, 5.4) - 模态框内容容器 */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          // Positioning - 定位
          'relative z-10',
          // Size constraints - 尺寸约束
          'max-w-lg w-full max-h-[90vh]',
          // Overflow handling - 溢出处理
          'overflow-y-auto',
          // Glass effect - heavy intensity (Req 5.1, 5.2) - 玻璃效果 - 重度强度
          'glass-heavy',
          // Additional backdrop blur for modal (12-20px range) - 模态框额外的背景模糊
          'backdrop-blur-[16px]',
          // Gradient border effect (Req 5.4) - 渐变边框效果
          'border-2 border-white/20 dark:border-white/15',
          // Rounded corners - 圆角
          'rounded-2xl',
          // Padding - 内边距
          'p-6',
          // Layered shadows for floating effect (Req 5.4) - 浮动效果的分层阴影
          'shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]',
          'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]',
          // Performance optimization - 性能优化
          'will-change-[backdrop-filter,transform]',
          // Animation (Req 5.6) - 动画
          'animate-in zoom-in-95 duration-300',
          // Focus outline - 焦点轮廓
          'outline-none focus-visible:ring-2 focus-visible:ring-white/30',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * GlassModalCloseButton - Close button component for modal
 * 玻璃态模态框关闭按钮组件
 * 
 * A pre-styled close button with proper touch target size for mobile (Req 6.4)
 */
export function GlassModalCloseButton({
  onClick,
  className = '',
  ariaLabel = 'Close modal',
}: {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        // Base styles - 基础样式
        'absolute top-4 right-4',
        'rounded-md',
        'flex items-center justify-center',
        // Mobile touch target size (Req 6.4) - 移动端触摸目标尺寸
        'w-8 h-8 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0',
        // Glass effect - 玻璃效果
        'glass-light',
        'backdrop-blur-[8px]',
        'border border-white/10 dark:border-white/8',
        // Hover state - 悬停状态
        'hover:bg-white/20 dark:hover:bg-white/15',
        // Focus state - 焦点状态
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        // Transition - 过渡效果
        'transition-all duration-200',
        // Text color - 文本颜色
        'text-foreground/70 hover:text-foreground',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}


export function GlassModalHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-4 pb-4',
        'border-b border-white/10 dark:border-white/8',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * GlassModalTitle - Title component for modal
 * 玻璃态模态框标题组件
 */
export function GlassModalTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'text-2xl font-semibold',
        'text-foreground',
        className,
      )}
    >
      {children}
    </h2>
  );
}

/**
 * GlassModalBody - Body component for modal content
 * 玻璃态模态框主体组件
 */
export function GlassModalBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-4',
        'text-foreground/90',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * GlassModalFooter - Footer component for modal actions
 * 玻璃态模态框底部组件
 */
export function GlassModalFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'pt-4',
        'border-t border-white/10 dark:border-white/8',
        className,
      )}
    >
      {children}
    </div>
  );
}
