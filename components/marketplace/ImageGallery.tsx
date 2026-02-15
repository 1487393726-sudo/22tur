'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  const displayImages = images.length > 0 ? images : ['/placeholder.jpg'];

  const handlePrev = () => {
    setSelectedIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  };

  const handleNext = () => {
    setSelectedIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="space-y-4">
      {/* 主图 */}
      <div className="relative aspect-square bg-muted rounded-xl overflow-hidden group">
        <Image
          src={displayImages[selectedIndex]}
          alt={alt}
          fill
          className="object-cover"
        />
        <button
          type="button"
          onClick={() => setShowZoom(true)}
          title="放大查看"
          aria-label="放大查看产品图片"
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
        >
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        
        {displayImages.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              title="上一张"
              aria-label="查看上一张产品图片"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              title="下一张"
              aria-label="查看下一张产品图片"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* 缩略图 */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                selectedIndex === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <Image src={image} alt={`${alt} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* 放大查看 */}
      <Dialog open={showZoom} onOpenChange={setShowZoom}>
        <DialogContent className="max-w-4xl p-0">
          <VisuallyHidden>
            <DialogTitle>产品图片放大查看</DialogTitle>
          </VisuallyHidden>
          <div className="relative aspect-square">
            <Image
              src={displayImages[selectedIndex]}
              alt={alt}
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
