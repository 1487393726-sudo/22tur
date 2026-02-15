/**
 * 基础仓库类
 * Base Repository Class
 * 
 * 提供通用的数据库操作方法和错误处理
 */

import { PrismaClient } from '@prisma/client';

// 全局 Prisma 客户端实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set, using placeholder Prisma client')
    return null as any
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * 仓库错误类型
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * 基础仓库类
 */
export abstract class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 包装数据库操作，统一错误处理
   */
  protected async executeQuery<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`[Repository Error] ${errorMessage}:`, error);
      throw new RepositoryError(
        errorMessage,
        'DATABASE_ERROR',
        error
      );
    }
  }

  /**
   * 分页参数处理
   */
  protected getPaginationParams(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return { skip, take };
  }

  /**
   * 日期范围过滤
   */
  protected getDateRangeFilter(startDate?: Date, endDate?: Date) {
    const filter: { gte?: Date; lte?: Date } = {};
    if (startDate) filter.gte = startDate;
    if (endDate) filter.lte = endDate;
    return Object.keys(filter).length > 0 ? filter : undefined;
  }
}
