'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Save, Trash2, X } from 'lucide-react';
import type { NavigationGuardProps, UnsavedChangesDialogProps, DraftRestoreDialogProps } from '@/types/editor';

// ============================================
// NavigationGuard 组件
// ============================================

export function NavigationGuard({
  isDirty,
  onSave,
  onDiscard,
  message = '您有未保存的更改。是否保存后再离开？',
}: NavigationGuardProps) {
  // 处理浏览器关闭/刷新
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  return null; // 这个组件只处理 beforeunload 事件
}

// ============================================
// UnsavedChangesDialog 组件
// ============================================

export function UnsavedChangesDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>未保存的更改</AlertDialogTitle>
          <AlertDialogDescription>
            您有未保存的更改。是否保存后再离开？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            取消
          </AlertDialogCancel>
          <Button variant="destructive" onClick={onDiscard}>
            <Trash2 className="w-4 h-4 mr-2" />
            不保存
          </Button>
          <AlertDialogAction onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// DraftRestoreDialog 组件
// ============================================

export function DraftRestoreDialog({
  open,
  draftTimestamp,
  onRestore,
  onDiscard,
}: DraftRestoreDialogProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>发现未保存的草稿</AlertDialogTitle>
          <AlertDialogDescription>
            我们发现了一个自动保存的草稿，保存于 {formatTime(draftTimestamp)}。
            是否恢复该草稿？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>
            <Trash2 className="w-4 h-4 mr-2" />
            丢弃草稿
          </AlertDialogCancel>
          <AlertDialogAction onClick={onRestore}>
            恢复草稿
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// useNavigationGuard Hook
// ============================================

interface UseNavigationGuardOptions {
  isDirty: boolean;
  onSave?: () => Promise<void>;
  message?: string;
}

export function useNavigationGuard({
  isDirty,
  onSave,
  message = '您有未保存的更改。是否保存后再离开？',
}: UseNavigationGuardOptions) {
  // 处理浏览器关闭/刷新
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  // 返回确认函数，用于程序化导航
  const confirmNavigation = useCallback(async (): Promise<boolean> => {
    if (!isDirty) {
      return true;
    }

    const confirmed = window.confirm(message);
    if (confirmed && onSave) {
      try {
        await onSave();
      } catch (error) {
        console.error('保存失败:', error);
        return false;
      }
    }
    return confirmed;
  }, [isDirty, message, onSave]);

  return { confirmNavigation };
}

// ============================================
// 工具函数（用于属性测试）
// ============================================

/**
 * 验证导航保护触发条件
 */
export function shouldTriggerDialog(isDirty: boolean): boolean {
  return isDirty;
}

/**
 * 验证草稿恢复可用性
 */
export function isDraftRestorable(
  hasDraft: boolean,
  draftTimestamp: Date | null
): boolean {
  if (!hasDraft || !draftTimestamp) {
    return false;
  }
  
  // 草稿不应超过7天
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const age = Date.now() - draftTimestamp.getTime();
  return age < maxAge;
}
