"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Force dynamic rendering to avoid prerender issues with useSearchParams
export const dynamic = 'force-dynamic';
import GridLayout, { Layout } from "react-grid-layout";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Settings,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Type,
  Hash,
  ArrowLeft,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// 小部件类型
type WidgetType = "chart-bar" | "chart-line" | "chart-pie" | "table" | "metric" | "text";

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: {
    datasource?: string;
    query?: string;
    refreshInterval?: number;
    color?: string;
    value?: string;
    text?: string;
  };
}

interface DashboardState {
  id?: string;
  title: string;
  description: string;
  layout: Layout[];
  widgets: Widget[];
}

// 小部件库
const widgetLibrary: { type: WidgetType; label: string; icon: any; description: string }[] = [
  { type: "chart-bar", label: "柱状图", icon: BarChart3, description: "展示分类数据对比" },
  { type: "chart-line", label: "折线图", icon: LineChart, description: "展示趋势变化" },
  { type: "chart-pie", label: "饼图", icon: PieChart, description: "展示占比分布" },
  { type: "table", label: "数据表格", icon: Table, description: "展示详细数据" },
  { type: "metric", label: "指标卡", icon: Hash, description: "展示单个关键指标" },
  { type: "text", label: "文本", icon: Type, description: "添加标题或说明" },
];

