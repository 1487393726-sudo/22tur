"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard, Column } from "@/components/kanban/kanban-board";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  // 获取项目信息
  const { data: project } = useSWR(`/api/projects/${id}`, fetcher);

  // 获取看板数据
  const { data: kanbanData, mutate } = useSWR(`/api/projects/${id}/kanban`, fetcher, {
    refreshInterval: 30000, // 每30秒刷新
  });

  const handleTaskMove = async (taskId: string, newStatus: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          order: newOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("更新任务失败");
      }

      // 乐观更新
      mutate();
      toast.success("任务已移动");
    } catch (error) {
      console.error("移动任务失败:", error);
      toast.error("移动任务失败");
      // 重新获取数据
      mutate();
    }
  };

  // 默认列配置
  const defaultColumns: Column[] = [
    {
      id: "todo",
      title: "待办",
      status: "TODO",
      tasks: [],
    },
    {
      id: "in-progress",
      title: "进行中",
      status: "IN_PROGRESS",
      tasks: [],
    },
    {
      id: "review",
      title: "待审核",
      status: "REVIEW",
      tasks: [],
    },
    {
      id: "done",
      title: "已完成",
      status: "DONE",
      tasks: [],
    },
  ];

  // 组织看板数据
  const columns: Column[] = kanbanData?.columns || defaultColumns;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      <div className="container mx-auto p-6">
        {/* 头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/projects/${id}`)}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">看板视图</h1>
                {project && (
                  <p className="text-white/60 mt-1">{project.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              <Button
                onClick={() => router.push(`/projects/${id}/tasks/new`)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                新建任务
              </Button>
            </div>
          </div>

          {/* 筛选栏（可选） */}
          {showFilters && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="priority-filter" className="text-sm text-white/80 mb-2 block">优先级</label>
                  <select id="priority-filter" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                    <option value="">全部</option>
                    <option value="HIGH">高</option>
                    <option value="MEDIUM">中</option>
                    <option value="LOW">低</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="assignee-filter" className="text-sm text-white/80 mb-2 block">负责人</label>
                  <select id="assignee-filter" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                    <option value="">全部</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tag-filter" className="text-sm text-white/80 mb-2 block">标签</label>
                  <select id="tag-filter" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                    <option value="">全部</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 看板 */}
        {columns.length > 0 ? (
          <KanbanBoard
            projectId={id}
            initialColumns={columns}
            onTaskMove={handleTaskMove}
          />
        ) : (
          <div className="text-center text-white/60 py-12">
            <p>加载中...</p>
          </div>
        )}
      </div>
    </div>
  );
}
