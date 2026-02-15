// lib/auth/account-linking-service.ts
// 账户关联管理服务

import { prisma } from '@/lib/prisma';
import type {
  OAuthProvider,
  LinkedAccount,
  AccountLinkingResult,
  AuthError,
  AuthErrorCodes,
} from '@/types/auth';

export class AccountLinkingService {
  /**
   * 关联第三方账户
   */
  static async linkAccount(
    userId: string,
    provider: OAuthProvider,
    providerAccountId: string,
    profile?: {
      email?: string;
      name?: string;
      avatar?: string;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
    }
  ): Promise<AccountLinkingResult> {
    // 检查该提供商账户是否已关联到其他用户
    const existingLink = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });

    if (existingLink) {
      if (existingLink.userId === userId) {
        return {
          success: true,
          provider,
          message: 'Account already linked',
        };
      }
      return {
        success: false,
        provider,
        message: 'This account is already linked to another user',
      };
    }

    // 创建关联
    await prisma.oAuthAccount.create({
      data: {
        userId,
        provider,
        providerAccountId,
        accessToken: profile?.accessToken,
        refreshToken: profile?.refreshToken,
        expiresAt: profile?.expiresAt,
      },
    });

    return {
      success: true,
      provider,
      message: 'Account linked successfully',
    };
  }

  /**
   * 解除第三方账户关联
   */
  static async unlinkAccount(
    userId: string,
    provider: OAuthProvider
  ): Promise<AccountLinkingResult> {
    // 检查是否可以解除关联
    const canUnlink = await this.canUnlink(userId, provider);
    if (!canUnlink) {
      return {
        success: false,
        provider,
        message: 'Cannot unlink: this is your only login method',
      };
    }

    // 检查关联是否存在
    const link = await prisma.oAuthAccount.findFirst({
      where: { userId, provider },
    });

    if (!link) {
      return {
        success: false,
        provider,
        message: 'Account not linked',
      };
    }

    // 删除关联
    await prisma.oAuthAccount.delete({
      where: { id: link.id },
    });

    return {
      success: true,
      provider,
      message: 'Account unlinked successfully',
    };
  }


  /**
   * 获取用户已关联的账户列表
   */
  static async getLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
    const accounts = await prisma.oAuthAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((account) => ({
      provider: account.provider as OAuthProvider,
      providerAccountId: account.providerAccountId,
      linkedAt: account.createdAt,
    }));
  }

  /**
   * 检查是否可以解除关联
   * 确保用户至少保留一种登录方式
   */
  static async canUnlink(
    userId: string,
    provider: OAuthProvider
  ): Promise<boolean> {
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    // 获取所有关联的 OAuth 账户
    const linkedAccounts = await prisma.oAuthAccount.findMany({
      where: { userId },
    });

    // 如果用户有密码，可以解除任何 OAuth 关联
    if (user?.password) {
      return true;
    }

    // 如果没有密码，必须保留至少一个 OAuth 账户
    const otherAccounts = linkedAccounts.filter((a) => a.provider !== provider);
    return otherAccounts.length > 0;
  }

  /**
   * 检查提供商是否已关联
   */
  static async isProviderLinked(
    userId: string,
    provider: OAuthProvider
  ): Promise<boolean> {
    const link = await prisma.oAuthAccount.findFirst({
      where: { userId, provider },
    });
    return !!link;
  }

  /**
   * 获取用户的登录方式数量
   */
  static async getLoginMethodCount(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    const linkedAccounts = await prisma.oAuthAccount.count({
      where: { userId },
    });

    // 密码算一种登录方式
    const hasPassword = user?.password ? 1 : 0;

    return hasPassword + linkedAccounts;
  }

  /**
   * 通过提供商 ID 查找用户
   */
  static async findUserByProvider(
    provider: OAuthProvider,
    providerAccountId: string
  ): Promise<string | null> {
    const account = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      select: { userId: true },
    });

    return account?.userId || null;
  }
}
