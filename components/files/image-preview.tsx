'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';

export interface ImageFile {
  id: string;
  name: string;
  url: string;
}

interface ImagePreviewProps {
  images: ImageFile[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  onDownload?: (image: ImageFile) => void;
}

export function ImagePreview({
  images,
  currentIndex,
  onIndexChange,
  onDownload,
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // 重置状态当切换图片时
  useEffect(() => {
    setZoom(100);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && onIndexChange) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1 && onIndexChange) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(currentImage);
    } else {
      const a = document.createElement('a');
      a.href = currentImage.url;
      a.download = currentImage.name;
      a.click();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={zoom <= 25}
            className="text-white/60 hover:text-white hover:bg-white/10"
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
            disabled={zoom >= 300}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRotateLeft}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRotateRight}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {hasMultiple && (
            <span className="text-white/60 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 图片显示区域 */}
      <div
        className="flex-1 relative overflow-hidden bg-black/20"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.name}
              width={1200}
              height={800}
              className="max-w-full h-auto select-none"
              style={{ objectFit: 'contain', pointerEvents: 'none' }}
              draggable={false}
            />
          </div>
        </div>

        {/* 导航按钮 */}
        {hasMultiple && (
          <>
            <Button
              size="lg"
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}
      </div>

      {/* 缩略图导航 */}
      {hasMultiple && (
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onIndexChange?.(index)}
                className={`
                  flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                  ${index === currentIndex ? 'border-purple-500' : 'border-white/20 hover:border-white/40'}
                `}
                aria-label={`查看图片 ${index + 1}: ${image.name}`}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 快捷键提示 */}
      <div className="p-2 text-center text-white/40 text-xs border-t border-white/10">
        快捷键: ← → 切换图片 | + - 缩放 | 0 重置
      </div>
    </div>
  );
}
