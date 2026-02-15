'use client';

/**
 * Dashboard Screen Management Page
 * 数据大屏管理页面
 */

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Plus,
  Settings,
  Share2,
  Trash2,
  Eye,
  Edit,
  Copy,
  MoreVertical,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NumberWidget,
  ProgressWidget,
  ListWidget,
  GaugeWidget,
  LineChartWidget,
  BarChartWidget,
  PieChartWidget,
  NumberConfig,
  ProgressConfig,
  ListConfig,
  GaugeConfig,
  LineChartConfig,
  BarChartConfig,
  PieChartConfig,
} from '@/components/dashboard/widgets';

// 大屏配置类型
interface DashboardScreen {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  widgets: number;
}

// 示例数据
const sampleScreens: DashboardScreen[] = [
  {
    id: '1',
    name: '销售数据大屏',
    description: '实时展示销售数据和趋势',
    isPublic: false,
    createdAt: '2026-01-10T10:00:00Z',
    widgets: 8,
  },
  {
    id: '2',
    name: '运营监控大屏',
    description: '系统运营状态实时监控',
    isPublic: true,
    createdAt: '2026-01-08T14:30:00Z',
    widgets: 12,
  },
  {
    id: '3',
    name: '用户分析大屏',
    description: '用户行为和留存分析',
    isPublic: false,
    createdAt: '2026-01-05T09:15:00Z',
    widgets: 6,
  },
];

// 示例组件配置
const sampleNumberConfig: NumberConfig = {
  id: 'num1',
  type: 'number',
  title: '今日销售额',
  position: { x: 0, y: 0 },
  size: { width: 200, height: 120 },
  value: 128500,
  unit: '元',
  format: 'number',
  trend: { value: 12.5, direction: 'up', isGood: true },
};

const sampleGaugeConfig: GaugeConfig = {
  id: 'gauge1',
  type: 'gauge',
  title: '系统负载',
  position: { x: 0, y: 0 },
  size: { width: 200, height: 180 },
  value: 68,
  min: 0,
  max: 100,
  unit: '%',
  showValue: true,
  thresholds: [
    { value: 0, color: '#10b981' },
    { value: 60, color: '#f59e0b' },
    { value: 80, color: '#ef4444' },
  ],
};

const sampleProgressConfig: ProgressConfig = {
  id: 'prog1',
  type: 'progress',
  title: '目标完成度',
  position: { x: 0, y: 0 },
  value: 75,
  max: 100,
  showLabel: true,
  variant: 'circular',
  size: 'md',
};

const sampleListConfig: ListConfig = {
  id: 'list1',
  type: 'list',
  title: '热门产品',
  position: { x: 0, y: 0 },
  size: { width: 300, height: 200 },
  showIndex: true,
  items: [
    { title: '产品 A', value: 1250 },
    { title: '产品 B', value: 980 },
    { title: '产品 C', value: 756 },
    { title: '产品 D', value: 543 },
    { title: '产品 E', value: 321 },
  ],
};

const sampleLineChartConfig: LineChartConfig = {
  id: 'line1',
  type: 'line-chart',
  title: '销售趋势',
  position: { x: 0, y: 0 },
  size: { width: 400, height: 200 },
  showLegend: true,
  showGrid: true,
  smooth: true,
  areaFill: true,
  series: [
    {
      name: '本月',
      data: [
        { label: '周一', value: 120 },
        { label: '周二', value: 180 },
        { label: '周三', value: 150 },
        { label: '周四', value: 220 },
        { label: '周五', value: 280 },
        { label: '周六', value: 190 },
        { label: '周日', value: 160 },
      ],
    },
    {
      name: '上月',
      data: [
        { label: '周一', value: 100 },
        { label: '周二', value: 140 },
        { label: '周三', value: 130 },
        { label: '周四', value: 180 },
        { label: '周五', value: 220 },
        { label: '周六', value: 150 },
        { label: '周日', value: 120 },
      ],
      color: '#94a3b8',
    },
  ],
};

const sampleBarChartConfig: BarChartConfig = {
  id: 'bar1',
  type: 'bar-chart',
  title: '部门业绩',
  position: { x: 0, y: 0 },
  size: { width: 300, height: 200 },
  showLegend: false,
  horizontal: false,
  series: [
    {
      name: '业绩',
      data: [
        { label: '销售部', value: 450 },
        { label: '市场部', value: 320 },
        { label: '技术部', value: 280 },
        { label: '运营部', value: 210 },
      ],
    },
  ],
};

const samplePieChartConfig: PieChartConfig = {
  id: 'pie1',
  type: 'pie-chart',
  title: '用户来源',
  position: { x: 0, y: 0 },
  size: { width: 300, height: 200 },
  showLegend: true,
  donut: true,
  donutWidth: 30,
  data: [
    { label: '搜索引擎', value: 45 },
    { label: '直接访问', value: 25 },
    { label: '社交媒体', value: 20 },
    { label: '其他', value: 10 },
  ],
};

