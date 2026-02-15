// lib/auth/oauth-service.ts
// OAuth 服务 - 处理账户关联和用户管理

import { prisma } from "@/lib/prisma";
import type {
  OAuthProvider,
  OAuthAccount,
  LinkedAccount,
  AccountLinkingResult,
  AuthError,
  AuthErrorCodes,
} from "@/types/auth";

/**
 * OAuth Service - Handles OAuth account linking and management
 */
export class OAuthService {
  /**
   * Get all linked OAuth accounts for a user
   */
  static async getLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
    const accounts = await prisma.oAuthAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return accounts.map((account) => ({
      provider: account.provider as OAuthProvider,
      providerAccountId: account.providerAccountId,
      linkedAt: account.createdAt,
    }));
  }

  /**
   * Link a new OAuth account to an existing user
   */
  static async linkAccount(
    userId: string,
    provider: OAuthProvider,
    providerAccountId: string,
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      tokenType?: string;
      scope?: string;
      idToken?: string;
    }
  ): Promise<AccountLinkingResult> {
    // Check if this provider account is already linked to another user
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
          message: "Account already linked",
        };
      }
      return {
        success: false,
        provider,
        message: "This account is already linked to another user",
      };
    }

    // Create the link
    await prisma.oAuthAccount.create({
      data: {
        userId,
        provider,
        providerAccountId,
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
        expiresAt: tokens?.expiresAt,
        tokenType: tokens?.tokenType,
        scope: tokens?.scope,
        idToken: tokens?.idToken,
      },
    });

    return {
      success: true,
      provider,
      message: "Account linked successfully",
    };
  }

  /**
   * Unlink an OAuth account from a user
   */
  static async unlinkAccount(
    userId: string,
    provider: OAuthProvider
  ): Promise<AccountLinkingResult> {
    // Check if user has other login methods
    const canUnlink = await this.canUnlinkAccount(userId, provider);
    if (!canUnlink) {
      return {
        success: false,
        provider,
        message: "Cannot unlink the last login method",
      };
    }

    // Find and delete the OAuth account
    const account = await prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider,
      },
    });

    if (!account) {
      return {
        success: false,
        provider,
        message: "Account not found",
      };
    }

    await prisma.oAuthAccount.delete({
      where: { id: account.id },
    });

    return {
      success: true,
      provider,
      message: "Account unlinked successfully",
    };
  }

  /**
   * Check if a user can unlink an OAuth account
   * User must have at least one other login method (password or another OAuth)
   */
  static async canUnlinkAccount(
    userId: string,
    providerToUnlink: OAuthProvider
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: true,
      },
    });

    if (!user) {
      return false;
    }

    // Check if user has a password
    const hasPassword = user.password && user.password.length > 0;

    // Count other OAuth accounts
    const otherOAuthAccounts = user.oauthAccounts.filter(
      (account) => account.provider !== providerToUnlink
    );

    // User can unlink if they have a password OR other OAuth accounts
    return hasPassword || otherOAuthAccounts.length > 0;
  }

  /**
   * Find user by OAuth provider and account ID
   */
  static async findUserByOAuth(
    provider: OAuthProvider,
    providerAccountId: string
  ) {
    const oauthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });

    return oauthAccount?.user || null;
  }

  /**
   * Find user by email and optionally link OAuth account
   */
  static async findOrCreateUserByEmail(
    email: string,
    provider: OAuthProvider,
    providerAccountId: string,
    profile: {
      name?: string;
      avatar?: string;
    },
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      tokenType?: string;
      scope?: string;
      idToken?: string;
    }
  ) {
    // First check if OAuth account exists
    const existingOAuth = await this.findUserByOAuth(provider, providerAccountId);
    if (existingOAuth) {
      // Update tokens
      await prisma.oAuthAccount.update({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        data: {
          accessToken: tokens?.accessToken,
          refreshToken: tokens?.refreshToken,
          expiresAt: tokens?.expiresAt,
          tokenType: tokens?.tokenType,
          scope: tokens?.scope,
          idToken: tokens?.idToken,
        },
      });
      return existingOAuth;
    }

    // Check if user with email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Link OAuth account to existing user
      await this.linkAccount(existingUser.id, provider, providerAccountId, tokens);
      return existingUser;
    }

    // Create new user
    const nameParts = (profile.name || "User").split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";
    const username = email.split("@")[0] || `user_${Date.now()}`;

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: "", // OAuth users don't have password
        firstName,
        lastName,
        avatar: profile.avatar,
        role: "EMPLOYEE",
        status: "ACTIVE",
        emailVerified: new Date(),
        oauthAccounts: {
          create: {
            provider,
            providerAccountId,
            accessToken: tokens?.accessToken,
            refreshToken: tokens?.refreshToken,
            expiresAt: tokens?.expiresAt,
            tokenType: tokens?.tokenType,
            scope: tokens?.scope,
            idToken: tokens?.idToken,
          },
        },
      },
    });

    return newUser;
  }

  /**
   * Create user from OAuth without email (WeChat/QQ)
   */
  static async createUserFromOAuth(
    provider: OAuthProvider,
    providerAccountId: string,
    profile: {
      name?: string;
      avatar?: string;
    },
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      tokenType?: string;
      scope?: string;
      idToken?: string;
    }
  ) {
    // Check if OAuth account exists
    const existingOAuth = await this.findUserByOAuth(provider, providerAccountId);
    if (existingOAuth) {
      // Update tokens
      await prisma.oAuthAccount.update({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        data: {
          accessToken: tokens?.accessToken,
          refreshToken: tokens?.refreshToken,
          expiresAt: tokens?.expiresAt,
          tokenType: tokens?.tokenType,
          scope: tokens?.scope,
          idToken: tokens?.idToken,
        },
      });
      return existingOAuth;
    }

    // Create new user
    const nameParts = (profile.name || "User").split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";
    const username = `${provider}_${providerAccountId.substring(0, 8)}`;
    const email = `${provider}_${providerAccountId}@oauth.local`;

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: "",
        firstName,
        lastName,
        avatar: profile.avatar,
        role: "EMPLOYEE",
        status: "ACTIVE",
        oauthAccounts: {
          create: {
            provider,
            providerAccountId,
            accessToken: tokens?.accessToken,
            refreshToken: tokens?.refreshToken,
            expiresAt: tokens?.expiresAt,
            tokenType: tokens?.tokenType,
            scope: tokens?.scope,
            idToken: tokens?.idToken,
          },
        },
      },
    });

    return newUser;
  }

  /**
   * Update OAuth tokens for an account
   */
  static async updateTokens(
    provider: OAuthProvider,
    providerAccountId: string,
    tokens: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      tokenType?: string;
      scope?: string;
      idToken?: string;
    }
  ) {
    await prisma.oAuthAccount.update({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        tokenType: tokens.tokenType,
        scope: tokens.scope,
        idToken: tokens.idToken,
      },
    });
  }

  /**
   * Get OAuth account details
   */
  static async getOAuthAccount(
    userId: string,
    provider: OAuthProvider
  ): Promise<OAuthAccount | null> {
    const account = await prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider,
      },
    });

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      userId: account.userId,
      provider: account.provider as OAuthProvider,
      providerAccountId: account.providerAccountId,
      accessToken: account.accessToken || undefined,
      refreshToken: account.refreshToken || undefined,
      expiresAt: account.expiresAt || undefined,
      tokenType: account.tokenType || undefined,
      scope: account.scope || undefined,
      idToken: account.idToken || undefined,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  /**
   * Check if provider is already linked to user
   */
  static async isProviderLinked(
    userId: string,
    provider: OAuthProvider
  ): Promise<boolean> {
    const account = await prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider,
      },
    });

    return !!account;
  }

  /**
   * Get count of linked accounts for a user
   */
  static async getLinkedAccountCount(userId: string): Promise<number> {
    return prisma.oAuthAccount.count({
      where: { userId },
    });
  }
}

export default OAuthService;
