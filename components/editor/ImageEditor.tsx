'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCw, RotateCcw, Crop as CropIcon, Check, X, RefreshCw } from 'lucide-react';
import type { CropAspectRatio, RotationAngle, ImageEditState } from '@/types/editor';
import { CROP_ASPECT_RATIOS, rotateImage } from '@/lib/editor/media-utils';

// ============================================
// 类型定义
// ============================================

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
  open: boolean;
}

interface ImageEditorControlsProps {
  onCrop: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
  disabled?: boolean;
}

// ============================================
// 工具函数
// ============================================

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

// ============================================
// ImageEditorControls 组件
// ============================================

export function ImageEditorControls({
  onCrop,
  onRotateLeft,
  onRotateRight,
  onReset,
  disabled = false,
}: ImageEditorControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onRotateLeft}
        disabled={disabled}
        aria-label="逆时针旋转"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onRotateRight}
        disabled={disabled}
        aria-label="顺时针旋转"
      >
        <RotateCw className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onCrop}
        disabled={disabled}
      >
        <CropIcon className="w-4 h-4 mr-1" />
        裁剪
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onReset}
        disabled={disabled}
      >
        <RefreshCw className="w-4 h-4 mr-1" />
        重置
      </Button>
    </div>
  );
}

// ============================================
// ImageEditor 主组件
// ============================================

export function ImageEditor({ imageUrl, onSave, onCancel, open }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState<RotationAngle>(0);
  const [aspectRatio, setAspectRatio] = useState<CropAspectRatio>('free');
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const aspect = CROP_ASPECT_RATIOS[aspectRatio];
      
      if (aspect) {
        setCrop(centerAspectCrop(width, height, aspect));
      }
    },
    [aspectRatio]
  );

  const handleAspectRatioChange = (value: CropAspectRatio) => {
    setAspectRatio(value);
    
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const aspect = CROP_ASPECT_RATIOS[value];
      
      if (aspect) {
        setCrop(centerAspectCrop(width, height, aspect));
      } else {
        setCrop(undefined);
      }
    }
  };

  const handleRotateLeft = () => {
    setRotation(rotateImage(rotation, 'counterclockwise'));
  };

  const handleRotateRight = () => {
    setRotation(rotateImage(rotation, 'clockwise'));
  };

  const handleReset = () => {
    setRotation(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspectRatio('free');
  };

  const handleStartCrop = () => {
    setIsCropping(true);
  };

  const handleApplyCrop = async () => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // 计算缩放比例
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 设置画布大小
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // 应用旋转
    ctx.save();
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // 绘制裁剪区域
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    // 转换为 Data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(dataUrl);
    setIsCropping(false);
  };

  const handleSave = async () => {
    if (!imgRef.current || !canvasRef.current) {
      onSave(imageUrl);
      return;
    }

    // 如果有旋转但没有裁剪，只应用旋转
    if (rotation !== 0 && !completedCrop) {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        onSave(imageUrl);
        return;
      }

      // 计算旋转后的尺寸
      const isVertical = rotation === 90 || rotation === 270;
      canvas.width = isVertical ? image.naturalHeight : image.naturalWidth;
      canvas.height = isVertical ? image.naturalWidth : image.naturalHeight;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2
      );
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(dataUrl);
    } else if (completedCrop) {
      await handleApplyCrop();
    } else {
      onSave(imageUrl);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>编辑图片</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 工具栏 */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRotateLeft}
                aria-label="逆时针旋转90度"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRotateRight}
                aria-label="顺时针旋转90度"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                旋转: {rotation}°
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">宽高比:</span>
              <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">自由</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                  <SelectItem value="16:9">16:9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleReset}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              重置
            </Button>
          </div>

          {/* 图片编辑区域 */}
          <div className="flex justify-center bg-muted/50 rounded-lg p-4 min-h-[300px]">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={CROP_ASPECT_RATIOS[aspectRatio]}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="编辑图片"
                onLoad={onImageLoad}
                style={{
                  maxHeight: '60vh',
                  transform: `rotate(${rotation}deg)`,
                }}
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>

          {/* 隐藏的 canvas 用于导出 */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            取消
          </Button>
          <Button type="button" onClick={handleSave}>
            <Check className="w-4 h-4 mr-1" />
            应用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// 图片编辑工具函数（用于属性测试）
// ============================================

/**
 * 验证裁剪宽高比
 */
export function validateCropRatio(
  width: number,
  height: number,
  aspectRatio: CropAspectRatio,
  tolerance: number = 1
): boolean {
  if (aspectRatio === 'free') {
    return true;
  }

  const targetRatio = CROP_ASPECT_RATIOS[aspectRatio];
  if (!targetRatio) {
    return true;
  }

  const actualRatio = width / height;
  return Math.abs(actualRatio - targetRatio) <= tolerance / Math.min(width, height);
}

/**
 * 计算旋转后的尺寸
 */
export function getRotatedDimensions(
  width: number,
  height: number,
  rotation: RotationAngle
): { width: number; height: number } {
  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}

/**
 * 验证旋转往返
 */
export function verifyRotationRoundTrip(initialRotation: RotationAngle): boolean {
  let rotation = initialRotation;
  for (let i = 0; i < 4; i++) {
    rotation = rotateImage(rotation, 'clockwise');
  }
  return rotation === initialRotation;
}
