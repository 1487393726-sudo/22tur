/**
 * Dashboard module types
 */

export interface KPICard {
  id: string;
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  icon?: string;
  color?: string;
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
    }[];
  };
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'transaction' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void | Promise<void>;
  color?: string;
  disabled?: boolean;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  widgets: WidgetPosition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetPosition {
  widgetId: string;
  widgetType: 'kpi' | 'chart' | 'activity' | 'action';
  x: number;
  y: number;
  width: number;
  height: number;
  settings?: Record<string, any>;
}

export interface DashboardData {
  kpis: KPICard[];
  charts: ChartData[];
  activities: ActivityItem[];
  quickActions: QuickAction[];
}
