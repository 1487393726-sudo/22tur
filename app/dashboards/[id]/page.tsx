"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import GridLayout, { Layout } from "react-grid-layout";
import {
  ArrowLeft,
  Edit,
  Maximize2,
  Minimize2,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Type,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import useSWR from "swr";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Widget {
  id: string;
  type: string;
  title: string;
  config: {
    datasource?: string;
    value?: string;
    text?: string;
    refreshInterval?: number;
  };
}

interface Dashboard {
  id: string;
  title: string;
  description: string;
  layout: Layout[];
  widgets: Widget[];
  creator: {
    firstName: string;
    lastName: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 获取小部件图标
const getWidgetIcon = (type: string) => {
  switch (type) {
    case "chart-bar":
      return BarChart3;
    case "chart-line":
      return LineChart;
    case "chart-pie":
      return PieChart;
    case "table":
      return Table;
    case "metric":
      return Hash;
    case "text":
      return Type;
    default:
      return BarChart3;
  }
};

export default function DashboardViewPage() {
  const router = useRouter();
  const params = useParams();
  const dashboardId = params.id as string;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboards/${dashboardId}`,
    fetcher
  );

  const dashboard: Dashboard | null = data?.dashboard;

  // 加载小部件数据
  useEffect(() => {
    if (!dashboard) return;

    dashboard.widgets.forEach((widget) => {
      if (widget.config.datasource) {
        loadWidgetData(widget);
      }
    });
  }, [dashboard]);

  // 加载单个小部件数据
  const loadWidgetData = async (widget: Widget) => {
    try {
      // 这里可以根据 datasource 调用不同的 API
      // 简化示例，返回模拟数据
      const mockData = {
        users: { count: 156, trend: "+12%" },
        projects: { count: 24, trend: "+3%" },
        tasks: { count: 89, trend: "-5%" },
        invoices: { total: "¥125,000", trend: "+18%" },
        "time-entries": { hours: 1240, trend: "+8%" },
      };

      setWidgetData((prev) => ({
        ...prev,
        [widget.id]: mockData[widget.config.datasource as keyof typeof mockData] || {},
      }));
    } catch (error) {
      console.error("加载小部件数据失败:", error);
    }
  };

  // 切换全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    mutate();
    if (dashboard) {
      dashboard.widgets.forEach((widget) => {
        if (widget.config.datasource) {
          loadWidgetData(widget);
        }
      });
    }
    toast.success("数据已刷新");
  };

  // 渲染小部件内容
  const renderWidgetContent = (widget: Widget) => {
    const Icon = getWidgetIcon(widget.type);
    const data = widgetData[widget.id];

    switch (widget.type) {
      case "metric":
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-blue-600">
              {widget.config.value || data?.count || data?.total || data?.hours || "0"}
            </p>
            <p className="text-sm text-gray-600 mt-2">{widget.title}</p>
            {data?.trend && (
              <p
                className={`text-xs mt-1 ${
                  data.trend.startsWith("+") ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.trend}
              </p>
            )}
          </div>
        );

      case "text":
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-xl font-semibold text-gray-800">
              {widget.config.text || widget.title}
            </p>
          </div>
        );

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Icon className="w-16 h-16 mb-3" />
            <p className="font-medium">{widget.title}</p>
            {widget.config.datasource && (
              <p className="text-sm mt-1">数据源: {widget.config.datasource}</p>
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-500 mt-2">加载仪表板...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">仪表板不存在或加载失败</p>
          <Button onClick={() => router.push("/admin/dashboards")}>返回列表</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${isFullscreen ? "p-4" : ""}`}>
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboards")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{dashboard.title}</h1>
            {dashboard.description && (
              <p className="text-sm text-gray-500">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/dashboards/editor?id=${dashboardId}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      {/* 仪表板内容 */}
      <div className="p-6">
        {dashboard.widgets.length === 0 ? (
          <div className="h-[calc(100vh-150px)] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">仪表板为空</h3>
              <p className="text-gray-600 mb-4">点击编辑按钮添加小部件</p>
              <Button onClick={() => router.push(`/admin/dashboards/editor?id=${dashboardId}`)}>
                <Edit className="w-4 h-4 mr-2" />
                编辑仪表板
              </Button>
            </div>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={dashboard.layout}
            cols={12}
            rowHeight={60}
            width={1200}
            isDraggable={false}
            isResizable={false}
          >
            {dashboard.widgets.map((widget) => (
              <div
                key={widget.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
              >
                <CardContent className="p-4 h-full">
                  {renderWidgetContent(widget)}
                </CardContent>
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
}
