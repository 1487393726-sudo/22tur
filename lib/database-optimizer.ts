/**
 * 数据库查询优化工具库
 * 包含查询优化、索引管理、缓存策略等功能
 */

import { prisma } from "@/lib/prisma";

/**
 * 查询优化建议
 */
export interface QueryOptimizationTip {
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
  estimatedImprovement: string;
}

/**
 * 数据库统计信息
 */
export interface DatabaseStats {
  totalTables: number;
  totalRecords: number;
  totalSize: string;
  slowQueries: number;
  indexCount: number;
}

/**
 * 查询优化分析器
 */
export class QueryOptimizer {
  /**
   * 分析 N+1 查询问题
   */
  static analyzeNPlusOne(): QueryOptimizationTip[] {
    return [
      {
        issue: "N+1 查询问题",
        suggestion: "使用 include 或 select 进行关联查询",
        priority: "high",
        estimatedImprovement: "50-70% 性能提升",
      },
      {
        issue: "未使用索引的查询",
        suggestion: "为频繁查询的字段添加索引",
        priority: "high",
        estimatedImprovement: "30-50% 性能提升",
      },
      {
        issue: "过度 SELECT",
        suggestion: "只选择需要的字段",
        priority: "medium",
        estimatedImprovement: "10-20% 性能提升",
      },
      {
        issue: "缺少分页",
        suggestion: "为大结果集添加分页",
        priority: "medium",
        estimatedImprovement: "20-30% 性能提升",
      },
      {
        issue: "复杂 JOIN",
        suggestion: "考虑使用数据库视图或物化视图",
        priority: "low",
        estimatedImprovement: "15-25% 性能提升",
      },
    ];
  }

  /**
   * 获取优化建议
   */
  static getOptimizationTips(): QueryOptimizationTip[] {
    return this.analyzeNPlusOne();
  }
}

/**
 * 索引管理器
 */
export class IndexManager {
  /**
   * 推荐的索引
   */
  static getRecommendedIndexes(): Record<string, string[]> {
    return {
      users: ["email", "status", "createdAt", "role"],
      projects: ["clientId", "status", "createdAt", "departmentId"],
      tasks: ["projectId", "assigneeId", "status", "dueDate"],
      documents: ["authorId", "projectId", "category", "uploadDate"],
      investments: ["userId", "status", "investmentDate"],
      payments: ["userId", "status", "createdAt"],
      dashboards: ["createdBy", "isPublic", "createdAt"],
      notifications: ["userId", "isRead", "createdAt"],
      auditLogs: ["userId", "action", "createdAt"],
    };
  }

  /**
   * 检查缺失的索引
   */
  static checkMissingIndexes(): Record<string, string[]> {
    const recommended = this.getRecommendedIndexes();
    // 实际应该检查数据库中已有的索引
    // 这里返回推荐的索引作为示例
    return recommended;
  }

  /**
   * 生成索引创建 SQL
   */
  static generateIndexSQL(table: string, columns: string[]): string {
    const indexName = `idx_${table}_${columns.join("_")}`;
    const columnList = columns.join(", ");
    return `CREATE INDEX ${indexName} ON ${table} (${columnList});`;
  }
}

/**
 * 查询缓存策略
 */
export class QueryCacheStrategy {
  /**
   * 获取缓存策略
   */
  static getCacheStrategy(
    queryType: string
  ): {
    ttl: number;
    invalidateOn: string[];
    priority: "high" | "medium" | "low";
  } {
    const strategies: Record<
      string,
      {
        ttl: number;
        invalidateOn: string[];
        priority: "high" | "medium" | "low";
      }
    > = {
      // 用户查询 - 中等缓存
      users: {
        ttl: 300, // 5 分钟
        invalidateOn: ["user_created", "user_updated", "user_deleted"],
        priority: "medium",
      },

      // 项目查询 - 长期缓存
      projects: {
        ttl: 600, // 10 分钟
        invalidateOn: ["project_created", "project_updated", "project_deleted"],
        priority: "high",
      },

      // 任务查询 - 短期缓存
      tasks: {
        ttl: 180, // 3 分钟
        invalidateOn: ["task_created", "task_updated", "task_deleted"],
        priority: "medium",
      },

      // 文档查询 - 长期缓存
      documents: {
        ttl: 900, // 15 分钟
        invalidateOn: ["document_created", "document_deleted"],
        priority: "high",
      },

      // 统计查询 - 长期缓存
      statistics: {
        ttl: 1800, // 30 分钟
        invalidateOn: ["data_changed"],
        priority: "high",
      },

      // 配置查询 - 超长期缓存
      config: {
        ttl: 3600, // 1 小时
        invalidateOn: ["config_updated"],
        priority: "high",
      },
    };

    return (
      strategies[queryType] || {
        ttl: 300,
        invalidateOn: [],
        priority: "low",
      }
    );
  }
}

