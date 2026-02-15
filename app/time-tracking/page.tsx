"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Clock, Plus, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeTracker } from "@/components/time-tracker/time-tracker";
import { TimeLogList } from "@/components/time-tracker/time-log-list";
import { ManualTimeEntry } from "@/components/time-tracker/manual-time-entry";
import { TimeStatistics } from "@/components/time-tracker/time-statistics";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TimeTrackingPage() {
  const router = useRouter();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"tracker" | "statistics">("tracker");

  // 
  const { data: timeEntries, mutate } = useSWR("/api/time-entries", fetcher, {
    refreshInterval: 30000,
  });

  // 
  const { data: tasks } = useSWR("/api/tasks?status=TODO,IN_PROGRESS", fetcher);

  const handleSaveTimer = async (duration: number, description: string) => {
    if (!selectedTask) {
      toast.error("");
      return;
    }

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          duration,
          description,
          startTime: new Date(Date.now() - duration * 1000).toISOString(),
          endTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      mutate();
    } catch (error) {
      console.error("保存失败:", error);
      throw error;
    }
  };

  const handleSaveManual = async (data: any) => {
    try {
      const totalSeconds = data.hours * 3600 + data.minutes * 60;
      const date = new Date(data.date);
      const startTime = new Date(date.setHours(9, 0, 0, 0)); // 默认开始时间
      const endTime = new Date(startTime.getTime() + totalSeconds * 1000);

      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: data.taskId,
          duration: totalSeconds,
          description: data.description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      mutate();
      setShowManualEntry(false);
    } catch (error) {
      console.error("保存失败:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      mutate();
    } catch (error) {
      console.error("删除失败:", error);
      throw error;
    }
  };

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      <div className="container mx-auto p-6">
        {/*  */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-white" />
              <h1 className="purple-gradient-title text-3xl font-bold text-white">Time Tracking</h1>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "tracker" && (
                <>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    ?
                  </Button>
                  <Button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manual Entry
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ?*/}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "tracker" ? "default" : "outline"}
              onClick={() => setActiveTab("tracker")}
              className={
                activeTab === "tracker"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }
            >
              <Clock className="w-4 h-4 mr-2" />
              Tracker
            </Button>
            <Button
              variant={activeTab === "statistics" ? "default" : "outline"}
              onClick={() => setActiveTab("statistics")}
              className={
                activeTab === "statistics"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </Button>
          </div>
        </div>

        {/*  */}
        {activeTab === "tracker" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/*  */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <label htmlFor="task-selector" className="text-sm text-white/80 mb-2 block">
                  Select Task
                </label>
                <select
                  id="task-selector"
                  value={selectedTask?.id || ""}
                  onChange={(e) => {
                    const task = tasks?.find((t: any) => t.id === e.target.value);
                    setSelectedTask(task ? { id: task.id, title: task.title } : null);
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select a task...</option>
                  {tasks?.map((task: any) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <TimeTracker
                taskId={selectedTask?.id}
                taskTitle={selectedTask?.title}
                onSave={handleSaveTimer}
              />

              {/*  */}
              {showManualEntry && (
                <div className="mt-4">
                  <ManualTimeEntry
                    tasks={tasks || []}
                    onSave={handleSaveManual}
                    onCancel={() => setShowManualEntry(false)}
                  />
                </div>
              )}
            </div>

            {/* ?*/}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <h2 className="purple-gradient-title text-xl font-semibold text-white mb-4">Time Logs</h2>
                <TimeLogList
                  entries={timeEntries || []}
                  onDelete={handleDelete}
                  onRefresh={() => mutate()}
                />
              </div>
            </div>
          </div>
        )}

        {/* ?*/}
        {activeTab === "statistics" && (
          <TimeStatistics entries={timeEntries || []} viewMode="personal" />
        )}
      </div>
    </div>
  );
}
