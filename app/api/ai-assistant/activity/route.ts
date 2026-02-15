/**
 * AI 助手活动记录 API
 * 提供最近的 AI 助手活动记录
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface ActivityRecord {
  id: string;
  type: 'CONVERSATION' | 'RECOMMENDATION' | 'REPORT' | 'ALERT';
  title: string;
  description: string;
  timestamp: Date;
  status: 'SUCCESS' | 'PENDING' | 'ERROR';
  projectId?: string;
  userId: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const projectId = searchParams.get('projectId');

    const activities: ActivityRecord[] = [];

    // 获取最近的对话记录
    const conversations = await prisma.aIConversation.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        isActive: true,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.ceil(limit / 4),
    });

    conversations.forEach(conversation => {
      const lastMessage = conversation.messages[0];
      activities.push({
        id: `conv-${conversation.id}`,
        type: 'CONVERSATION',
        title: `AI 对话: ${conversation.title}`,
        description: lastMessage 
          ? `最新消息: ${lastMessage.content.substring(0, 100)}...`
          : '开始了新的对话',
        timestamp: conversation.updatedAt,
        status: 'SUCCESS',
        projectId: conversation.projectId || undefined,
        userId: conversation.userId,
      });
    });

    // 获取最近的建议记录
    const recommendations = await prisma.recommendation.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 4),
    });

    recommendations.forEach(recommendation => {
      activities.push({
        id: `rec-${recommendation.id}`,
        type: 'RECOMMENDATION',
        title: `AI 建议: ${recommendation.title}`,
        description: recommendation.description.substring(0, 100) + '...',
        timestamp: recommendation.createdAt,
        status: recommendation.status === 'APPLIED' ? 'SUCCESS' : 
                recommendation.status === 'REJECTED' ? 'ERROR' : 'PENDING',
        projectId: recommendation.projectId || undefined,
        userId: '', // Recommendation model doesn't have createdBy field
      });
    });

    // 获取最近的报告记录
    const reports = await prisma.reportInstance.findMany({
      where: {
        report: {
          type: 'AI_GENERATED',
          ...(projectId ? { 
            config: {
              contains: projectId,
            },
          } : {}),
        },
      },
      include: {
        report: true,
      },
      orderBy: { generatedAt: 'desc' },
      take: Math.ceil(limit / 4),
    });

    reports.forEach(report => {
      activities.push({
        id: `report-${report.id}`,
        type: 'REPORT',
        title: `AI 报告: ${report.title}`,
        description: `生成了 ${report.format} 格式的项目报告`,
        timestamp: report.generatedAt,
        status: 'SUCCESS',
        projectId: projectId || undefined,
        userId: report.report.createdBy,
      });
    });

    // 获取最近的警报记录
    const alerts = await prisma.notification.findMany({
      where: {
        type: {
          in: ['TASK_OVERDUE', 'PROJECT_DELAY', 'RESOURCE_OVERLOAD', 'DEADLINE_APPROACHING'],
        },
        ...(projectId ? {
          metadata: {
            contains: projectId,
          },
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 4),
    });

    alerts.forEach(alert => {
      activities.push({
        id: `alert-${alert.id}`,
        type: 'ALERT',
        title: `智能警报: ${alert.title}`,
        description: alert.message,
        timestamp: alert.createdAt,
        status: alert.isRead ? 'SUCCESS' : 'PENDING',
        projectId: projectId || undefined,
        userId: alert.userId,
      });
    });

    // 按时间排序并限制数量
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return NextResponse.json({
      activities: sortedActivities,
      total: sortedActivities.length,
    });
  } catch (error) {
    console.error('Error getting AI activity:', error);
    return NextResponse.json(
      { error: 'Failed to get AI activity' },
      { status: 500 }
    );
  }
}