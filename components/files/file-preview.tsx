'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

export interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
  };
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export function FilePreview({ file, open, onClose, onDownload }: FilePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // 默认下载行为
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      a.click();
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full overflow-auto">
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
            }}
          >
            <Image
              src={file.url}
              alt={file.name}
              width={800}
              height={600}
              className="max-w-full h-auto"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="h-full">
          <iframe
            src={file.url}
            className="w-full h-full border-0"
            title={file.name}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center h-full">
          <video
            src={file.url}
            controls
            className="max-w-full max-h-full"
            style={{ maxHeight: '80vh' }}
          >
            您的浏览器不支持视频播放
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex items-center justify-center h-full">
          <audio src={file.url} controls className="w-full max-w-md">
            您的浏览器不支持音频播放
          </audio>
        </div>
      );
    }

    // 不支持预览的文件类型
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60">
        <p className="text-lg mb-4">此文件类型不支持预览</p>
        <Button onClick={handleDownload} className="bg-purple-500 hover:bg-purple-600">
          <Download className="w-4 h-4 mr-2" />
          下载文件
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`
          bg-gray-900/95 backdrop-blur-sm border-white/20 text-white
          ${isFullscreen ? 'max-w-full h-screen' : 'max-w-6xl h-[90vh]'}
        `}
      >
        {/* 头部 */}
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg truncate flex-1 mr-4">
              {file.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* 图片控制按钮 */}
              {isImage && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomOut}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-white/60 text-sm min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomIn}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRotate}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* 下载按钮 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4" />
              </Button>

              {/* 全屏按钮 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              {/* 关闭按钮 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 预览内容 */}
        <div className="flex-1 overflow-hidden">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  );
}