/**
 * 数据库连接池优化
 */
export class ConnectionPoolOptimizer {
  /**
   * 获取推荐的连接池配置
   */
  static getRecommendedPoolConfig(): {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  } {
    return {
      min: 2, // 最小连接数
      max: 10, // 最大连接数
      idleTimeoutMillis: 30000, // 30 秒空闲超时
      connectionTimeoutMillis: 5000, // 5 秒连接超时
    };
  }

  /**
   * 获取当前连接池状态
   */
  static getPoolStatus(): {
    activeConnections: number;
    idleConnections: number;
    waitingRequests: number;
  } {
    // 实际应该从数据库连接池获取
    return {
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
    };
  }
}

/**
 * 查询性能分析
 */
export class QueryPerformanceAnalyzer {
  /**
   * 分析查询性能
   */
  static analyzePerformance(
    queryTime: number,
    recordCount: number
  ): {
    status: "excellent" | "good" | "fair" | "poor";
    message: string;
    suggestions: string[];
  } {
    const timePerRecord = queryTime / Math.max(recordCount, 1);

    if (queryTime < 100 && recordCount < 1000) {
      return {
        status: "excellent",
        message: "查询性能优秀",
        suggestions: [],
      };
    }

    if (queryTime < 500 && recordCount < 10000) {
      return {
        status: "good",
        message: "查询性能良好",
        suggestions: ["考虑添加分页以进一步优化"],
      };
    }

    if (queryTime < 2000) {
      return {
        status: "fair",
        message: "查询性能一般",
        suggestions: [
          "检查是否有 N+1 查询问题",
          "考虑添加索引",
          "考虑使用缓存",
        ],
      };
    }

    return {
      status: "poor",
      message: "查询性能较差",
      suggestions: [
        "立即检查 N+1 查询问题",
        "添加必要的索引",
        "考虑重构查询逻辑",
        "考虑使用数据库视图",
      ],
    };
  }
}

/**
 * 数据库优化建议生成器
 */
export class DatabaseOptimizationAdvisor {
  /**
   * 获取完整的优化建议
   */
  static getFullOptimizationAdvice(): {
    queryOptimization: QueryOptimizationTip[];
    indexing: Record<string, string[]>;
    caching: Record<string, { ttl: number; priority: string }>;
    pooling: {
      min: number;
      max: number;
      idleTimeoutMillis: number;
      connectionTimeoutMillis: number;
    };
  } {
    return {
      queryOptimization: QueryOptimizer.getOptimizationTips(),
      indexing: IndexManager.getRecommendedIndexes(),
      caching: Object.entries(QueryCacheStrategy.getCacheStrategy("projects"))
        .reduce(
          (acc, [key, value]) => {
            acc[key] = {
              ttl: value.ttl,
              priority: value.priority,
            };
            return acc;
          },
          {} as Record<string, { ttl: number; priority: string }>
        ),
      pooling: ConnectionPoolOptimizer.getRecommendedPoolConfig(),
    };
  }

  /**
   * 生成优化报告
   */
  static generateOptimizationReport(): string {
    const advice = this.getFullOptimizationAdvice();

    let report = "# 数据库优化报告\n\n";

    report += "## 查询优化建议\n";
    advice.queryOptimization.forEach((tip) => {
      report += `- **${tip.issue}** (${tip.priority})\n`;
      report += `  - 建议: ${tip.suggestion}\n`;
      report += `  - 预期改进: ${tip.estimatedImprovement}\n\n`;
    });

    report += "## 索引建议\n";
    Object.entries(advice.indexing).forEach(([table, columns]) => {
      report += `- **${table}**: ${columns.join(", ")}\n`;
    });

    report += "\n## 连接池配置\n";
    report += `- 最小连接数: ${advice.pooling.min}\n`;
    report += `- 最大连接数: ${advice.pooling.max}\n`;
    report += `- 空闲超时: ${advice.pooling.idleTimeoutMillis}ms\n`;
    report += `- 连接超时: ${advice.pooling.connectionTimeoutMillis}ms\n`;

    return report;
  }
}

/**
 * 导出优化建议
 */
export function getDatabaseOptimizationAdvice() {
  return DatabaseOptimizationAdvisor.getFullOptimizationAdvice();
}

/**
 * 生成优化报告
 */
export function generateDatabaseOptimizationReport(): string {
  return DatabaseOptimizationAdvisor.generateOptimizationReport();
}
