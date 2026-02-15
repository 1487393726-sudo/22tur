// 邮件队列管理 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getQueueStats,
  getAllQueueItems,
  cleanupQueue,
  clearQueue,
} from '@/lib/email-retry';
import {
  getWorkerStatus,
  triggerEmailProcessing,
  startEmailWorker,
  stopEmailWorker,
} from '@/lib/email-worker';

/**
 * GET /api/admin/email-queue
 * 获取邮件队列状态
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查是否为管理员
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 获取队列详情
    if (action === 'details') {
      const items = getAllQueueItems();
      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    // 获取队列统计
    const stats = getQueueStats();
    const workerStatus = getWorkerStatus();

    return NextResponse.json({
      stats,
      worker: workerStatus,
    });
  } catch (error) {
    console.error('获取邮件队列状态失败:', error);
    return NextResponse.json(
      { error: '获取队列状态失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email-queue
 * 管理邮件队列（触发处理、清理、启动/停止处理器）
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查是否为管理员
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'process': {
        // 手动触发队列处理
        const result = await triggerEmailProcessing();
        return NextResponse.json({
          message: '队列处理已触发',
          result,
        });
      }

      case 'cleanup': {
        // 清理旧项目
        const maxAge = body.maxAge || 3600000; // 默认1小时
        const cleaned = cleanupQueue(maxAge);
        return NextResponse.json({
          message: '队列清理完成',
          cleaned,
        });
      }

      case 'clear': {
        // 清空队列（仅超级管理员）
        if (session.user.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: '仅超级管理员可以清空队列' }, { status: 403 });
        }
        clearQueue();
        return NextResponse.json({
          message: '队列已清空',
        });
      }

      case 'start': {
        // 启动处理器
        const interval = body.interval || 30000; // 默认30秒
        startEmailWorker(interval);
        return NextResponse.json({
          message: '邮件处理器已启动',
          interval,
        });
      }

      case 'stop': {
        // 停止处理器
        stopEmailWorker();
        return NextResponse.json({
          message: '邮件处理器已停止',
        });
      }

      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('管理邮件队列失败:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}
