"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Edit2,
  Loader2,
  Move,
  Maximize2,
  Minimize2,
  Copy,
  Settings,
  Palette,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Hash,
  List,
  Table,
  Type,
  TrendingUp,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import {
  WidgetConfig,
  WidgetType,
  DashboardScreenConfig,
  WidgetSize,
  WidgetPosition,
} from "./widgets/types";

// 组件类型定义
const WIDGET_CATALOG: Array<{
  type: WidgetType;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultSize: WidgetSize;
  category: "chart" | "data" | "display";
}> = [
  {
    type: "line-chart",
    name: "折线图",
    description: "展示趋势数据",
    icon: <LineChart className="w-5 h-5" />,
    defaultSize: { width: 400, height: 300, minWidth: 200, minHeight: 200 },
    category: "chart",
  },
  {
    type: "bar-chart",
    name: "柱状图",
    description: "展示对比数据",
    icon: <BarChart3 className="w-5 h-5" />,
    defaultSize: { width: 400, height: 300, minWidth: 200, minHeight: 200 },
    category: "chart",
  },
  {
    type: "pie-chart",
    name: "饼图",
    description: "展示占比数据",
    icon: <PieChart className="w-5 h-5" />,
    defaultSize: { width: 300, height: 300, minWidth: 200, minHeight: 200 },
    category: "chart",
  },
  {
    type: "gauge",
    name: "仪表盘",
    description: "展示进度指标",
    icon: <Gauge className="w-5 h-5" />,
    defaultSize: { width: 250, height: 250, minWidth: 150, minHeight: 150 },
    category: "chart",
  },
  {
    type: "number",
    name: "数字卡片",
    description: "展示关键指标",
    icon: <Hash className="w-5 h-5" />,
    defaultSize: { width: 200, height: 120, minWidth: 150, minHeight: 100 },
    category: "data",
  },
  {
    type: "progress",
    name: "进度条",
    description: "展示完成进度",
    icon: <TrendingUp className="w-5 h-5" />,
    defaultSize: { width: 300, height: 80, minWidth: 200, minHeight: 60 },
    category: "data",
  },
  {
    type: "list",
    name: "列表",
    description: "展示排行数据",
    icon: <List className="w-5 h-5" />,
    defaultSize: { width: 300, height: 250, minWidth: 200, minHeight: 150 },
    category: "display",
  },
  {
    type: "table",
    name: "表格",
    description: "展示详细数据",
    icon: <Table className="w-5 h-5" />,
    defaultSize: { width: 500, height: 300, minWidth: 300, minHeight: 200 },
    category: "display",
  },
  {
    type: "text",
    name: "文本",
    description: "展示文字内容",
    icon: <Type className="w-5 h-5" />,
    defaultSize: { width: 200, height: 60, minWidth: 100, minHeight: 40 },
    category: "display",
  },
  {
    type: "map",
    name: "地图",
    description: "展示地理数据",
    icon: <Map className="w-5 h-5" />,
    defaultSize: { width: 500, height: 400, minWidth: 300, minHeight: 300 },
    category: "chart",
  },
];

interface ScreenEditorProps {
  screenConfig?: DashboardScreenConfig;
  onSave?: (config: DashboardScreenConfig) => Promise<void>;
  readOnly?: boolean;
}

// 拖拽状态
interface DragState {
  isDragging: boolean;
  widgetId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

// 调整大小状态
interface ResizeState {
  isResizing: boolean;
  widgetId: string | null;
  direction: "se" | "sw" | "ne" | "nw" | "e" | "w" | "n" | "s" | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export function ScreenEditor({
  screenConfig,
  onSave,
  readOnly = false,
}: ScreenEditorProps) {
  // 大屏配置状态
  const [config, setConfig] = useState<DashboardScreenConfig>(
    screenConfig || {
      id: `screen-${Date.now()}`,
      name: "新建大屏",
      width: 1920,
      height: 1080,
      backgroundColor: "#0a1929",
      widgets: [],
      createdAt: new Date(),
      createdBy: "admin",
    }
  );

  // UI 状态
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [scale, setScale] = useState(0.5);

  // 拖拽和调整大小状态
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    widgetId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    widgetId: null,
    direction: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // 添加组件
  const handleAddWidget = useCallback(
    (widgetType: (typeof WIDGET_CATALOG)[0]) => {
      const newId = `widget-${Date.now()}`;
      const newWidget: WidgetConfig = {
        id: newId,
        type: widgetType.type,
        title: widgetType.name,
        position: { x: 50, y: 50 },
        size: { ...widgetType.defaultSize },
        style: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderRadius: 8,
          padding: 16,
          titleColor: "#ffffff",
          valueColor: "#00d4ff",
        },
      } as WidgetConfig;

      setConfig((prev) => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
        updatedAt: new Date(),
      }));