export default function DashboardEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboardId = searchParams.get("id");

  const [dashboard, setDashboard] = useState<DashboardState>({
    title: "新建仪表板",
    description: "",
    layout: [],
    widgets: [],
  });

  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // 添加小部件
  const handleAddWidget = (type: WidgetType) => {
    const id = `widget-${Date.now()}`;
    const newWidget: Widget = {
      id,
      type,
      title: widgetLibrary.find((w) => w.type === type)?.label || "小部件",
      config: {},
    };

    const newLayout: Layout = {
      i: id,
      x: (dashboard.layout.length * 4) % 12,
      y: Infinity,
      w: type === "metric" ? 3 : type === "text" ? 6 : 4,
      h: type === "metric" ? 2 : type === "text" ? 1 : 4,
      minW: 2,
      minH: type === "metric" ? 2 : 1,
    };

    setDashboard((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      layout: [...prev.layout, newLayout],
    }));

    toast.success("小部件已添加");
  };

  // 删除小部件
  const handleDeleteWidget = (widgetId: string) => {
    setDashboard((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
      layout: prev.layout.filter((l) => l.i !== widgetId),
    }));
    setSelectedWidget(null);
    toast.success("小部件已删除");
  };

  // 更新布局
  const handleLayoutChange = (newLayout: Layout[]) => {
    setDashboard((prev) => ({ ...prev, layout: newLayout }));
  };

  // 更新小部件配置
  const handleUpdateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setDashboard((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, ...updates } : w
      ),
    }));
  };


  // 保存仪表板
  const handleSave = async () => {
    if (!dashboard.title.trim()) {
      toast.error("请输入仪表板标题");
      return;
    }

    try {
      setSaving(true);
      toast.loading("正在保存...", { id: "save" });

      const response = await fetch("/api/dashboards", {
        method: dashboardId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dashboardId,
          title: dashboard.title,
          description: dashboard.description,
          layout: JSON.stringify(dashboard.layout),
          widgets: dashboard.widgets,
        }),
      });

      if (!response.ok) throw new Error("保存失败");

      const data = await response.json();
      toast.success("保存成功", { id: "save" });

      if (!dashboardId) {
        router.push(`/admin/dashboards/editor?id=${data.dashboard.id}`);
      }
    } catch (error) {
      toast.error("保存失败", { id: "save" });
    } finally {
      setSaving(false);
    }
  };

  // 渲染小部件内容
  const renderWidgetContent = (widget: Widget) => {
    const Icon = widgetLibrary.find((w) => w.type === widget.type)?.icon || BarChart3;

    switch (widget.type) {
      case "metric":
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-blue-600">
              {widget.config.value || "0"}
            </p>
            <p className="text-sm text-gray-600 mt-1">{widget.title}</p>
          </div>
        );
      case "text":
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-lg font-medium text-gray-800">
              {widget.config.text || widget.title}
            </p>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Icon className="w-12 h-12 mb-2" />
            <p className="text-sm">{widget.title}</p>
            <p className="text-xs mt-1">配置数据源以显示图表</p>
          </div>
        );
    }
  };

  const currentWidget = dashboard.widgets.find((w) => w.id === selectedWidget);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboards")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <Input
              value={dashboard.title}
              onChange={(e) => setDashboard((prev) => ({ ...prev, title: e.target.value }))}
              className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
              placeholder="仪表板标题"
            />
            <Input
              value={dashboard.description}
              onChange={(e) => setDashboard((prev) => ({ ...prev, description: e.target.value }))}
              className="text-sm text-gray-500 border-none shadow-none focus-visible:ring-0 p-0 h-auto mt-1"
              placeholder="添加描述..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboards/${dashboardId}`)}>
            <Eye className="w-4 h-4 mr-2" />
            预览
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* 左侧小部件库 */}
        <div className="w-64 bg-white border-r p-4 min-h-[calc(100vh-57px)]">
          <h3 className="font-semibold text-gray-900 mb-4">小部件库</h3>
          <div className="space-y-2">
            {widgetLibrary.map((widget) => (
              <button
                key={widget.type}
                onClick={() => handleAddWidget(widget.type)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 hover:border-blue-300 transition-colors text-left"
              >
                <widget.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-sm">{widget.label}</p>
                  <p className="text-xs text-gray-500">{widget.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 中间画布 */}
        <div className="flex-1 p-6 overflow-auto">
          {dashboard.widgets.length === 0 ? (
            <div className="h-[calc(100vh-150px)] flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">开始构建仪表板</h3>
                <p className="text-gray-600">从左侧小部件库拖拽或点击添加小部件</p>
              </div>
            </div>
          ) : (
            <GridLayout
              className="layout"
              layout={dashboard.layout}
              cols={12}
              rowHeight={60}
              width={1200}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              isResizable={true}
              isDraggable={true}
            >
              {dashboard.widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
                    selectedWidget === widget.id ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedWidget(widget.id)}
                >
                  {/* 小部件头部 */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move drag-handle" />
                      <span className="text-sm font-medium text-gray-700">{widget.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWidget(widget.id);
                          setShowConfigDialog(true);
                        }}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWidget(widget.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {/* 小部件内容 */}
                  <div className="p-3 h-[calc(100%-40px)]">
                    {renderWidgetContent(widget)}
                  </div>
                </div>
              ))}
            </GridLayout>
          )}
        </div>
      </div>

      {/* 配置对话框 */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置小部件</DialogTitle>
            <DialogDescription>设置小部件的数据源和显示选项</DialogDescription>
          </DialogHeader>

          {currentWidget && (
            <div className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={currentWidget.title}
                  onChange={(e) =>
                    handleUpdateWidget(currentWidget.id, { title: e.target.value })
                  }
                />
              </div>

              {currentWidget.type === "metric" && (
                <div>
                  <Label>显示值</Label>
                  <Input
                    value={currentWidget.config.value || ""}
                    onChange={(e) =>
                      handleUpdateWidget(currentWidget.id, {
                        config: { ...currentWidget.config, value: e.target.value },
                      })
                    }
                    placeholder="例如: 1,234"
                  />
                </div>
              )}

              {currentWidget.type === "text" && (
                <div>
                  <Label>文本内容</Label>
                  <Textarea
                    value={currentWidget.config.text || ""}
                    onChange={(e) =>
                      handleUpdateWidget(currentWidget.id, {
                        config: { ...currentWidget.config, text: e.target.value },
                      })
                    }
                    placeholder="输入文本内容..."
                  />
                </div>
              )}

              {["chart-bar", "chart-line", "chart-pie", "table"].includes(currentWidget.type) && (
                <>
                  <div>
                    <Label>数据源</Label>
                    <Select
                      value={currentWidget.config.datasource || ""}
                      onValueChange={(value) =>
                        handleUpdateWidget(currentWidget.id, {
                          config: { ...currentWidget.config, datasource: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择数据源" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">用户数据</SelectItem>
                        <SelectItem value="projects">项目数据</SelectItem>
                        <SelectItem value="tasks">任务数据</SelectItem>
                        <SelectItem value="invoices">发票数据</SelectItem>
                        <SelectItem value="time-entries">时间记录</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>刷新间隔（秒）</Label>
                    <Input
                      type="number"
                      value={currentWidget.config.refreshInterval || 60}
                      onChange={(e) =>
                        handleUpdateWidget(currentWidget.id, {
                          config: {
                            ...currentWidget.config,
                            refreshInterval: parseInt(e.target.value) || 60,
                          },
                        })
                      }
                      min={10}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              取消
            </Button>
            <Button onClick={() => setShowConfigDialog(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
