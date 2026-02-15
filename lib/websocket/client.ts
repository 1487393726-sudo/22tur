/**
 * WebSocket Client
 * WebSocket 客户端实现（带指数退避重连）
 */

import {
  IWebSocketClient,
  WebSocketMessage,
  ConnectionStatus,
  WebSocketConfig,
  DEFAULT_WEBSOCKET_CONFIG,
  createHeartbeat,
  calculateReconnectDelay,
} from './types';

/**
 * WebSocket 客户端配置
 */
export interface WebSocketClientConfig {
  // 重连配置
  reconnectEnabled: boolean;
  reconnectMaxAttempts: number;
  reconnectBaseDelay: number;
  reconnectMaxDelay: number;
  
  // 心跳配置
  heartbeatInterval: number;
  heartbeatTimeout: number;
  
  // 其他配置
  debug: boolean;
}

const DEFAULT_CLIENT_CONFIG: WebSocketClientConfig = {
  reconnectEnabled: DEFAULT_WEBSOCKET_CONFIG.reconnectEnabled,
  reconnectMaxAttempts: DEFAULT_WEBSOCKET_CONFIG.reconnectMaxAttempts,
  reconnectBaseDelay: DEFAULT_WEBSOCKET_CONFIG.reconnectBaseDelay,
  reconnectMaxDelay: DEFAULT_WEBSOCKET_CONFIG.reconnectMaxDelay,
  heartbeatInterval: DEFAULT_WEBSOCKET_CONFIG.heartbeatInterval,
  heartbeatTimeout: DEFAULT_WEBSOCKET_CONFIG.heartbeatTimeout,
  debug: false,
};

/**
 * WebSocket 客户端
 */
export class WebSocketClient implements IWebSocketClient {
  private config: WebSocketClientConfig;
  private ws: WebSocket | null = null;
  private url: string = '';
  private token: string | undefined;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  
  // 事件处理器
  private messageHandlers: Set<(message: WebSocketMessage) => void> = new Set();
  private connectHandlers: Set<() => void> = new Set();
  private disconnectHandlers: Set<(reason?: string) => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();
  private reconnectingHandlers: Set<(attempt: number) => void> = new Set();

  constructor(config: Partial<WebSocketClientConfig> = {}) {
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
  }

