import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  detectLoginFailures,
  detectAbnormalIpLogin,
  detectFrequentOperations,
  detectDataLeakageRisk,
  performSecurityChecks,
} from '@/lib/security/event-detector';

/**
 * 手动触发安全检测
 * POST /api/security/detect
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 只有管理员可以手动触发安全检测
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();
    const { type, ...params } = body;

    let result: any = { success: true };

    switch (type) {
      case 'login_failures_ip':
        await detectLoginFailures(params.ipAddress, 'ip', params.timeWindowMinutes, params.threshold);
        result.message = `已检测 IP ${params.ipAddress} 的登录失败情况`;
        break;

      case 'login_failures_user':
        await detectLoginFailures(params.userId, 'user', params.timeWindowMinutes, params.threshold);
        result.message = `已检测用户 ${params.userId} 的登录失败情况`;
        break;

      case 'abnormal_ip':
        await detectAbnormalIpLogin(params.userId, params.ipAddress, params.userAgent);
        result.message = `已检测用户 ${params.userId} 的异常 IP 登录`;
        break;

      case 'frequent_operations':
        await detectFrequentOperations(params.userId, params.action, params.timeWindowMinutes, params.threshold);
        result.message = `已检测用户 ${params.userId} 的频繁操作`;
        break;

      case 'data_leakage':
        await detectDataLeakageRisk(params.userId, params.timeWindowMinutes, params.threshold);
        result.message = `已检测用户 ${params.userId} 的数据泄露风险`;
        break;

      case 'comprehensive':
        await performSecurityChecks(params);
        result.message = '已执行综合安全检测';
        break;

      default:
        return NextResponse.json({ error: '未知的检测类型' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('安全检测失败:', error);
    return NextResponse.json(
      { error: '安全检测失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * 获取安全检测配置
 * GET /api/security/detect
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 只有管理员可以查看配置
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 返回检测配置
    const config = {
      detectionTypes: [
        {
          type: 'login_failures_ip',
          name: '登录失败检测（IP）',
          description: '检测同一 IP 地址的多次登录失败',
          params: {
            ipAddress: 'string (required)',
            timeWindowMinutes: 'number (default: 15)',
            threshold: 'number (default: 5)',
          },
        },
        {
          type: 'login_failures_user',
          name: '登录失败检测（用户）',
          description: '检测同一用户的多次登录失败',
          params: {
            userId: 'string (required)',
            timeWindowMinutes: 'number (default: 15)',
            threshold: 'number (default: 5)',
          },
        },
        {
          type: 'abnormal_ip',
          name: '异常 IP 登录检测',
          description: '检测用户从新的 IP 地址登录',
          params: {
            userId: 'string (required)',
            ipAddress: 'string (required)',
            userAgent: 'string (optional)',
          },
        },
        {
          type: 'frequent_operations',
          name: '频繁操作检测',
          description: '检测用户在短时间内的频繁操作',
          params: {
            userId: 'string (required)',
            action: 'string (required)',
            timeWindowMinutes: 'number (default: 5)',
            threshold: 'number (default: 50)',
          },
        },
        {
          type: 'data_leakage',
          name: '数据泄露风险检测',
          description: '检测用户在短时间内的大量导出/下载操作',
          params: {
            userId: 'string (required)',
            timeWindowMinutes: 'number (default: 10)',
            threshold: 'number (default: 10)',
          },
        },
        {
          type: 'comprehensive',
          name: '综合安全检测',
          description: '执行所有适用的安全检测',
          params: {
            userId: 'string (optional)',
            action: 'string (required)',
            resource: 'string (required)',
            resourceId: 'string (optional)',
            ipAddress: 'string (optional)',
            userAgent: 'string (optional)',
            status: 'string (required: SUCCESS | FAILED | WARNING)',
          },
        },
      ],
      defaultThresholds: {
        loginFailures: {
          timeWindowMinutes: 15,
          threshold: 5,
        },
        frequentOperations: {
          timeWindowMinutes: 5,
          threshold: 50,
        },
        dataLeakage: {
          timeWindowMinutes: 10,
          threshold: 10,
        },
      },
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('获取安全检测配置失败:', error);
    return NextResponse.json({ error: '获取配置失败' }, { status: 500 });
  }
}
