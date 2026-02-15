"use client";

import { ReactNode } from "react";
import { Loader2, AlertCircle, FileQuestion, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 数据状态组件
 * 
 * 统一处理加载状态、错误状态、空状态
 */

interface DataStateProps<T> {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否发生错误 */
  isError?: boolean;
  /** 错误对象 */
  error?: Error | string | null;
  /** 数据 */
  data: T | undefined | null;
  /** 空状态提示消息 */
  emptyMessage?: string;
  /** 空状态图标 */
  emptyIcon?: ReactNode;
  /** 重试回调 */
  onRetry?: () => void;
  /** 子元素渲染函数 */
  children: (data: T) => ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 加载状态文本 */
  loadingText?: string;
}

/**
 * 检查数据是否为空
 */
function isEmpty<T>(data: T | undefined | null): boolean {
  if (data === undefined || data === null) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object") return Object.keys(data).length === 0;
  return false;
}

/**
 * 加载状态组件
 */
export function LoadingState({ 
  text = "加载中...",
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

/**
 * 错误状态组件
 */
export function ErrorState({ 
  error, 
  onRetry,
  className 
}: { 
  error?: Error | string | null;
  onRetry?: () => void;
  className?: string;
}) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : error || "加载失败，请稍后重试";

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <p className="text-destructive font-medium mb-2">出错了</p>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-4">
        {errorMessage}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          重试
        </Button>
      )}
    </div>
  );
}

/**
 * 空状态组件
 */
export function EmptyState({ 
  message = "暂无数据",
  icon,
  action,
  className 
}: { 
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      {icon || <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />}
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * 数据状态包装组件
 * 
 * 根据数据状态自动渲染加载、错误、空状态或数据内容
 */
export function DataState<T>({ 
  isLoading, 
  isError = false, 
  error, 
  data, 
  emptyMessage = "暂无数据",
  emptyIcon,
  onRetry,
  children,
  className,
  loadingText = "加载中..."
}: DataStateProps<T>) {
  if (isLoading) {
    return <LoadingState text={loadingText} className={className} />;
  }

  if (isError || error) {
    return <ErrorState error={error} onRetry={onRetry} className={className} />;
  }

  if (isEmpty(data)) {
    return (
      <EmptyState 
        message={emptyMessage} 
        icon={emptyIcon}
        className={className} 
      />
    );
  }

  return <>{children(data as T)}</>;
}

/**
 * 骨架屏加载组件
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    </div>
  );
}

/**
 * 骨架屏列表组件
 */
export function SkeletonList({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * 骨架屏表格组件
 */
export function SkeletonTable({ 
  rows = 5,
  cols = 4,
  className 
}: { 
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse border rounded-lg overflow-hidden", className)}>
      {/* 表头 */}
      <div className="bg-muted/30 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-1" />
        ))}
      </div>
      {/* 表体 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="p-4 flex gap-4 border-t border-border/20"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-muted/50 rounded flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default DataState;
