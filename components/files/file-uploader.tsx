'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface FileUploaderProps {
  maxFiles?: number;
  maxSize?: number; // 字节
  accept?: Record<string, string[]>;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  projectId?: string;
}

export function FileUploader({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 默认 10MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
  onUploadComplete,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  projectId,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // 处理被拒绝的文件
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejected) => {
          const error = rejected.errors[0];
          if (error.code === 'file-too-large') {
            toast.error(`文件 "${rejected.file.name}" 太大，最大允许 ${formatFileSize(maxSize)}`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`文件 "${rejected.file.name}" 类型不支持`);
          } else {
            toast.error(`文件 "${rejected.file.name}" 上传失败: ${error.message}`);
          }
        });
      }

      // 检查文件数量限制
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`最多只能上传 ${maxFiles} 个文件`);
        return;
      }

      // 添加新文件
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // 自动开始上传
      newFiles.forEach((uploadFile) => {
        uploadFile_(uploadFile);
      });
    },
    [files, maxFiles, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
  });

  const uploadFile_ = async (uploadFile: UploadedFile) => {
    // 更新状态为上传中
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: 'uploading' as const } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      if (projectId) {
        formData.append('projectId', projectId);
      }

      // 模拟上传进度
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
          );
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: 'success' as const, progress: 100, url: response.url }
                : f
            )
          );
          toast.success(`文件 "${uploadFile.name}" 上传成功`);
          onUploadSuccess?.();
        } else {
          throw new Error('上传失败');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('网络错误');
      });

      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'error' as const, error: errorMessage }
            : f
        )
      );
      toast.error(`文件 "${uploadFile.name}" 上传失败: ${errorMessage}`);
      onUploadError?.(errorMessage);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const retryUpload = (uploadFile: UploadedFile) => {
    uploadFile_(uploadFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const successCount = files.filter((f) => f.status === 'success').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed transition-all cursor-pointer
          ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 bg-white/5'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/50 hover:bg-white/10'}
        `}
      >
        <input {...getInputProps()} />
        <div className="p-8 text-center">
          <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-white text-lg mb-2">放开以上传文件...</p>
          ) : (
            <>
              <p className="text-white text-lg mb-2">拖拽文件到这里，或点击选择文件</p>
              <p className="text-white/60 text-sm">
                最多 {maxFiles} 个文件，每个文件最大 {formatFileSize(maxSize)}
              </p>
            </>
          )}
        </div>
      </Card>

      {/* 文件列表 */}
      {files.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">
                文件列表 ({files.length}/{maxFiles})
              </h3>
              <div className="flex items-center gap-4 text-sm">
                {successCount > 0 && (
                  <span className="text-green-400">✓ {successCount} 成功</span>
                )}
                {uploadingCount > 0 && (
                  <span className="text-blue-400">↑ {uploadingCount} 上传中</span>
                )}
                {errorCount > 0 && (
                  <span className="text-red-400">✗ {errorCount} 失败</span>
                )}
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[400px]">
            <div className="p-4 space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  {/* 文件图标 */}
                  <div className="text-white/60">{getFileIcon(file.type)}</div>

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <span className="text-white/60 text-xs ml-2 flex-shrink-0">
                        {formatFileSize(file.size)}
                      </span>
                    </div>

                    {/* 进度条 */}
                    {file.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-1" />
                        <p className="text-white/60 text-xs">{file.progress}%</p>
                      </div>
                    )}

                    {/* 错误信息 */}
                    {file.status === 'error' && (
                      <p className="text-red-400 text-xs">{file.error}</p>
                    )}
                  </div>

                  {/* 状态图标和操作 */}
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    {file.status === 'error' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => retryUpload(file)}
                          className="text-white/60 hover:text-white h-8 px-2"
                        >
                          重试
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      className="text-white/60 hover:text-white h-8 w-8 p-0"
                      aria-label={`移除文件 ${file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
