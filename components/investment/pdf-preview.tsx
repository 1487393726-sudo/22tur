"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// 设置 PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  fileUrl: string;
  fileName: string;
  onClose?: () => void;
  fullscreen?: boolean;
}

export function PDFPreview({
  fileUrl,
  fileName,
  onClose,
  fullscreen = false,
}: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF 加载失败:", error);
    setError("PDF 文件加载失败，请检查文件是否有效");
    setLoading(false);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages || 1));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-black flex flex-col"
    : "w-full h-full flex flex-col";

  const contentClass = isFullscreen
    ? "flex-1 overflow-auto bg-gray-900"
    : "flex-1 overflow-auto bg-gray-100";

  return (
    <div className={containerClass}>
      {/* 工具栏 */}
      <div className="bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate">{fileName}</h3>
          {numPages && (
            <span className="text-xs text-gray-500">
              第 {currentPage} / {numPages} 页
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 缩放控制 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-xs text-gray-600 w-12 text-center">
            {zoom}%
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* 分隔符 */}
          <div className="w-px h-6 bg-gray-200" />

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
              <p className="text-sm text-gray-600">正在加载 PDF...</p>
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

        {!loading && !error && (
          <div className="flex justify-center p-4">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<Loader2 className="w-8 h-8 animate-spin" />}
            >
              <Page
                pageNumber={currentPage}
                scale={zoom / 100}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        )}
      </div>

      {/* 分页控制 */}
      {numPages && numPages > 1 && (
        <div className="bg-white dark:bg-gray-800 border-t p-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={numPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value) || 1;
                setCurrentPage(Math.min(Math.max(page, 1), numPages));
              }}
              className="w-12 px-2 py-1 border rounded text-center text-sm"
            />
            <span className="text-sm text-gray-600">/ {numPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
