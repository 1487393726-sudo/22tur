"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TimeTrackerProps {
  taskId?: string;
  taskTitle?: string;
  onSave?: (duration: number, description: string) => Promise<void>;
}

export function TimeTracker({ taskId, taskTitle, onSave }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 秒
  const [description, setDescription] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 从 localStorage 恢复状态
  useEffect(() => {
    const savedState = localStorage.getItem("timeTracker");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.taskId === taskId && state.isRunning) {
          const now = Date.now();
          const elapsed = Math.floor((now - state.startTime) / 1000);
          setElapsedTime(state.elapsedTime + elapsed);
          setIsRunning(true);
          startTimeRef.current = now;
        } else if (state.taskId === taskId) {
          setElapsedTime(state.elapsedTime);
          setDescription(state.description || "");
        }
      } catch (error) {
        console.error("恢复计时器状态失败:", error);
      }
    }
  }, [taskId]);

  // 保存状态到 localStorage
  useEffect(() => {
    if (taskId) {
      const state = {
        taskId,
        isRunning,
        elapsedTime,
        startTime: startTimeRef.current,
        description,
      };
      localStorage.setItem("timeTracker", JSON.stringify(state));
    }
  }, [taskId, isRunning, elapsedTime, description]);

  // 计时器
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
    toast.success("开始计时");
  };

  const handlePause = () => {
    setIsRunning(false);
    startTimeRef.current = null;
    toast.info("暂停计时");
  };

  const handleStop = async () => {
    if (elapsedTime === 0) {
      toast.error("计时时长为0，无法保存");
      return;
    }

    setIsRunning(false);
    startTimeRef.current = null;

    if (onSave) {
      try {
        await onSave(elapsedTime, description);
        setElapsedTime(0);
        setDescription("");
        localStorage.removeItem("timeTracker");
        toast.success("时间记录已保存");
      } catch (error) {
        console.error("保存时间记录失败:", error);
        toast.error("保存失败");
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setDescription("");
    startTimeRef.current = null;
    localStorage.removeItem("timeTracker");
    toast.info("计时器已重置");
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
      {/* 任务信息 */}
      {taskTitle && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>当前任务</span>
          </div>
          <h3 className="text-white font-medium">{taskTitle}</h3>
        </div>
      )}

      {/* 计时器显示 */}
      <div className="text-center mb-6">
        <div className="text-6xl font-mono font-bold text-white mb-2">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-white/60 text-sm">
          {isRunning ? "计时中..." : "已暂停"}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Play className="w-4 h-4 mr-2" />
            开始
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Pause className="w-4 h-4 mr-2" />
            暂停
          </Button>
        )}

        <Button
          onClick={handleStop}
          disabled={elapsedTime === 0}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50"
        >
          <Square className="w-4 h-4 mr-2" />
          停止并保存
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          重置
        </Button>
      </div>

      {/* 工作说明 */}
      <div>
        <label className="text-sm text-white/80 mb-2 block">工作说明（可选）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述你在这段时间做了什么..."
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}
