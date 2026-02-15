"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Clock,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import useSWR from "swr";

interface ScheduleTask {
  id: string;
  reportId: string;
  reportName: string;
  reportType: string;
  cronExpression: string;
  description: string;
  enabled: boolean;
  recipients: string[];
  lastRunAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  createdAt: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  activeTasks: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportSchedulerPage() {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "/api/admin/report-scheduler",
    fetcher,
    { refreshInterval: 30000 }
  );

  const status: SchedulerStatus = data?.status || { isRunning: false, activeTasks: 0 };
  const tasks: ScheduleTask[] = data?.tasks || [];
  const presets = data?.presets || [];

  // 启动/停止调度器
  const handleToggleScheduler = async () => {
    try {
      const action = status.isRunning ? "stop" : "start";
      toast.loading(status.isRunning ? "正在停止..." : "正在启动...", { id: "scheduler" });

      const response = await fetch("/api/admin/report-scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("操作失败");

      toast.success(status.isRunning ? "调度器已停止" : "调度器已启动", { id: "scheduler" });
      mutate();
    } catch (error) {
      toast.error("操作失败", { id: "scheduler" });
    }
  };

  // 切换任务启用状态
  const handleToggleTask = async (reportId: string) => {
    try {
      const response = await fetch("/api/admin/report-scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", reportId }),
      });

      if (!response.ok) throw new Error("操作失败");

      toast.success("状态已更新");
      mutate();
    } catch (error) {
      toast.error("操作失败");
    }
  };

  // 删除调度任务
  const handleDeleteTask = async (reportId: string, reportName: string) => {
    if (!confirm(`确定要删除"${reportName}"的调度任务吗？`)) return;

    try {
      const response = await fetch("/api/admin/report-scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", reportId }),
      });

      if (!response.ok) throw new Error("删除失败");

      toast.success("调度已删除");
      mutate();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  // 格式化时间
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("zh-CN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">报表调度器</h1>
            <p className="text-slate-600 mt-1">管理定时报表生成任务</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={status.isRunning ? "destructive" : "default"}
              onClick={handleToggleScheduler}
              className={status.isRunning ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {status.isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  停止调度器
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  启动调度器
                </>
              )}
            </Button>
            <Button onClick={() => router.push("/reports")}>
              <Plus className="w-4 h-4 mr-2" />
              管理报表
            </Button>
          </div>
        </div>


        {/* 状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">调度器状态</p>
                  <p className="text-2xl font-bold mt-1">
                    {status.isRunning ? (
                      <span className="text-green-600">运行中</span>
                    ) : (
                      <span className="text-gray-400">已停止</span>
                    )}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status.isRunning ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Settings
                    className={`w-6 h-6 ${status.isRunning ? "text-green-600 animate-spin" : "text-gray-400"}`}
                    style={{ animationDuration: "3s" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">活跃任务</p>
                  <p className="text-2xl font-bold mt-1">{status.activeTasks}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总调度数</p>
                  <p className="text-2xl font-bold mt-1">{tasks.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 调度任务列表 */}
        <Card>
          <CardHeader>
            <CardTitle>调度任务</CardTitle>
            <CardDescription>管理报表的定时生成任务</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">加载中...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无调度任务</h3>
                <p className="text-gray-600 mb-4">在报表详情页面可以设置定时生成</p>
                <Button onClick={() => router.push("/reports")}>
                  前往报表管理
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{task.reportName}</h4>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {task.reportType}
                          </span>
                          {task.enabled ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              已启用
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              已禁用
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{task.description}</span>
                            <span className="text-gray-400">({task.cronExpression})</span>
                          </div>

                          {task.recipients.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{task.recipients.length} 位收件人</span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-gray-500">
                              上次执行: {formatTime(task.lastRunAt)}
                            </span>
                            {task.lastStatus && (
                              <span
                                className={`flex items-center gap-1 ${
                                  task.lastStatus === "SUCCESS"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {task.lastStatus === "SUCCESS" ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                {task.lastStatus === "SUCCESS" ? "成功" : "失败"}
                              </span>
                            )}
                          </div>

                          {task.lastError && (
                            <p className="text-red-500 text-xs mt-1">{task.lastError}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          checked={task.enabled}
                          onCheckedChange={() => handleToggleTask(task.reportId)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/reports/${task.reportId}`)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.reportId, task.reportName)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 预设调度说明 */}
        <Card>
          <CardHeader>
            <CardTitle>调度表达式说明</CardTitle>
            <CardDescription>常用的 Cron 表达式预设</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset: any) => (
                <div key={preset.value} className="border rounded-lg p-3">
                  <p className="font-medium text-gray-900">{preset.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                    {preset.value}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
