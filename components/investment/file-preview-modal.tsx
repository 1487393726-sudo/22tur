"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Download, X } from "lucide-react";
import { PDFPreview } from "./pdf-preview";
import { HTMLPreview } from "./html-preview";
import { PPTPreview } from "./ppt-preview";

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  fileName: string;
  fileType: string;
  onDownload?: () => void;
}

export function FilePreviewModal({
  open,
  onOpenChange,
  fileId,
  fileName,
  fileType,
  onDownload,
}: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/files/${fileId}/preview`);

        if (!response.ok) {
          if (response.status === 403) {
            setError("您没有权限预览此文件");
          } else if (response.status === 404) {
            setError("文件不存在");
          } else {
            setError("加载预览失败");
          }
          return;
        }

        const data = await response.json();
        setPreviewUrl(data.previewUrl);
      } catch (err) {
        console.error("获取预览失败:", err);
        setError("获取预览失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [open, fileId]);

  const isPDF = fileType.toLowerCase() === "pdf";
  const isHTML = fileType.toLowerCase() === "html";
  const isPPT = ["ppt", "pptx"].includes(fileType.toLowerCase());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="border-b p-4 flex flex-row items-center justify-between">
          <DialogTitle className="truncate">{fileName}</DialogTitle>
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                title="下载文件"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">正在加载预览...</p>
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

          {!loading && !error && previewUrl && isPDF && (
            <PDFPreview
              fileUrl={previewUrl}
              fileName={fileName}
              onClose={() => onOpenChange(false)}
            />
          )}

          {!loading && !error && previewUrl && isHTML && (
            <HTMLPreview
              fileUrl={previewUrl}
              fileName={fileName}
              onClose={() => onOpenChange(false)}
            />
          )}

          {!loading && !error && previewUrl && isPPT && (
            <PPTPreview
              fileUrl={previewUrl}
              fileName={fileName}
              onClose={() => onOpenChange(false)}
            />
          )}

          {!loading && !error && previewUrl && !isPDF && !isHTML && !isPPT && (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-4">暂不支持此文件类型的预览</p>
                <Button onClick={onDownload} variant="default">
                  <Download className="w-4 h-4 mr-2" />
                  下载文件
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
