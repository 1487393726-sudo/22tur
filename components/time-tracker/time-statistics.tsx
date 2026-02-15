"use client";

import { useState, useMemo } from "react";
import {
  DynamicBarChart as BarChart,
  DynamicBar as Bar,
  DynamicLineChart as LineChart,
  DynamicLine as Line,
  DynamicPieChart as PieChart,
  DynamicPie as Pie,
  DynamicCell as Cell,
  DynamicXAxis as XAxis,
  DynamicYAxis as YAxis,
  DynamicCartesianGrid as CartesianGrid,
  DynamicTooltip as Tooltip,
  DynamicLegend as Legend,
  DynamicResponsiveContainer as ResponsiveContainer,
} from "@/components/charts/dynamic-charts";
import { Calendar, Download, TrendingUp, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TimeEntry {
  id: string;
  taskId: string;
  task: { title: string };
  userId: string;
  user?: { firstName: string; lastName: string };
  duration: number;
  startTime: string;
  description?: string;
}

interface TimeStatisticsProps {
  entries: TimeEntry[];
  viewMode?: "personal" | "team";
}

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

export function TimeStatistics({ entries, viewMode = "personal" }: TimeStatisticsProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // 计算统计数据
  const statistics = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        totalHours: 0,
        totalEntries: 0,
        avgHoursPerDay: 0,
        dailyData: [],
        taskData: [],
        userData: [],
      };
    }

    const totalSeconds = (Array.isArray(entries) ? entries : []).reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = totalSeconds / 3600;

    // 按日期分组
    const dailyMap = new Map<string, number>();
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
      const date = new Date(entry.startTime).toLocaleDateString("zh-CN");
      dailyMap.set(date, (dailyMap.get(date) || 0) + entry.duration);
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, seconds]) => ({
        date,
        hours: Number((seconds / 3600).toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // 最近30天

    // 按任务分组
    const taskMap = new Map<string, { title: string; seconds: number }>();
    entries.forEach((entry) => {
      const existing = taskMap.get(entry.taskId);
      if (existing) {
        existing.seconds += entry.duration;
      } else {
        taskMap.set(entry.taskId, {
          title: entry.task.title,
          seconds: entry.duration,
        });
      }
    });

    const taskData = Array.from(taskMap.values())
      .map((task) => ({
        name: task.title,
        hours: Number((task.seconds / 3600).toFixed(2)),
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10); // 前10个任务

    // 按用户分组（团队模式）
    const userMap = new Map<string, { name: string; seconds: number }>();
    if (viewMode === "team") {
      entries.forEach((entry) => {
        if (entry.user) {
          const userName = `${entry.user.firstName} ${entry.user.lastName}`;
          const existing = userMap.get(entry.userId);
          if (existing) {
            existing.seconds += entry.duration;
          } else {
            userMap.set(entry.userId, {
              name: userName,
              seconds: entry.duration,
            });
          }
        }
      });
    }

    const userDataArray = Array.from(userMap.values())
      .map((user) => ({
        name: user.name,
        hours: Number((user.seconds / 3600).toFixed(2)),
      }))
      .sort((a, b) => b.hours - a.hours);

    const avgHoursPerDay = dailyData.length > 0 ? totalHours / dailyData.length : 0;

    return {
      totalHours: Number(totalHours.toFixed(2)),
      totalEntries: entries.length,
      avgHoursPerDay: Number(avgHoursPerDay.toFixed(2)),
      dailyData,
      taskData,
      userData: userDataArray,
    };
  }, [entries, viewMode]);

  // 导出为 CSV
  const handleExportCSV = () => {
    try {
      const headers = ["日期", "任务", "时长(小时)", "说明"];
      const rows = entries.map((entry) => [
        new Date(entry.startTime).toLocaleDateString("zh-CN"),
        entry.task.title,
        (entry.duration / 3600).toFixed(2),
        entry.description || "",
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `time-report-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("报表已导出");
    } catch (error) {
      console.error("导出失败:", error);
      toast.error("导出失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={period === "day" ? "default" : "outline"}
            onClick={() => setPeriod("day")}
            className={period === "day" ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
          >
            日
          </Button>
          <Button
            variant={period === "week" ? "default" : "outline"}
            onClick={() => setPeriod("week")}
            className={period === "week" ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
          >
            周
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            onClick={() => setPeriod("month")}
            className={period === "month" ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
          >
            月
          </Button>
        </div>

        <Button
          onClick={handleExportCSV}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Download className="w-4 h-4 mr-2" />
          导出报表
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">总工时</span>
            <Clock className="w-5 h-5 text-white400" />
          </div>
          <div className="text-3xl font-bold text-white">{statistics.totalHours}h</div>
          <div className="text-white/40 text-xs mt-1">{statistics.totalEntries} 条记录</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">日均工时</span>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-3xl font-bold text-white">{statistics.avgHoursPerDay}h</div>
          <div className="text-white/40 text-xs mt-1">每天平均</div>
        </div>

        {viewMode === "team" && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">团队成员</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{statistics.userData.length}</div>
            <div className="text-white/40 text-xs mt-1">活跃成员</div>
          </div>
        )}
      </div>

      {/* 每日工时趋势图 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">每日工时趋势</h3>
          <div className="flex gap-2">
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
              className={chartType === "bar" ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
            >
              柱状图
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
              className={chartType === "line" ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
            >
              折线图
            </Button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartType === "bar" ? (
            <BarChart data={statistics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="hours" fill="#8b5cf6" name="工时(小时)" />
            </BarChart>
          ) : (
            <LineChart data={statistics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} name="工时(小时)" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 任务工时分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">任务工时分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statistics.taskData}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: { name: string; hours: number }) => `${entry.name}: ${entry.hours}h`}
              >
                {statistics.taskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 任务工时排行 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">任务工时排行</h3>
          <div className="space-y-3">
            {statistics.taskData.slice(0, 5).map((task, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white text-sm truncate">{task.name}</span>
                </div>
                <span className="text-white font-semibold">{task.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 团队工时统计 */}
      {viewMode === "team" && statistics.userData.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">团队成员工时</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.userData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="hours" fill="#ec4899" name="工时(小时)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
