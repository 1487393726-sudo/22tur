"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * HTML 安全级别
 */
export type SecurityLevel = "safe" | "warning" | "danger";

/**
 * 安全检查结果
 */
export interface SecurityCheckResult {
  level: SecurityLevel;
  issues: string[];
  sanitized: boolean;
}

/**
 * HTML 预览组件属性
 */
interface HTMLViewerProps {
  /** HTML 文件 URL */
  url?: string;
  /** HTML 内容（直接渲染） */
  content?: string;
  /** 在新窗口打开回调 */
  onOpenExternal?: () => void;
  /** 自定义高度 */
  height?: number;
  /** 是否显示安全信息 */
  showSecurityInfo?: boolean;
  /** 安全检查结果 */
  securityCheck?: SecurityCheckResult;
  /** 是否允许表单 */
  allowForms?: boolean;
  /** 是否允许弹窗 */
  allowPopups?: boolean;
}

/**
 * 危险的 HTML 标签
 */
const DANGEROUS_TAGS = [
  "script",
  "iframe",
  "object",
  "embed",
  "applet",
  "meta",
  "link",
  "base",
  "form",
];

/**
 * 危险的属性
 */
const DANGEROUS_ATTRIBUTES = [
  "onclick",
  "onload",
  "onerror",
  "onmouseover",
  "onmouseout",
  "onkeydown",
  "onkeyup",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onmouseenter",
  "onmouseleave",
  "ondblclick",
  "oncontextmenu",
  "ondrag",
  "ondrop",
];

/**
 * 危险的 URL 协议
 */
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:"];

/**
 * 检查 HTML 内容安全性
 */
function checkHtmlSecurity(html: string): SecurityCheckResult {
  const issues: string[] = [];

  // 检查危险标签
  for (const tag of DANGEROUS_TAGS) {
    const regex = new RegExp(`<${tag}[\\s>]`, "gi");
    if (regex.test(html)) {
      issues.push(`检测到危险标签: <${tag}>`);
    }
  }

  // 检查危险属性
  for (const attr of DANGEROUS_ATTRIBUTES) {
    const regex = new RegExp(`${attr}\\s*=`, "gi");
    if (regex.test(html)) {
      issues.push(`检测到危险属性: ${attr}`);
    }
  }

  // 检查危险协议
  for (const protocol of DANGEROUS_PROTOCOLS) {
    const regex = new RegExp(`(href|src)\\s*=\\s*["']?${protocol}`, "gi");
    if (regex.test(html)) {
      issues.push(`检测到危险协议: ${protocol}`);
    }
  }

  // 检查内联事件处理器
  if (/<[^>]+on\w+\s*=/gi.test(html)) {
    issues.push("检测到内联事件处理器");
  }

  // 确定安全级别
  let level: SecurityLevel = "safe";
  if (issues.length > 0) {
    level = issues.some(
      (i) => i.includes("script") || i.includes("javascript")
    )
      ? "danger"
      : "warning";
  }

  return {
    level,
    issues,
    sanitized: false,
  };
}

/**
 * 清理 HTML 内容
 */
function sanitizeHtmlContent(html: string): string {
  let sanitized = html;

  // 移除危险标签及其内容
  for (const tag of DANGEROUS_TAGS) {
    // 移除带内容的标签
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, "gis");
    sanitized = sanitized.replace(regex, "");
    // 移除自闭合标签
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, "gi");
    sanitized = sanitized.replace(selfClosingRegex, "");
  }

  // 移除危险属性
  for (const attr of DANGEROUS_ATTRIBUTES) {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, "gi");
    sanitized = sanitized.replace(regex, "");
    // 移除不带引号的属性
    const noQuoteRegex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]+`, "gi");
    sanitized = sanitized.replace(noQuoteRegex, "");
  }

  // 移除危险协议
  for (const protocol of DANGEROUS_PROTOCOLS) {
    const regex = new RegExp(
      `(href|src)\\s*=\\s*["']?${protocol}[^"'\\s>]*["']?`,
      "gi"
    );
    sanitized = sanitized.replace(regex, '$1=""');
  }

  // 移除所有内联事件处理器
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");

  return sanitized;
}

/**
 * 生成安全的 HTML 文档
 */
function generateSafeHtmlDocument(content: string): string {
  const sanitized = sanitizeHtmlContent(content);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; object-src 'none'; frame-src 'none';">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      margin: 0;
      max-width: 100%;
      overflow-x: auto;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    pre, code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 4px;
      overflow-x: auto;
    }
    a {
      color: #0066cc;
    }
  </style>
</head>
<body>
  ${sanitized}
</body>
</html>`;
}

/**
 * 获取 iframe sandbox 属性
 */
function getSandboxAttributes(options: {
  allowForms?: boolean;
  allowPopups?: boolean;
}): string {
  const attrs = ["allow-same-origin"];

  if (options.allowForms) {
    attrs.push("allow-forms");
  }

  if (options.allowPopups) {
    attrs.push("allow-popups");
    attrs.push("allow-popups-to-escape-sandbox");
  }

  return attrs.join(" ");
}

/**
 * 安全级别图标组件
 */
