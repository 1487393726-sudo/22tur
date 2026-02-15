/**
 * WebSocket service for real-time dashboard updates
 */

export type DashboardUpdateType = 'metric' | 'chart' | 'activity' | 'all';

export interface DashboardUpdate {
  type: DashboardUpdateType;
  data: any;
  timestamp: Date;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class DashboardWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<DashboardUpdateType, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private isIntentionallyClosed = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectInterval = config.reconnectInterval || 3000;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('Dashboard WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const update: DashboardUpdate = JSON.parse(event.data);
            this.handleUpdate(update);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        this.ws.onerror = (error: Event) => {
          console.error('Dashboard WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Dashboard WebSocket closed');
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to dashboard updates
   */
  subscribe(type: DashboardUpdateType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Send message to server
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Request specific data update
   */
  requestUpdate(type: DashboardUpdateType): void {
    this.send({
      action: 'request_update',
      type,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle incoming update
   */
  private handleUpdate(update: DashboardUpdate): void {
    // Notify all listeners for this type
    const callbacks = this.listeners.get(update.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update.data);
        } catch (err) {
          console.error('Error in dashboard update callback:', err);
        }
      });
    }

    // Also notify 'all' listeners
    if (update.type !== 'all') {
      const allCallbacks = this.listeners.get('all');
      if (allCallbacks) {
        allCallbacks.forEach(callback => {
          try {
            callback(update);
          } catch (err) {
            console.error('Error in dashboard update callback:', err);
          }
        });
      }
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      this.connect().catch(err => {
        console.error('Reconnection failed:', err);
      });
    }, this.reconnectInterval);
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let instance: DashboardWebSocketService | null = null;

export function getDashboardWebSocketService(
  config?: WebSocketConfig
): DashboardWebSocketService {
  if (!instance && config) {
    instance = new DashboardWebSocketService(config);
  }
  return instance!;
}
