"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import type { ApiStatistics } from "@/types/api-management";

interface ApiStatisticsDashboardProps {
  statistics: ApiStatistics | null;
  dailyStats?: Array<{ date: string; calls: number; success: number; avgResponseTime: number }>;
  connectionId?: string;
  onConnectionChange?: (id: string) => void;
  connections?: Array<{ id: string; name: string }>;
}

export function ApiStatisticsDashboard({
  statistics,
  dailyStats = [],
  connectionId,
  onConnectionChange,
  connections = [],
}: ApiStatisticsDashboardProps) {
  if (!statistics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        选择一个连接查看统计数据
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {connections.length > 0 && onConnectionChange && (
        <Select value={connectionId} onValueChange={onConnectionChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="选择连接" />
          </SelectTrigger>
          <SelectContent>
            {connections.map((conn) => (
              <SelectItem key={conn.id} value={conn.id}>{conn.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总调用次数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalCalls.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {statistics.successCount} 成功 / {statistics.failureCount} 失败
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.avgResponseTime}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">错误类型</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(statistics.errorsByType).length}</div>
            <p className="text-xs text-muted-foreground">种不同错误</p>
          </CardContent>
        </Card>
      </div>

      {dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>每日统计</CardTitle>
            <CardDescription>最近 30 天的 API 调用趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-1">
              {dailyStats.slice(-30).map((day, i) => {
                const maxCalls = Math.max(...dailyStats.map((d) => d.calls), 1);
                const height = (day.calls / maxCalls) * 100;
                const successRate = day.calls > 0 ? (day.success / day.calls) * 100 : 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${Math.max(height, 2)}%`,
                      backgroundColor: successRate >= 95 ? "#22c55e" : successRate >= 80 ? "#eab308" : "#ef4444",
                    }}
                    title={`${day.date}: ${day.calls} 次调用, ${successRate.toFixed(0)}% 成功`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{dailyStats[0]?.date}</span>
              <span>{dailyStats[dailyStats.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(statistics.errorsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>错误分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statistics.errorsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{type}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
