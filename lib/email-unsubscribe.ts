// 邮件退订链接生成工具
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * 生成退订令牌
 * @param userId 用户ID
 * @returns Promise<string> 退订令牌
 */
export async function generateUnsubscribeToken(userId: string): Promise<string> {
  // 检查用户是否已有退订令牌
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { unsubscribeToken: true },
  });

  // 如果已有令牌，直接返回
  if (user?.unsubscribeToken) {
    return user.unsubscribeToken;
  }

  // 生成新令牌
  const token = crypto.randomBytes(32).toString('hex');

  // 保存到用户记录
  await prisma.user.update({
    where: { id: userId },
    data: { unsubscribeToken: token },
  });

  return token;
}

/**
 * 生成退订链接
 * @param userId 用户ID
 * @returns Promise<string> 退订链接
 */
export async function generateUnsubscribeLink(userId: string): Promise<string> {
  const token = await generateUnsubscribeToken(userId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/unsubscribe?token=${token}`;
}

/**
 * 生成退订HTML片段
 * @param userId 用户ID
 * @returns Promise<string> HTML片段
 */
export async function generateUnsubscribeFooter(userId: string): Promise<string> {
  const unsubscribeLink = await generateUnsubscribeLink(userId);
  
  return `
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        不想再收到这类邮件？
        <a href="${unsubscribeLink}" style="color: #667eea; text-decoration: underline;">
          点击这里退订
        </a>
      </p>
    </div>
  `;
}

/**
 * 验证退订令牌
 * @param token 退订令牌
 * @returns Promise<string | null> 用户ID，如果令牌无效则返回null
 */
export async function verifyUnsubscribeToken(token: string): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { unsubscribeToken: token },
    select: { id: true },
  });

  return user?.id || null;
}
