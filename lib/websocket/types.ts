/**
 * WebSocket Service Types
 * WebSocket 服务类型定义
 */

// 消息类型
export type MessageType = 'notification' | 'message' | 'system' | 'heartbeat' | 'ack';

// 连接状态
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

// WebSocket 消息
export interface WebSocketMessage<T = unknown> {
  id: string;
  type: MessageType;
  payload: T;
  timestamp: number;
  userId?: string;
  targetUserId?: string;
}

// 通知消息载荷
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  data?: Record<string, unknown>;
}

// 系统消息载荷
export interface SystemPayload {
  action: 'maintenance' | 'update' | 'broadcast' | 'kick';
  message: string;
  data?: Record<string, unknown>;
}

// 心跳消息载荷
export interface HeartbeatPayload {
  clientTime: number;
  serverTime?: number;
}

// 确认消息载荷
export interface AckPayload {
  messageId: string;
  status: 'received' | 'read' | 'error';
  error?: string;
}

// 连接信息
export interface ConnectionInfo {
  connectionId: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  tabId?: string;
}

// 离线消息
export interface OfflineMessage {
  id: string;
  userId: string;
  message: WebSocketMessage;
  createdAt: Date;
  expiresAt: Date;
  delivered: boolean;
}

// WebSocket 配置
export interface WebSocketConfig {
  // 服务器配置
  port?: number;
  path?: string;
  
  // 心跳配置
  heartbeatInterval: number;      // 心跳间隔（毫秒）
  heartbeatTimeout: number;       // 心跳超时（毫秒）
  
  // 重连配置
  reconnectEnabled: boolean;
  reconnectMaxAttempts: number;
  reconnectBaseDelay: number;     // 基础延迟（毫秒）
  reconnectMaxDelay: number;      // 最大延迟（毫秒）
  
  // 离线消息配置
  offlineMessageEnabled: boolean;
  offlineMessageMaxCount: number;
  offlineMessageTTL: number;      // 过期时间（毫秒）
  
  // 认证配置
  authRequired: boolean;
  authTimeout: number;            // 认证超时（毫秒）
}

// 默认配置
export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  port: 3001,
  path: '/ws',
  heartbeatInterval: 30000,       // 30 秒
  heartbeatTimeout: 10000,        // 10 秒
  reconnectEnabled: true,
  reconnectMaxAttempts: 10,
  reconnectBaseDelay: 1000,       // 1 秒
  reconnectMaxDelay: 30000,       // 30 秒
  offlineMessageEnabled: true,
  offlineMessageMaxCount: 100,
  offlineMessageTTL: 24 * 60 * 60 * 1000, // 24 小时
  authRequired: true,
  authTimeout: 10000,             // 10 秒
};

// 连接事件
export interface ConnectionEvents {
  onConnect: (connection: ConnectionInfo) => void;
  onDisconnect: (connectionId: string, reason?: string) => void;
  onMessage: (connectionId: string, message: WebSocketMessage) => void;
  onError: (connectionId: string, error: Error) => void;
  onHeartbeat: (connectionId: string) => void;
}

// 队列统计
export interface QueueStats {
  pendingMessages: number;
  deliveredMessages: number;
  expiredMessages: number;
}

// WebSocket 服务接口
export interface IWebSocketService {
  // 连接管理
  getConnection(connectionId: string): ConnectionInfo | undefined;
  getConnectionsByUserId(userId: string): ConnectionInfo[];
  getAllConnections(): ConnectionInfo[];
  disconnectUser(userId: string, reason?: string): Promise<void>;
  disconnectConnection(connectionId: string, reason?: string): Promise<void>;
  
  // 消息发送
  sendToUser(userId: string, message: WebSocketMessage): Promise<boolean>;
  sendToConnection(connectionId: string, message: WebSocketMessage): Promise<boolean>;
  broadcast(message: WebSocketMessage, excludeUserIds?: string[]): Promise<number>;
  
  // 离线消息
  queueOfflineMessage(userId: string, message: WebSocketMessage): Promise<void>;
  getOfflineMessages(userId: string): Promise<OfflineMessage[]>;
  clearOfflineMessages(userId: string): Promise<void>;
  
  // 统计
  getStats(): {
    totalConnections: number;
    uniqueUsers: number;
    queueStats: QueueStats;
  };
}

// WebSocket 客户端接口
export interface IWebSocketClient {
  // 连接管理
  connect(url: string, token?: string): Promise<void>;
  disconnect(): void;
  reconnect(): Promise<void>;
  
  // 状态
  getStatus(): ConnectionStatus;
  isConnected(): boolean;
  
  // 消息
  send(message: WebSocketMessage): Promise<void>;
  onMessage(handler: (message: WebSocketMessage) => void): void;
  offMessage(handler: (message: WebSocketMessage) => void): void;
  
  // 事件
  onConnect(handler: () => void): void;
  onDisconnect(handler: (reason?: string) => void): void;
  onError(handler: (error: Error) => void): void;
  onReconnecting(handler: (attempt: number) => void): void;
}

// 生成消息 ID
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// 生成连接 ID
export function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// 创建消息
export function createMessage<T>(
  type: MessageType,
  payload: T,
  options?: {
    userId?: string;
    targetUserId?: string;
  }
): WebSocketMessage<T> {
  return {
    id: generateMessageId(),
    type,
    payload,
    timestamp: Date.now(),
    userId: options?.userId,
    targetUserId: options?.targetUserId,
  };
}

// 创建通知消息
export function createNotification(
  title: string,
  body: string,
  options?: Partial<NotificationPayload>
): WebSocketMessage<NotificationPayload> {
  return createMessage('notification', {
    title,
    body,
    ...options,
  });
}

// 创建系统消息
export function createSystemMessage(
  action: SystemPayload['action'],
  message: string,
  data?: Record<string, unknown>
): WebSocketMessage<SystemPayload> {
  return createMessage('system', {
    action,
    message,
    data,
  });
}

// 创建心跳消息
export function createHeartbeat(): WebSocketMessage<HeartbeatPayload> {
  return createMessage('heartbeat', {
    clientTime: Date.now(),
  });
}

// 创建确认消息
export function createAck(
  messageId: string,
  status: AckPayload['status'],
  error?: string
): WebSocketMessage<AckPayload> {
  return createMessage('ack', {
    messageId,
    status,
    error,
  });
}

// 计算重连延迟（指数退避）
export function calculateReconnectDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  // 指数退避: delay = baseDelay * 2^attempt
  const delay = baseDelay * Math.pow(2, attempt);
  // 添加随机抖动 (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, maxDelay);
}

// 验证重连延迟序列
export function validateReconnectSequence(
  attempts: number,
  baseDelay: number,
  maxDelay: number
): number[] {
  const delays: number[] = [];
  for (let i = 0; i < attempts; i++) {
    const expectedDelay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
    delays.push(expectedDelay);
  }
  return delays;
}
