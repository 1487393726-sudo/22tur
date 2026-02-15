// lib/auth/notification-service.ts
// 安全通知服务

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import type { DeviceInfo, SecurityEventType } from '@/types/auth';
import { AnomalyService } from './anomaly-service';

// 邮件模板类型
type EmailTemplate =
  | 'NEW_DEVICE_LOGIN'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'PASSWORD_CHANGED'
  | 'ACCOUNT_LOCKED';

interface EmailData {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

export class NotificationService {
  /**
   * 发送新设备登录通知
   */
  static async sendNewDeviceAlert(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      console.warn('Cannot send new device alert: user email not found');
      return;
    }

    const emailData: EmailData = {
      to: user.email,
      subject: '新设备登录提醒',
      template: 'NEW_DEVICE_LOGIN',
      data: {
        userName: user.name || user.email,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ipAddress: deviceInfo.ipAddress,
        location: deviceInfo.location
          ? `${deviceInfo.location.city || ''}, ${deviceInfo.location.country || ''}`
          : '未知位置',
        time: new Date().toLocaleString('zh-CN'),
      },
    };

    await this.sendSecurityEmail(emailData);

    // 记录安全事件
    await AnomalyService.createSecurityEvent({
      userId,
      eventType: 'NEW_DEVICE',
      severity: 'MEDIUM',
      description: `New device login: ${deviceInfo.browser} on ${deviceInfo.os}`,
      metadata: { deviceInfo },
      ipAddress: deviceInfo.ipAddress,
    });
  }

  /**
   * 发送 2FA 状态变更通知
   */
  static async send2FAChangeAlert(
    userId: string,
    enabled: boolean
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      console.warn('Cannot send 2FA change alert: user email not found');
      return;
    }

    const emailData: EmailData = {
      to: user.email,
      subject: enabled ? '双因素认证已启用' : '双因素认证已禁用',
      template: enabled ? '2FA_ENABLED' : '2FA_DISABLED',
      data: {
        userName: user.name || user.email,
        time: new Date().toLocaleString('zh-CN'),
      },
    };

    await this.sendSecurityEmail(emailData);

