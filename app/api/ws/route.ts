/**
 * WebSocket API Endpoint
 * WebSocket API 端点
 * 
 * 注意：Next.js App Router 不直接支持 WebSocket 升级。
 * 此端点提供 WebSocket 连接信息和管理功能。
 * 实际的 WebSocket 连接需要通过独立的 WebSocket 服务器处理。
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getWebSocketServer,
  getPushService,
} from '@/lib/websocket';

// 获取 WebSocket 服务实例
const wsServer = getWebSocketServer();
const pushService = getPushService(wsServer);

/**
 * GET /api/ws
 * 获取 WebSocket 连接信息和状态
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 获取连接信息
    if (action === 'info') {
      const wsUrl = process.env.WEBSOCKET_URL || `ws://${request.headers.get('host')}/ws`;
      const wsPort = process.env.WEBSOCKET_PORT || '3001';
      
      return NextResponse.json({
        success: true,
        data: {
          url: wsUrl,
          port: parseInt(wsPort),
          path: '/ws',
          protocols: ['v1'],
          authRequired: true,
        },
      });
    }

    // 获取用户的连接状态
    if (action === 'status') {
      const userId = session.user.id;
      const connections = wsServer.getConnectionsByUserId(userId);
      const offlineMessages = await wsServer.getOfflineMessages(userId);

      return NextResponse.json({
        success: true,
        data: {
          userId,
          isOnline: connections.length > 0,
          connectionCount: connections.length,
          connections: connections.map(conn => ({
            connectionId: conn.connectionId,
            connectedAt: conn.connectedAt,
            lastHeartbeat: conn.lastHeartbeat,
            tabId: conn.tabId,
          })),
          pendingMessages: offlineMessages.length,
        },
      });
    }

    // 获取离线消息
    if (action === 'offline-messages') {
      const userId = session.user.id;
      const messages = await wsServer.getOfflineMessages(userId);

      return NextResponse.json({
        success: true,
        data: {
          messages: messages.map(msg => ({
            id: msg.id,
            type: msg.message.type,
            payload: msg.message.payload,
            createdAt: msg.createdAt,
            expiresAt: msg.expiresAt,
          })),
          total: messages.length,
        },
      });
    }

    // 管理员：获取服务器统计
    if (action === 'stats') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      const stats = wsServer.getStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // 管理员：获取所有连接
    if (action === 'connections') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      const connections = wsServer.getAllConnections();
      return NextResponse.json({
        success: true,
        data: {
          connections: connections.map(conn => ({
            connectionId: conn.connectionId,
            userId: conn.userId,
            connectedAt: conn.connectedAt,
            lastHeartbeat: conn.lastHeartbeat,
            userAgent: conn.userAgent,
            ipAddress: conn.ipAddress,
            tabId: conn.tabId,
          })),
          total: connections.length,
        },
      });
    }

    // 默认返回基本信息
    return NextResponse.json({
      success: true,
      data: {
        service: 'websocket',
        version: '1.0.0',
        status: 'running',
      },
    });
  } catch (error) {
    console.error('WebSocket API GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


/**
 * POST /api/ws
 * 发送消息或执行 WebSocket 操作
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, targetUserId, targetUserIds, message, title, content, data } = body;

    // 发送通知给指定用户
    if (action === 'notify') {
      if (!targetUserId || !title) {
        return NextResponse.json(
          { error: 'Missing required fields: targetUserId, title' },
          { status: 400 }
        );
      }

      // 只有管理员可以发送通知给其他用户
      if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Cannot send notifications to other users' },
          { status: 403 }
        );
      }

      const result = await pushService.sendNotification(
        { type: 'user', userId: targetUserId },
        title,
        content || '',
        { data }
      );

      return NextResponse.json({
        success: result.success,
        data: {
          sentCount: result.sentCount,
          offlineCount: result.offlineCount,
        },
      });
    }

    // 管理员：广播消息
    if (action === 'broadcast') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      if (!title) {
        return NextResponse.json(
          { error: 'Missing required field: title' },
          { status: 400 }
        );
      }

      const result = await pushService.sendSystemMessage(
        { type: 'all' },
        'broadcast',
        content || title,
        data
      );

      return NextResponse.json({
        success: true,
        data: {
          sentCount: result.sentCount,
        },
        message: 'Broadcast sent successfully',
      });
    }

    // 管理员：发送系统消息给多个用户
    if (action === 'multicast') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) {
        return NextResponse.json(
          { error: 'targetUserIds array is required' },
          { status: 400 }
        );
      }

      if (!title) {
        return NextResponse.json(
          { error: 'Missing required field: title' },
          { status: 400 }
        );
      }

      let sentCount = 0;
      let offlineCount = 0;

      for (const userId of targetUserIds) {
        const result = await pushService.sendNotification(
          { type: 'user', userId },
          title,
          content || '',
          { data }
        );
        sentCount += result.sentCount;
        offlineCount += result.offlineCount;
      }

      return NextResponse.json({
        success: true,
        data: {
          targetCount: targetUserIds.length,
          sentCount,
          offlineCount,
        },
      });
    }

    // 管理员：踢出用户
    if (action === 'kick') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      if (!targetUserId) {
        return NextResponse.json(
          { error: 'targetUserId is required' },
          { status: 400 }
        );
      }

      await pushService.kickUser(targetUserId, message || 'Kicked by administrator');

      return NextResponse.json({
        success: true,
        message: `User ${targetUserId} has been disconnected`,
      });
    }

    // 清除离线消息
    if (action === 'clear-offline') {
      const userId = targetUserId || session.user.id;
      
      // 只有管理员可以清除其他用户的离线消息
      if (userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Cannot clear offline messages for other users' },
          { status: 403 }
        );
      }

      await wsServer.clearOfflineMessages(userId);

      return NextResponse.json({
        success: true,
        message: 'Offline messages cleared',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('WebSocket API POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


/**
 * DELETE /api/ws
 * 断开连接或清理资源
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const userId = searchParams.get('userId');

    // 断开指定连接
    if (connectionId) {
      const connection = wsServer.getConnection(connectionId);
      
      if (!connection) {
        return NextResponse.json(
          { error: 'Connection not found' },
          { status: 404 }
        );
      }

      // 只有管理员或连接所有者可以断开连接
      if (connection.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Cannot disconnect this connection' },
          { status: 403 }
        );
      }

      await wsServer.disconnectConnection(connectionId, 'Disconnected via API');

      return NextResponse.json({
        success: true,
        message: 'Connection disconnected',
      });
    }

    // 断开用户的所有连接
    if (userId) {
      // 只有管理员可以断开其他用户的连接
      if (userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Cannot disconnect other users' },
          { status: 403 }
        );
      }

      const connections = wsServer.getConnectionsByUserId(userId);
      await wsServer.disconnectUser(userId, 'Disconnected via API');

      return NextResponse.json({
        success: true,
        message: `Disconnected ${connections.length} connection(s)`,
        data: {
          disconnectedCount: connections.length,
        },
      });
    }

    // 断开当前用户的所有连接
    const currentUserId = session.user.id;
    const connections = wsServer.getConnectionsByUserId(currentUserId);
    await wsServer.disconnectUser(currentUserId, 'Disconnected via API');

    return NextResponse.json({
      success: true,
      message: `Disconnected ${connections.length} connection(s)`,
      data: {
        disconnectedCount: connections.length,
      },
    });
  } catch (error) {
    console.error('WebSocket API DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
