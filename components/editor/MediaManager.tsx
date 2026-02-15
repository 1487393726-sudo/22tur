'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GripVertical, Image as ImageIcon, Trash2, Star, Plus, X, ZoomIn } from 'lucide-react';
import type { MediaManagerProps } from '@/types/editor';
import { reorderImages, setAsPrimary, deleteImage, addImage } from '@/lib/editor/media-utils';

// ============================================
// 可排序图片项组件
// ============================================

interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  isPrimary: boolean;
  onSetPrimary: () => void;
  onDelete: () => void;
  onPreview: () => void;
  disabled?: boolean;
}

function SortableImageItem({
  id,
  url,
  index,
  isPrimary,
  onSetPrimary,
  onDelete,
  onPreview,
  disabled = false,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative aspect-square rounded-lg overflow-hidden border-2
        ${isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}
        ${isDragging ? 'z-50 shadow-lg' : ''}
        group bg-muted
      `}
    >
      <img
        src={url}
        alt={`产品图片 ${index + 1}`}
        className="w-full h-full object-cover"
      />

      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-black/60 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      {/* 主图标识 */}
      {isPrimary && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
          <Star className="w-3 h-3" />
          主图
        </div>
      )}

      {/* 序号 */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>

      {/* 操作按钮 */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-7 w-7"
          onClick={onPreview}
          aria-label="预览"
        >
          <ZoomIn className="w-3 h-3" />
        </Button>
        {!isPrimary && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            onClick={onSetPrimary}
            disabled={disabled}
            aria-label="设为主图"
          >
            <Star className="w-3 h-3" />
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="h-7 w-7"
          onClick={onDelete}
          disabled={disabled}
          aria-label="删除"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MediaManager 主组件
// ============================================

export function MediaManager({
  images,
  onImagesChange,
  maxImages = 10,
}: MediaManagerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
        const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newImages = reorderImages(images, oldIndex, newIndex);
          onImagesChange(newImages);
        }
      }
    },
    [images, onImagesChange]
  );

  const handleSetPrimary = useCallback(
    (index: number) => {
      const newImages = setAsPrimary(images, index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const newImages = deleteImage(images, index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const handleAddUrl = useCallback(() => {
    if (newImageUrl.trim()) {
      const newImages = addImage(images, newImageUrl.trim(), maxImages);
      onImagesChange(newImages);
      setNewImageUrl('');
      setShowUrlInput(false);
    }
  }, [images, newImageUrl, maxImages, onImagesChange]);

  const canAddMore = images.length < maxImages;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          产品图片
          <span className="text-sm font-normal text-muted-foreground">
            ({images.length}/{maxImages})
          </span>
        </CardTitle>
        {canAddMore && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowUrlInput(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            添加图片
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无图片，请添加产品图片</p>
            <p className="text-sm">第一张图片将作为主图展示</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((_, i) => `image-${i}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((url, index) => (
                  <SortableImageItem
                    key={`image-${index}`}
                    id={`image-${index}`}
                    url={url}
                    index={index}
                    isPrimary={index === 0}
                    onSetPrimary={() => handleSetPrimary(index)}
                    onDelete={() => handleDelete(index)}
                    onPreview={() => setPreviewUrl(url)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* URL 输入对话框 */}
        <Dialog open={showUrlInput} onOpenChange={setShowUrlInput}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加图片</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">图片 URL</label>
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="输入图片URL地址"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddUrl();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUrlInput(false);
                    setNewImageUrl('');
                  }}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!newImageUrl.trim()}
                >
                  添加
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 图片预览对话框 */}
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-10"
                onClick={() => setPreviewUrl(null)}
                aria-label="关闭预览"
              >
                <X className="w-4 h-4" />
              </Button>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="图片预览"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
