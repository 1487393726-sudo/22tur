/**
 * 小程序认证模块
 * Miniprogram Authentication Module
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface MiniprogramUser {
  id: string;
  openId: string;
  unionId?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
}

/**
 * 验证小程序 Token
 * Verify miniprogram token from request header
 */
export async function verifyMiniprogramToken(request: NextRequest): Promise<MiniprogramUser | null> {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    // 查找用户会话
    const session = await prisma.session.findFirst({
      where: {
        sessionToken: token,
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      openId: session.user.id, // 使用用户ID作为openId
      nickname: session.user.name || undefined,
      avatar: session.user.image || undefined,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * 获取小程序用户信息
 * Get miniprogram user from request
 */
export async function getMiniprogramUser(request: NextRequest): Promise<MiniprogramUser | null> {
  return verifyMiniprogramToken(request);
}

/**
 * 生成小程序会话 Token
 * Generate miniprogram session token
 */
export function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
