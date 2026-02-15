// 告警通知服务
import { Alert, AlertRule, AlertChannel, AlertSeverity } from './types';

// 通知配置
interface NotificationConfig {
  email?: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    from: string;
    recipients: string[];
  };
  sms?: {
    enabled: boolean;
    provider: 'aliyun' | 'tencent';
    recipients: string[];
  };
  webhook?: {
    enabled: boolean;
    urls: string[];
    headers?: Record<string, string>;
  };
  wechat?: {
    enabled: boolean;
    corpId: string;
    agentId: string;
    secret: string;
    toUser?: string;
    toParty?: string;
  };
}

// 通知结果
interface NotificationResult {
  channel: AlertChannel;
  success: boolean;
  error?: string;
  sentAt: Date;
}

class AlertNotifier {
  private config: NotificationConfig;

  constructor(config?: NotificationConfig) {
    this.config = config || this.loadConfig();
  }

  // 加载配置
  private loadConfig(): NotificationConfig {
    return {
      email: {
        enabled: !!process.env.SMTP_HOST,
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS || '',
        from: process.env.ALERT_EMAIL_FROM || 'alerts@creative-journey.com',
        recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
      },
      sms: {
        enabled: !!process.env.SMS_ALERT_ENABLED,
        provider: (process.env.SMS_PROVIDER as 'aliyun' | 'tencent') || 'aliyun',
        recipients: (process.env.ALERT_SMS_RECIPIENTS || '').split(',').filter(Boolean),
      },
      webhook: {
        enabled: !!process.env.ALERT_WEBHOOK_URL,
        urls: (process.env.ALERT_WEBHOOK_URL || '').split(',').filter(Boolean),
        headers: process.env.ALERT_WEBHOOK_HEADERS 
          ? JSON.parse(process.env.ALERT_WEBHOOK_HEADERS) 
          : undefined,
      },
      wechat: {
        enabled: !!process.env.WECHAT_WORK_CORP_ID,
        corpId: process.env.WECHAT_WORK_CORP_ID || '',
        agentId: process.env.WECHAT_WORK_AGENT_ID || '',
        secret: process.env.WECHAT_WORK_SECRET || '',
        toUser: process.env.WECHAT_WORK_TO_USER,
        toParty: process.env.WECHAT_WORK_TO_PARTY,
      },
    };
  }