      setSelectedWidget(newId);
      toast.success(`已添加 ${widgetType.name}`);
    },
    []
  );

  // 删除组件
  const handleDeleteWidget = useCallback((widgetId: string) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
      updatedAt: new Date(),
    }));
    setSelectedWidget(null);
    toast.success("已删除组件");
  }, []);

  // 复制组件
  const handleDuplicateWidget = useCallback(
    (widgetId: string) => {
      const widget = config.widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      const newId = `widget-${Date.now()}`;
      const newWidget: WidgetConfig = {
        ...widget,
        id: newId,
        position: {
          x: widget.position.x + 20,
          y: widget.position.y + 20,
        },
      };

      setConfig((prev) => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
        updatedAt: new Date(),
      }));

      setSelectedWidget(newId);
      toast.success("已复制组件");
    },
    [config.widgets]
  );

  // 更新组件位置
  const updateWidgetPosition = useCallback(
    (widgetId: string, position: WidgetPosition) => {
      setConfig((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === widgetId ? { ...w, position } : w
        ) as WidgetConfig[],
        updatedAt: new Date(),
      }));
    },
    []
  );

  // 更新组件大小
  const updateWidgetSize = useCallback(
    (widgetId: string, size: WidgetSize) => {
      setConfig((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === widgetId ? { ...w, size } : w
        ) as WidgetConfig[],
        updatedAt: new Date(),
      }));
    },
    []
  );

  // 更新组件配置
  const updateWidgetConfig = useCallback(
    (widgetId: string, updates: Partial<WidgetConfig>) => {
      setConfig((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === widgetId ? { ...w, ...updates } : w
        ) as WidgetConfig[],
        updatedAt: new Date(),
      }));
    },
    []
  );

  // 拖拽开始
  const handleDragStart = useCallback(
    (e: React.MouseEvent, widgetId: string) => {
      if (readOnly || isPreview) return;
      e.preventDefault();
      e.stopPropagation();

      const widget = config.widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      setDragState({
        isDragging: true,
        widgetId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: widget.position.x,
        offsetY: widget.position.y,
      });

      setSelectedWidget(widgetId);
    },
    [config.widgets, readOnly, isPreview]
  );

  // 拖拽移动
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.widgetId) return;

      const deltaX = (e.clientX - dragState.startX) / scale;
      const deltaY = (e.clientY - dragState.startY) / scale;

      const newX = Math.max(0, Math.min(config.width - 50, dragState.offsetX + deltaX));
      const newY = Math.max(0, Math.min(config.height - 50, dragState.offsetY + deltaY));

      updateWidgetPosition(dragState.widgetId, { x: newX, y: newY });
    },
    [dragState, scale, config.width, config.height, updateWidgetPosition]
  );

  // 拖拽结束
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      widgetId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    });
  }, []);

  // 调整大小开始
  const handleResizeStart = useCallback(
    (
      e: React.MouseEvent,
      widgetId: string,
      direction: ResizeState["direction"]
    ) => {
      if (readOnly || isPreview) return;
      e.preventDefault();
      e.stopPropagation();

      const widget = config.widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      setResizeState({
        isResizing: true,
        widgetId,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: widget.size.width,
        startHeight: widget.size.height,
      });
    },
    [config.widgets, readOnly, isPreview]
  );

  // 调整大小移动
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.widgetId) return;

      const widget = config.widgets.find((w) => w.id === resizeState.widgetId);
      if (!widget) return;

      const widgetSize = widget.size;
      const deltaX = (e.clientX - resizeState.startX) / scale;
      const deltaY = (e.clientY - resizeState.startY) / scale;

      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;

      if (resizeState.direction?.includes("e")) {
        newWidth = Math.max(widgetSize.minWidth || 100, resizeState.startWidth + deltaX);
      }
      if (resizeState.direction?.includes("w")) {
        newWidth = Math.max(widgetSize.minWidth || 100, resizeState.startWidth - deltaX);
      }
      if (resizeState.direction?.includes("s")) {
        newHeight = Math.max(widgetSize.minHeight || 100, resizeState.startHeight + deltaY);
      }
      if (resizeState.direction?.includes("n")) {
        newHeight = Math.max(widgetSize.minHeight || 100, resizeState.startHeight - deltaY);
      }

      updateWidgetSize(resizeState.widgetId, {
        ...widgetSize,
        width: newWidth,
        height: newHeight,
      });
    },
    [resizeState, scale, config.widgets, updateWidgetSize]
  );

  // 调整大小结束
  const handleResizeEnd = useCallback(() => {
    setResizeState({
      isResizing: false,
      widgetId: null,
      direction: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
    });
  }, []);

  // 全局鼠标事件监听
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        handleDragMove(e);
      }
      if (resizeState.isResizing) {
        handleResizeMove(e);
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        handleDragEnd();
      }
      if (resizeState.isResizing) {
        handleResizeEnd();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragState.isDragging,
    resizeState.isResizing,
    handleDragMove,
    handleDragEnd,
    handleResizeMove,
    handleResizeEnd,
  ]);

  // 保存大屏配置
  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave?.(config);
      toast.success("大屏配置已保存");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 获取选中的组件
  const selectedWidgetConfig = config.widgets.find(
    (w) => w.id === selectedWidget
  );

  // 辅助函数：安全获取 widget size
  const getWidgetSize = (widget: WidgetConfig): WidgetSize => {
    return widget.size;
  };

  // 渲染组件占位符
  const renderWidgetPlaceholder = (widget: WidgetConfig) => {
    const catalogItem = WIDGET_CATALOG.find((c) => c.type === widget.type);
    const isSelected = selectedWidget === widget.id;
    const widgetSize = getWidgetSize(widget);

    return (
      <div
        key={widget.id}
        className={`absolute cursor-move transition-shadow ${
          isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
        }`}
        style={{
          left: widget.position.x,
          top: widget.position.y,
          width: widgetSize.width,
          height: widgetSize.height,
          backgroundColor: widget.style?.backgroundColor || "rgba(255,255,255,0.05)",
          borderColor: widget.style?.borderColor || "rgba(255,255,255,0.1)",
          borderWidth: widget.style?.borderWidth || 1,
          borderStyle: "solid",
          borderRadius: widget.style?.borderRadius || 8,
          padding: widget.style?.padding || 16,
        }}
        onMouseDown={(e) => handleDragStart(e, widget.id)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedWidget(widget.id);
        }}
      >
        {/* 组件标题 */}
        <div
          className="text-sm font-medium mb-2 truncate"
          style={{ color: widget.style?.titleColor || "#ffffff" }}
        >
          {widget.title}
        </div>

        {/* 组件图标和类型 */}
        <div className="flex items-center justify-center flex-1 opacity-50">
          {catalogItem?.icon}
          <span className="ml-2 text-xs text-gray-400">{catalogItem?.name}</span>
        </div>

        {/* 选中时显示操作按钮 */}
        {isSelected && !readOnly && !isPreview && (
          <>
            {/* 操作按钮 */}
            <div className="absolute -top-8 right-0 flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditDialogOpen(true);
                }}
                className="p-1 bg-blue-500 rounded text-white hover:bg-blue-600"
                title="编辑"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateWidget(widget.id);
                }}
                className="p-1 bg-green-500 rounded text-white hover:bg-green-600"
                title="复制"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWidget(widget.id);
                }}
                className="p-1 bg-red-500 rounded text-white hover:bg-red-600"
                title="删除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* 调整大小手柄 */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-blue-500 rounded-tl"
              onMouseDown={(e) => handleResizeStart(e, widget.id, "se")}
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize bg-blue-500 rounded-tr"
              onMouseDown={(e) => handleResizeStart(e, widget.id, "sw")}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize bg-blue-500 rounded-bl"
              onMouseDown={(e) => handleResizeStart(e, widget.id, "ne")}
            />
            <div
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize bg-blue-500 rounded-br"
              onMouseDown={(e) => handleResizeStart(e, widget.id, "nw")}
            />
          </>
        )}
      </div>
    );
  };

  // 预览模式
  if (isPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(false)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            退出预览
          </Button>
        </div>

        <div
          ref={canvasRef}
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: config.backgroundColor }}
        >
          <div
            className="relative"
            style={{
              width: config.width,
              height: config.height,
              transform: `scale(${Math.min(
                window.innerWidth / config.width,
                window.innerHeight / config.height
              )})`,
              transformOrigin: "center center",
            }}
          >
            {config.widgets.map((widget) => renderWidgetPlaceholder(widget))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* 左侧组件库 */}
      <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            组件库
          </h3>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="chart" className="text-xs">图表</TabsTrigger>
              <TabsTrigger value="data" className="text-xs">数据</TabsTrigger>
              <TabsTrigger value="display" className="text-xs">展示</TabsTrigger>
            </TabsList>

            {["chart", "data", "display"].map((category) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="space-y-2">
                  {WIDGET_CATALOG.filter((w) => w.category === category).map(
                    (widget) => (
                      <button
                        key={widget.type}
                        type="button"
                        onClick={() => handleAddWidget(widget)}
                        disabled={readOnly}
                        className="w-full p-3 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-colors text-left flex items-center gap-3 disabled:opacity-50"
                      >
                        <div className="text-blue-500">{widget.icon}</div>
                        <div>
                          <p className="font-medium text-sm">{widget.name}</p>
                          <p className="text-xs text-gray-500">
                            {widget.description}
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* 中间画布区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 工具栏 */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">{config.name}</h2>
            <Badge variant="outline">
              {config.width} x {config.height}
            </Badge>
            <Badge variant="secondary">{config.widgets.length} 个组件</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* 缩放控制 */}
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-gray-500">缩放</span>
              <Slider
                value={[scale * 100]}
                onValueChange={([v]) => setScale(v / 100)}
                min={20}
                max={100}
                step={5}
                className="w-24"
              />
              <span className="text-sm w-12">{Math.round(scale * 100)}%</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-1" />
              设置
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              预览
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || readOnly}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              保存
            </Button>
          </div>
        </div>

        {/* 画布 */}
        <div
          className="flex-1 overflow-auto p-8"
          style={{ backgroundColor: "#1a1a2e" }}
          onClick={() => setSelectedWidget(null)}
        >
          <div
            ref={canvasRef}
            className="relative mx-auto shadow-2xl"
            style={{
              width: config.width * scale,
              height: config.height * scale,
              backgroundColor: config.backgroundColor,
              backgroundImage: config.backgroundImage
                ? `url(${config.backgroundImage})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: config.width,
                height: config.height,
              }}
            >
              {config.widgets.map((widget) => renderWidgetPlaceholder(widget))}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧属性面板 */}
      <div className="w-72 border-l bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="p-4">
          {selectedWidgetConfig ? (
            <>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                组件属性
              </h3>

              <div className="space-y-4">
                {/* 基本信息 */}
                <div>
                  <Label>标题</Label>
                  <Input
                    value={selectedWidgetConfig.title}
                    onChange={(e) =>
                      updateWidgetConfig(selectedWidgetConfig.id, {
                        title: e.target.value,
                      })
                    }
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>

                {/* 位置 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>X 位置</Label>
                    <Input
                      type="number"
                      value={selectedWidgetConfig.position.x}
                      onChange={(e) =>
                        updateWidgetPosition(selectedWidgetConfig.id, {
                          ...selectedWidgetConfig.position,
                          x: Number(e.target.value),
                        })
                      }
                      disabled={readOnly}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Y 位置</Label>
                    <Input
                      type="number"
                      value={selectedWidgetConfig.position.y}
                      onChange={(e) =>
                        updateWidgetPosition(selectedWidgetConfig.id, {
                          ...selectedWidgetConfig.position,
                          y: Number(e.target.value),
                        })
                      }
                      disabled={readOnly}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 大小 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>宽度</Label>
                    <Input
                      type="number"
                      value={getWidgetSize(selectedWidgetConfig).width}
                      onChange={(e) =>
                        updateWidgetSize(selectedWidgetConfig.id, {
                          ...getWidgetSize(selectedWidgetConfig),
                          width: Number(e.target.value),
                        })
                      }
                      disabled={readOnly}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>高度</Label>
                    <Input
                      type="number"
                      value={getWidgetSize(selectedWidgetConfig).height}
                      onChange={(e) =>
                        updateWidgetSize(selectedWidgetConfig.id, {
                          ...getWidgetSize(selectedWidgetConfig),
                          height: Number(e.target.value),
                        })
                      }
                      disabled={readOnly}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 样式 */}
                <div>
                  <Label>背景颜色</Label>
                  <Input
                    type="color"
                    value={selectedWidgetConfig.style?.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      updateWidgetConfig(selectedWidgetConfig.id, {
                        style: {
                          ...selectedWidgetConfig.style,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                    disabled={readOnly}
                    className="mt-1 h-10"
                  />
                </div>

                <div>
                  <Label>边框颜色</Label>
                  <Input
                    type="color"
                    value={selectedWidgetConfig.style?.borderColor || "#e5e7eb"}
                    onChange={(e) =>
                      updateWidgetConfig(selectedWidgetConfig.id, {
                        style: {
                          ...selectedWidgetConfig.style,
                          borderColor: e.target.value,
                        },
                      })
                    }
                    disabled={readOnly}
                    className="mt-1 h-10"
                  />
                </div>

                <div>
                  <Label>圆角 ({selectedWidgetConfig.style?.borderRadius || 8}px)</Label>
                  <Slider
                    value={[selectedWidgetConfig.style?.borderRadius || 8]}
                    onValueChange={([v]) =>
                      updateWidgetConfig(selectedWidgetConfig.id, {
                        style: {
                          ...selectedWidgetConfig.style,
                          borderRadius: v,
                        },
                      })
                    }
                    min={0}
                    max={24}
                    step={2}
                    disabled={readOnly}
                    className="mt-2"
                  />
                </div>

                {/* 数据源 */}
                <div>
                  <Label>数据源 URL</Label>
                  <Input
                    value={selectedWidgetConfig.dataSource || ""}
                    onChange={(e) =>
                      updateWidgetConfig(selectedWidgetConfig.id, {
                        dataSource: e.target.value,
                      })
                    }
                    placeholder="/api/data/..."
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>刷新间隔 (秒)</Label>
                  <Input
                    type="number"
                    value={selectedWidgetConfig.refreshInterval || 0}
                    onChange={(e) =>
                      updateWidgetConfig(selectedWidgetConfig.id, {
                        refreshInterval: Number(e.target.value),
                      })
                    }
                    min={0}
                    disabled={readOnly}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">选择一个组件查看属性</p>
            </div>
          )}
        </div>
      </div>

      {/* 大屏设置对话框 */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>大屏设置</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>大屏名称</Label>
              <Input
                value={config.name}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={readOnly}
                className="mt-1"
              />
            </div>

            <div>
              <Label>描述</Label>
              <Input
                value={config.description || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={readOnly}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>宽度</Label>
                <Select
                  value={String(config.width)}
                  onValueChange={(v) =>
                    setConfig((prev) => ({ ...prev, width: Number(v) }))
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1920">1920 (Full HD)</SelectItem>
                    <SelectItem value="2560">2560 (2K)</SelectItem>
                    <SelectItem value="3840">3840 (4K)</SelectItem>
                    <SelectItem value="1280">1280 (HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>高度</Label>
                <Select
                  value={String(config.height)}
                  onValueChange={(v) =>
                    setConfig((prev) => ({ ...prev, height: Number(v) }))
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1080">1080 (Full HD)</SelectItem>
                    <SelectItem value="1440">1440 (2K)</SelectItem>
                    <SelectItem value="2160">2160 (4K)</SelectItem>
                    <SelectItem value="720">720 (HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>背景颜色</Label>
              <Input
                type="color"
                value={config.backgroundColor || "#0a1929"}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    backgroundColor: e.target.value,
                  }))
                }
                disabled={readOnly}
                className="mt-1 h-10"
              />
            </div>

            <div>
              <Label>背景图片 URL</Label>
              <Input
                value={config.backgroundImage || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    backgroundImage: e.target.value,
                  }))
                }
                placeholder="https://..."
                disabled={readOnly}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={config.isPublic || false}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, isPublic: e.target.checked }))
                }
                disabled={readOnly}
                className="rounded"
              />
              <Label htmlFor="isPublic">公开分享</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSettingsDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={() => setSettingsDialogOpen(false)}>
                确定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 组件编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑组件</DialogTitle>
          </DialogHeader>

          {selectedWidgetConfig && (
            <div className="space-y-4">
              <div>
                <Label>组件类型</Label>
                <div className="mt-1 text-sm text-gray-600">
                  {WIDGET_CATALOG.find((c) => c.type === selectedWidgetConfig.type)?.name}
                </div>
              </div>

              <div>
                <Label>标题</Label>
                <Input
                  value={selectedWidgetConfig.title}
                  onChange={(e) =>
                    updateWidgetConfig(selectedWidgetConfig.id, {
                      title: e.target.value,
                    })
                  }
                  disabled={readOnly}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>描述</Label>
                <Input
                  value={selectedWidgetConfig.description || ""}
                  onChange={(e) =>
                    updateWidgetConfig(selectedWidgetConfig.id, {
                      description: e.target.value,
                    })
                  }
                  disabled={readOnly}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={() => setEditDialogOpen(false)}>
                  确定
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
