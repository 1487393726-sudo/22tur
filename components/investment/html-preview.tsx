"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HTMLPreviewProps {
  fileUrl: string;
  fileName: string;
  onClose?: () => void;
}

export function HTMLPreview({
  fileUrl,
  fileName,
  onClose,
}: HTMLPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error("加载 HTML 文件失败");
        }

        const content = await response.text();

        // 验证 HTML 内容
        const validationResponse = await fetch("/api/files/validate-html", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ html: content }),
        });

        if (!validationResponse.ok) {
          const validationData = await validationResponse.json();
          throw new Error(validationData.error || "HTML 验证失败");
        }

        const validationData = await validationResponse.json();

        if (!validationData.valid) {
          throw new Error(validationData.error || "HTML 文件包含不安全内容");
        }

        setHtmlContent(validationData.sanitized || content);
      } catch (err) {
        console.error("加载 HTML 失败:", err);
        setError(
          err instanceof Error ? err.message : "加载 HTML 文件失败"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHtml();
  }, [fileUrl]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 工具栏 */}
      <div className="border-b p-4 flex items-center justify-between gap-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate">{fileName}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            title="刷新"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

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
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">正在加载 HTML...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-red-600 p-4">
              <AlertTriangle className="w-8 h-8" />
              <p className="text-sm text-center">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                重新加载
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && htmlContent && (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title={fileName}
            sandbox={{
              allow: [
                "same-origin",
                "scripts",
                "forms",
                "popups",
                "presentation",
              ],
            }}
            style={{
              // 防止 iframe 被点击穿透
              pointerEvents: "auto",
            }}
          />
        )}
      </div>
    </div>
  );
}
