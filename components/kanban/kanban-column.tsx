"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import type { Column } from "./kanban-board";

interface KanbanColumnProps {
  column: Column;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        {/* 列头 */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{column.title}</h3>
            <span className="text-sm text-white/60">{column.tasks.length}</span>
          </div>
        </div>

        {/* 任务列表 */}
        <div ref={setNodeRef} className="p-4 space-y-3 min-h-[200px]">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>

          {column.tasks.length === 0 && (
            <div className="text-center text-white/40 text-sm py-8">
              拖拽任务到这里
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
