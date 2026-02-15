/**
 * AI 助手警报生成器
 * 自动生成风险警报和通知
 */

import { prisma } from '@/lib/prisma';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  condition: AlertCondition;
  severity: AlertSeverity;
  isActive: boolean;
  projectId?: string;
  userId?: string;
}

export type AlertType = 
  | 'TASK_OVERDUE'
  | 'PROJECT_DELAY'
  | 'RESOURCE_OVERLOAD'
  | 'BUDGET_EXCEEDED'
  | 'RISK_ESCALATION'
  | 'QUALITY_ISSUE'
  | 'DEADLINE_APPROACHING'
  | 'TEAM_PERFORMANCE';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains';
  value: number | string;
  timeframe?: number; // 时间窗口（小时）
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  projectId: string;
  userId?: string;
  metadata: Record<string, any>;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface NotificationChannel {
  id: string;
  type: 'EMAIL' | 'PUSH' | 'SMS' | 'WEBHOOK';
  config: Record<string, any>;
  isActive: boolean;
}

export interface NotificationPreference {
  userId: string;
  alertType: AlertType;
  channels: string[]; // channel IDs
  minSeverity: AlertSeverity;
  isEnabled: boolean;
}

/**
 * 检查并生成警报
 */
export async function checkAndGenerateAlerts(projectId: string): Promise<Alert[]> {
  try {
    const alerts: Alert[] = [];
    
    // 获取项目数据
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            assignee: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // 检查各种警报条件
    const taskOverdueAlerts = await checkTaskOverdueAlerts(project);
    const projectDelayAlerts = await checkProjectDelayAlerts(project);
    const resourceOverloadAlerts = await checkResourceOverloadAlerts(project);
    const deadlineApproachingAlerts = await checkDeadlineApproachingAlerts(project);
    const teamPerformanceAlerts = await checkTeamPerformanceAlerts(project);

    alerts.push(
      ...taskOverdueAlerts,
      ...projectDelayAlerts,
      ...resourceOverloadAlerts,
      ...deadlineApproachingAlerts,
      ...teamPerformanceAlerts
    );

    // 保存警报到数据库
    for (const alert of alerts) {
      await saveAlert(alert);
    }

    return alerts;
  } catch (error) {
    console.error('Error checking and generating alerts:', error);
    throw new Error('Failed to generate alerts');
  }
}

/**
 * 检查任务逾期警报
 */
