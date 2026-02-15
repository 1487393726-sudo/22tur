"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardEditor } from "@/components/dashboard/dashboard-editor";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Layout } from "react-grid-layout";

interface Widget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  title: string;
  config?: Record<string, any>;
}

interface Dashboard {
  id: string;
  name: string;
  layout: Layout[];
  widgets: Widget[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dashboardId = params.id as string;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/dashboards/${dashboardId}/layout`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "获取仪表板失败");
        }

        const data = await response.json();
        setDashboard(data);
      } catch (err) {
        console.error("获取仪表板失败:", err);
        setError(
          err instanceof Error ? err.message : "获取仪表板失败"
        );
      } finally {
        setLoading(false);
      }
    };

    if (dashboardId) {
      fetchDashboard();
    }
  }, [dashboardId]);

  const handleSave = async (layout: Layout[], widgets: Widget[]) => {
    try {
      const response = await fetch(
        `/api/dashboards/${dashboardId}/layout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ layout, widgets }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "保存失败");
      }

      // 更新本地状态
      setDashboard((prev) =>
        prev
          ? {
              ...prev,
              layout,
              widgets,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>

          <div className="bg-white rounded-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">加载失败</h2>
            <p className="text-gray-600 mb-4">
              {error || "仪表板不存在"}
            </p>
            <Button onClick={() => router.push("/admin/dashboards")}>
              返回仪表板列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">编辑仪表板</h1>
          <p className="text-gray-600">
            {dashboard.name}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            最后更新: {new Date(dashboard.updatedAt).toLocaleString("zh-CN")}
          </p>
        </div>

        {/* 编辑器 */}
        <DashboardEditor
          dashboardId={dashboardId}
          initialLayout={dashboard.layout}
          initialWidgets={dashboard.widgets}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
