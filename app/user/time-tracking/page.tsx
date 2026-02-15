"use client";

import { useState } from "react";
import useSWR from "swr";
import { Clock, Plus, Filter, BarChart3, Play, Sparkles, Calendar, Timer } from "lucide-react";
import { TimeTracker } from "@/components/time-tracker/time-tracker";
import { TimeLogList } from "@/components/time-tracker/time-log-list";
import { ManualTimeEntry } from "@/components/time-tracker/manual-time-entry";
import { TimeStatistics } from "@/components/time-tracker/time-statistics";
import { toast } from "sonner";
import "@/styles/user-pages.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TimeTrackingPage() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"tracker" | "statistics">("tracker");

  const { data: timeEntries, mutate } = useSWR("/api/time-entries", fetcher, { refreshInterval: 30000 });
  const { data: tasks } = useSWR("/api/tasks?status=TODO,IN_PROGRESS", fetcher);

  const handleSaveTimer = async (duration: number, description: string) => {
    if (!selectedTask) {
      toast.error("请先选择任务");
      return;
    }

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          duration,
          description,
          startTime: new Date(Date.now() - duration * 1000).toISOString(),
          endTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("保存失败");
      mutate();
    } catch (error) {
      console.error("保存时间记录失败:", error);
      throw error;
    }
  };

  const handleSaveManual = async (data: { taskId: string; hours: number; minutes: number; date: string; description?: string }) => {
    try {
      const totalSeconds = data.hours * 3600 + data.minutes * 60;
      const date = new Date(data.date);
      const startTime = new Date(date.setHours(9, 0, 0, 0));
      const endTime = new Date(startTime.getTime() + totalSeconds * 1000);

      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: data.taskId,
          duration: totalSeconds,
          description: data.description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("保存失败");
      mutate();
      setShowManualEntry(false);
    } catch (error) {
      console.error("保存时间记录失败:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("删除失败");
      mutate();
    } catch (error) {
      console.error("删除时间记录失败:", error);
      throw error;
    }
  };

  // 确保 timeEntries 是数组
  const entriesArray = Array.isArray(timeEntries) ? timeEntries : (timeEntries?.data || []);
  
  // 确保 tasks 是数组
  const tasksArray = Array.isArray(tasks) ? tasks : (tasks?.data || []);
  
  // 计算统计数据
  const totalHours = entriesArray.reduce((acc: number, entry: { duration: number }) => acc + (entry.duration || 0), 0) / 3600 || 0;
  const todayEntries = entriesArray.filter((entry: { startTime: string }) => {
    const entryDate = new Date(entry.startTime).toDateString();
    return entryDate === new Date().toDateString();
  }) || [];
  const todayHours = todayEntries.reduce((acc: number, entry: { duration: number }) => acc + (entry.duration || 0), 0) / 3600;

  return (
    <div className="user-page-container">
      {/* Hero 区域 */}
      <div className="user-page-hero">
        <div className="user-page-hero-content">
          <div className="user-page-hero-header">
            <div className="user-page-hero-icon">
              <Clock className="w-8 h-8" />
            </div>
            <div className="user-page-hero-title-section">
              <div className="user-page-hero-title-row">
                <h1 className="user-page-hero-title">时间跟踪</h1>
                <Sparkles className="user-page-sparkle" />
              </div>
              <p className="user-page-hero-description">记录和管理您的工作时间，提高效率</p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="user-page-stats-grid">
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon">
                <Timer className="w-5 h-5" />
              </div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{totalHours.toFixed(1)}h</span>
                <span className="user-page-stat-label">总工时</span>
              </div>
            </div>
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{todayHours.toFixed(1)}h</span>
                <span className="user-page-stat-label">今日工时</span>
              </div>
            </div>
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{entriesArray.length || 0}</span>
                <span className="user-page-stat-label">记录条数</span>
              </div>
            </div>
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon">
                <Play className="w-5 h-5" />
              </div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{todayEntries.length}</span>
                <span className="user-page-stat-label">今日记录</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="user-page-actions">
            {activeTab === "tracker" && (
              <>
                <button className="user-button user-button-secondary user-button-md">
                  <Filter className="w-4 h-4" />
                  筛选
                </button>
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="user-button user-button-primary user-button-md"
                >
                  <Plus className="w-4 h-4" />
                  手动添加
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="user-page-content">
        {/* Tabs */}
        <div className="user-tabs">
          <button
            onClick={() => setActiveTab("tracker")}
            className={`user-tab ${activeTab === "tracker" ? "active" : ""}`}
          >
            <Clock className="user-tab-icon" />
            <span>计时器</span>
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`user-tab ${activeTab === "statistics" ? "active" : ""}`}
          >
            <BarChart3 className="user-tab-icon" />
            <span>统计报表</span>
          </button>
        </div>

        {/* 计时器标签页 */}
        {activeTab === "tracker" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：计时器 */}
            <div className="lg:col-span-1 space-y-4">
              {/* 任务选择器 */}
              <div className="user-card">
                <div className="user-card-content">
                  <label className="block text-sm text-white/70 mb-2">选择任务</label>
                  <select
                    value={selectedTask?.id || ""}
                    onChange={(e) => {
                      const task = tasksArray.find((t: { id: string; title: string }) => t.id === e.target.value);
                      setSelectedTask(task ? { id: task.id, title: task.title } : null);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-slate-900">选择任务开始计时</option>
                    {tasksArray.map((task: { id: string; title: string }) => (
                      <option key={task.id} value={task.id} className="bg-slate-900">
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 计时器组件 */}
              <div className="user-card">
                <div className="user-card-content">
                  <TimeTracker
                    taskId={selectedTask?.id}
                    taskTitle={selectedTask?.title}
                    onSave={handleSaveTimer}
                  />
                </div>
              </div>

              {/* 手动添加表单 */}
              {showManualEntry && (
                <div className="user-card">
                  <div className="user-card-content">
                    <ManualTimeEntry
                      tasks={tasksArray}
                      onSave={handleSaveManual}
                      onCancel={() => setShowManualEntry(false)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：时间日志 */}
            <div className="lg:col-span-2">
              <div className="user-card">
                <div className="user-card-header">
                  <div className="user-card-header-icon">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="user-card-title">时间日志</h3>
                    <p className="user-card-description">您的工作时间记录</p>
                  </div>
                </div>
                <div className="user-card-content">
                  <TimeLogList
                    entries={entriesArray}
                    onDelete={handleDelete}
                    onRefresh={() => mutate()}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 统计报表标签页 */}
        {activeTab === "statistics" && (
          <div className="user-card">
            <div className="user-card-content">
              <TimeStatistics entries={entriesArray} viewMode="personal" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
