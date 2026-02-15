'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Video, Upload } from 'lucide-react';
import type { MediaSwitcherProps } from '@/types/editor';

export function MediaSwitcher({
  currentMode,
  onModeChange,
  imageControls,
  videoControls,
}: MediaSwitcherProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <Tabs
          value={currentMode}
          onValueChange={(value) => onModeChange(value as 'image' | 'video')}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              图片
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              视频
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-0">
            {imageControls}
          </TabsContent>

          <TabsContent value="video" className="mt-0">
            {videoControls}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================
// 媒体槽位组件
// ============================================

interface MediaSlotProps {
  index: number;
  type: 'image' | 'video';
  url?: string;
  thumbnail?: string;
  onUpload: () => void;
  onRemove?: () => void;
  onSetPrimary?: () => void;
  isPrimary?: boolean;
  disabled?: boolean;
}

export function MediaSlot({
  index,
  type,
  url,
  thumbnail,
  onUpload,
  onRemove,
  onSetPrimary,
  isPrimary = false,
  disabled = false,
}: MediaSlotProps) {
  const displayUrl = type === 'video' && thumbnail ? thumbnail : url;

  return (
    <div
      className={`
        relative aspect-square rounded-lg border-2 border-dashed
        ${url ? 'border-transparent' : 'border-muted-foreground/25'}
        ${isPrimary ? 'ring-2 ring-primary ring-offset-2' : ''}
        overflow-hidden group
      `}
    >
      {url ? (
        <>
          {type === 'image' ? (
            <img
              src={displayUrl}
              alt={`媒体 ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={displayUrl || '/placeholder.jpg'}
                alt={`视频缩略图 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Video className="w-8 h-8 text-white" />
              </div>
            </div>
          )}

          {/* 悬浮操作 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {onSetPrimary && !isPrimary && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onSetPrimary}
                disabled={disabled}
              >
                设为主图
              </Button>
            )}
            {onRemove && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onRemove}
                disabled={disabled}
              >
                删除
              </Button>
            )}
          </div>

          {/* 主图标识 */}
          {isPrimary && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              主图
            </div>
          )}

          {/* 序号 */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {index + 1}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          disabled={disabled}
          className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm">
            {type === 'image' ? '上传图片' : '上传视频'}
          </span>
        </button>
      )}
    </div>
  );
}

// ============================================
// 媒体模式切换工具函数（用于属性测试）
// ============================================

/**
 * 媒体槽位状态
 */
export interface MediaSlotState {
  index: number;
  type: 'image' | 'video';
  url?: string;
}

/**
 * 切换媒体模式，保持槽位位置
 */
export function switchMediaMode(
  slot: MediaSlotState,
  newMode: 'image' | 'video'
): MediaSlotState {
  return {
    ...slot,
    type: newMode,
    // 切换模式时清除URL，因为类型不同
    url: undefined,
  };
}

/**
 * 验证模式切换是否保持了位置
 */
export function verifyModeSwitch(
  originalSlot: MediaSlotState,
  newSlot: MediaSlotState,
  expectedMode: 'image' | 'video'
): boolean {
  return (
    newSlot.index === originalSlot.index &&
    newSlot.type === expectedMode
  );
}

/**
 * 批量切换媒体模式
 */
export function switchAllMediaMode(
  slots: MediaSlotState[],
  newMode: 'image' | 'video'
): MediaSlotState[] {
  return slots.map((slot) => switchMediaMode(slot, newMode));
}
