"use strict";
/**
 * Push Service
 * 实时数据推送服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
exports.createPushService = createPushService;
const types_1 = require("./types");
/**
 * 推送服务
 */
class PushService {
    constructor(wsService) {
        this.wsService = wsService;
    }
    /**
     * 推送仪表板数据更新
     */
    async pushDashboardUpdate(userId, widgetId, data) {
        const payload = {
            widgetId,
            data,
            timestamp: Date.now(),
        };
        const message = (0, types_1.createMessage)('notification', payload, { userId });
        return this.wsService.sendToUser(userId, message);
    }
    /**
     * 推送数据变化
     */
    async pushDataChange(userId, tableId, rowId, action, data) {
        const payload = {
            tableId,
            rowId,
            action,
            data,
            timestamp: Date.now(),
        };
        const message = (0, types_1.createMessage)('notification', payload, { userId });
        return this.wsService.sendToUser(userId, message);
    }
    /**
     * 推送审计日志
     */
    async pushAuditLog(userId, auditLog) {
        const message = (0, types_1.createMessage)('notification', auditLog, { userId });
        return this.wsService.sendToUser(userId, message);
    }
    /**
     * 广播通知
     */
    async broadcastNotification(title, body, excludeUserIds) {
        const message = (0, types_1.createNotification)(title, body);
        return this.wsService.broadcast(message, excludeUserIds);
    }
    /**
     * 推送给多个用户
     */
    async pushToUsers(userIds, message) {
        let sentCount = 0;
        for (const userId of userIds) {
            const sent = await this.wsService.sendToUser(userId, message);
            if (sent)
                sentCount++;
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
exports.PushService = PushService;
/**
 * 创建推送服务
 */
function createPushService(wsService) {
    return new PushService(wsService);
}
//# sourceMappingURL=push-service.js.map