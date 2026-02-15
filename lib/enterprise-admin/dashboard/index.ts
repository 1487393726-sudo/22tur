/**
 * Dashboard module exports
 */

export { Dashboard } from './Dashboard';
export { KPICard } from './KPICard';
export { ChartWidget } from './ChartWidget';
export { ActivityList } from './ActivityList';
export { QuickActions } from './QuickActions';

export {
  DashboardWebSocketService,
  getDashboardWebSocketService,
  type DashboardUpdate,
  type DashboardUpdateType,
  type WebSocketConfig,
} from './websocket-service';

export { useDashboardUpdates } from './useDashboardUpdates';

export type {
  KPICard as KPICardType,
  ChartData,
  ActivityItem,
  QuickAction,
  DashboardLayout,
  WidgetPosition,
  DashboardData,
} from './types';
