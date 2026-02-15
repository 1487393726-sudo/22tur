/**
 * Push Service
 * 实时数据推送服务
 */
import { IWebSocketService, WebSocketMessage } from './types';
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
export declare class PushService {
    private wsService;
    constructor(wsService: IWebSocketService);
    /**
     * 推送仪表板数据更新
     */
    pushDashboardUpdate(userId: string, widgetId: string, data: any): Promise<boolean>;
    /**
     * 推送数据变化
     */
    pushDataChange(userId: string, tableId: string, rowId: string, action: 'create' | 'update' | 'delete', data?: any): Promise<boolean>;
    /**
     * 推送审计日志
     */
    pushAuditLog(userId: string, auditLog: AuditLogPayload): Promise<boolean>;
    /**
     * 广播通知
     */
    broadcastNotification(title: string, body: string, excludeUserIds?: string[]): Promise<number>;
    /**
     * 推送给多个用户
     */
    pushToUsers(userIds: string[], message: WebSocketMessage): Promise<number>;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalConnections: number;
        uniqueUsers: number;
        queueStats: import("./types").QueueStats;
    };
}
/**
 * 创建推送服务
 */
export declare function createPushService(wsService: IWebSocketService): PushService;
//# sourceMappingURL=push-service.d.ts.map