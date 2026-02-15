// 邮件服务工具函数
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

// 创建邮件传输器（单例模式）
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  // 从环境变量读取 SMTP 配置
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // 如果没有配置 SMTP，返回一个测试传输器
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('⚠️  SMTP 配置未完成，邮件将不会实际发送');
    console.warn('请在 .env 文件中配置 SMTP_HOST, SMTP_USER, SMTP_PASS');
    
    // 开发环境使用 ethereal.email 测试账号
    if (process.env.NODE_ENV === 'development') {
      console.log('💡 开发环境：使用控制台输出模拟邮件发送');
    }
    
    // 返回一个模拟传输器
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    
    return transporter;
  }

  // 创建真实的 SMTP 传输器
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // 连接超时设置
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  console.log('✅ SMTP 传输器已配置:', {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    user: smtpUser,
  });

  return transporter;
}

/**
 * 发送邮件
 * @param options 邮件选项
 * @returns Promise<boolean> 发送是否成功
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || '企业管理系统';

    console.log('📧 准备发送邮件:', {
      to: options.to,
      subject: options.subject,
      from: `${fromName} <${from}>`,
    });

    // 发送邮件
    const info = await transporter.sendMail({
      from: `${fromName} <${from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    // 开发环境下，输出邮件内容
    if (process.env.NODE_ENV === 'development') {
      console.log('📬 邮件发送成功:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
      
      // 如果使用的是测试传输器，输出邮件内容
      if (info.message) {
        console.log('📄 邮件内容预览:');
        console.log('---');
        console.log(options.html.substring(0, 500) + '...');
        console.log('---');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
    
    // 开发环境下，即使发送失败也返回 true，避免阻塞流程
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  开发环境：忽略邮件发送错误');
      return true;
    }
    
    return false;
  }
}

/**
 * 发送密码重置邮件
 * @param email 用户邮箱
 * @param resetToken 重置令牌
 * @returns Promise<boolean>
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>密码重置请求</h1>
          </div>
          <div class="content">
            <p>您好，</p>
            <p>我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">重置密码</a>
            </div>
            <p>或者复制以下链接到浏览器：</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <p><strong>重要提示：</strong></p>
            <ul>
              <li>此链接将在 <strong>15分钟</strong> 后过期</li>
              <li>如果您没有请求重置密码，请忽略此邮件</li>
              <li>为了您的账户安全，请勿将此链接分享给他人</li>
            </ul>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 企业管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    密码重置请求
    
    您好，
    
    我们收到了您的密码重置请求。请访问以下链接重置您的密码：
    
    ${resetUrl}
    
    重要提示：
    - 此链接将在 15分钟 后过期
    - 如果您没有请求重置密码，请忽略此邮件
    - 为了您的账户安全，请勿将此链接分享给他人
    
    此邮件由系统自动发送，请勿回复
  `;
  
  return sendEmail({
    to: email,
    subject: '密码重置请求 - 企业管理系统',
    html,
    text,
  });
}

/**
 * 发送邮箱验证邮件
 * @param email 用户邮箱
 * @param verificationToken 验证令牌
 * @returns Promise<boolean>
 */
