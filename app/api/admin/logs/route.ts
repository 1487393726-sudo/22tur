/**
 * Logs Management API
 * 日志管理 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getLoggingService,
  LogLevel,
  LogQuery,
  ExportOptions,
} from '@/lib/logging';

// 初始化日志服务
const loggingService = getLoggingService({ level: 'debug' });

/**
 * GET /api/admin/logs
 * 查询日志或导出日志
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
    
    // 解析时间范围
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime are required' },
        { status: 400 }
      );
    }

    const timeRange = {
      start: new Date(startTime),
      end: new Date(endTime),
    };

    // 构建查询参数
    const query: LogQuery = {
      timeRange,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '50'),
    };

    // 解析过滤条件
    const level = searchParams.get('level');
    if (level && level !== 'all') {
      query.level = [level as LogLevel];
    }

    const source = searchParams.get('source');
    if (source && source !== 'all') {
      query.source = source;
    }

    const search = searchParams.get('search');
    if (search) {
      query.search = search;
    }

    const userId = searchParams.get('userId');
    if (userId) {
      query.userId = userId;
    }

    const requestId = searchParams.get('requestId');
    if (requestId) {
      query.requestId = requestId;
    }

    // 导出日志
    if (action === 'export') {
      const format = (searchParams.get('format') || 'json') as 'json' | 'csv';
      const options: ExportOptions = {
        format,
        includeMetadata: true,
        includeStackTrace: true,
        maxRecords: 10000,
      };

      const buffer = await loggingService.export(query, options);
      
      const contentType = format === 'json' 
        ? 'application/json' 
        : 'text/csv';
      
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="logs_${new Date().toISOString().split('T')[0]}.${format}"`,
        },
      });
    }

    // 查询日志
    const result = await loggingService.query(query);
    
    // 获取统计信息
    const stats = await loggingService.getStats(timeRange);

    return NextResponse.json({
      success: true,
      data: {
        logs: result.logs,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
        stats,
      },
    });
  } catch (error) {
    console.error('Logs API GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/logs
 * 执行日志操作（清理、归档等）
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
    const { action, olderThan } = body;

    // 清理日志
    if (action === 'cleanup') {
      if (!olderThan) {
        return NextResponse.json(
          { error: 'olderThan date is required' },
          { status: 400 }
        );
      }

      const cleaned = await loggingService.cleanup(new Date(olderThan));
      return NextResponse.json({
        success: true,
        data: { cleaned },
        message: `Cleaned ${cleaned} log entries`,
      });
    }

    // 归档日志
    if (action === 'archive') {
      if (!olderThan) {
        return NextResponse.json(
          { error: 'olderThan date is required' },
          { status: 400 }
        );
      }

      const archiveFile = await loggingService.archive(new Date(olderThan));
      return NextResponse.json({
        success: true,
        data: { archiveFile },
        message: archiveFile 
          ? `Logs archived to ${archiveFile}` 
          : 'No logs to archive',
      });
    }

    // 设置日志级别
    if (action === 'setLevel') {
      const { level } = body;
      if (!level || !['debug', 'info', 'warn', 'error'].includes(level)) {
        return NextResponse.json(
          { error: 'Valid log level is required' },
          { status: 400 }
        );
      }

      loggingService.setLevel(level as LogLevel);
      return NextResponse.json({
        success: true,
        message: `Log level set to ${level}`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Logs API POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
