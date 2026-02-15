import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { findUserByIdentifier, identifyLoginType, IdentifierType } from "@/lib/auth-utils"
import type { OAuthProvider } from "@/types/auth"
import WeChatProvider from "@/lib/auth/wechat-provider"
import QQProvider from "@/lib/auth/qq-provider"

// 登录失败计数器（用于检测暴力破解）
const loginFailureTracker = new Map<string, { count: number; lastAttempt: number }>();

// 清理过期的失败记录（每小时清理一次）
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  for (const [key, value] of loginFailureTracker.entries()) {
    if (now - value.lastAttempt > oneHour) {
      loginFailureTracker.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Helper function to link OAuth account to existing user or create new user
async function handleOAuthSignIn(
  account: { provider: string; providerAccountId: string; access_token?: string; refresh_token?: string; expires_at?: number; token_type?: string; scope?: string; id_token?: string },
  profile: { email?: string | null; name?: string | null; image?: string | null; id: string }
) {
  const provider = account.provider as OAuthProvider;
  
  // Check if OAuth account already exists
  const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: provider,
        providerAccountId: account.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingOAuthAccount) {
    // Update tokens
    await prisma.oAuthAccount.update({
      where: { id: existingOAuthAccount.id },
      data: {
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        expiresAt: account.expires_at,
        tokenType: account.token_type,
        scope: account.scope,
        idToken: account.id_token,
      },
    });
    return existingOAuthAccount.user;
  }

  // Check if user with same email exists
  if (profile.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      // Link OAuth account to existing user
      await prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider: provider,
          providerAccountId: account.providerAccountId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          tokenType: account.token_type,
          scope: account.scope,
          idToken: account.id_token,
        },
      });
      return existingUser;
    }
  }

  // Create new user with OAuth account
  const nameParts = (profile.name || 'User').split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';
  const username = profile.email?.split('@')[0] || `user_${Date.now()}`;

  const newUser = await prisma.user.create({
    data: {
      email: profile.email || `${provider}_${account.providerAccountId}@oauth.local`,
      username: username,
      password: '', // OAuth users don't have password
      firstName: firstName,
      lastName: lastName,
      avatar: profile.image,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      emailVerified: new Date(), // OAuth emails are verified
      oauthAccounts: {
        create: {
          provider: provider,
          providerAccountId: account.providerAccountId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          tokenType: account.token_type,
          scope: account.scope,
          idToken: account.id_token,
        },
      },
    },
  });

  return newUser;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email',
        }
      }
    }),
    // WeChat OAuth Provider (微信)
    ...(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET ? [
      WeChatProvider({
        appId: process.env.WECHAT_APP_ID,
        appSecret: process.env.WECHAT_APP_SECRET,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/wechat`,
      })
    ] : []),
    // QQ OAuth Provider
    ...(process.env.QQ_CLIENT_ID && process.env.QQ_CLIENT_SECRET ? [
      QQProvider({
        clientId: process.env.QQ_CLIENT_ID,
        clientSecret: process.env.QQ_CLIENT_SECRET,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/qq`,
      })
    ] : []),
    // Credentials Provider (existing)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email/Phone/UserID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<any> {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            console.log('❌ 缺少凭证');
            return null
          }

          console.log(`🔐 尝试登录: ${credentials.identifier}`);

          // 使用增强的标识符识别功能查找用户
          const user = await findUserByIdentifier(credentials.identifier)

          if (!user) {
            console.log(`❌ 用户不存在: ${credentials.identifier}`);
            return null
          }

          console.log(`✅ 用户存在: ${user.email}`);

          // 验证密码
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log(`❌ 密码错误: ${credentials.identifier}`);
            return null
          }

          console.log(`✅ 密码正确: ${credentials.identifier}`);

          // 更新最后登录时间
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            })
          } catch (err) {
            console.error('更新登录时间失败:', err);
          }

          console.log(`✅ 登录成功: ${user.email}`);

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
          }
        } catch (error) {
          console.error('❌ 授权过程中出错:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/admin-login",
    error: "/admin-login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in
      if (account && account.provider !== 'credentials' && profile) {
        try {
          const oauthUser = await handleOAuthSignIn(
            {
              provider: account.provider,
              providerAccountId: account.providerAccountId!,
              access_token: account.access_token ?? undefined,
              refresh_token: account.refresh_token ?? undefined,
              expires_at: account.expires_at ?? undefined,
              token_type: account.token_type ?? undefined,
              scope: account.scope ?? undefined,
              id_token: account.id_token ?? undefined,
            },
            {
              email: profile.email,
              name: profile.name ?? user.name,
              image: profile.image ?? user.image,
              id: account.providerAccountId!,
            }
          );
          // Attach user info to the user object for JWT callback
          (user as any).id = oauthUser.id;
          (user as any).role = oauthUser.role;
          return true;
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || 'EMPLOYEE';
        token.sub = (user as any).id || token.sub;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        (session as any).provider = token.provider;
      }
      return session;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }