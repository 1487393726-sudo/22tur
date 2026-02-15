"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface DownloadManagerProps {
  fileId: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  isLocked?: boolean;
  onDownload?: () => void;
}

export function DownloadManager({
  fileId,
  fileName,
  fileSize,
  downloadCount,
  isLocked = false,
  onDownload,
}: DownloadManagerProps) {
  const [generating, setGenerating] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${bytes} B`;
  };

  // 处理下载
  const handleDownload = async () => {
    try {
      onDownload?.();
      window.open(`/api/files/${fileId}/download`, "_blank");
      toast.success("文件下载已开始");
    } catch (error) {
      toast.error("下载失败");
    }
  };

  // 生成分享令牌
  const handleGenerateToken = async () => {
    try {
      setGenerating(true);

      const response = await fetch(`/api/files/${fileId}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiresIn: 86400, // 24 小时
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "生成令牌失败");
      }

      const data = await response.json();
      setShareToken(data.token);
      toast.success("分享链接已生成");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "生成令牌失败"
      );
    } finally {
      setGenerating(false);
    }
  };

  // 复制分享链接
  const handleCopyLink = () => {
    if (!shareToken) return;

    const downloadUrl = `${window.location.origin}/api/files/${fileId}/download?token=${shareToken}`;
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
    toast.success("链接已复制到剪贴板");
  };

  return (
    <div className="space-y-4">
      {/* 下载信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">下载信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文件信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">文件大小</p>
              <p className="font-medium">{formatFileSize(fileSize)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">下载次数</p>
              <p className="font-medium">{downloadCount}</p>
            </div>
          </div>

          {/* 下载按钮 */}
          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={isLocked}
          >
            <Download className="w-4 h-4 mr-2" />
            下载文件
          </Button>

          {isLocked && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-600">
                此文件已锁定，需要投资后才能下载
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分享链接卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">分享文件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            生成临时分享链接，24 小时内有效
          </p>

          {!shareToken ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleGenerateToken}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  生成分享链接
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              {/* 分享链接显示 */}
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs text-gray-500 mb-2">分享链接</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/files/${fileId}/download?token=${shareToken}`}
                    className="flex-1 px-2 py-1 text-xs bg-white border rounded"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 令牌信息 */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600">
                  ✓ 分享链接已生成，24 小时内有效
                </p>
              </div>

              {/* 重新生成按钮 */}
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => setShareToken(null)}
              >
                生成新链接
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 下载历史卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">下载统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">总下载次数</span>
              <Badge variant="secondary">{downloadCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">文件大小</span>
              <Badge variant="outline">{formatFileSize(fileSize)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">文件名</span>
              <span className="text-sm font-medium truncate max-w-xs">
                {fileName}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
