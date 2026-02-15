"use strict";
/**
 * WebSocket Server
 * WebSocket 服务器实现
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
exports.getWebSocketServer = getWebSocketServer;
exports.resetWebSocketServer = resetWebSocketServer;
const types_1 = require("./types");
/**
 * 内存存储（用于开发环境）
 */
class InMemoryStore {
    constructor() {
        this.connections = new Map();
        this.userConnections = new Map();
        this.offlineMessages = new Map();
        this.deliveredCount = 0;
        this.expiredCount = 0;
    }
    // 连接管理
    addConnection(connection) {
        this.connections.set(connection.connectionId, connection);
        if (!this.userConnections.has(connection.userId)) {
            this.userConnections.set(connection.userId, new Set());
        }
        this.userConnections.get(connection.userId).add(connection.connectionId);
    }
    removeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            this.connections.delete(connectionId);
            const userConns = this.userConnections.get(connection.userId);
            if (userConns) {
                userConns.delete(connectionId);
                if (userConns.size === 0) {
                    this.userConnections.delete(connection.userId);
                }
            }
        }
        return connection;
    }
    getConnection(connectionId) {
        return this.connections.get(connectionId);
    }
    getConnectionsByUserId(userId) {
        const connectionIds = this.userConnections.get(userId);
        if (!connectionIds)
            return [];
        return Array.from(connectionIds)
            .map(id => this.connections.get(id))
            .filter((conn) => conn !== undefined);
    }
    getAllConnections() {
        return Array.from(this.connections.values());
    }
    updateHeartbeat(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.lastHeartbeat = new Date();
        }
    }
    // 离线消息管理
    addOfflineMessage(userId, message) {
        if (!this.offlineMessages.has(userId)) {
            this.offlineMessages.set(userId, []);
        }
        const messages = this.offlineMessages.get(userId);
        messages.push(message);
    }
    getOfflineMessages(userId) {
        return this.offlineMessages.get(userId) || [];
    }
    clearOfflineMessages(userId) {
        const messages = this.offlineMessages.get(userId) || [];
        this.deliveredCount += messages.filter(m => m.delivered).length;
        this.offlineMessages.delete(userId);
    }
    removeExpiredMessages() {
        const now = Date.now();
        let removed = 0;
        for (const [userId, messages] of this.offlineMessages.entries()) {
            const validMessages = messages.filter(m => {
                if (m.expiresAt.getTime() < now) {
                    removed++;
                    return false;
                }
                return true;
            });
            if (validMessages.length === 0) {
                this.offlineMessages.delete(userId);
            }
            else {
                this.offlineMessages.set(userId, validMessages);
            }
        }
        this.expiredCount += removed;
        return removed;
    }
    enforceMessageLimit(userId, maxCount) {
        const messages = this.offlineMessages.get(userId);
        if (!messages || messages.length <= maxCount)
            return 0;
        const removed = messages.length - maxCount;
        this.offlineMessages.set(userId, messages.slice(-maxCount));
        this.expiredCount += removed;
        return removed;
    }
    // 统计
    getStats() {
        let pendingMessages = 0;
        for (const messages of this.offlineMessages.values()) {
            pendingMessages += messages.length;
        }
        return {
            connections: this.connections.size,
            users: this.userConnections.size,
            queueStats: {
                pendingMessages,
                deliveredMessages: this.deliveredCount,
                expiredMessages: this.expiredCount,
            },
        };
    }
}
/**
 * WebSocket 服务器实现
 */