export default function DashboardScreenPage() {
  const [loading, setLoading] = useState(true);
  const [screens, setScreens] = useState<DashboardScreen[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenDesc, setNewScreenDesc] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 模拟加载
      await new Promise(resolve => setTimeout(resolve, 500));
      setScreens(sampleScreens);
      setLoading(false);
    };
    loadData();
  }, []);

  // 创建大屏
  const handleCreate = () => {
    if (!newScreenName.trim()) return;

    const newScreen: DashboardScreen = {
      id: Date.now().toString(),
      name: newScreenName,
      description: newScreenDesc,
      isPublic: false,
      createdAt: new Date().toISOString(),
      widgets: 0,
    };

    setScreens([newScreen, ...screens]);
    setShowCreateDialog(false);
    setNewScreenName('');
    setNewScreenDesc('');
  };

  // 删除大屏
  const handleDelete = (id: string) => {
    setScreens(screens.filter(s => s.id !== id));
  };

  // 复制大屏
  const handleDuplicate = (screen: DashboardScreen) => {
    const newScreen: DashboardScreen = {
      ...screen,
      id: Date.now().toString(),
      name: `${screen.name} (副本)`,
      createdAt: new Date().toISOString(),
    };
    setScreens([newScreen, ...screens]);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">数据大屏</h1>
          <p className="text-muted-foreground">创建和管理数据可视化大屏</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Settings className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {previewMode ? '管理模式' : '预览组件'}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新建大屏
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建数据大屏</DialogTitle>
                <DialogDescription>
                  创建一个新的数据可视化大屏
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">大屏名称</Label>
                  <Input
                    id="name"
                    value={newScreenName}
                    onChange={(e) => setNewScreenName(e.target.value)}
                    placeholder="输入大屏名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">描述（可选）</Label>
                  <Input
                    id="desc"
                    value={newScreenDesc}
                    onChange={(e) => setNewScreenDesc(e.target.value)}
                    placeholder="输入大屏描述"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleCreate} disabled={!newScreenName.trim()}>
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 预览模式 - 展示组件 */}
      {previewMode && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">组件预览</h2>
          
          {/* 数字卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <NumberWidget config={sampleNumberConfig} />
            <NumberWidget
              config={{
                ...sampleNumberConfig,
                id: 'num2',
                title: '订单数量',
                value: 1256,
                unit: '单',
                trend: { value: 8.3, direction: 'up', isGood: true },
              }}
            />
            <NumberWidget
              config={{
                ...sampleNumberConfig,
                id: 'num3',
                title: '退款率',
                value: 2.5,
                unit: '%',
                format: 'number',
                decimals: 1,
                trend: { value: 0.3, direction: 'down', isGood: true },
              }}
            />
            <NumberWidget
              config={{
                ...sampleNumberConfig,
                id: 'num4',
                title: '活跃用户',
                value: 8520,
                trend: { value: 15.2, direction: 'up', isGood: true },
              }}
            />
          </div>

          {/* 图表 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <LineChartWidget config={sampleLineChartConfig} />
            <BarChartWidget config={sampleBarChartConfig} />
            <PieChartWidget config={samplePieChartConfig} />
          </div>

          {/* 仪表盘和进度 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <GaugeWidget config={sampleGaugeConfig} />
            <GaugeWidget
              config={{
                ...sampleGaugeConfig,
                id: 'gauge2',
                title: 'CPU 使用率',
                value: 45,
              }}
            />
            <ProgressWidget config={sampleProgressConfig} />
            <ProgressWidget
              config={{
                ...sampleProgressConfig,
                id: 'prog2',
                title: '存储使用',
                value: 65,
                variant: 'linear',
              }}
            />
          </div>

          {/* 列表 */}
          <div className="grid gap-4 md:grid-cols-2">
            <ListWidget config={sampleListConfig} />
            <ListWidget
              config={{
                ...sampleListConfig,
                id: 'list2',
                title: '最新订单',
                showIndex: false,
                items: [
                  { title: '订单 #12345', value: '¥1,250' },
                  { title: '订单 #12344', value: '¥980' },
                  { title: '订单 #12343', value: '¥756' },
                  { title: '订单 #12342', value: '¥543' },
                  { title: '订单 #12341', value: '¥321' },
                ],
              }}
            />
          </div>
        </div>
      )}

      {/* 管理模式 - 大屏列表 */}
      {!previewMode && (
        <>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : screens.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {screens.map((screen) => (
                <Card key={screen.id} className="group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{screen.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Maximize2 className="mr-2 h-4 w-4" />
                            全屏预览
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(screen)}>
                            <Copy className="mr-2 h-4 w-4" />
                            复制
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            分享
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(screen.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {screen.description && (
                      <CardDescription>{screen.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {screen.widgets} 个组件
                        </span>
                        {screen.isPublic && (
                          <Badge variant="secondary">公开</Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(screen.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Monitor className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">暂无数据大屏</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  创建您的第一个数据可视化大屏
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建大屏
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
