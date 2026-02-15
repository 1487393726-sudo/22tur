/**
 * Dashboard Widget Types
 * 数据大屏组件类型定义
 */

// 组件类型
export type WidgetType =
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'gauge'
  | 'number'
  | 'table'
  | 'map'
  | 'progress'
  | 'list'
  | 'text';

// 组件尺寸
export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

// 组件位置
export interface WidgetPosition {
  x: number;
  y: number;
}

// 数据点
export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  extra?: Record<string, unknown>;
}

// 时间序列数据点
export interface TimeSeriesDataPoint {
  timestamp: Date | string;
  value: number;
  label?: string;
}

// 图表数据系列
export interface ChartSeries {
  name: string;
  data: (DataPoint | TimeSeriesDataPoint)[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

// 组件配置基类
export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  refreshInterval?: number; // 刷新间隔（秒）
  dataSource?: string; // 数据源 URL
  style?: WidgetStyle;
}

// 组件样式
export interface WidgetStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  titleColor?: string;
  titleSize?: number;
  valueColor?: string;
  valueSize?: number;
}

// 折线图配置
export interface LineChartConfig extends BaseWidgetConfig {
  type: 'line-chart';
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  smooth?: boolean;
  areaFill?: boolean;
}

// 柱状图配置
export interface BarChartConfig extends BaseWidgetConfig {
  type: 'bar-chart';
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
}

// 饼图配置
export interface PieChartConfig extends BaseWidgetConfig {
  type: 'pie-chart';
  data: DataPoint[];
  showLegend?: boolean;
  showLabels?: boolean;
  donut?: boolean;
  donutWidth?: number;
}

// 仪表盘配置
export interface GaugeConfig extends BaseWidgetConfig {
  type: 'gauge';
  value: number;
  min: number;
  max: number;
  unit?: string;
  thresholds?: Array<{ value: number; color: string }>;
  showValue?: boolean;
}

// 数字卡片配置
export interface NumberConfig extends BaseWidgetConfig {
  type: 'number';
  value: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    isGood?: boolean;
  };
  format?: 'number' | 'currency' | 'percent';
  decimals?: number;
}

// 表格配置
export interface TableConfig extends BaseWidgetConfig {
  type: 'table';
  columns: Array<{
    key: string;
    title: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
  }>;
  data: Record<string, unknown>[];
  showHeader?: boolean;
  striped?: boolean;
  maxRows?: number;
}

// 地图配置
export interface MapConfig extends BaseWidgetConfig {
  type: 'map';
  mapType: 'china' | 'world' | 'province';
  province?: string;
  data: Array<{
    name: string;
    value: number;
    coordinates?: [number, number];
  }>;
  showLabels?: boolean;
  colorRange?: [string, string];
}

// 进度条配置
export interface ProgressConfig extends BaseWidgetConfig {
  type: 'progress';
  value: number;
  max: number;
  showLabel?: boolean;
  color?: string;
  trackColor?: string;
  progressSize?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
}

// 列表配置
export interface ListConfig extends BaseWidgetConfig {
  type: 'list';
  items: Array<{
    title: string;
    value?: string | number;
    icon?: string;
    color?: string;
  }>;
  showIndex?: boolean;
  maxItems?: number;
}

// 文本配置
export interface TextConfig extends BaseWidgetConfig {
  type: 'text';
  content: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
}

// 组件配置联合类型
export type WidgetConfig =
  | LineChartConfig
  | BarChartConfig
  | PieChartConfig
  | GaugeConfig
  | NumberConfig
  | TableConfig
  | MapConfig
  | ProgressConfig
  | ListConfig
  | TextConfig;

// 大屏配置
export interface DashboardScreenConfig {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  backgroundColor?: string;
  backgroundImage?: string;
  widgets: WidgetConfig[];
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  isPublic?: boolean;
  shareToken?: string;
}

// 数据变化高亮配置
export interface HighlightConfig {
  enabled: boolean;
  threshold: number; // 变化百分比阈值
  duration: number; // 高亮持续时间（毫秒）
  upColor: string;
  downColor: string;
}

// 组件属性
export interface WidgetProps<T extends WidgetConfig = WidgetConfig> {
  config: T;
  data?: unknown;
  loading?: boolean;
  error?: string;
  highlight?: HighlightConfig;
  onConfigChange?: (config: T) => void;
  onRefresh?: () => void;
}