  // 发送告警通知
  async notify(alert: Alert, rule: AlertRule): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const channel of rule.channels) {
      const result = await this.sendToChannel(alert, rule, channel);
      results.push(result);
    }

    return results;
  }

  // 发送到指定通道
  private async sendToChannel(
    alert: Alert,
    rule: AlertRule,
    channel: AlertChannel
  ): Promise<NotificationResult> {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmail(alert, rule);
          break;
        case 'sms':
          await this.sendSMS(alert, rule);
          break;
        case 'webhook':
          await this.sendWebhook(alert, rule);
          break;
        case 'wechat':
          await this.sendWechat(alert, rule);
          break;
      }

      return { channel, success: true, sentAt: new Date() };
    } catch (error) {
      return {
        channel,
        success: false,
        error: (error as Error).message,
        sentAt: new Date(),
      };
    }
  }

  // 发送邮件
  private async sendEmail(alert: Alert, rule: AlertRule): Promise<void> {
    if (!this.config.email?.enabled) {
      throw new Error('邮件通知未启用');
    }

    const recipients = rule.recipients?.filter(r => r.includes('@')) || this.config.email.recipients;
    
    if (recipients.length === 0) {
      throw new Error('没有邮件接收人');
    }

    const subject = this.formatEmailSubject(alert);
    const body = this.formatEmailBody(alert, rule);

    // 使用 nodemailer 或其他邮件服务
    // 这里使用简化的实现
    console.log(`[Email] To: ${recipients.join(', ')}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Body: ${body}`);

    // TODO: 实际发送邮件
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});
  }

  // 发送短信
  private async sendSMS(alert: Alert, rule: AlertRule): Promise<void> {
    if (!this.config.sms?.enabled) {
      throw new Error('短信通知未启用');
    }

    const recipients = rule.recipients?.filter(r => /^1[3-9]\d{9}$/.test(r)) || this.config.sms.recipients;
    
    if (recipients.length === 0) {
      throw new Error('没有短信接收人');
    }

    const content = this.formatSMSContent(alert);

    console.log(`[SMS] To: ${recipients.join(', ')}`);
    console.log(`[SMS] Content: ${content}`);

    // TODO: 调用短信服务
    // await smsService.send({...});
  }

  // 发送 Webhook
  private async sendWebhook(alert: Alert, rule: AlertRule): Promise<void> {
    const urls = rule.webhookUrl ? [rule.webhookUrl] : this.config.webhook?.urls || [];
    
    if (urls.length === 0) {
      throw new Error('没有 Webhook URL');
    }

    const payload = this.formatWebhookPayload(alert, rule);

    for (const url of urls) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Alert-ID': alert.id,
          'X-Alert-Severity': alert.severity,
          ...this.config.webhook?.headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook 请求失败: ${response.status} ${response.statusText}`);
      }
    }
  }

  // 发送企业微信
  private async sendWechat(alert: Alert, rule: AlertRule): Promise<void> {
    if (!this.config.wechat?.enabled) {
      throw new Error('企业微信通知未启用');
    }

    // 获取 access_token
    const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.config.wechat.corpId}&corpsecret=${this.config.wechat.secret}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.errcode !== 0) {
      throw new Error(`获取企业微信 token 失败: ${tokenData.errmsg}`);
    }

    // 发送消息
    const sendUrl = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${tokenData.access_token}`;
    const message = this.formatWechatMessage(alert, rule);

    const sendRes = await fetch(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: this.config.wechat.toUser || '@all',
        toparty: this.config.wechat.toParty,
        msgtype: 'markdown',
        agentid: parseInt(this.config.wechat.agentId),
        markdown: { content: message },
      }),
    });

    const sendData = await sendRes.json();
    if (sendData.errcode !== 0) {
      throw new Error(`发送企业微信消息失败: ${sendData.errmsg}`);
    }
  }

  // 格式化邮件主题
  private formatEmailSubject(alert: Alert): string {
    const severityPrefix = {
      info: '[INFO]',
      warning: '[WARNING]',
      critical: '[CRITICAL]',
    };
    return `${severityPrefix[alert.severity]} ${alert.ruleName} - ${alert.metric}`;
  }

  // 格式化邮件正文
  private formatEmailBody(alert: Alert, rule: AlertRule): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .alert-box { padding: 20px; border-radius: 8px; margin: 20px 0; }
    .critical { background-color: #fee2e2; border-left: 4px solid #dc2626; }
    .warning { background-color: #fef3c7; border-left: 4px solid #d97706; }
    .info { background-color: #e0e7ff; border-left: 4px solid #4f46e5; }
    .metric { font-size: 24px; font-weight: bold; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-size: 18px; }
  </style>
</head>
<body>
  <h2>系统告警通知</h2>
  
  <div class="alert-box ${alert.severity}">
    <h3>${alert.ruleName}</h3>
    <p><span class="label">指标:</span> <span class="metric">${alert.metric}</span></p>
    <p><span class="label">当前值:</span> <span class="value">${alert.value.toFixed(2)}</span></p>
    <p><span class="label">阈值:</span> <span class="value">${this.getConditionText(alert.condition)} ${alert.threshold}</span></p>
    <p><span class="label">严重级别:</span> <span class="value">${alert.severity.toUpperCase()}</span></p>
    <p><span class="label">触发时间:</span> <span class="value">${alert.triggeredAt.toLocaleString('zh-CN')}</span></p>
  </div>
  
  <p>请及时处理此告警。</p>
  
  <hr>
  <p style="color: #9ca3af; font-size: 12px;">
    此邮件由创意之旅监控系统自动发送，请勿直接回复。
  </p>
</body>
</html>
    `.trim();
  }

  // 格式化短信内容
  private formatSMSContent(alert: Alert): string {
    const severityText = { info: '提示', warning: '警告', critical: '严重' };
    return `【创意之旅】${severityText[alert.severity]}：${alert.ruleName}，${alert.metric}=${alert.value.toFixed(2)}，阈值${alert.threshold}`;
  }

  // 格式化 Webhook 负载
  private formatWebhookPayload(alert: Alert, rule: AlertRule): object {
    return {
      version: '1.0',
      alertId: alert.id,
      ruleName: alert.ruleName,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      condition: alert.condition,
      severity: alert.severity,
      status: alert.status,
      message: alert.message,
      labels: alert.labels,
      triggeredAt: alert.triggeredAt.toISOString(),
      rule: {
        id: rule.id,
        name: rule.name,
        description: rule.description,
      },
    };
  }

  // 格式化企业微信消息
  private formatWechatMessage(alert: Alert, rule: AlertRule): string {
    const severityEmoji = { info: 'ℹ️', warning: '⚠️', critical: '🚨' };
    const severityColor = { info: 'info', warning: 'warning', critical: 'warning' };

    return `
${severityEmoji[alert.severity]} **系统告警**

> 规则: ${alert.ruleName}
> 指标: \`${alert.metric}\`
> 当前值: <font color="${severityColor[alert.severity]}">${alert.value.toFixed(2)}</font>
> 阈值: ${this.getConditionText(alert.condition)} ${alert.threshold}
> 级别: ${alert.severity.toUpperCase()}
> 时间: ${alert.triggeredAt.toLocaleString('zh-CN')}

请及时处理！
    `.trim();
  }

  // 获取条件文本
  private getConditionText(condition: string): string {
    const texts: Record<string, string> = {
      gt: '>',
      lt: '<',
      eq: '=',
      gte: '>=',
      lte: '<=',
      ne: '!=',
    };
    return texts[condition] || condition;
  }
}

// 单例
export const alertNotifier = new AlertNotifier();

export default alertNotifier;
