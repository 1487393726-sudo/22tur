/**
 * 数据库查询优化工具
 * 提供查询优化、批量查询、分页优化等功能
 */

import { Prisma } from "@prisma/client";

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

/**
 * 分页结果接口
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

/**
 * 解析分页参数
 */
export function parsePaginationParams(
  params: PaginationParams,
  defaults: { page: number; pageSize: number; maxPageSize: number } = {
    page: 1,
    pageSize: 10,
    maxPageSize: 100,
  }
): { skip: number; take: number; page: number; pageSize: number } {
  const page = Math.max(1, params.page ?? defaults.page);
  const pageSize = Math.min(
    defaults.maxPageSize,
    Math.max(1, params.pageSize ?? defaults.pageSize)
  );

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    page,
    pageSize,
  };
}

/**
 * 创建分页结果
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * 游标分页参数
 */
export interface CursorPaginationParams {
  cursor?: string;
  take?: number;
  direction?: "forward" | "backward";
}

/**
 * 解析游标分页参数（用于大数据集）
 */
export function parseCursorPagination(
  params: CursorPaginationParams,
  defaults: { take: number; maxTake: number } = { take: 20, maxTake: 100 }
): {
  cursor?: { id: string };
  take: number;
  skip: number;
} {
  const take = Math.min(
    defaults.maxTake,
    Math.max(1, params.take ?? defaults.take)
  );

  return {
    cursor: params.cursor ? { id: params.cursor } : undefined,
    take: params.direction === "backward" ? -take : take,
    skip: params.cursor ? 1 : 0, // 跳过游标本身
  };
}

/**
 * 优化的 select 字段生成器
 * 只选择需要的字段，减少数据传输
 */
export const optimizedSelects = {
  // 项目列表（精简字段）
  projectList: {
    id: true,
    title: true,
    description: true,
    status: true,
    category: true,
    targetAmount: true,
    totalRaised: true,
    investorCount: true,
    expectedReturnRate: true,
    coverImage: true,
    createdAt: true,
  } as const,

  // 项目详情（完整字段）
  projectDetail: {
    id: true,
    title: true,
    description: true,
    content: true,
    status: true,
    category: true,
    targetAmount: true,
    minInvestment: true,
    maxInvestment: true,
    totalRaised: true,
    investorCount: true,
    expectedReturnRate: true,
    duration: true,
    riskLevel: true,
    coverImage: true,
    images: true,
    startDate: true,
    endDate: true,
    createdAt: true,
    updatedAt: true,
    createdBy: {
      select: {
        id: true,
        name: true,
      },
    },
  } as const,

  // 投资列表
  investmentList: {
    id: true,
    amount: true,
    status: true,
    expectedReturn: true,
    createdAt: true,
    project: {
      select: {
        id: true,
        title: true,
        coverImage: true,
      },
    },
  } as const,

  // 文件列表
  fileList: {
    id: true,
    fileName: true,
    originalName: true,
    fileType: true,
    fileSize: true,
    isLocked: true,
    unlockPrice: true,
    description: true,
    createdAt: true,
  } as const,

  // 用户基本信息
  userBasic: {
    id: true,
    name: true,
    email: true,
    image: true,
    role: true,
  } as const,
};

/**
 * 批量查询优化器
 * 用于 N+1 查询问题的解决
 */
export class BatchLoader<K, V> {
  private batch: Map<K, { resolve: (value: V | null) => void; reject: (error: Error) => void }[]> = new Map();
  private scheduled = false;
  private batchFn: (keys: K[]) => Promise<Map<K, V>>;
  private delay: number;

  constructor(
    batchFn: (keys: K[]) => Promise<Map<K, V>>,
    options: { delay?: number } = {}
  ) {
    this.batchFn = batchFn;
    this.delay = options.delay ?? 0;
  }

