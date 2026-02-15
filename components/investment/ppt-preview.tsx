"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface PPTPreviewProps {
  fileUrl: string;
  fileName: string;
  onClose?: () => void;
  fullscreen?: boolean;
}

export function PPTPreview({
  fileUrl,
  fileName,
  onClose,
  fullscreen = false,
}: PPTPreviewProps) {
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        setLoading(true);
        setError(null);

        // 调用 API 转换 PPT 为图片
        const response = await fetch("/api/files/convert-ppt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileUrl }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "PPT 转换失败");
        }

        const data = await response.json();
        setSlides(data.slides || []);

        if (!data.slides || data.slides.length === 0) {
          throw new Error("无法提取 PPT 幻灯片");
        }
      } catch (err) {
        console.error("加载 PPT 失败:", err);
        setError(
          err instanceof Error ? err.message : "加载 PPT 文件失败"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, [fileUrl]);

  const handlePreviousSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-black flex flex-col"
    : "w-full h-full flex flex-col";

  const contentClass = isFullscreen
    ? "flex-1 overflow-auto bg-black"
    : "flex-1 overflow-auto bg-gray-100";

  return (
    <div className={containerClass}>
      {/* 工具栏 */}
      <div className="bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate">{fileName}</h3>
          {slides.length > 0 && (
            <span className="text-xs text-gray-500">
              第 {currentSlide + 1} / {slides.length} 页
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 全屏按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            title={isFullscreen ? "退出全屏" : "全屏"}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          {/* 关闭按钮 */}
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              title="关闭"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className={contentClass}>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">正在转换 PPT...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-red-600">
              <AlertTriangle className="w-8 h-8" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && slides.length > 0 && (
          <div className="flex justify-center items-center h-full p-4">
            <img
              src={slides[currentSlide]}
              alt={`幻灯片 ${currentSlide + 1}`}
              className={`max-w-full max-h-full object-contain ${
                isFullscreen ? "w-full h-full" : ""
              }`}
            />
          </div>
        )}
      </div>

      {/* 幻灯片导航 */}
      {slides.length > 1 && (
        <div className="bg-white dark:bg-gray-800 border-t p-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousSlide}
            disabled={currentSlide <= 0}
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={slides.length}
              value={currentSlide + 1}
              onChange={(e) => {
                const slide = parseInt(e.target.value) - 1 || 0;
                setCurrentSlide(
                  Math.min(Math.max(slide, 0), slides.length - 1)
                );
              }}
              className="w-12 px-2 py-1 border rounded text-center text-sm"
            />
            <span className="text-sm text-gray-600">/ {slides.length}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextSlide}
            disabled={currentSlide >= slides.length - 1}
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