export async function sendEmailVerification(
  email: string,
  verificationToken: string
): Promise<boolean> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>验证您的邮箱</h1>
          </div>
          <div class="content">
            <p>您好，</p>
            <p>感谢您注册企业管理系统！请点击下面的按钮验证您的邮箱地址：</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">验证邮箱</a>
            </div>
            <p>或者复制以下链接到浏览器：</p>
            <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
            <p><strong>提示：</strong></p>
            <ul>
              <li>验证邮箱后，您将可以使用系统的全部功能</li>
              <li>如果您没有注册账户，请忽略此邮件</li>
            </ul>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 企业管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    验证您的邮箱
    
    您好，
    
    感谢您注册企业管理系统！请访问以下链接验证您的邮箱地址：
    
    ${verifyUrl}
    
    提示：
    - 验证邮箱后，您将可以使用系统的全部功能
    - 如果您没有注册账户，请忽略此邮件
    
    此邮件由系统自动发送，请勿回复
  `;
  
  return sendEmail({
    to: email,
    subject: '验证您的邮箱 - 企业管理系统',
    html,
    text,
  });
}

/**
 * 发送欢迎邮件
 * @param email 用户邮箱
 * @param userName 用户名
 * @returns Promise<boolean>
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<boolean> {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .feature-list {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 欢迎加入企业管理系统！</h1>
          </div>
          <div class="content">
            <p>您好 <strong>${userName}</strong>，</p>
            <p>欢迎加入企业管理系统！我们很高兴您成为我们的一员。</p>
            
            <div class="feature-list">
              <h3>您可以使用以下功能：</h3>
              <ul>
                <li>📋 项目和任务管理</li>
                <li>📄 文档管理和版本控制</li>
                <li>💬 消息中心和团队协作</li>
                <li>📊 报表和数据分析</li>
                <li>🔄 工作流和审批流程</li>
                <li>⏱️ 时间跟踪和工时统计</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">立即登录</a>
            </div>
            
            <p><strong>温馨提示：</strong></p>
            <ul>
              <li>请妥善保管您的账户信息</li>
              <li>建议定期修改密码以确保账户安全</li>
              <li>如有任何问题，请联系系统管理员</li>
            </ul>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 企业管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    欢迎加入企业管理系统！
    
    您好 ${userName}，
    
    欢迎加入企业管理系统！我们很高兴您成为我们的一员。
    
    您可以使用以下功能：
    - 项目和任务管理
    - 文档管理和版本控制
    - 消息中心和团队协作
    - 报表和数据分析
    - 工作流和审批流程
    - 时间跟踪和工时统计
    
    立即登录：${loginUrl}
    
    温馨提示：
    - 请妥善保管您的账户信息
    - 建议定期修改密码以确保账户安全
    - 如有任何问题，请联系系统管理员
    
    此邮件由系统自动发送，请勿回复
  `;
  
  return sendEmail({
    to: email,
    subject: '欢迎加入企业管理系统！',
    html,
    text,
  });
}

/**
 * 发送任务分配邮件
 * @param email 用户邮箱
 * @param userName 用户名
 * @param taskTitle 任务标题
 * @param taskId 任务ID
 * @param assignerName 分配人名称
 * @param dueDate 截止日期
 * @returns Promise<boolean>
 */
export async function sendTaskAssignmentEmail(
  email: string,
  userName: string,
  taskTitle: string,
  taskId: string,
  assignerName: string,
  dueDate?: Date
): Promise<boolean> {
  const taskUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`;
  const dueDateStr = dueDate ? new Date(dueDate).toLocaleDateString('zh-CN') : '未设置';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .task-info {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 新任务分配</h1>
          </div>
          <div class="content">
            <p>您好 <strong>${userName}</strong>，</p>
            <p><strong>${assignerName}</strong> 为您分配了一个新任务：</p>
            
            <div class="task-info">
              <h3>${taskTitle}</h3>
              <p><strong>截止日期：</strong> ${dueDateStr}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${taskUrl}" class="button">查看任务详情</a>
            </div>
            
            <p>请及时查看任务详情并开始工作。如有任何问题，请与分配人联系。</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 企业管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    新任务分配
    
    您好 ${userName}，
    
    ${assignerName} 为您分配了一个新任务：
    
    任务：${taskTitle}
    截止日期：${dueDateStr}
    
    查看任务详情：${taskUrl}
    
    请及时查看任务详情并开始工作。如有任何问题，请与分配人联系。
    
    此邮件由系统自动发送，请勿回复
  `;
  
  return sendEmail({
    to: email,
    subject: `新任务分配：${taskTitle}`,
    html,
    text,
  });
}

/**
 * 发送审批请求邮件
 * @param email 审批人邮箱
 * @param approverName 审批人名称
 * @param requesterName 申请人名称
 * @param workflowName 工作流名称
 * @param instanceId 工作流实例ID
 * @param description 申请描述
 * @returns Promise<boolean>
 */
