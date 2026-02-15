'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { AssetUploaderProps, AssetMetadata, AssetType } from '@/types/editor';
import {
  EDITOR_FILE_PRESETS,
  validateAssetFile,
  getValidationErrorReason,
  formatFileSize,
} from '@/lib/editor/media-utils';

// ============================================
// 类型定义
// ============================================

interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  metadata?: AssetMetadata;
}

// ============================================
// 工具函数
// ============================================

function getAcceptConfig(type: AssetType): Record<string, string[]> {
  const preset = EDITOR_FILE_PRESETS[type];
  const accept: Record<string, string[]> = {};
  
  preset.allowedTypes.forEach((mimeType) => {
    accept[mimeType] = preset.allowedExtensions;
  });
  
  return accept;
}

function getTypeIcon(type: AssetType) {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-12 h-12" />;
    case 'video':
      return <Video className="w-12 h-12" />;
    case 'document':
      return <FileText className="w-12 h-12" />;
  }
}

function getTypeLabel(type: AssetType): string {
  switch (type) {
    case 'image':
      return '图片';
    case 'video':
      return '视频';
    case 'document':
      return '文档';
  }
}

async function generateThumbnail(file: File, type: AssetType): Promise<string | undefined> {
  if (type === 'image') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }

  if (type === 'video') {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;

      video.onloadeddata = () => {
        video.currentTime = 1; // 跳到第1秒
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(undefined);
        }
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        resolve(undefined);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  }

  return undefined;
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

async function getVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
}

// ============================================
// AssetUploader 组件
// ============================================

export function AssetUploader({
  type,
  onUploadComplete,
  onUploadError,
  maxSize,
  accept,
}: AssetUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  const preset = EDITOR_FILE_PRESETS[type];
  const effectiveMaxSize = maxSize ?? preset.maxSize;
  const effectiveAccept = accept
    ? accept.reduce((acc, ext) => ({ ...acc, [`${type}/*`]: [ext] }), {})
    : getAcceptConfig(type);

  const uploadFile = async (file: File) => {
    setUploadState({
      file,
      progress: 0,
      status: 'uploading',
    });

    try {
      // 生成缩略图和元数据
      const thumbnail = await generateThumbnail(file, type);
      let width: number | undefined;
      let height: number | undefined;
      let duration: number | undefined;

      if (type === 'image') {
        const dimensions = await getImageDimensions(file);
        width = dimensions?.width;
        height = dimensions?.height;
      } else if (type === 'video') {
        duration = await getVideoDuration(file);
      }

      const metadata: AssetMetadata = {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        width,
        height,
        duration,
        thumbnail,
      };

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);

      // 使用 XMLHttpRequest 以支持进度
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState((prev) =>
            prev ? { ...prev, progress } : null
          );
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadState((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'success',
                  progress: 100,
                  url: response.url,
                  metadata,
                }
              : null
          );
          onUploadComplete(response.url, metadata);
        } else {
          const errorMessage = '上传失败';
          setUploadState((prev) =>
            prev ? { ...prev, status: 'error', error: errorMessage } : null
          );
          onUploadError(errorMessage);
        }
      });

      xhr.addEventListener('error', () => {
        const errorMessage = '网络错误';
        setUploadState((prev) =>
          prev ? { ...prev, status: 'error', error: errorMessage } : null
        );
        onUploadError(errorMessage);
      });

      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      setUploadState((prev) =>
        prev ? { ...prev, status: 'error', error: errorMessage } : null
      );
      onUploadError(errorMessage);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // 处理被拒绝的文件
      if (rejectedFiles.length > 0) {
        const rejected = rejectedFiles[0];
        const { reason, message } = getValidationErrorReason(rejected.file, type);
        onUploadError(message || '文件验证失败');
        return;
      }

      // 验证文件
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validation = validateAssetFile(file, type);

        if (!validation.valid) {
          onUploadError(validation.error || '文件验证失败');
          return;
        }

        uploadFile(file);
      }
    },
    [type, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: effectiveAccept,
    maxSize: effectiveMaxSize,
    maxFiles: 1,
    disabled: uploadState?.status === 'uploading',
  });

  const handleCancel = () => {
    setUploadState(null);
  };

  const handleRetry = () => {
    if (uploadState?.file) {
      uploadFile(uploadState.file);
    }
  };

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      {(!uploadState || uploadState.status === 'error') && (
        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed transition-all cursor-pointer p-8
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            hover:border-primary/50 hover:bg-muted/50
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center text-muted-foreground">
            {getTypeIcon(type)}
            <div className="mt-4">
              {isDragActive ? (
                <p className="text-lg">放开以上传{getTypeLabel(type)}...</p>
              ) : (
                <>
                  <p className="text-lg mb-1">
                    拖拽{getTypeLabel(type)}到这里，或点击选择
                  </p>
                  <p className="text-sm">
                    支持 {preset.allowedExtensions.join(', ')}，最大 {formatFileSize(effectiveMaxSize)}
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 上传状态 */}
      {uploadState && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            {/* 缩略图 */}
            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden">
              {uploadState.metadata?.thumbnail ? (
                <img
                  src={uploadState.metadata.thumbnail}
                  alt="缩略图"
                  className="w-full h-full object-cover"
                />
              ) : (
                getTypeIcon(type)
              )}
            </div>

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{uploadState.file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(uploadState.file.size)}
              </p>

              {/* 进度条 */}
              {uploadState.status === 'uploading' && (
                <div className="mt-2">
                  <Progress value={uploadState.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadState.progress}%
                  </p>
                </div>
              )}

              {/* 错误信息 */}
              {uploadState.status === 'error' && (
                <p className="text-sm text-destructive mt-1">
                  {uploadState.error}
                </p>
              )}
            </div>

            {/* 状态图标和操作 */}
            <div className="flex items-center gap-2">
              {uploadState.status === 'uploading' && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
              {uploadState.status === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {uploadState.status === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <Button size="sm" variant="outline" onClick={handleRetry}>
                    重试
                  </Button>
                </>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                disabled={uploadState.status === 'uploading'}
                aria-label="取消"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
