"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleVideoProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

/**
 * 简易视频播放器组件
 * 支持本地文件和在线视频链接
 */
export function SimpleVideo({
  src,
  poster,
  title,
  className = "",
}: SimpleVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={`relative group rounded-lg overflow-hidden ${className}`}>
      <video
        src={src}
        poster={poster}
        controls={isPlaying}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 播放按钮覆盖层 */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm group-hover:bg-black/40 transition-all">
          <Button
            onClick={() => setIsPlaying(true)}
            size="lg"
            className="h-16 w-16 rounded-full bg-white/90 hover:bg-white text-black"
          >
            <Play className="h-8 w-8 ml-1" fill="currentColor" />
          </Button>
        </div>
      )}

      {/* 标题 */}
      {title && !isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      )}
    </div>
  );
}
