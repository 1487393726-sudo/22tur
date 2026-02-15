"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: Date;
  order: number;
}

export interface Column {
  id: string;
  title: string;
  status: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  projectId: string;
  initialColumns: Column[];
  onTaskMove?: (taskId: string, newStatus: string, newOrder: number) => Promise<void>;
}

export function KanbanBoard({ projectId, initialColumns, onTaskMove }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTask(active.id as string);
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // 查找任务和目标列
    const activeTask = findTask(activeId);
    const overColumn = findColumnByTaskOrId(overId);

    if (!activeTask || !overColumn) {
      setActiveTask(null);
      return;
    }

    const activeColumn = findColumnByTask(activeId);

    if (!activeColumn) {
      setActiveTask(null);
      return;
    }

    // 如果在同一列内移动
    if (activeColumn.id === overColumn.id) {
      const columnIndex = columns.findIndex((col) => col.id === activeColumn.id);
      const oldIndex = activeColumn.tasks.findIndex((task) => task.id === activeId);
      const newIndex = activeColumn.tasks.findIndex((task) => task.id === overId);

      if (oldIndex !== newIndex) {
        const newTasks = arrayMove(activeColumn.tasks, oldIndex, newIndex);
        const newColumns = [...columns];
        newColumns[columnIndex] = {
          ...activeColumn,
          tasks: newTasks.map((task, index) => ({ ...task, order: index })),
        };
        setColumns(newColumns);

        // 调用 API 更新
        if (onTaskMove) {
          await onTaskMove(activeId, activeColumn.status, newIndex);
        }
      }
    } else {
      // 跨列移动
      const activeColumnIndex = columns.findIndex((col) => col.id === activeColumn.id);
      const overColumnIndex = columns.findIndex((col) => col.id === overColumn.id);

      const newActiveColumn = {
        ...activeColumn,
        tasks: activeColumn.tasks.filter((task) => task.id !== activeId),
      };

      const newOverColumn = {
        ...overColumn,
        tasks: [
          ...overColumn.tasks,
          { ...activeTask, status: overColumn.status, order: overColumn.tasks.length },
        ],
      };

      const newColumns = [...columns];
      newColumns[activeColumnIndex] = newActiveColumn;
      newColumns[overColumnIndex] = newOverColumn;
      setColumns(newColumns);

      // 调用 API 更新
      if (onTaskMove) {
        await onTaskMove(activeId, overColumn.status, overColumn.tasks.length);
      }
    }

    setActiveTask(null);
  };

  const findTask = (taskId: string): Task | null => {
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const findColumnByTask = (taskId: string): Column | null => {
    return columns.find((col) => col.tasks.some((task) => task.id === taskId)) || null;
  };

  const findColumnByTaskOrId = (id: string): Column | null => {
    // 先尝试作为列 ID 查找
    const columnById = columns.find((col) => col.id === id);
    if (columnById) return columnById;

    // 再尝试作为任务 ID 查找所属列
    return findColumnByTask(id);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
