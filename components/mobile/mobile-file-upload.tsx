'use client';

/**
 * Mobile File Upload
 * 移动端文件上传组件 - 支持相机拍照和相册选择
 */

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera, Image, FileUp, X, Loader2 } from 'lucide-react';

interface MobileFileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // MB
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function MobileFileUpload({
  onUpload,
  accept = 'image/*',
  maxSize = 10,
  className,
  disabled = false,
  children,
}: MobileFileUploadProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 重置 input
      e.target.value = '';

      // 验证文件大小
      if (file.size > maxSize * 1024 * 1024) {
        setError(`文件大小不能超过 ${maxSize}MB`);
        return;
      }

      setError(null);
      setIsUploading(true);
      setShowDialog(false);

      try {
        await onUpload(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : '上传失败');
      } finally {
        setIsUploading(false);
      }
    },
    [maxSize, onUpload]
  );

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const openGallery = () => {
    galleryInputRef.current?.click();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <>
      {/* 触发按钮 */}
      <div
        className={cn('cursor-pointer', className)}
        onClick={() => (isMobile ? setShowDialog(true) : openFilePicker())}
      >
        {children || (
          <Button variant="outline" disabled={disabled || isUploading}>
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4 mr-2" />
            )}
            {isUploading ? '上传中...' : '上传文件'}
          </Button>
        )}
      </div>

      {/* 错误提示 */}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      {/* 隐藏的 input 元素 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 移动端选择对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>选择上传方式</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="h-16 justify-start gap-4"
              onClick={openCamera}
            >
              <Camera className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">拍照</p>
                <p className="text-sm text-muted-foreground">使用相机拍摄</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-16 justify-start gap-4"
              onClick={openGallery}
            >
              <Image className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">从相册选择</p>
                <p className="text-sm text-muted-foreground">选择已有图片</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-16 justify-start gap-4"
              onClick={openFilePicker}
            >
              <FileUp className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">选择文件</p>
                <p className="text-sm text-muted-foreground">从文件管理器选择</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * 图片预览上传组件
 */
interface ImageUploadPreviewProps {
  value?: string;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUploadPreview({
  value,
  onChange,
  onUpload,
  placeholder = '点击上传图片',
  className,
  disabled = false,
}: ImageUploadPreviewProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className={cn('relative', className)}>
      {value ? (
        <div className="relative rounded-lg overflow-hidden">
          <img src={value} alt="Preview" className="w-full h-auto" />
          {!disabled && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        <MobileFileUpload
          onUpload={handleUpload}
          accept="image/*"
          disabled={disabled || isUploading}
        >
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8',
              'flex flex-col items-center justify-center gap-2',
              'text-muted-foreground',
              'hover:border-primary hover:text-primary transition-colors',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Camera className="w-8 h-8" />
            )}
            <span className="text-sm">{isUploading ? '上传中...' : placeholder}</span>
          </div>
        </MobileFileUpload>
      )}
    </div>
  );
}

export default MobileFileUpload;