export async function sendApprovalRequestEmail(
  email: string,
  approverName: string,
  requesterName: string,
  workflowName: string,
  instanceId: string,
  description?: string
): Promise<boolean> {
  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/approvals/${instanceId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .approval-info {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #f093fb;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ 待审批请求</h1>
          </div>
          <div class="content">
            <p>您好 <strong>${approverName}</strong>，</p>
            <p><strong>${requesterName}</strong> 提交了一个审批请求，需要您的审批：</p>
            
            <div class="approval-info">
              <h3>${workflowName}</h3>
              ${description ? `<p>${description}</p>` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${approvalUrl}" class="button">立即审批</a>
            </div>
            
            <p>请及时处理审批请求。如有疑问，请与申请人联系。</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 企业管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    待审批请求
    
    您好 ${approverName}，
    
    ${requesterName} 提交了一个审批请求，需要您的审批：
    
    工作流：${workflowName}
    ${description ? `描述：${description}` : ''}
    
    立即审批：${approvalUrl}
    
    请及时处理审批请求。如有疑问，请与申请人联系。
    
    此邮件由系统自动发送，请勿回复
  `;
  
  return sendEmail({
    to: email,
    subject: `待审批：${workflowName}`,
    html,
    text,
  });
}

/**
 * 发送发票邮件
 * @param email 客户邮箱
 * @param clientName 客户名称
 * @param invoiceNumber 发票号
 * @param invoiceId 发票ID
 * @param amount 金额
 * @param dueDate 到期日期
 * @returns Promise<boolean>
 */
export async function sendInvoiceEmail(
  email: string,
  clientName: string,
  invoiceNumber: string,
  invoiceId: string,
  amount: number,
  dueDate: Date
): Promise<boolean> {
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices/${invoiceId}`;
  const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invoices/${invoiceId}/pdf`;
  const dueDateStr = new Date(dueDate).toLocaleDateString('zh-CN');
  const amountStr = amount.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
          }
          .invoice-info {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #4facfe;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 发票通知</h1>
          </div>
          <div class="content">
            <p>尊敬的 <strong>${clientName}</strong>，</p>
            <p>您有一张新的发票，详情如下：</p>
            
            <div class="invoice-info">
              <h3>发票 #${invoiceNumber}</h3>
              <p><strong>金额：</strong> ${amountStr}</p>
              <p><strong>到期日期：</strong> ${dueDateStr}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${invoiceUrl}" class="button">查看发票</a>
              <a href="${pdfUrl}" class="button">下载 PDF</a>
            </div>
            
            <p>请在到期日前完成付款。如有任何问题，请及时与我们联系。</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 企业管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    发票通知
    
    尊敬的 ${clientName}，
    
    您有一张新的发票，详情如下：
    
    发票号：#${invoiceNumber}
    金额：${amountStr}
    到期日期：${dueDateStr}
    
    查看发票：${invoiceUrl}
    下载 PDF：${pdfUrl}
    
    请在到期日前完成付款。如有任何问题，请及时与我们联系。
    
    此邮件由系统自动发送，请勿回复
  `;
  
  return sendEmail({
    to: email,
    subject: `发票 #${invoiceNumber} - 企业管理系统`,
    html,
    text,
  });
}

/**
 * 发送工作流通知邮件
 * @param email 用户邮箱
 * @param userName 用户名
 * @param workflowName 工作流名称
 * @param status 状态（已完成/已拒绝/已取消）
 * @param instanceId 工作流实例ID
 * @param notes 备注
 * @returns Promise<boolean>
 */
export async function sendWorkflowNotificationEmail(
  email: string,
  userName: string,
  workflowName: string,
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED',
  instanceId: string,
  notes?: string
): Promise<boolean> {
  const workflowUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/approvals/${instanceId}`;
  
  const statusMap = {
    COMPLETED: { text: '已完成', emoji: '✅', color: '#10b981' },
    FAILED: { text: '已拒绝', emoji: '❌', color: '#ef4444' },
    CANCELLED: { text: '已取消', emoji: '⚠️', color: '#f59e0b' },
  };
  
  const statusInfo = statusMap[status];
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .workflow-info {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid ${statusInfo.color};
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            background: ${statusInfo.color};
            color: white;
            border-radius: 20px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.emoji} 工作流状态更新</h1>
          </div>
          <div class="content">
            <p>您好 <strong>${userName}</strong>，</p>
            <p>您的工作流已更新：</p>
            
            <div class="workflow-info">
              <h3>${workflowName}</h3>
              <p><span class="status-badge">${statusInfo.text}</span></p>
              ${notes ? `<p><strong>备注：</strong>${notes}</p>` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${workflowUrl}" class="button">查看详情</a>
            </div>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 企业管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
    工作流状态更新
    
    您好 ${userName}，
    
    您的工作流已更新：
    
    工作流：${workflowName}
    状态：${statusInfo.text}
    ${notes ? `备注：${notes}` : ''}
    
    查看详情：${workflowUrl}
    
    此邮件由系统自动发送，请勿回复
  `;
  
  return sendEmail({
    to: email,
    subject: `工作流${statusInfo.text}：${workflowName}`,
    html,
    text,
  });
}
