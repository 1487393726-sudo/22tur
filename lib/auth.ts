import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { Role } from './types'
import { findUserByIdentifier } from './auth-utils'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email/Phone/UserID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        // 使用增强的标识符识别功能查找用户
        const user = await findUserByIdentifier(credentials.identifier)

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // 更新最后登录时间
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phone,
          role: user.role as Role,
          status: user.status
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.sub = user.id // 确保设置用户ID到token.sub
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.username = user.username
        token.phone = user.phone
        token.status = user.status
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.username = token.username as string
        session.user.phone = token.phone as string
        session.user.status = token.status as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register'
  }
}