/**
 * 自动保存 Hook
 * Auto-Save Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  UseAutoSaveOptions,
  UseAutoSaveReturn,
  AutoSaveDraft,
  AutoSaveEntityType,
} from '@/types/editor';

const DEFAULT_INTERVAL = 30000; // 30 seconds

/**
 * 自动保存 Hook
 */
export function useAutoSave<T>({
  entityType,
  entityId,
  data,
  interval = DEFAULT_INTERVAL,
  onSave,
  onError,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<T | null>(null);

  const dataRef = useRef(data);
  const lastSavedDataRef = useRef<string | null>(null);

  // 更新数据引用
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // 检查是否有现有草稿
  useEffect(() => {
    checkForDraft();
  }, [entityType, entityId]);

  // 自动保存定时器
  useEffect(() => {
    const timer = setInterval(() => {
      const currentDataStr = JSON.stringify(dataRef.current);
      
      // 只有数据变化时才保存
      if (currentDataStr !== lastSavedDataRef.current) {
        saveDraft();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [interval, entityType, entityId]);

  /**
   * 检查是否有现有草稿
   */
  const checkForDraft = async () => {
    try {
      const response = await fetch(
        `/api/admin/drafts?entityType=${entityType}&entityId=${entityId || ''}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.draft) {
          setHasDraft(true);
          setDraftData(JSON.parse(result.draft.data) as T);
        } else {
          setHasDraft(false);
          setDraftData(null);
        }
      }
    } catch (error) {
      console.error('检查草稿失败:', error);
    }
  };

  /**
   * 保存草稿
   */
  const saveDraft = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const dataStr = JSON.stringify(dataRef.current);
      
      const response = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          data: dataStr,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastSaved(new Date());
        lastSavedDataRef.current = dataStr;
        setHasDraft(true);
        onSave?.(result.draft);
      } else {
        throw new Error('保存草稿失败');
      }
    } catch (error) {
      console.error('自动保存失败:', error);
      onError?.(error instanceof Error ? error : new Error('自动保存失败'));
    } finally {
      setIsSaving(false);
    }
  }, [entityType, entityId, isSaving, onSave, onError]);

  /**
   * 丢弃草稿
   */
  const discardDraft = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/drafts?entityType=${entityType}&entityId=${entityId || ''}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setHasDraft(false);
        setDraftData(null);
        lastSavedDataRef.current = null;
      }
    } catch (error) {
      console.error('丢弃草稿失败:', error);
    }
  }, [entityType, entityId]);

  /**
   * 恢复草稿
   */
  const restoreDraft = useCallback((): T | null => {
    return draftData;
  }, [draftData]);

  return {
    lastSaved,
    isSaving,
    hasDraft,
    saveDraft,
    discardDraft,
    restoreDraft,
  };
}

// ============================================
// 草稿 API 路由需要的类型
// ============================================

export interface DraftApiRequest {
  entityType: AutoSaveEntityType;
  entityId: string | null;
  data: string;
}

export interface DraftApiResponse {
  draft: AutoSaveDraft | null;
}

// ============================================
// 工具函数（用于属性测试）
// ============================================

/**
 * 验证草稿恢复可用性
 */
export function verifyDraftAvailability(
  hasDraft: boolean,
  draftData: unknown
): boolean {
  if (hasDraft) {
    return draftData !== null;
  }
  return true;
}

/**
 * 验证导航保护触发
 */
export function shouldTriggerNavigationGuard(
  originalData: unknown,
  currentData: unknown
): boolean {
  return JSON.stringify(originalData) !== JSON.stringify(currentData);
}

/**
 * 格式化最后保存时间
 */
export function formatLastSaved(date: Date | null): string {
  if (!date) return '未保存';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) {
    return '刚刚保存';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} 分钟前保存`;
  } else {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
