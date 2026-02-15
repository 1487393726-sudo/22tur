/**
 * Push Service
 * 实时数据推送服务
 */

import {
  IWebSocketService,
  WebSocketMessage,
  createNotification,
  createMessage,
} from './types';

export interface DashboardUpdatePayload {
  widgetId: string;
  data: any;
  timestamp: number;
}

export interface DataChangePayload {
  tableId: string;
  rowId: string;
  action: 'create' | 'update' | 'delete';
  data?: any;
  timestamp: number;
}

export interface AuditLogPayload {
  id: string;
  userId: string;
  operationType: string;
  resource: string;
  action: string;
  timestamp: number;
}

/**
 * 推送服务
 */
export class PushService {
  private wsService: IWebSocketService;

  constructor(wsService: IWebSocketService) {
    this.wsService = wsService;
  }

  /**
   * 推送仪表板数据更新
   */
  async pushDashboardUpdate(
    userId: string,
    widgetId: string,
    data: any
  ): Promise<boolean> {
    const payload: DashboardUpdatePayload = {
      widgetId,
      data,
      timestamp: Date.now(),
    };

    const message = createMessage<DashboardUpdatePayload>(
      'notification',
      payload as any,
      { userId }
    );

    return this.wsService.sendToUser(userId, message);
  }

  /**
   * 推送数据变化
   */
  async pushDataChange(
    userId: string,
    tableId: string,
    rowId: string,
    action: 'create' | 'update' | 'delete',
    data?: any
  ): Promise<boolean> {
    const payload: DataChangePayload = {
      tableId,
      rowId,
      action,
      data,
      timestamp: Date.now(),
    };

    const message = createMessage<DataChangePayload>(
      'notification',
      payload as any,
      { userId }
    );

    return this.wsService.sendToUser(userId, message);
  }

  /**
   * 推送审计日志
   */
  async pushAuditLog(
    userId: string,
    auditLog: AuditLogPayload
  ): Promise<boolean> {
    const message = createMessage<AuditLogPayload>(
      'notification',
      auditLog,
      { userId }
    );

    return this.wsService.sendToUser(userId, message);
  }

  /**
   * 广播通知
   */
  async broadcastNotification(
    title: string,
    body: string,
    excludeUserIds?: string[]
  ): Promise<number> {
    const message = createNotification(title, body);
    return this.wsService.broadcast(message, excludeUserIds);
  }

  /**
   * 推送给多个用户
   */
  async pushToUsers(
    userIds: string[],
    message: WebSocketMessage
  ): Promise<number> {
    let sentCount = 0;
    for (const userId of userIds) {
      const sent = await this.wsService.sendToUser(userId, message);
      if (sent) sentCount++;
    }
    return sentCount;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return this.wsService.getStats();
  }
}

/**
 * 创建推送服务
 */
export function createPushService(wsService: IWebSocketService): PushService {
  return new PushService(wsService);
}

// 全局推送服务实例
let pushServiceInstance: PushService | null = null;

/**
 * 获取推送服务实例
 */
export function getPushService(wsService?: IWebSocketService): PushService {
  if (!pushServiceInstance && wsService) {
    pushServiceInstance = createPushService(wsService);
  }
  if (!pushServiceInstance) {
    throw new Error('Push service not initialized. Please provide wsService.');
  }
  return pushServiceInstance;
}

/**
 * 重置推送服务实例
 */
export function resetPushService(): void {
  pushServiceInstance = null;
}

// 推送目标类型
export type PushTarget = string | string[];

// 推送结果类型
export interface PushResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
}
