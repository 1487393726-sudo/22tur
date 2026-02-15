"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * 错误边界组件 - 捕获React组件树中的JavaScript错误
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("错误边界捕获到错误:", error, errorInfo);

    // 记录错误信息
    this.setState({
      error,
      errorInfo,
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误报告到服务器
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
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (reportError) {
      console.error("发送错误报告失败:", reportError);
    }
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  private reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义的fallback组件，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误页面
      return (
        <div
          className="flex items-center justify-center min-h-screen bg-gray-50"
          data-oid="1erher:"
        >
          <div
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center"
            data-oid="0xm89-2"
          >
            <div className="text-red-500 text-6xl mb-4" data-oid="bluxesq">
              ⚠️
            </div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-2"
              data-oid="61flq0b"
            >
              出错了
            </h1>
            <p className="text-gray-600 mb-6" data-oid="6somilh">
              抱歉，页面出现了错误。请尝试刷新页面或返回首页。
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-4 text-left" data-oid="9:4cbcx">
                <summary
                  className="cursor-pointer text-sm text-gray-500"
                  data-oid="4dds59b"
                >
                  错误详情 (仅开发环境可见)
                </summary>
                <div
                  className="mt-2 p-3 bg-red-50 rounded text-xs font-mono"
                  data-oid="_i0yet5"
                >
                  <div
                    className="font-semibold text-red-700"
                    data-oid="s-yr888"
                  >
                    {this.state.error.message}
                  </div>
                  <div className="mt-2 text-red-600" data-oid="ppf3wlm">
                    {this.state.error.stack}
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2 text-red-500" data-oid="7vzx404">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center" data-oid=":63bja_">
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                data-oid="q5lfjng"
              >
                重试
              </button>
              <button
                onClick={this.reloadPage}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                data-oid="mlv6472"
              >
                刷新页面
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                data-oid="rri8w:g"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 高阶组件 - 为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
): React.ComponentType<P> {
  return (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError} data-oid="k3v4:.6">
      <Component {...props} data-oid="mt:exmb" />
    </ErrorBoundary>
  );
}

/**
 * 自定义错误页面组件
 */
export function ErrorPage({
  title = "出错了",
  message = "抱歉，页面出现了错误。请尝试刷新页面或返回首页。",
  showRetry = true,
  onRetry,
  showReload = true,
  showHome = true,
}: {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showReload?: boolean;
  showHome?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-50"
      data-oid="c-ud0fx"
    >
      <div
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center"
        data-oid="57mtx50"
      >
        <div className="text-red-500 text-6xl mb-4" data-oid="23::m9t">
          ⚠️
        </div>
        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          data-oid="s8yn9nl"
        >
          {title}
        </h1>
        <p className="text-gray-600 mb-6" data-oid="m0w-uju">
          {message}
        </p>

        <div className="flex gap-3 justify-center" data-oid="w609985">
          {showRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              data-oid="k_cchic"
            >
              重试
            </button>
          )}
          {showReload && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              data-oid="378aa7:"
            >
              刷新页面
            </button>
          )}
          {showHome && (
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              data-oid="ptibqfu"
            >
              返回首页
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
