'use client';

/**
 * Mobile Header
 * 移动端顶部导航栏
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Menu, MoreVertical, X } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showMore?: boolean;
  onBack?: () => void;
  onMenu?: () => void;
  onMore?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function MobileHeader({
  title,
  showBack = false,
  showMenu = false,
  showMore = false,
  onBack,
  onMenu,
  onMore,
  rightContent,
  className,
  transparent = false,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-14 flex items-center justify-between px-4',
        'safe-area-inset-top',
        'md:hidden', // 仅在移动端显示
        transparent ? 'bg-transparent' : 'bg-white border-b border-gray-200',
        className
      )}
    >
      {/* 左侧 */}
      <div className="flex items-center gap-2 w-20">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        {showMenu && (
          <Button variant="ghost" size="icon" onClick={onMenu} className="h-9 w-9">
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* 标题 */}
      {title && (
        <h1 className="flex-1 text-center font-medium text-base truncate">{title}</h1>
      )}

      {/* 右侧 */}
      <div className="flex items-center justify-end gap-2 w-20">
        {rightContent}
        {showMore && (
          <Button variant="ghost" size="icon" onClick={onMore} className="h-9 w-9">
            <MoreVertical className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
}

export default MobileHeader;