function SecurityIcon({ level }: { level: SecurityLevel }) {
  switch (level) {
    case "safe":
      return <ShieldCheck className="h-4 w-4 text-green-500" />;
    case "warning":
      return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
    case "danger":
      return <Shield className="h-4 w-4 text-red-500" />;
  }
}

/**
 * 安全级别徽章组件
 */
function SecurityBadge({
  level,
  issues,
}: {
  level: SecurityLevel;
  issues: string[];
}) {
  const variants: Record<SecurityLevel, "default" | "secondary" | "destructive"> = {
    safe: "default",
    warning: "secondary",
    danger: "destructive",
  };

  const labels: Record<SecurityLevel, string> = {
    safe: "安全",
    warning: "注意",
    danger: "风险",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variants[level]} className="gap-1 cursor-help">
            <SecurityIcon level={level} />
            {labels[level]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {issues.length > 0 ? (
            <div className="space-y-1">
              <p className="font-medium">检测到以下问题：</p>
              <ul className="text-xs list-disc pl-4">
                {issues.slice(0, 5).map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
                {issues.length > 5 && (
                  <li>还有 {issues.length - 5} 个问题...</li>
                )}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                危险内容已被自动移除
              </p>
            </div>
          ) : (
            <p>内容已通过安全检查</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * HTML 文件预览组件
 * 使用 iframe 沙箱渲染，确保安全性
 */
export function HTMLViewer({
  url,
  content,
  onOpenExternal,
  height = 600,
  showSecurityInfo = true,
  securityCheck: externalSecurityCheck,
  allowForms = false,
  allowPopups = false,
}: HTMLViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [securityResult, setSecurityResult] = useState<SecurityCheckResult | null>(
    externalSecurityCheck || null
  );
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取 sandbox 属性
  const sandboxAttrs = useMemo(
    () => getSandboxAttributes({ allowForms, allowPopups }),
    [allowForms, allowPopups]
  );

  // 加载 HTML 内容
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);

      try {
        let rawContent: string;

        if (content) {
          // 直接使用提供的内容
          rawContent = content;
        } else if (url) {
          // 从 URL 加载内容
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`加载失败: ${response.status}`);
          }
          rawContent = await response.text();
        } else {
          throw new Error("未提供 URL 或内容");
        }

        // 安全检查
        const check = checkHtmlSecurity(rawContent);
        setSecurityResult(check);

        // 生成安全的 HTML 文档
        const safeHtml = generateSafeHtmlDocument(rawContent);
        setHtmlContent(safeHtml);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载 HTML 文件失败");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [url, content]);

  // 处理 iframe 加载完成
  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  // 处理 iframe 加载错误
  const handleError = useCallback(() => {
    setError("无法加载 HTML 文件");
    setLoading(false);
  }, []);

  // 刷新内容
  const handleRefresh = useCallback(() => {
    if (url) {
      setLoading(true);
      setError(null);
      setHtmlContent(null);
      // 触发重新加载
      const loadContent = async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`加载失败: ${response.status}`);
          }
          const rawContent = await response.text();
          const check = checkHtmlSecurity(rawContent);
          setSecurityResult(check);
          const safeHtml = generateSafeHtmlDocument(rawContent);
          setHtmlContent(safeHtml);
        } catch (err) {
          setError(err instanceof Error ? err.message : "加载 HTML 文件失败");
        } finally {
          setLoading(false);
        }
      };
      loadContent();
    }
  }, [url]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 50));
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 生成 blob URL 用于 iframe src
  const blobUrl = useMemo(() => {
    if (!htmlContent) return null;
    const blob = new Blob([htmlContent], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [htmlContent]);

  // 清理 blob URL
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // 错误状态
  if (error) {
    return (
      <Card className="flex items-center justify-center bg-gray-50 dark:bg-gray-900" style={{ height }}>
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            HTML 预览
          </span>
          {showSecurityInfo && securityResult && (
            <SecurityBadge
              level={securityResult.level}
              issues={securityResult.issues}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* 缩放控制 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>缩小</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-xs text-gray-500 w-12 text-center">
            {zoom}%
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>放大</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* 刷新 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>刷新</TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
              <TooltipContent>
                {isFullscreen ? "退出全屏" : "全屏"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 外部打开 */}
          {onOpenExternal && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onOpenExternal}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>在新窗口打开</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* HTML 内容 */}
      <Card
        className="relative overflow-hidden"
        style={{ height: isFullscreen ? "calc(100vh - 120px)" : height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto" />
              <p className="text-sm text-gray-500">正在加载...</p>
            </div>
          </div>
        )}
        {blobUrl && (
          <iframe
            ref={iframeRef}
            src={blobUrl}
            className="w-full h-full border-0 bg-white"
            title="HTML Preview"
            onLoad={handleLoad}
            onError={handleError}
            sandbox={sandboxAttrs}
            referrerPolicy="no-referrer"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
              width: `${10000 / zoom}%`,
              height: `${10000 / zoom}%`,
            }}
          />
        )}
      </Card>

      {/* 安全提示 */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Shield className="h-3 w-3" />
        <span>
          此内容在安全沙箱中渲染，脚本和危险内容已被禁用
        </span>
      </div>
    </div>
  );
}

export default HTMLViewer;