async function checkTaskOverdueAlerts(project: any): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();
  
  const overdueTasks = project.tasks.filter((task: any) => 
    task.dueDate && 
    task.dueDate < now && 
    task.status !== 'COMPLETED'
  );

  if (overdueTasks.length > 0) {
    // 单个任务逾期警报
    for (const task of overdueTasks) {
      const daysOverdue = Math.floor((now.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `task-overdue-${task.id}`,
        type: 'TASK_OVERDUE',
        severity: daysOverdue > 7 ? 'HIGH' : daysOverdue > 3 ? 'MEDIUM' : 'LOW',
        title: `任务逾期: ${task.title}`,
        message: `任务 "${task.title}" 已逾期 ${daysOverdue} 天，负责人: ${task.assignee?.firstName || '未分配'}`,
        projectId: project.id,
        userId: task.assigneeId,
        metadata: {
          taskId: task.id,
          daysOverdue,
          dueDate: task.dueDate,
          assigneeId: task.assigneeId,
        },
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }

    // 批量逾期警报
    if (overdueTasks.length >= 3) {
      alerts.push({
        id: `batch-overdue-${project.id}`,
        type: 'TASK_OVERDUE',
        severity: 'HIGH',
        title: `批量任务逾期`,
        message: `项目 "${project.name}" 有 ${overdueTasks.length} 个任务逾期，需要立即处理`,
        projectId: project.id,
        metadata: {
          overdueCount: overdueTasks.length,
          taskIds: overdueTasks.map((t: any) => t.id),
        },
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }
  }

  return alerts;
}

/**
 * 检查项目延期警报
 */
async function checkProjectDelayAlerts(project: any): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();

  if (project.endDate && project.endDate < now) {
    const daysOverdue = Math.floor((now.getTime() - project.endDate.getTime()) / (1000 * 60 * 60 * 24));
    
    alerts.push({
      id: `project-delay-${project.id}`,
      type: 'PROJECT_DELAY',
      severity: daysOverdue > 14 ? 'CRITICAL' : daysOverdue > 7 ? 'HIGH' : 'MEDIUM',
      title: `项目延期`,
      message: `项目 "${project.name}" 已延期 ${daysOverdue} 天，需要调整计划`,
      projectId: project.id,
      metadata: {
        daysOverdue,
        originalEndDate: project.endDate,
        completionRate: calculateCompletionRate(project.tasks),
      },
      isRead: false,
      isResolved: false,
      createdAt: now,
    });
  }

  // 检查预计延期
  const completionRate = calculateCompletionRate(project.tasks);
  const estimatedCompletion = estimateProjectCompletion(project);
  
  if (project.endDate && estimatedCompletion > project.endDate) {
    const estimatedDelayDays = Math.floor((estimatedCompletion.getTime() - project.endDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (estimatedDelayDays > 0) {
      alerts.push({
        id: `project-delay-prediction-${project.id}`,
        type: 'PROJECT_DELAY',
        severity: estimatedDelayDays > 14 ? 'HIGH' : 'MEDIUM',
        title: `项目预计延期`,
        message: `基于当前进度，项目 "${project.name}" 预计将延期 ${estimatedDelayDays} 天`,
        projectId: project.id,
        metadata: {
          estimatedDelayDays,
          completionRate,
          estimatedCompletion,
          originalEndDate: project.endDate,
        },
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }
  }

  return alerts;
}

/**
 * 检查资源过载警报
 */
async function checkResourceOverloadAlerts(project: any): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();

  // 计算每个成员的工作负载
  for (const member of project.members) {
    const assignedTasks = project.tasks.filter((task: any) => 
      task.assigneeId === member.userId && 
      task.status !== 'COMPLETED'
    );

    const urgentTasks = assignedTasks.filter((task: any) => 
      task.priority === 'HIGH' || task.priority === 'URGENT'
    );

    const overdueTasks = assignedTasks.filter((task: any) => 
      task.dueDate && task.dueDate < now
    );

    // 任务过多警报
    if (assignedTasks.length > 10) {
      alerts.push({
        id: `resource-overload-${member.userId}`,
        type: 'RESOURCE_OVERLOAD',
        severity: assignedTasks.length > 15 ? 'HIGH' : 'MEDIUM',
        title: `资源过载`,
        message: `${member.user.firstName} ${member.user.lastName} 当前有 ${assignedTasks.length} 个未完成任务，工作负载过重`,
        projectId: project.id,
        userId: member.userId,
        metadata: {
          assignedTasks: assignedTasks.length,
          urgentTasks: urgentTasks.length,
          overdueTasks: overdueTasks.length,
          memberName: `${member.user.firstName} ${member.user.lastName}`,
        },
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }

    // 紧急任务过多警报
    if (urgentTasks.length > 3) {
      alerts.push({
        id: `urgent-tasks-overload-${member.userId}`,
        type: 'RESOURCE_OVERLOAD',
        severity: 'HIGH',
        title: `紧急任务过多`,
        message: `${member.user.firstName} ${member.user.lastName} 有 ${urgentTasks.length} 个紧急任务，需要重新分配优先级`,
        projectId: project.id,
        userId: member.userId,
        metadata: {
          urgentTasks: urgentTasks.length,
          memberName: `${member.user.firstName} ${member.user.lastName}`,
          taskIds: urgentTasks.map((t: any) => t.id),
        },
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }
  }

  return alerts;
}

/**
 * 检查截止日期临近警报
 */
async function checkDeadlineApproachingAlerts(project: any): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 检查任务截止日期
  const approachingTasks = project.tasks.filter((task: any) => 
    task.dueDate && 
    task.dueDate > now && 
    task.dueDate <= oneWeekFromNow &&
    task.status !== 'COMPLETED'
  );

  for (const task of approachingTasks) {
    const daysUntilDue = Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    alerts.push({
      id: `deadline-approaching-${task.id}`,
      type: 'DEADLINE_APPROACHING',
      severity: daysUntilDue <= 1 ? 'HIGH' : daysUntilDue <= 3 ? 'MEDIUM' : 'LOW',
      title: `截止日期临近`,
      message: `任务 "${task.title}" 将在 ${daysUntilDue} 天后到期，负责人: ${task.assignee?.firstName || '未分配'}`,
      projectId: project.id,
      userId: task.assigneeId,
      metadata: {
        taskId: task.id,
        daysUntilDue,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      },
      isRead: false,
      isResolved: false,
      createdAt: now,
    });
  }

  // 检查项目截止日期
  if (project.endDate && project.endDate > now && project.endDate <= oneWeekFromNow) {
    const daysUntilDue = Math.ceil((project.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    alerts.push({
      id: `project-deadline-approaching-${project.id}`,
      type: 'DEADLINE_APPROACHING',
      severity: daysUntilDue <= 3 ? 'HIGH' : 'MEDIUM',
      title: `项目截止日期临近`,
      message: `项目 "${project.name}" 将在 ${daysUntilDue} 天后到期，当前完成率: ${calculateCompletionRate(project.tasks).toFixed(1)}%`,
      projectId: project.id,
      metadata: {
        daysUntilDue,
        endDate: project.endDate,
        completionRate: calculateCompletionRate(project.tasks),
      },
      isRead: false,
      isResolved: false,
      createdAt: now,
    });
  }

  return alerts;
}

/**
 * 检查团队绩效警报
 */
async function checkTeamPerformanceAlerts(project: any): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();

  const completionRate = calculateCompletionRate(project.tasks);
  const averageTaskDuration = calculateAverageTaskDuration(project.tasks);

  // 项目进度缓慢警报
  if (completionRate < 30 && project.startDate) {
    const projectDuration = (now.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (projectDuration > 30) { // 项目进行超过30天但完成率低于30%
      alerts.push({
        id: `low-progress-${project.id}`,
        type: 'TEAM_PERFORMANCE',
        severity: 'HIGH',
        title: `项目进度缓慢`,
        message: `项目 "${project.name}" 进行了 ${Math.floor(projectDuration)} 天，但完成率仅为 ${completionRate.toFixed(1)}%`,
        projectId: project.id,
        metadata: {
          completionRate,
          projectDuration: Math.floor(projectDuration),
          totalTasks: project.tasks.length,
          completedTasks: project.tasks.filter((t: any) => t.status === 'COMPLETED').length,
        },
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }
  }

  // 任务完成效率低警报
  if (averageTaskDuration > 14) { // 平均任务完成时间超过14天
    alerts.push({
      id: `low-efficiency-${project.id}`,
      type: 'TEAM_PERFORMANCE',
      severity: 'MEDIUM',
      title: `任务完成效率低`,
      message: `项目 "${project.name}" 平均任务完成时间为 ${averageTaskDuration.toFixed(1)} 天，效率偏低`,
      projectId: project.id,
      metadata: {
        averageTaskDuration,
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter((t: any) => t.status === 'COMPLETED').length,
      },
      isRead: false,
      isResolved: false,
      createdAt: now,
    });
  }

  return alerts;
}

/**
 * 保存警报到数据库
 */
async function saveAlert(alert: Alert): Promise<void> {
  try {
    // 检查是否已存在相同的警报
    const existingAlert = await prisma.notification.findFirst({
      where: {
        userId: alert.userId || '',
        type: alert.type,
        metadata: {
          contains: alert.id,
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时内
        },
      },
    });

    if (existingAlert) {
      return; // 避免重复警报
    }

    await prisma.notification.create({
      data: {
        userId: alert.userId || '',
        title: alert.title,
        message: alert.message,
        type: alert.type,
        priority: alert.severity,
        isRead: false,
        metadata: JSON.stringify(alert.metadata),
      },
    });
  } catch (error) {
    console.error('Error saving alert:', error);
  }
}

/**
 * 发送通知
 */
export async function sendNotifications(alerts: Alert[]): Promise<void> {
  try {
    for (const alert of alerts) {
      // 获取用户通知偏好
      const preferences = await getUserNotificationPreferences(alert.userId);
      
      if (!preferences || !preferences.isEnabled) {
        continue;
      }

      // 检查严重程度是否满足用户设置
      if (!shouldSendNotification(alert.severity, preferences.minSeverity)) {
        continue;
      }

      // 发送到各个渠道
      for (const channelId of preferences.channels) {
        await sendToChannel(alert, channelId);
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

/**
 * 获取用户通知偏好
 */
async function getUserNotificationPreferences(userId?: string): Promise<NotificationPreference | null> {
  if (!userId) return null;

  try {
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      return {
        userId,
        alertType: 'TASK_OVERDUE',
        channels: ['email'],
        minSeverity: 'MEDIUM',
        isEnabled: true,
      };
    }

    return {
      userId: preference.userId,
      alertType: 'TASK_OVERDUE', // 简化处理
      channels: ['email'], // 简化处理
      minSeverity: 'MEDIUM',
      isEnabled: preference.emailEnabled,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

/**
 * 检查是否应该发送通知
 */
function shouldSendNotification(alertSeverity: AlertSeverity, minSeverity: AlertSeverity): boolean {
  const severityLevels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
  return severityLevels[alertSeverity] >= severityLevels[minSeverity];
}

/**
 * 发送到指定渠道
 */
async function sendToChannel(alert: Alert, channelId: string): Promise<void> {
  try {
    // 这里应该根据 channelId 获取渠道配置并发送
    // 暂时只记录日志
    console.log(`Sending alert ${alert.id} to channel ${channelId}:`, {
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
    });

    // 实际实现中，这里会调用邮件服务、推送服务等
    // 例如：
    // if (channel.type === 'EMAIL') {
    //   await sendEmail(alert, channel.config);
    // } else if (channel.type === 'PUSH') {
    //   await sendPushNotification(alert, channel.config);
    // }
  } catch (error) {
    console.error(`Error sending to channel ${channelId}:`, error);
  }
}

/**
 * 解决警报
 */
export async function resolveAlert(alertId: string, userId: string, resolution?: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        metadata: {
          contains: alertId,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    throw new Error('Failed to resolve alert');
  }
}

/**
 * 获取项目警报
 */
export async function getProjectAlerts(projectId: string, limit = 50): Promise<Alert[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        metadata: {
          contains: projectId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return notifications.map(notification => ({
      id: notification.id,
      type: notification.type as AlertType,
      severity: notification.priority as AlertSeverity,
      title: notification.title,
      message: notification.message,
      projectId,
      userId: notification.userId,
      metadata: JSON.parse(notification.metadata || '{}'),
      isRead: notification.isRead,
      isResolved: notification.isRead,
      createdAt: notification.createdAt,
      resolvedAt: notification.readAt,
    }));
  } catch (error) {
    console.error('Error getting project alerts:', error);
    return [];
  }
}

// 辅助函数
function calculateCompletionRate(tasks: any[]): number {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  return (completedTasks / tasks.length) * 100;
}

function calculateAverageTaskDuration(tasks: any[]): number {
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
  if (completedTasks.length === 0) return 0;

  const totalDuration = completedTasks.reduce((sum, task) => {
    if (task.createdAt && task.updatedAt) {
      return sum + (task.updatedAt.getTime() - task.createdAt.getTime());
    }
    return sum;
  }, 0);

  return totalDuration / completedTasks.length / (1000 * 60 * 60 * 24); // 转换为天
}

function estimateProjectCompletion(project: any): Date {
  const completedTasks = project.tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const totalTasks = project.tasks.length;
  
  if (totalTasks === 0 || completedTasks === totalTasks) {
    return new Date();
  }
  
  const completionRate = completedTasks / totalTasks;
  const now = new Date();
  const projectDuration = project.startDate ? 
    (now.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24) : 30;
  
  const estimatedTotalDuration = projectDuration / completionRate;
  const remainingDuration = estimatedTotalDuration - projectDuration;
  
  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + remainingDuration);
  
  return estimatedCompletion;
}