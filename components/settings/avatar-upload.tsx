'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Upload, Camera, X } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUploadSuccess?: (avatarUrl: string) => void;
  maxSize?: number; // MB
}

export function AvatarUpload({ 
  currentAvatar, 
  onUploadSuccess,
  maxSize = 5 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    // 读取图片并显示裁剪对话框
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);
  };

  // 获取裁剪后的图片
  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 设置画布大小为裁剪区域大小
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // 绘制裁剪后的图片
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  // 上传头像
  const handleUpload = async () => {
    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      // 获取裁剪后的图片
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        setError('图片处理失败');
        return;
      }

      // 压缩图片
      const compressedFile = await imageCompression(
        new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' }),
        {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        }
      );

      // 创建 FormData
      const formData = new FormData();
      formData.append('avatar', compressedFile);

      // 上传到服务器
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('头像上传成功！');
        setShowCropDialog(false);
        setSelectedImage(null);
        onUploadSuccess?.(data.avatarUrl);
        
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.error || '上传失败，请稍后重试');
      }
    } catch (err) {
      console.error('上传错误:', err);
      setError('上传失败，请稍后重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 取消裁剪
  const handleCancelCrop = () => {
    setShowCropDialog(false);
    setSelectedImage(null);
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* 当前头像显示 */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="用户头像"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-white/50" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload">
            <Button
              type="button"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => fileInputRef.current?.click()}
              asChild
            >
              <span>
                <Upload className="mr-2 h-4 w-4" />
                上传头像
              </span>
            </Button>
          </label>
          <p className="text-sm text-white/60 mt-2">
            支持 JPG、PNG 格式，最大 {maxSize}MB
          </p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* 成功提示 */}
      {success && (
        <Alert className="bg-green-500/10 border-green-500/50">
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* 裁剪对话框 */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">裁剪头像</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedImage && (
              <div className="max-h-[400px] overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="待裁剪图片"
                    className="max-w-full"
                  />
                </ReactCrop>
              </div>
            )}

            <p className="text-sm text-white/60">
              拖动调整裁剪区域，头像将被裁剪为圆形
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelCrop}
              disabled={isUploading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !completedCrop}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
