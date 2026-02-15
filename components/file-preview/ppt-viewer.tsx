"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  Grid3X3,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * 幻灯片数据接口
 */
interface SlideData {
  index: number;
  thumbnailUrl?: string;
  title?: string;
}

/**
 * PPT 预览组件属性
 */
interface PPTViewerProps {
  /** PPT 文件 URL */
  url: string;
  /** 文件名 */
  fileName?: string;
  /** 下载回调 */
  onDownload?: () => void;
  /** 幻灯片缩略图列表（如果服务端已生成）*/
  slides?: SlideData[];
  /** 总页数 */
  totalSlides?: number;
  /** 预览图 URL（封面图）*/
  previewUrl?: string;
  /** 是否显示幻灯片导航 */
  showNavigation?: boolean;
  /** 自定义高度 */
  height?: number;
}

/**
 * 预览模式
 */
type PreviewMode = "single" | "grid" | "slideshow";

/**
 * PPT/PPTX 文件预览组件
 * 
 * 功能：
 * - 幻灯片缩略图预览
 * - 幻灯片导航（上一页/下一页）
 * - 网格视图
 * - 幻灯片放映模式
 * - 外部预览（Office Online / Google Docs）
 * - 下载功能
 */
export function PPTViewer({
  url,
  fileName,
  onDownload,
  slides = [],
  totalSlides,
  previewUrl,
  showNavigation = true,
  height = 500,
}: PPTViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("single");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 计算总页数
  const slideCount = totalSlides || slides.length || 1;

  // 是否有幻灯片数据
  const hasSlides = slides.length > 0;

  // 当前幻灯片数据
  const currentSlideData = hasSlides ? slides[currentSlide] : null;

  // 使用 Microsoft Office Online 预览
  const getOfficeOnlineUrl = useCallback(() => {
    if (url.startsWith("http")) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    return null;
  }, [url]);

  // 使用 Google Docs 预览
  const getGoogleDocsUrl = useCallback(() => {
    if (url.startsWith("http")) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return null;
  }, [url]);

  const officeUrl = useMemo(() => getOfficeOnlineUrl(), [getOfficeOnlineUrl]);
  const googleUrl = useMemo(() => getGoogleDocsUrl(), [getGoogleDocsUrl]);

  // 导航到上一页
  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slideCount - 1));
  }, [slideCount]);

  // 导航到下一页
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < slideCount - 1 ? prev + 1 : 0));
  }, [slideCount]);

  // 导航到指定页
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slideCount) {
      setCurrentSlide(index);
      setPreviewMode("single");
    }
  }, [slideCount]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewMode !== "single" && previewMode !== "slideshow") return;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goToPrevSlide();
          break;
        case "ArrowRight":
        case "ArrowDown":
        case " ":
          e.preventDefault();
          goToNextSlide();
          break;
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          if (isPlaying) {
            setIsPlaying(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewMode, goToPrevSlide, goToNextSlide, isFullscreen, isPlaying]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= slideCount - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3000); // 3秒切换

    return () => clearInterval(interval);
  }, [isPlaying, slideCount]);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 切换播放
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setPreviewMode("slideshow");
    }
  }, [isPlaying]);

  // 渲染幻灯片内容
  const renderSlideContent = () => {
    if (hasSlides && currentSlideData?.thumbnailUrl) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
          <img
            src={currentSlideData.thumbnailUrl}
            alt={`幻灯片 ${currentSlide + 1}`}
            className="max-w-full max-h-full object-contain"
            onError={() => setError("无法加载幻灯片图片")}
          />
          {currentSlideData.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
              {currentSlideData.title}
            </div>
          )}
        </div>
      );
    }

    if (previewUrl) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
          <img
            src={previewUrl}
            alt="PPT 预览"
            className="max-w-full max-h-full object-contain"
            onError={() => setError("无法加载预览图")}
          />
        </div>
      );
    }

    // 无预览图时显示占位符
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <FileText className="h-24 w-24 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          PowerPoint 文件
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-md mb-6">
          浏览器无法直接预览 PPT 文件内容。
          {(officeUrl || googleUrl) && "您可以使用在线服务预览，或下载文件后查看。"}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {onDownload && (
            <Button onClick={onDownload} className="gap-2">
              <Download className="h-4 w-4" />
              下载文件
            </Button>
          )}
          {officeUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(officeUrl, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Office Online
            </Button>
          )}
          {googleUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(googleUrl, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Google Docs
            </Button>
          )}
        </div>
      </div>
    );
  };

  // 渲染网格视图
  const renderGridView = () => {
    if (!hasSlides) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">暂无幻灯片缩略图</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 overflow-auto">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              index === currentSlide
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => goToSlide(index)}
          >
            {slide.thumbnailUrl ? (
              <img
                src={slide.thumbnailUrl}
                alt={`幻灯片 ${index + 1}`}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="p-2 bg-white dark:bg-gray-800 text-center">
              <span className="text-xs text-gray-500">
                {index + 1} / {slideCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 错误状态
  if (error) {
    return (
      <Card className="flex items-center justify-center bg-gray-50 dark:bg-gray-900" style={{ height }}>
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={() => setError(null)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-black p-4" : ""}`}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
            {fileName || "PPT 文件"}
          </span>
          {slideCount > 1 && (
            <Badge variant="secondary" className="ml-2">
              {currentSlide + 1} / {slideCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* 视图切换 */}
          {hasSlides && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setPreviewMode(previewMode === "grid" ? "single" : "grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>网格视图</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isPlaying ? "secondary" : "ghost"}
                      size="icon"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isPlaying ? "暂停" : "播放"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-gray-300 mx-1" />
            </>
          )}

          {/* 全屏 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? "退出全屏" : "全屏"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 外部预览 */}
          {officeUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(officeUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Office Online 预览</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* 下载 */}
          {onDownload && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>下载</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <Card
        className="relative overflow-hidden"
        style={{ height: isFullscreen ? "calc(100vh - 120px)" : height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}

        {previewMode === "grid" ? renderGridView() : renderSlideContent()}

        {/* 导航按钮 */}
        {showNavigation && hasSlides && previewMode !== "grid" && slideCount > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={goToPrevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={goToNextSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </Card>

      {/* 幻灯片指示器 */}
      {hasSlides && previewMode !== "grid" && slideCount > 1 && slideCount <= 20 && (
        <div className="flex justify-center gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-blue-500 w-4"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`跳转到幻灯片 ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* 提示信息 */}
      <p className="text-xs text-gray-500 text-center">
        {hasSlides
          ? "使用方向键或点击按钮导航幻灯片"
          : "提示：在线预览需要文件可通过公网访问"}
      </p>
    </div>
  );
}

export default PPTViewer;
