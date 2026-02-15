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
  taskTitle?: string;
  duration: number; // 秒
  startTime: Date;
  endTime: Date;
  description?: string;
  createdAt: Date;
}

interface TimeLogListProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function TimeLogList({ entries, onEdit, onDelete, onRefresh }: TimeLogListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条时间记录吗？")) {
      return;
    }

    setDeletingId(id);
    try {
      if (onDelete) {
        await onDelete(id);
        toast.success("时间记录已删除");
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("删除时间记录失败:", error);
      toast.error("删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  // 按日期分组 - 确保 entries 是数组
  const groupedEntries = (Array.isArray(entries) ? entries : []).reduce((groups, entry) => {
    const date = format(new Date(entry.createdAt), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  if (!Array.isArray(entries) || entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">暂无时间记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dateEntries = groupedEntries[date];
        const totalDuration = dateEntries.reduce((sum, entry) => sum + entry.duration, 0);

        return (
          <div key={date}>
            {/* 日期标题 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/60" />
                <h3 className="text-white font-medium">
                  {format(new Date(date), "yyyy年MM月dd日 EEEE", { locale: zhCN })}
                </h3>
              </div>
              <span className="text-white/60 text-sm">
                总计: {formatDuration(totalDuration)}
              </span>
            </div>

            {/* 时间记录列表 */}
            <div className="space-y-2">
              {dateEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 任务标题 */}
                      {entry.taskTitle && (
                        <h4 className="text-white font-medium mb-1">{entry.taskTitle}</h4>
                      )}

                      {/* 时间信息 */}
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(entry.duration)}</span>
                        </div>
                        <span>
                          {format(new Date(entry.startTime), "HH:mm")} -{" "}
                          {format(new Date(entry.endTime), "HH:mm")}
                        </span>
                      </div>

                      {/* 工作说明 */}
                      {entry.description && (
                        <p className="text-white/80 text-sm">{entry.description}</p>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 ml-4">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(entry)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