  async load(key: K): Promise<V | null> {
    return new Promise((resolve, reject) => {
      const callbacks = this.batch.get(key) || [];
      callbacks.push({ resolve, reject });
      this.batch.set(key, callbacks);

      if (!this.scheduled) {
        this.scheduled = true;
        setTimeout(() => this.executeBatch(), this.delay);
      }
    });
  }

  private async executeBatch(): Promise<void> {
    const batch = this.batch;
    this.batch = new Map();
    this.scheduled = false;

    const keys = Array.from(batch.keys());
    if (keys.length === 0) return;

    try {
      const results = await this.batchFn(keys);
      for (const [key, callbacks] of batch.entries()) {
        const value = results.get(key) ?? null;
        for (const { resolve } of callbacks) {
          resolve(value);
        }
      }
    } catch (error) {
      for (const callbacks of batch.values()) {
        for (const { reject } of callbacks) {
          reject(error as Error);
        }
      }
    }
  }
}

/**
 * 查询条件构建器
 */
export class QueryBuilder<T extends Record<string, unknown>> {
  private conditions: Prisma.JsonObject[] = [];
  private orderByClause: Record<string, "asc" | "desc">[] = [];

  where(condition: Prisma.JsonObject): this {
    this.conditions.push(condition);
    return this;
  }

  whereIf(condition: boolean, clause: Prisma.JsonObject): this {
    if (condition) {
      this.conditions.push(clause);
    }
    return this;
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this.orderByClause.push({ [field]: direction });
    return this;
  }

  build(): { where: Prisma.JsonObject; orderBy: Record<string, "asc" | "desc">[] } {
    return {
      where: this.conditions.length > 0 ? { AND: this.conditions } : {},
      orderBy: this.orderByClause,
    };
  }
}

/**
 * 搜索条件优化
 * 支持多字段模糊搜索
 */
export function buildSearchCondition(
  search: string | undefined,
  fields: string[]
): Prisma.JsonObject | undefined {
  if (!search || search.trim() === "") return undefined;

  const searchTerm = search.trim();
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: "insensitive",
      },
    })),
  };
}

/**
 * 日期范围条件构建
 */
export function buildDateRangeCondition(
  field: string,
  startDate?: string | Date,
  endDate?: string | Date
): Prisma.JsonObject | undefined {
  const conditions: Prisma.JsonObject = {};

  if (startDate) {
    conditions.gte = new Date(startDate);
  }
  if (endDate) {
    conditions.lte = new Date(endDate);
  }

  if (Object.keys(conditions).length === 0) return undefined;

  return { [field]: conditions };
}

/**
 * 统计查询优化
 * 使用聚合查询代替多次查询
 */
export interface AggregateOptions {
  _count?: boolean | { [field: string]: boolean };
  _sum?: { [field: string]: boolean };
  _avg?: { [field: string]: boolean };
  _min?: { [field: string]: boolean };
  _max?: { [field: string]: boolean };
}

/**
 * 查询性能监控
 */
export class QueryPerformanceMonitor {
  private queries: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  async measure<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await queryFn();
    } finally {
      const duration = performance.now() - start;
      this.recordQuery(queryName, duration);
    }
  }

  private recordQuery(name: string, duration: number): void {
    const existing = this.queries.get(name) || { count: 0, totalTime: 0, avgTime: 0 };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    this.queries.set(name, existing);
  }

  getStats(): Map<string, { count: number; totalTime: number; avgTime: number }> {
    return new Map(this.queries);
  }

  getSlowQueries(threshold: number = 100): Array<{ name: string; avgTime: number }> {
    const slow: Array<{ name: string; avgTime: number }> = [];
    for (const [name, stats] of this.queries.entries()) {
      if (stats.avgTime > threshold) {
        slow.push({ name, avgTime: stats.avgTime });
      }
    }
    return slow.sort((a, b) => b.avgTime - a.avgTime);
  }

  reset(): void {
    this.queries.clear();
  }
}

// 全局性能监控实例
export const queryMonitor = new QueryPerformanceMonitor();
