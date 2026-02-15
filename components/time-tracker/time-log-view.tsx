"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Clock, Edit2, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  duration: number; // 秒
  startTime?: Date;
  endTime?: Date;
  description?: string;
  createdAt: Date;
}

interface TimeLogViewProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entryId: string) => Promise<void>;
}

export function TimeLogView({ entries, onEdit, onDelete }: TimeLogViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (entryId: string) => {
    if (!confirm("确定要删除这条时间记录吗？")) {
      return;
    }

    setDeletingId(entryId);
    try {
      if (onDelete) {
        await onDelete(entryId);
      }
      toast.success("时间记录已删除");
    } catch (error) {
      console.error("删除时间记录失败:", error);
      toast.error("删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes > 0 ? ` ${minutes}分钟` : ""}`;
    }
    return `${minutes}分钟`;
  };

  // 按日期分组
  const groupedEntries = (Array.isArray(entries) ? entries : []).reduce((groups, entry) => {
    const date = format(new Date(entry.createdAt), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  if (entries.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-12 text-center">
        <Clock className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">还没有时间记录</p>
        <p className="text-white/40 text-sm mt-2">开始计时或手动添加时间记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dayEntries = groupedEntries[date];
        const totalDuration = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);

        return (
          <div key={date} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            {/* 日期头部 */}
            <div className="bg-white/5 px-4 py-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/60" />
                  <span className="text-white font-medium">
                    {format(new Date(date), "yyyy年MM月dd日 EEEE", { locale: zhCN })}
                  </span>
                </div>
                <span className="text-white/60 text-sm">
                  总计: {formatDuration(totalDuration)}
                </span>
              </div>
            </div>

            {/* 时间记录列表 */}
            <div className="divide-y divide-white/10">
              {dayEntries.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* 任务标题 */}
                      <h4 className="text-white font-medium mb-1">{entry.taskTitle}</h4>

                      {/* 时长 */}
                      <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(entry.duration)}</span>
                        {entry.startTime && entry.endTime && (
                          <span className="text-white/40">
                            ({format(new Date(entry.startTime), "HH:mm")} - {format(new Date(entry.endTime), "HH:mm")})
                          </span>
                        )}
                      </div>

                      {/* 工作说明 */}
                      {entry.description && (
                        <p className="text-white/60 text-sm">{entry.description}</p>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(entry)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-white/60 hover:text-red-400 hover:bg-white/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
