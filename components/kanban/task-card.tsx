"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Task } from "./kanban-board";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const transformStyle = transform ? CSS.Transform.toString(transform) : undefined;

  const priorityColors = {
    LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const priorityLabels = {
    LOW: "低",
    MEDIUM: "中",
    HIGH: "高",
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transformStyle,
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4
        hover:bg-white/15 hover:border-white/30 transition-all cursor-pointer
        ${isDragging ? "shadow-2xl rotate-3" : ""}
      `}
    >
      {/* 优先级标签 */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`
            text-xs px-2 py-1 rounded-full border
            ${priorityColors[task.priority]}
          `}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      {/* 任务标题 */}
      <h4 className="text-white font-medium mb-2 line-clamp-2">{task.title}</h4>

      {/* 任务描述 */}
      {task.description && (
        <p className="text-white/60 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-white/60">
        {/* 负责人 */}
        {task.assignedToName && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{task.assignedToName}</span>
          </div>
        )}

        {/* 到期日期 */}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(task.dueDate), "MM/dd", { locale: zhCN })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
