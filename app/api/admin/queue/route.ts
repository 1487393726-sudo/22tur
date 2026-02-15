/**
 * Queue Management API
 * 队列管理 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getQueueService,
  JobType,
  JobOptions,
  registerAllProcessors,
} from '@/lib/queue';

// 初始化队列服务
const queueService = getQueueService();
registerAllProcessors(queueService);

/**
 * GET /api/admin/queue
 * 获取队列状态和统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const queueName = searchParams.get('queue') || undefined;
    const jobId = searchParams.get('jobId');

    // 获取单个任务状态
    if (action === 'job' && jobId) {
      const job = await queueService.getJob(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: job });
    }

    // 检查告警
    if (action === 'alerts') {
      const alerts = await queueService.checkAlerts();
      return NextResponse.json({ success: true, data: alerts });
    }

    // 获取队列统计
    const stats = await queueService.getQueueStats(queueName);
    return NextResponse.json({
      success: true,
      data: {
        stats,
        connected: queueService.isConnected(),
      },
    });
  } catch (error) {
    console.error('Queue API GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/queue
 * 添加任务或执行队列操作
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, queueName, jobId, type, name, data, options } = body;

    // 添加新任务
    if (action === 'add') {
      if (!type || !name || !data) {
        return NextResponse.json(
          { error: 'Missing required fields: type, name, data' },
          { status: 400 }
        );
      }

      const validTypes: JobType[] = ['email', 'sms', 'notification', 'file-process', 'report', 'backup', 'sync', 'cleanup', 'custom'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Invalid job type. Valid types: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }

      const jobOptions: JobOptions = options || {};
      const newJobId = await queueService.addJob(type, name, data, jobOptions);

      return NextResponse.json({
        success: true,
        data: { jobId: newJobId },
        message: 'Job added successfully',
      });
    }

    // 批量添加任务
    if (action === 'addBulk') {
      const { jobs } = body;
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return NextResponse.json(
          { error: 'Jobs array is required' },
          { status: 400 }
        );
      }

      const jobIds = await queueService.addBulkJobs(jobs);
      return NextResponse.json({
        success: true,
        data: { jobIds },
        message: `${jobIds.length} jobs added successfully`,
      });
    }

    // 重试任务
    if (action === 'retry') {
      if (!jobId) {
        return NextResponse.json(
          { error: 'Job ID is required' },
          { status: 400 }
        );
      }

      const success = await queueService.retryJob(jobId);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to retry job. Job may not exist or is not in failed state.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Job retry initiated',
      });
    }

    // 暂停队列
    if (action === 'pause') {
      if (!queueName) {
        return NextResponse.json(
          { error: 'Queue name is required' },
          { status: 400 }
        );
      }

      await queueService.pauseQueue(queueName);
      return NextResponse.json({
        success: true,
        message: `Queue ${queueName} paused`,
      });
    }

    // 恢复队列
    if (action === 'resume') {
      if (!queueName) {
        return NextResponse.json(
          { error: 'Queue name is required' },
          { status: 400 }
        );
      }

      await queueService.resumeQueue(queueName);
      return NextResponse.json({
        success: true,
        message: `Queue ${queueName} resumed`,
      });
    }

    // 清理队列
    if (action === 'clean') {
      if (!queueName) {
        return NextResponse.json(
          { error: 'Queue name is required' },
          { status: 400 }
        );
      }

      const { status, olderThan } = body;
      if (!status || !['completed', 'failed'].includes(status)) {
        return NextResponse.json(
          { error: 'Status must be "completed" or "failed"' },
          { status: 400 }
        );
      }

      const cleaned = await queueService.cleanQueue(queueName, status, olderThan);
      return NextResponse.json({
        success: true,
        data: { cleaned },
        message: `Cleaned ${cleaned} ${status} jobs`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Queue API POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/queue
 * 删除任务
 */
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const success = await queueService.removeJob(jobId);
    if (!success) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job removed successfully',
    });
  } catch (error) {
    console.error('Queue API DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
