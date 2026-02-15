/**
 * WebSocket Server
 * WebSocket 服务器实现
 */
import { IWebSocketService, WebSocketConfig, WebSocketMessage, ConnectionInfo, OfflineMessage, QueueStats } from './types';
/**
 * WebSocket 服务器实现
 */
export declare class WebSocketServer implements IWebSocketService {
    private config;
    private store;
    private messageHandlers;
    private heartbeatInterval;
    private cleanupInterval;
    constructor(config?: Partial<WebSocketConfig>);
    /**
     * 启动服务器
     */
    start(): void;
    /**
     * 停止服务器
     */
    stop(): void;
    /**
     * 处理新连接
     */
    handleConnection(userId: string, options?: {
        userAgent?: string;
        ipAddress?: string;
        tabId?: string;
    }): ConnectionInfo;
    /**
     * 处理断开连接
     */
    handleDisconnection(connectionId: string, reason?: string): void;
    /**
     * 处理收到的消息
     */
    handleMessage(connectionId: string, message: WebSocketMessage): void;
    /**
     * 注册消息处理器
     */
    registerMessageHandler(id: string, handler: (connectionId: string, message: WebSocketMessage) => void): void;
    /**
     * 移除消息处理器
     */
    unregisterMessageHandler(id: string): void;
    getConnection(connectionId: string): ConnectionInfo | undefined;
    getConnectionsByUserId(userId: string): ConnectionInfo[];
    getAllConnections(): ConnectionInfo[];
    disconnectUser(userId: string, reason?: string): Promise<void>;
    disconnectConnection(connectionId: string, reason?: string): Promise<void>;
    sendToUser(userId: string, message: WebSocketMessage): Promise<boolean>;
    sendToConnection(connectionId: string, message: WebSocketMessage): Promise<boolean>;
    broadcast(message: WebSocketMessage, excludeUserIds?: string[]): Promise<number>;
    queueOfflineMessage(userId: string, message: WebSocketMessage): Promise<void>;
    getOfflineMessages(userId: string): Promise<OfflineMessage[]>;
    clearOfflineMessages(userId: string): Promise<void>;
    getStats(): {
        totalConnections: number;
        uniqueUsers: number;
        queueStats: QueueStats;
    };
    private startHeartbeatCheck;
    private startCleanup;
    private deliverOfflineMessages;
}
export declare function getWebSocketServer(config?: Partial<WebSocketConfig>): WebSocketServer;
export declare function resetWebSocketServer(): void;
//# sourceMappingURL=websocket-server.d.ts.map