"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, FileText, Loader2 } from "lucide-react";
import { HTMLViewer } from "./html-viewer";
import { PPTViewer } from "./ppt-viewer";

// 动态导入 PDF 查看器以减少初始包大小
const PDFViewer = dynamic(
  () => import("./pdf-viewer").then((mod) => mod.PDFViewer),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    ),
    ssr: false,
  }
);

interface FileViewerProps {
  url: string;
  fileType: string;
  fileName?: string;
  onDownload?: () => void;
  isLocked?: boolean;
  onUnlock?: () => void;
}

/**
 * 统一文件预览组件
 * 根据文件类型自动选择合适的预览器
 */
export function FileViewer({
  url,
  fileType,
  fileName,
  onDownload,
  isLocked = false,
  onUnlock,
}: FileViewerProps) {
  // 如果文件被锁定，显示锁定提示
  if (isLocked) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className="relative">
            <FileText className="h-24 w-24 text-gray-300 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                已锁定
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-700">
              {fileName || "文件已锁定"}
            </h3>
            <p className="text-sm text-gray-500">
              此文件需要投资后才能查看
            </p>
          </div>
          {onUnlock && (
            <Button onClick={onUnlock} className="gap-2">
              解锁查看
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // 根据文件类型选择预览器
  const normalizedType = fileType.toLowerCase();

  // PDF 文件
  if (normalizedType.includes("pdf")) {
    return <PDFViewer url={url} onDownload={onDownload} />;
  }

  // HTML 文件
  if (normalizedType.includes("html") || normalizedType.includes("htm")) {
    return (
      <HTMLViewer
        url={url}
        onOpenExternal={() => window.open(url, "_blank")}
      />
    );
  }

  // PPT/PPTX 文件
  if (
    normalizedType.includes("powerpoint") ||
    normalizedType.includes("presentation") ||
    normalizedType.includes("ppt")
  ) {
    return (
      <PPTViewer url={url} fileName={fileName} onDownload={onDownload} />
    );
  }

  // 不支持的文件类型
  return (
    <Card className="p-8">
      <div className="text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-700">
            无法预览此文件
          </h3>
          <p className="text-sm text-gray-500">
            文件类型 "{fileType}" 暂不支持在线预览
          </p>
        </div>
        {onDownload && (
          <Button onClick={onDownload} className="gap-2">
            <Download className="h-4 w-4" />
            下载文件
          </Button>
        )}
      </div>
    </Card>
  );
}
