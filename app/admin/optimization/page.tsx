"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Database,
  Shield,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import useSWR from "swr";

interface OptimizationData {
  database?: any;
  performance?: any;
  security?: any;
  report?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OptimizationPage() {
  const [activeTab, setActiveTab] = useState<
    "database" | "performance" | "security" | "report"
  >("database");
  const [executing, setExecuting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "/api/admin/optimization?type=all",
    fetcher
  );

  const optimizationData: OptimizationData = data || {};

  // 执行优化操作
  const handleOptimization = async (action: string) => {
    try {
      setExecuting(true);
      const response = await fetch("/api/admin/optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("操作失败");

      const result = await response.json();
      toast.success(result.message);
      mutate();
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600">加载优化数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">系统优化</h1>
          <p className="text-slate-600 mt-1">
            性能优化、安全加固、数据库优化
          </p>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2 border-b">
          {[
            { id: "database", label: "数据库优化", icon: Database },
            { id: "performance", label: "性能优化", icon: Zap },
            { id: "security", label: "安全加固", icon: Shield },
            { id: "report", label: "优化报告", icon: Activity },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() =>
                setActiveTab(id as typeof activeTab)
              }
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* 数据库优化标签页 */}
        {activeTab === "database" && (
          <div className="space-y-4">
            {/* 查询优化 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  查询优化建议
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {optimizationData.database?.queryOptimization?.map(
                  (tip: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg bg-blue-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {tip.issue}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {tip.suggestion}
                          </p>
                          <p className="text-xs text-green-600">
                            预期改进: {tip.estimatedImprovement}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tip.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : tip.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {tip.priority}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* 索引建议 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">推荐的索引</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(
                    optimizationData.database?.indexing || {}
                  ).map(([table, columns]: [string, any]) => (
                    <div key={table} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">{table}</h4>
                      <div className="space-y-1">
                        {(columns as string[]).map((col) => (
                          <div
                            key={col}
                            className="text-xs text-gray-600 flex items-center gap-2"
                          >
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {col}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 连接池配置 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">连接池配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "最小连接数",
                      value: optimizationData.database?.pooling?.min,
                    },
                    {
                      label: "最大连接数",
                      value: optimizationData.database?.pooling?.max,
                    },
                    {
                      label: "空闲超时",
                      value: `${optimizationData.database?.pooling?.idleTimeoutMillis}ms`,
                    },
                    {
                      label: "连接超时",
                      value: `${optimizationData.database?.pooling?.connectionTimeoutMillis}ms`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 border rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">{label}</p>
                      <p className="text-lg font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 性能优化标签页 */}
        {activeTab === "performance" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  性能指标
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 缓存状态 */}
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">缓存</h4>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">
                      {optimizationData.performance?.cache?.size || 0}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      缓存项目数
                    </p>
                  </div>

                  {/* 请求去重 */}
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">请求去重</h4>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">
                      {optimizationData.performance?.deduplicator
                        ?.pendingRequests || 0}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      待处理请求
                    </p>
                  </div>

                  {/* 性能监控 */}
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">监控</h4>
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold">
                      {Object.keys(
                        optimizationData.performance?.monitor?.stats || {}
                      ).length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      监控的查询
                    </p>
                  </div>
                </div>

                {/* 查询统计 */}
                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-3">查询统计</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      optimizationData.performance?.monitor?.stats || {}
                    ).map(([queryName, stats]: [string, any]) => (
                      <div
                        key={queryName}
                        className="p-3 border rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{queryName}</span>
                          <span className="text-xs text-gray-600">
                            {stats.count} 次
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-gray-600">平均时间</p>
                            <p className="font-semibold">
                              {stats.avgTime?.toFixed(2)}ms
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">最大时间</p>
                            <p className="font-semibold">
                              {stats.maxTime?.toFixed(2)}ms
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">缓存命中率</p>
                            <p className="font-semibold">
                              {(stats.cacheHitRate * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 优化操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">优化操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { action: "clear_cache", label: "清空缓存" },
                    {
                      action: "clear_deduplicator",
                      label: "清空去重缓存",
                    },
                    { action: "clear_monitor", label: "清空监控数据" },
                    {
                      action: "clear_rate_limiter",
                      label: "重置速率限制",
                    },
                  ].map(({ action, label }) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleOptimization(action)}
                      disabled={executing}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 安全加固标签页 */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  安全头配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    optimizationData.security?.headers || {}
                  ).map(([header, value]) => (
                    <div
                      key={header}
                      className="p-3 border rounded-lg bg-green-50"
                    >
                      <p className="text-xs font-mono text-gray-600">
                        {header}
                      </p>
                      <p className="text-sm font-medium mt-1">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">安全建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(optimizationData.security?.recommendations || []).map(
                    (rec: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 优化报告标签页 */}
        {activeTab === "report" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                优化报告
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs whitespace-pre-wrap">
                {optimizationData.report}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