class WebSocketServer {
    constructor(config = {}) {
        this.messageHandlers = new Map();
        this.heartbeatInterval = null;
        this.cleanupInterval = null;
        this.config = { ...types_1.DEFAULT_WEBSOCKET_CONFIG, ...config };
        this.store = new InMemoryStore();
    }
    /**
     * 启动服务器
     */
    start() {
        // 启动心跳检测
        this.startHeartbeatCheck();
        // 启动过期消息清理
        this.startCleanup();
        console.log(`WebSocket server started on port ${this.config.port}`);
    }
    /**
     * 停止服务器
     */
    stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        console.log('WebSocket server stopped');
    }
    /**
     * 处理新连接
     */
    handleConnection(userId, options) {
        const connection = {
            connectionId: (0, types_1.generateConnectionId)(),
            userId,
            userAgent: options?.userAgent,
            ipAddress: options?.ipAddress,
            tabId: options?.tabId,
            connectedAt: new Date(),
            lastHeartbeat: new Date(),
        };
        this.store.addConnection(connection);
        // 发送离线消息
        if (this.config.offlineMessageEnabled) {
            this.deliverOfflineMessages(userId, connection.connectionId);
        }
        console.log(`User ${userId} connected: ${connection.connectionId}`);
        return connection;
    }
    /**
     * 处理断开连接
     */
    handleDisconnection(connectionId, reason) {
        const connection = this.store.removeConnection(connectionId);
        if (connection) {
            console.log(`User ${connection.userId} disconnected: ${connectionId}, reason: ${reason || 'unknown'}`);
        }
    }
    /**
     * 处理收到的消息
     */
    handleMessage(connectionId, message) {
        const connection = this.store.getConnection(connectionId);
        if (!connection)
            return;
        // 处理心跳
        if (message.type === 'heartbeat') {
            this.store.updateHeartbeat(connectionId);
            // 发送心跳响应
            const response = (0, types_1.createHeartbeat)();
            response.payload.serverTime = Date.now();
            this.sendToConnection(connectionId, response);
            return;
        }
        // 处理确认
        if (message.type === 'ack') {
            // 可以在这里处理消息确认逻辑
            return;
        }
        // 调用注册的消息处理器
        for (const handler of this.messageHandlers.values()) {
            handler(connectionId, message);
        }
    }
    /**
     * 注册消息处理器
     */
    registerMessageHandler(id, handler) {
        this.messageHandlers.set(id, handler);
    }
    /**
     * 移除消息处理器
     */
    unregisterMessageHandler(id) {
        this.messageHandlers.delete(id);
    }
    // IWebSocketService 实现
    getConnection(connectionId) {
        return this.store.getConnection(connectionId);
    }
    getConnectionsByUserId(userId) {
        return this.store.getConnectionsByUserId(userId);
    }
    getAllConnections() {
        return this.store.getAllConnections();
    }
    async disconnectUser(userId, reason) {
        const connections = this.store.getConnectionsByUserId(userId);
        for (const conn of connections) {
            await this.disconnectConnection(conn.connectionId, reason);
        }
    }
    async disconnectConnection(connectionId, reason) {
        this.handleDisconnection(connectionId, reason);
    }
    async sendToUser(userId, message) {
        const connections = this.store.getConnectionsByUserId(userId);
        if (connections.length === 0) {
            // 用户离线，存储离线消息
            if (this.config.offlineMessageEnabled) {
                await this.queueOfflineMessage(userId, message);
            }
            return false;
        }
        // 发送到所有连接（多标签页支持）
        let sent = false;
        for (const conn of connections) {
            const result = await this.sendToConnection(conn.connectionId, message);
            if (result)
                sent = true;
        }
        return sent;
    }
    async sendToConnection(connectionId, message) {
        const connection = this.store.getConnection(connectionId);
        if (!connection)
            return false;
        // 在实际实现中，这里会通过 WebSocket 发送消息
        // 这里只是模拟
        console.log(`Sending message to ${connectionId}:`, message.type);
        return true;
    }
    async broadcast(message, excludeUserIds) {
        const connections = this.store.getAllConnections();
        let sentCount = 0;
        for (const conn of connections) {
            if (excludeUserIds?.includes(conn.userId))
                continue;
            const sent = await this.sendToConnection(conn.connectionId, message);
            if (sent)
                sentCount++;
        }
        return sentCount;
    }
    async queueOfflineMessage(userId, message) {
        const offlineMessage = {
            id: message.id,
            userId,
            message,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.config.offlineMessageTTL),
            delivered: false,
        };
        this.store.addOfflineMessage(userId, offlineMessage);
        // 强制执行消息数量限制
        this.store.enforceMessageLimit(userId, this.config.offlineMessageMaxCount);
    }
    async getOfflineMessages(userId) {
        return this.store.getOfflineMessages(userId);
    }
    async clearOfflineMessages(userId) {
        this.store.clearOfflineMessages(userId);
    }
    getStats() {
        const stats = this.store.getStats();
        return {
            totalConnections: stats.connections,
            uniqueUsers: stats.users,
            queueStats: stats.queueStats,
        };
    }
    // 私有方法
    startHeartbeatCheck() {
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            const timeout = this.config.heartbeatTimeout;
            for (const conn of this.store.getAllConnections()) {
                const lastHeartbeat = conn.lastHeartbeat.getTime();
                if (now - lastHeartbeat > timeout) {
                    console.log(`Connection ${conn.connectionId} timed out`);
                    this.handleDisconnection(conn.connectionId, 'heartbeat_timeout');
                }
            }
        }, this.config.heartbeatInterval);
    }
    startCleanup() {
        // 每分钟清理过期消息
        this.cleanupInterval = setInterval(() => {
            const removed = this.store.removeExpiredMessages();
            if (removed > 0) {
                console.log(`Cleaned up ${removed} expired offline messages`);
            }
        }, 60000);
    }
    async deliverOfflineMessages(userId, connectionId) {
        const messages = await this.getOfflineMessages(userId);
        for (const offlineMsg of messages) {
            if (!offlineMsg.delivered) {
                const sent = await this.sendToConnection(connectionId, offlineMsg.message);
                if (sent) {
                    offlineMsg.delivered = true;
                }
            }
        }
        // 清理已投递的消息
        await this.clearOfflineMessages(userId);
    }
}
exports.WebSocketServer = WebSocketServer;
// 单例
let serverInstance = null;
function getWebSocketServer(config) {
    if (!serverInstance) {
        serverInstance = new WebSocketServer(config);
    }
    return serverInstance;
}
function resetWebSocketServer() {
    if (serverInstance) {
        serverInstance.stop();
    }
    serverInstance = null;
}
//# sourceMappingURL=websocket-server.js.map