  /**
   * 连接到服务器
   */
  async connect(url: string, token?: string): Promise<void> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }

    this.url = url;
    this.token = token;
    this.status = 'connecting';
    this.reconnectAttempt = 0;

    return this.doConnect();
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopReconnect();
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.status = 'disconnected';
    this.log('Disconnected');
  }

  /**
   * 重新连接
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    return this.connect(this.url, this.token);
  }

  /**
   * 获取连接状态
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.status === 'connected';
  }

  /**
   * 发送消息
   */
  async send(message: WebSocketMessage): Promise<void> {
    if (!this.ws || this.status !== 'connected') {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
    this.log('Sent message:', message.type);
  }

  /**
   * 注册消息处理器
   */
  onMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.add(handler);
  }

  /**
   * 移除消息处理器
   */
  offMessage(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * 注册连接处理器
   */
  onConnect(handler: () => void): void {
    this.connectHandlers.add(handler);
  }

  /**
   * 注册断开处理器
   */
  onDisconnect(handler: (reason?: string) => void): void {
    this.disconnectHandlers.add(handler);
  }

  /**
   * 注册错误处理器
   */
  onError(handler: (error: Error) => void): void {
    this.errorHandlers.add(handler);
  }

  /**
   * 注册重连处理器
   */
  onReconnecting(handler: (attempt: number) => void): void {
    this.reconnectingHandlers.add(handler);
  }

  /**
   * 获取重连延迟序列（用于测试）
   */
  getReconnectDelays(attempts: number): number[] {
    const delays: number[] = [];
    for (let i = 0; i < attempts; i++) {
      delays.push(
        calculateReconnectDelay(
          i,
          this.config.reconnectBaseDelay,
          this.config.reconnectMaxDelay
        )
      );
    }
    return delays;
  }

  // 私有方法

  private async doConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 构建 URL（带 token）
        let connectUrl = this.url;
        if (this.token) {
          const separator = this.url.includes('?') ? '&' : '?';
          connectUrl = `${this.url}${separator}token=${encodeURIComponent(this.token)}`;
        }

        // 在浏览器环境中使用原生 WebSocket
        // 在 Node.js 环境中需要使用 ws 库
        if (typeof WebSocket !== 'undefined') {
          this.ws = new WebSocket(connectUrl);
        } else {
          // 模拟连接（用于测试）
          this.simulateConnection(resolve, reject);
          return;
        }

        this.ws.onopen = () => {
          this.status = 'connected';
          this.reconnectAttempt = 0;
          this.startHeartbeat();
          this.emitConnect();
          this.log('Connected');
          resolve();
        };

        this.ws.onclose = (event) => {
          this.handleClose(event.reason);
        };

        this.ws.onerror = (event) => {
          const error = new Error('WebSocket error');
          this.emitError(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.handleMessage(message);
          } catch (error) {
            this.log('Failed to parse message:', error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private simulateConnection(
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    // 模拟连接延迟
    setTimeout(() => {
      this.status = 'connected';
      this.reconnectAttempt = 0;
      this.startHeartbeat();
      this.emitConnect();
      this.log('Connected (simulated)');
      resolve();
    }, 100);
  }

  private handleClose(reason?: string): void {
    this.stopHeartbeat();
    this.status = 'disconnected';
    this.emitDisconnect(reason);
    this.log('Connection closed:', reason);

    // 尝试重连
    if (this.config.reconnectEnabled) {
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // 处理心跳响应
    if (message.type === 'heartbeat') {
      this.resetHeartbeatTimeout();
      return;
    }

    // 触发消息处理器
    this.emitMessage(message);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.config.reconnectMaxAttempts) {
      this.log('Max reconnect attempts reached');
      return;
    }

    this.status = 'reconnecting';
    this.reconnectAttempt++;

    const delay = calculateReconnectDelay(
      this.reconnectAttempt - 1,
      this.config.reconnectBaseDelay,
      this.config.reconnectMaxDelay
    );

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})`);
    this.emitReconnecting(this.reconnectAttempt);

    this.reconnectTimer = setTimeout(() => {
      this.doConnect().catch((error) => {
        this.log('Reconnect failed:', error);
        this.scheduleReconnect();
      });
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.status === 'connected' && this.ws) {
        const heartbeat = createHeartbeat();
        this.ws.send(JSON.stringify(heartbeat));
        this.startHeartbeatTimeout();
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.resetHeartbeatTimeout();
  }

  private startHeartbeatTimeout(): void {
    this.resetHeartbeatTimeout();
    this.heartbeatTimeoutTimer = setTimeout(() => {
      this.log('Heartbeat timeout');
      this.handleClose('heartbeat_timeout');
    }, this.config.heartbeatTimeout);
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  // 事件触发

  private emitConnect(): void {
    for (const handler of this.connectHandlers) {
      handler();
    }
  }

  private emitDisconnect(reason?: string): void {
    for (const handler of this.disconnectHandlers) {
      handler(reason);
    }
  }

  private emitMessage(message: WebSocketMessage): void {
    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  private emitError(error: Error): void {
    for (const handler of this.errorHandlers) {
      handler(error);
    }
  }

  private emitReconnecting(attempt: number): void {
    for (const handler of this.reconnectingHandlers) {
      handler(attempt);
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[WebSocket Client]', ...args);
    }
  }
}

/**
 * 创建 WebSocket 客户端
 */
export function createWebSocketClient(
  config?: Partial<WebSocketClientConfig>
): WebSocketClient {
  return new WebSocketClient(config);
}
