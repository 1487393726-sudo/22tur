import hexhubPrisma from './prisma'
import { hash, compare } from 'bcryptjs'

export class HexHubUserService {
  /**
   * 创建用户
   */
  static async createUser(data: {
    email: string
    username: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
  }) {
    const hashedPassword = await hash(data.password, 10)

    return hexhubPrisma.hexHubUser.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'USER',
      },
    })
  }

  /**
   * 获取用户
   */
  static async getUser(id: string) {
    return hexhubPrisma.hexHubUser.findUnique({
      where: { id },
      include: {
        projects: true,
        datasets: true,
      },
    })
  }

  /**
   * 通过邮箱获取用户
   */
  static async getUserByEmail(email: string) {
    return hexhubPrisma.hexHubUser.findUnique({
      where: { email },
    })
  }

  /**
   * 验证密码
   */
  static async verifyPassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword)
  }

  /**
   * 更新用户
   */
  static async updateUser(
    id: string,
    data: {
      firstName?: string
      lastName?: string
      avatar?: string
      status?: string
    }
  ) {
    return hexhubPrisma.hexHubUser.update({
      where: { id },
      data,
    })
  }

  /**
   * 更新最后登录时间
   */
  static async updateLastLogin(id: string) {
    return hexhubPrisma.hexHubUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }

  /**
   * 列出所有用户
   */
  static async listUsers(options?: {
    skip?: number
    take?: number
    status?: string
    role?: string
  }) {
    return hexhubPrisma.hexHubUser.findMany({
      where: {
        status: options?.status,
        role: options?.role,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: string) {
    return hexhubPrisma.hexHubUser.delete({
      where: { id },
    })
  }
}
