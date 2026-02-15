"use strict";
/**
 * WebSocket Service Types
 * WebSocket 服务类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_WEBSOCKET_CONFIG = void 0;
exports.generateMessageId = generateMessageId;
exports.generateConnectionId = generateConnectionId;
exports.createMessage = createMessage;
exports.createNotification = createNotification;
exports.createSystemMessage = createSystemMessage;
exports.createHeartbeat = createHeartbeat;
exports.createAck = createAck;
exports.calculateReconnectDelay = calculateReconnectDelay;
exports.validateReconnectSequence = validateReconnectSequence;
// 默认配置
exports.DEFAULT_WEBSOCKET_CONFIG = {
    port: 3001,
    path: '/ws',
    heartbeatInterval: 30000, // 30 秒
    heartbeatTimeout: 10000, // 10 秒
    reconnectEnabled: true,
    reconnectMaxAttempts: 10,
    reconnectBaseDelay: 1000, // 1 秒
    reconnectMaxDelay: 30000, // 30 秒
    offlineMessageEnabled: true,
    offlineMessageMaxCount: 100,
    offlineMessageTTL: 24 * 60 * 60 * 1000, // 24 小时
    authRequired: true,
    authTimeout: 10000, // 10 秒
};
// 生成消息 ID
function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
// 生成连接 ID
function generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
// 创建消息
function createMessage(type, payload, options) {
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
function createNotification(title, body, options) {
    return createMessage('notification', {
        title,
        body,
        ...options,
    });
}
// 创建系统消息
function createSystemMessage(action, message, data) {
    return createMessage('system', {
        action,
        message,
        data,
    });
}
// 创建心跳消息
function createHeartbeat() {
    return createMessage('heartbeat', {
        clientTime: Date.now(),
    });
}
// 创建确认消息
function createAck(messageId, status, error) {
    return createMessage('ack', {
        messageId,
        status,
        error,
    });
}
// 计算重连延迟（指数退避）
function calculateReconnectDelay(attempt, baseDelay, maxDelay) {
    // 指数退避: delay = baseDelay * 2^attempt
    const delay = baseDelay * Math.pow(2, attempt);
    // 添加随机抖动 (±10%)
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);
    return Math.min(delay + jitter, maxDelay);
}
// 验证重连延迟序列
function validateReconnectSequence(attempts, baseDelay, maxDelay) {
    const delays = [];
    for (let i = 0; i < attempts; i++) {
        const expectedDelay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
        delays.push(expectedDelay);
    }
    return delays;
}
//# sourceMappingURL=types.js.map