    // 记录安全事件
    await AnomalyService.createSecurityEvent({
      userId,
      eventType: enabled ? '2FA_ENABLED' : '2FA_DISABLED',
      severity: 'LOW',
      description: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`,
    });
  }


  /**
   * 发送密码变更通知
   */
  static async sendPasswordChangeAlert(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      console.warn('Cannot send password change alert: user email not found');
      return;
    }

    const emailData: EmailData = {
      to: user.email,
      subject: '密码已更改',
      template: 'PASSWORD_CHANGED',
      data: {
        userName: user.name || user.email,
        time: new Date().toLocaleString('zh-CN'),
      },
    };

    await this.sendSecurityEmail(emailData);

    // 记录安全事件
    await AnomalyService.createSecurityEvent({
      userId,
      eventType: 'PASSWORD_CHANGED',
      severity: 'MEDIUM',
      description: 'Password changed',
    });
  }

  /**
   * 发送账户锁定通知
   */
  static async sendAccountLockedAlert(
    identifier: string,
    reason: string
  ): Promise<void> {
    // 尝试通过邮箱查找用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      select: { id: true, email: true, name: true },
    });

    if (!user?.email) {
      console.warn('Cannot send account locked alert: user email not found');
      return;
    }

    const emailData: EmailData = {
      to: user.email,
      subject: '账户已被锁定',
      template: 'ACCOUNT_LOCKED',
      data: {
        userName: user.name || user.email,
        reason,
        unlockTime: new Date(Date.now() + 30 * 60 * 1000).toLocaleString('zh-CN'),
        time: new Date().toLocaleString('zh-CN'),
      },
    };

    await this.sendSecurityEmail(emailData);
  }

  /**
   * 发送可疑登录通知
   */
  static async sendSuspiciousLoginAlert(
    userId: string,
    deviceInfo: DeviceInfo,
    reasons: string[]
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      console.warn('Cannot send suspicious login alert: user email not found');
      return;
    }

    const emailData: EmailData = {
      to: user.email,
      subject: '检测到可疑登录活动',
      template: 'NEW_DEVICE_LOGIN', // 复用新设备模板
      data: {
        userName: user.name || user.email,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ipAddress: deviceInfo.ipAddress,
        location: deviceInfo.location
          ? `${deviceInfo.location.city || ''}, ${deviceInfo.location.country || ''}`
          : '未知位置',
        time: new Date().toLocaleString('zh-CN'),
        reasons: reasons.join(', '),
      },
    };

    await this.sendSecurityEmail(emailData);

    // 记录安全事件
    await AnomalyService.createSecurityEvent({
      userId,
      eventType: 'SUSPICIOUS_LOGIN',
      severity: 'HIGH',
      description: `Suspicious login detected: ${reasons.join(', ')}`,
      metadata: { deviceInfo, reasons },
      ipAddress: deviceInfo.ipAddress,
    });
  }

  /**
   * 发送邮件（使用系统邮件服务）
   */
  private static async sendSecurityEmail(emailData: EmailData): Promise<void> {
    const { subject, html, text } = this.generateEmailContent(
      emailData.template,
      emailData.data
    );

    try {
      await sendEmail({
        to: emailData.to,
        subject: emailData.subject || subject,
        html,
        text,
      });
      console.log('Security email sent:', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
      });
    } catch (error) {
      console.error('Failed to send security email:', error);
      // 不抛出错误，避免阻塞主流程
    }
  }

  /**
   * 生成邮件内容（根据模板）
   */
  static generateEmailContent(
    template: EmailTemplate,
    data: Record<string, unknown>
  ): { subject: string; html: string; text: string } {
    switch (template) {
      case 'NEW_DEVICE_LOGIN':
        return {
          subject: '新设备登录提醒',
          html: `
            <h2>您好，${data.userName}</h2>
            <p>我们检测到您的账户在新设备上登录：</p>
            <ul>
              <li>浏览器：${data.browser}</li>
              <li>操作系统：${data.os}</li>
              <li>IP 地址：${data.ipAddress}</li>
              <li>位置：${data.location}</li>
              <li>时间：${data.time}</li>
            </ul>
            <p>如果这不是您本人操作，请立即修改密码并启用双因素认证。</p>
          `,
          text: `您好，${data.userName}\n\n我们检测到您的账户在新设备上登录。\n浏览器：${data.browser}\n操作系统：${data.os}\nIP 地址：${data.ipAddress}\n位置：${data.location}\n时间：${data.time}\n\n如果这不是您本人操作，请立即修改密码。`,
        };

      case '2FA_ENABLED':
        return {
          subject: '双因素认证已启用',
          html: `
            <h2>您好，${data.userName}</h2>
            <p>您的账户已成功启用双因素认证。</p>
            <p>时间：${data.time}</p>
            <p>请妥善保管您的备份码。</p>
          `,
          text: `您好，${data.userName}\n\n您的账户已成功启用双因素认证。\n时间：${data.time}\n\n请妥善保管您的备份码。`,
        };

      case '2FA_DISABLED':
        return {
          subject: '双因素认证已禁用',
          html: `
            <h2>您好，${data.userName}</h2>
            <p>您的账户双因素认证已被禁用。</p>
            <p>时间：${data.time}</p>
            <p>如果这不是您本人操作，请立即联系客服。</p>
          `,
          text: `您好，${data.userName}\n\n您的账户双因素认证已被禁用。\n时间：${data.time}\n\n如果这不是您本人操作，请立即联系客服。`,
        };

      case 'PASSWORD_CHANGED':
        return {
          subject: '密码已更改',
          html: `
            <h2>您好，${data.userName}</h2>
            <p>您的账户密码已成功更改。</p>
            <p>时间：${data.time}</p>
            <p>如果这不是您本人操作，请立即联系客服。</p>
          `,
          text: `您好，${data.userName}\n\n您的账户密码已成功更改。\n时间：${data.time}\n\n如果这不是您本人操作，请立即联系客服。`,
        };

      case 'ACCOUNT_LOCKED':
        return {
          subject: '账户已被锁定',
          html: `
            <h2>您好，${data.userName}</h2>
            <p>由于多次登录失败，您的账户已被临时锁定。</p>
            <p>原因：${data.reason}</p>
            <p>预计解锁时间：${data.unlockTime}</p>
            <p>如需立即解锁，请联系客服。</p>
          `,
          text: `您好，${data.userName}\n\n由于多次登录失败，您的账户已被临时锁定。\n原因：${data.reason}\n预计解锁时间：${data.unlockTime}\n\n如需立即解锁，请联系客服。`,
        };

      default:
        return {
          subject: '系统通知',
          html: '<p>系统通知</p>',
          text: '系统通知',
        };
    }
  }
}
