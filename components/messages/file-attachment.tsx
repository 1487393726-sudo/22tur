'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export interface AttachmentFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileAttachmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelected: (files: AttachmentFile[]) => void;
  maxFileSize?: number; // MB
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function FileAttachment({
  open,
  onOpenChange,
  onFilesSelected,
  maxFileSize = 10, // 默认10MB
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
}: FileAttachmentProps) {
  const [selectedFiles, setSelectedFiles] = useState<AttachmentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // 检查文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      return `文件大小超过 ${maxFileSize}MB`;
    }

    // 检查文件类型
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type);
      }
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return '不支持的文件类型';
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: AttachmentFile[] = [];
    const errors: string[] = [];

    // 检查文件数量
    if (selectedFiles.length + files.length > maxFiles) {
      errors.push(`最多只能选择 ${maxFiles} 个文件`);
      return;
    }

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadStatus: 'pending',
          uploadProgress: 0,
        });
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (newFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter(f => f.id !== id));
  };

  const handleConfirm = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">选择文件</DialogTitle>
          <DialogDescription className="text-white/60">
            最多选择 {maxFiles} 个文件，单个文件不超过 {maxFileSize}MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 拖拽上传区域 */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/80 mb-2">
              拖拽文件到这里，或点击选择文件
            </p>
            <p className="text-sm text-white/40">
              支持图片、视频、音频、文档等格式
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* 已选文件列表 */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h4 className="text-sm font-medium text-white/80">
                已选择 {selectedFiles.length} 个文件
              </h4>
              {selectedFiles.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="p-2 bg-white/10 rounded">
                      <Icon className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-white/40">
                        {formatFileSize(file.size)}
                      </p>
                      {file.uploadStatus === 'uploading' && file.uploadProgress !== undefined && (
                        <Progress value={file.uploadProgress} className="mt-2 h-1" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.uploadStatus === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {file.uploadStatus === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-white/20 text-white hover:bg-white/10"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedFiles.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              确定 ({selectedFiles.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
