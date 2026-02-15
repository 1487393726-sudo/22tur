"use client";

import { useState, useCallback } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Edit2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

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

interface DashboardEditorProps {
  dashboardId: string;
  initialLayout?: Layout[];
  initialWidgets?: Widget[];
  onSave?: (layout: Layout[], widgets: Widget[]) => Promise<void>;
  readOnly?: boolean;
}

const WIDGET_TYPES = [
  {
    id: "stats",
    name: "统计卡片",
    description: "显示关键指标",
    defaultSize: { w: 3, h: 2 },
  },
  {
    id: "chart",
    name: "图表",
    description: "显示数据图表",
    defaultSize: { w: 6, h: 4 },
  },
  {
    id: "table",
    name: "表格",
    description: "显示数据表格",
    defaultSize: { w: 12, h: 4 },
  },
  {
    id: "timeline",
    name: "时间线",
    description: "显示事件时间线",
    defaultSize: { w: 6, h: 3 },
  },
  {
    id: "list",
    name: "列表",
    description: "显示项目列表",
    defaultSize: { w: 4, h: 3 },
  },
  {
    id: "calendar",
    name: "日历",
    description: "显示日历",
    defaultSize: { w: 6, h: 5 },
  },
];

export function DashboardEditor({
  dashboardId,
  initialLayout = [],
  initialWidgets = [],
  onSave,
  readOnly = false,
}: DashboardEditorProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [layout, setLayout] = useState<Layout[]>(initialLayout);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  // 添加小部件
  const handleAddWidget = useCallback(
    (widgetType: (typeof WIDGET_TYPES)[0]) => {
      const newId = `widget-${Date.now()}`;
      const newWidget: Widget = {
        i: newId,
        x: 0,
        y: 0,
        w: widgetType.defaultSize.w,
        h: widgetType.defaultSize.h,
        type: widgetType.id,
        title: widgetType.name,
      };

      setWidgets([...widgets, newWidget]);
      setLayout([
        ...layout,
        {
          i: newId,
          x: 0,
          y: 0,
          w: widgetType.defaultSize.w,
          h: widgetType.defaultSize.h,
        },
      ]);

      toast.success(`已添加 ${widgetType.name}`);
    },
    [widgets, layout]
  );

  // 删除小部件
  const handleDeleteWidget = useCallback(
    (widgetId: string) => {
      setWidgets(widgets.filter((w) => w.i !== widgetId));
      setLayout(layout.filter((l) => l.i !== widgetId));
      toast.success("已删除小部件");
    },
    [widgets, layout]
  );

  // 编辑小部件
  const handleEditWidget = useCallback((widget: Widget) => {
    setEditingWidget(widget);
  }, []);

  // 保存小部件编辑
  const handleSaveWidgetEdit = useCallback(
    (updatedWidget: Widget) => {
      setWidgets(
        widgets.map((w) => (w.i === updatedWidget.i ? updatedWidget : w))
      );
      setEditingWidget(null);
      toast.success("已更新小部件");
    },
    [widgets]
  );

  // 处理布局变化
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
  }, []);

  // 保存仪表板
  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave?.(layout, widgets);
      toast.success("仪表板已保存");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "保存失败，请稍后重试"
      );
    } finally {
      setSaving(false);
    }
  };

  if (isPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">预览模式</h2>
          <Button
            variant="outline"
            onClick={() => setIsPreview(false)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </Button>
        </div>

        <GridLayout
          className="bg-gray-50 rounded-lg"
          layout={layout}
          cols={12}
          rowHeight={60}
          width={1200}
          isDraggable={false}
          isResizable={false}
        >
          {widgets.map((widget) => (
            <div
              key={widget.i}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <h3 className="font-semibold text-sm mb-2">{widget.title}</h3>
              <div className="text-xs text-gray-500">
                {widget.type} 小部件
              </div>
            </div>
          ))}
        </GridLayout>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">仪表板编辑器</h2>
          <p className="text-sm text-gray-600 mt-1">
            拖拽小部件调整布局，点击添加新小部件
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(true)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            预览
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving || readOnly}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 小部件库 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加小部件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {WIDGET_TYPES.map((widgetType) => (
              <button
                key={widgetType.id}
                type="button"
                onClick={() => handleAddWidget(widgetType)}
                className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
              >
                <p className="font-medium text-sm">{widgetType.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {widgetType.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 编辑区域 */}
      <Card>
        <CardContent className="pt-6">
          {widgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">暂无小部件</p>
              <p className="text-sm text-gray-400">
                点击上方"添加小部件"开始创建您的仪表板
              </p>
            </div>
          ) : (
            <GridLayout
              className="bg-gray-50 rounded-lg"
              layout={layout}
              onLayoutChange={handleLayoutChange}
              cols={12}
              rowHeight={60}
              width={1200}
              isDraggable={!readOnly}
              isResizable={!readOnly}
              compactType="vertical"
              preventCollision={false}
              useCSSTransforms={true}
            >
              {widgets.map((widget) => (
                <div
                  key={widget.i}
                  className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{widget.title}</h3>
                    <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditWidget(widget)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWidget(widget.i)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{widget.type}</Badge>
                    <span className="text-xs text-gray-500">
                      {widget.w}x{widget.h}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    拖拽调整大小和位置
                  </div>
                </div>
              ))}
            </GridLayout>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      {editingWidget && (
        <Dialog open={!!editingWidget} onOpenChange={() => setEditingWidget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑小部件</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label htmlFor="widget-title" className="text-sm font-medium">标题</label>
                <input
                  id="widget-title"
                  type="text"
                  value={editingWidget.title}
                  onChange={(e) =>
                    setEditingWidget({
                      ...editingWidget,
                      title: e.target.value,
                    })
                  }
                  placeholder="输入小部件标题"
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">类型</label>
                <div className="text-sm text-gray-600 mt-1">
                  {WIDGET_TYPES.find((w) => w.id === editingWidget.type)?.name}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleSaveWidgetEdit(editingWidget)
                  }
                  className="flex-1"
                >
                  保存
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingWidget(null)}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
