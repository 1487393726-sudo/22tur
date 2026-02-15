"use client";

import React, { Component, ErrorInfo, ReactNode, useState } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  serviceName?: string;
  showRetry?: boolean;
  showBack?: boolean;
  showHome?: boolean;
}

interface ServiceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRetrying: boolean;
}

/**
 * 服务模块专用错误边界组件
 * 用于捕获服务展示、案例库、产品商店等模块的加载错误
 */
export class ServiceErrorBoundary extends Component<
  ServiceErrorBoundaryProps,
  ServiceErrorBoundaryState
> {
  constructor(props: ServiceErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ServiceErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("服务模块错误:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误报告
    this.reportError(error, errorInfo);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      await fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "service_error",
          serviceName: this.props.serviceName,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      });
    } catch (reportError) {
      console.error("发送错误报告失败:", reportError);
    }
  }

  private handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    // 短暂延迟以显示加载状态
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      isRetrying: false,
    });
  };

  private handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  private handleHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    const { showRetry = true, showBack = true, showHome = true } = this.props;

    if (this.state.hasError) {
      // 如果有自定义的fallback组件，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认服务错误页面
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full text-center">
            {/* 错误图标 - 使用CSS动画 */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {this.props.serviceName
                ? `${this.props.serviceName}加载失败`
                : "内容加载失败"}
            </h2>
            <p className="text-gray-400 mb-6">
              抱歉，加载过程中出现了问题。请尝试刷新页面或稍后再试。
            </p>

            {/* 开发环境显示错误详情 */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left bg-slate-800/50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  查看错误详情 (仅开发环境)
                </summary>
                <div className="mt-3 text-xs font-mono">
                  <div className="text-red-400 font-semibold mb-2">
                    {this.state.error.message}
                  </div>
                  <pre className="text-red-300/70 whitespace-pre-wrap overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3 justify-center">
              {showRetry && (
                <Button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {this.state.isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      重试中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重试
                    </>
                  )}
                </Button>
              )}
              {showBack && (
                <Button
                  variant="outline"
                  onClick={this.handleBack}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              )}
              {showHome && (
                <Button
                  variant="outline"
                  onClick={this.handleHome}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  首页
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 服务加载错误提示组件 - 用于API请求失败时的内联错误显示
 */
export function ServiceLoadError({
  message = "加载失败",
  onRetry,
  className = "",
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          variant="outline"
          className="border-slate-600"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              重试中...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </>
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * 服务空状态组件 - 用于无数据时的友好提示
 */
export function ServiceEmptyState({
  icon: Icon = AlertTriangle,
  title = "暂无数据",
  description,
  action,
  actionLabel = "浏览更多",
  actionHref,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-center max-w-md mb-6">{description}</p>
      )}
      {(action || actionHref) && (
        <Button
          onClick={action}
          className="bg-blue-600 hover:bg-blue-700"
          {...(actionHref ? { asChild: true } : {})}
        >
          {actionHref ? (
            <a href={actionHref}>{actionLabel}</a>
          ) : (
            actionLabel
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * 高阶组件 - 为服务组件添加错误边界
 */
export function withServiceErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  serviceName?: string,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ServiceErrorBoundary serviceName={serviceName} fallback={fallback}>
        <Component {...props} />
      </ServiceErrorBoundary>
    );
  };
}
