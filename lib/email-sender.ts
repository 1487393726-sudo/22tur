// 邮件发送逻辑 - 根据用户偏好发送邮件
import { prisma } from '@/lib/prisma';
import * as emailTemplates from '@/lib/email';

/**
 * 检查用户是否启用了邮件通知
 * @param userId 用户ID
 * @param notificationType 通知类型
 * @returns Promise<boolean>
 */
async function shouldSendEmail(
  userId: string,
  notificationType?: string
): Promise<boolean> {
  try {
    // 获取用户的通知偏好
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // 如果没有偏好设置，默认发送邮件
    if (!preference) {
      return true;
    }

    // 检查邮件通知是否启用
    if (!preference.emailEnabled) {
      return false;
    }

    // 根据通知类型检查具体偏好
    if (notificationType) {
      switch (notificationType) {
        case 'TASK':
          return preference.taskEnabled;
        case 'APPROVAL':
          return preference.taskEnabled; // 使用 taskEnabled 作为审批通知
        case 'MESSAGE':
          return preference.pushEnabled; // 使用 pushEnabled 作为消息通知
        case 'SYSTEM':
          return preference.emailEnabled;
        case 'REMINDER':
          return preference.reminderEnabled;
        default:
          return true;
      }
    }

    return true;
  } catch (error) {
    console.error('检查邮件偏好失败:', error);
    // 出错时默认发送邮件
    return true;
  }
}

/**
 * 发送欢迎邮件（带用户偏好检查）
 */
export async function sendWelcomeEmailWithPreference(
  userId: string,
  email: string,
  userName: string
): Promise<boolean> {
  const shouldSend = await shouldSendEmail(userId, 'SYSTEM');
  if (!shouldSend) {
    console.log(`用户 ${userId} 已禁用系统邮件通知，跳过发送`);
    return false;
  }

  return emailTemplates.sendWelcomeEmail(email, userName);
}

/**
 * 发送任务分配邮件（带用户偏好检查）
 */
export async function sendTaskAssignmentEmailWithPreference(
  userId: string,
  email: string,
  userName: string,
  taskTitle: string,
  taskId: string,
  assignerName: string,
  dueDate?: Date
): Promise<boolean> {
  const shouldSend = await shouldSendEmail(userId, 'TASK');
  if (!shouldSend) {
    console.log(`用户 ${userId} 已禁用任务邮件通知，跳过发送`);
    return false;
  }

  return emailTemplates.sendTaskAssignmentEmail(
    email,
    userName,
    taskTitle,
    taskId,
    assignerName,
    dueDate
  );
}

/**
 * 发送审批请求邮件（带用户偏好检查）
 */
export async function sendApprovalRequestEmailWithPreference(
  userId: string,
  email: string,
  approverName: string,
  requesterName: string,
  workflowName: string,
  instanceId: string,
  description?: string
): Promise<boolean> {
  const shouldSend = await shouldSendEmail(userId, 'APPROVAL');
  if (!shouldSend) {
    console.log(`用户 ${userId} 已禁用审批邮件通知，跳过发送`);
    return false;
  }

  return emailTemplates.sendApprovalRequestEmail(
    email,
    approverName,
    requesterName,
    workflowName,
    instanceId,
    description
  );
}

/**
 * 发送工作流通知邮件（带用户偏好检查）
 */
export async function sendWorkflowNotificationEmailWithPreference(
  userId: string,
  email: string,
  userName: string,
  workflowName: string,
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED',
  instanceId: string,
  notes?: string
): Promise<boolean> {
  const shouldSend = await shouldSendEmail(userId, 'APPROVAL');
  if (!shouldSend) {
    console.log(`用户 ${userId} 已禁用审批邮件通知，跳过发送`);
    return false;
  }

  return emailTemplates.sendWorkflowNotificationEmail(
    email,
    userName,
    workflowName,
    status,
    instanceId,
    notes
  );
}

/**
 * 发送发票邮件（不检查偏好，财务邮件总是发送）
 */
export async function sendInvoiceEmailDirect(
  email: string,
  clientName: string,
  invoiceNumber: string,
  invoiceId: string,
  amount: number,
  dueDate: Date
): Promise<boolean> {
  // 发票邮件是重要的财务通知，不受用户偏好限制
  return emailTemplates.sendInvoiceEmail(
    email,
    clientName,
    invoiceNumber,
    invoiceId,
    amount,
    dueDate
  );
}

/**
 * 批量发送邮件（带用户偏好检查）
 * @param recipients 收件人列表
 * @param notificationType 通知类型
 * @param emailFunction 邮件发送函数
 * @returns Promise<{ sent: number; skipped: number; failed: number }>
 */
export async function sendBulkEmails<T extends { userId: string; email: string }>(
  recipients: T[],
  notificationType: string,
  emailFunction: (recipient: T) => Promise<boolean>
): Promise<{ sent: number; skipped: number; failed: number }> {
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const shouldSend = await shouldSendEmail(recipient.userId, notificationType);
      
      if (!shouldSend) {
        skipped++;
        continue;
      }

      const success = await emailFunction(recipient);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`发送邮件失败 (${recipient.email}):`, error);
      failed++;
    }
  }

  return { sent, skipped, failed };
}

/**
 * 发送邮件并记录日志
 * @param userId 用户ID
 * @param email 邮箱
 * @param subject 主题
 * @param emailFunction 邮件发送函数
 * @returns Promise<boolean>
 */
export async function sendEmailWithLogging(
  userId: string,
  email: string,
  subject: string,
  emailFunction: () => Promise<boolean>
): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const success = await emailFunction();
    const duration = Date.now() - startTime;

    // 记录到审计日志
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EMAIL_SENT',
        resource: 'Email',
        resourceId: email,
        details: JSON.stringify({
          subject,
          success,
          duration,
        }),
        status: success ? 'SUCCESS' : 'FAILED',
        risk: 'LOW',
      },
    });

    return success;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // 记录失败日志
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EMAIL_SENT',
        resource: 'Email',
        resourceId: email,
        details: JSON.stringify({
          subject,
          success: false,
          duration,
          error: error instanceof Error ? error.message : String(error),
        }),
        status: 'FAILED',
        risk: 'LOW',
      },
    });

    return false;
  }
}
