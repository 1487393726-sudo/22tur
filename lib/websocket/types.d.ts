/**
 * WebSocket Service Types
 * WebSocket 服务类型定义
 */
export type MessageType = 'notification' | 'message' | 'system' | 'heartbeat' | 'ack';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
export interface WebSocketMessage<T = unknown> {
    id: string;
    type: MessageType;
    payload: T;
    timestamp: number;
    userId?: string;
    targetUserId?: string;
}
export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    data?: Record<string, unknown>;
}
export interface SystemPayload {
    action: 'maintenance' | 'update' | 'broadcast' | 'kick';
    message: string;
    data?: Record<string, unknown>;
}
export interface HeartbeatPayload {
    clientTime: number;
    serverTime?: number;
}
export interface AckPayload {
    messageId: string;
    status: 'received' | 'read' | 'error';
    error?: string;
}
export interface ConnectionInfo {
    connectionId: string;
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    connectedAt: Date;
    lastHeartbeat: Date;
    tabId?: string;
}
export interface OfflineMessage {
    id: string;
    userId: string;
    message: WebSocketMessage;
    createdAt: Date;
    expiresAt: Date;
    delivered: boolean;
}
export interface WebSocketConfig {
    port?: number;
    path?: string;
    heartbeatInterval: number;
    heartbeatTimeout: number;
    reconnectEnabled: boolean;
    reconnectMaxAttempts: number;
    reconnectBaseDelay: number;
    reconnectMaxDelay: number;
    offlineMessageEnabled: boolean;
    offlineMessageMaxCount: number;
    offlineMessageTTL: number;
    authRequired: boolean;
    authTimeout: number;
}
export declare const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig;
export interface ConnectionEvents {
    onConnect: (connection: ConnectionInfo) => void;
    onDisconnect: (connectionId: string, reason?: string) => void;
    onMessage: (connectionId: string, message: WebSocketMessage) => void;
    onError: (connectionId: string, error: Error) => void;
    onHeartbeat: (connectionId: string) => void;
}
export interface QueueStats {
    pendingMessages: number;
    deliveredMessages: number;
    expiredMessages: number;
}
export interface IWebSocketService {
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
}
export interface IWebSocketClient {
    connect(url: string, token?: string): Promise<void>;
    disconnect(): void;
    reconnect(): Promise<void>;
    getStatus(): ConnectionStatus;
    isConnected(): boolean;
    send(message: WebSocketMessage): Promise<void>;
    onMessage(handler: (message: WebSocketMessage) => void): void;
    offMessage(handler: (message: WebSocketMessage) => void): void;
    onConnect(handler: () => void): void;
    onDisconnect(handler: (reason?: string) => void): void;
    onError(handler: (error: Error) => void): void;
    onReconnecting(handler: (attempt: number) => void): void;
}
export declare function generateMessageId(): string;
export declare function generateConnectionId(): string;
export declare function createMessage<T>(type: MessageType, payload: T, options?: {
    userId?: string;
    targetUserId?: string;
}): WebSocketMessage<T>;
export declare function createNotification(title: string, body: string, options?: Partial<NotificationPayload>): WebSocketMessage<NotificationPayload>;
export declare function createSystemMessage(action: SystemPayload['action'], message: string, data?: Record<string, unknown>): WebSocketMessage<SystemPayload>;
export declare function createHeartbeat(): WebSocketMessage<HeartbeatPayload>;
export declare function createAck(messageId: string, status: AckPayload['status'], error?: string): WebSocketMessage<AckPayload>;
export declare function calculateReconnectDelay(attempt: number, baseDelay: number, maxDelay: number): number;
export declare function validateReconnectSequence(attempts: number, baseDelay: number, maxDelay: number): number[];
//# sourceMappingURL=types.d.ts.map