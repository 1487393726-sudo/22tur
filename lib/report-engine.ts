import { prisma } from "@/lib/prisma";

/**
 * 报表配置接口
 */
export interface ReportConfig {
  datasource: string;
  fields: string[];
  filters: FilterCondition[];
  chartType: string;
  chartConfig: ChartConfig;
}

/**
 * 便捷函数：执行报表查询
 * @param config 报表配置
 * @returns 报表执行结果
 */
export async function executeReport(config: ReportConfig): Promise<ReportResult> {
  return ReportEngine.execute(config);
}



interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
}

interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";
  title?: string;
  colors?: string[];
}

/**
 * 报表执行结果接口
 */
export interface ReportResult {
  data: any[];
  total: number;
  aggregated?: any[];
  metadata: {
    datasource: string;
    fields: string[];
    filterCount: number;
    chartType: string;
  };
}

/**
 * 报表执行引擎
 */
export class ReportEngine {
  /**
   * 执行报表查询
   */
  static async execute(config: ReportConfig): Promise<ReportResult> {
    try {
      // 1. 验证配置
      this.validateConfig(config);

      // 2. 构建查询
      const query = this.buildQuery(config);

      // 3. 执行查询
      const data = await this.executeQuery(config.datasource, query, config.fields);

      // 4. 应用聚合（如果需要）
      const aggregated = this.applyAggregation(data, config);

      // 5. 返回结果
      return {
        data,
        total: data.length,
        aggregated,
        metadata: {
          datasource: config.datasource,
          fields: config.fields,
          filterCount: config.filters.length,
          chartType: config.chartType,
        },
      };
    } catch (error) {
      console.error("报表执行失败:", error);
      throw new Error(`报表执行失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  /**
   * 验证报表配置
   */
  private static validateConfig(config: ReportConfig): void {
    if (!config.datasource) {
      throw new Error("数据源不能为空");
    }

    if (!config.fields || config.fields.length === 0) {
      throw new Error("字段列表不能为空");
    }

    if (!config.chartType) {
      throw new Error("图表类型不能为空");
    }
  }

  /**
   * 构建 Prisma 查询条件
   */
  private static buildQuery(config: ReportConfig): any {
    const where: any = {};

    if (config.filters.length === 0) {
      return where;
    }

    // 处理筛选条件
    const conditions: any[] = [];

    for (const filter of config.filters) {
      if (!filter.field || !filter.operator) {
        continue;
      }

      const condition = this.buildFilterCondition(filter);
      if (condition) {
        conditions.push(condition);
      }
    }

    // 组合条件（AND/OR）
    if (conditions.length > 0) {
      // 检查是否有 OR 逻辑
      const hasOr = config.filters.some((f) => f.logic === "OR");

      if (hasOr) {
        // 如果有 OR，使用 OR 数组
        where.OR = conditions;
      } else {
        // 如果全是 AND，直接合并到 where
        conditions.forEach((condition) => {
          Object.assign(where, condition);
        });
      }
    }

    return where;
  }

  /**
   * 构建单个筛选条件
   */
  private static buildFilterCondition(filter: FilterCondition): any {
    const { field, operator, value } = filter;

    switch (operator) {
      case "=":
        return { [field]: value };

      case "!=":
        return { [field]: { not: value } };

      case ">":
        return { [field]: { gt: this.parseValue(value) } };

      case "<":
        return { [field]: { lt: this.parseValue(value) } };

      case ">=":
        return { [field]: { gte: this.parseValue(value) } };

      case "<=":
        return { [field]: { lte: this.parseValue(value) } };

      case "LIKE":
        return { [field]: { contains: value } };

      case "NOT LIKE":
        return { [field]: { not: { contains: value } } };

      case "IN":
        return { [field]: { in: value.split(",").map((v) => v.trim()) } };

      case "NOT IN":
        return { [field]: { notIn: value.split(",").map((v) => v.trim()) } };

      case "IS NULL":
        return { [field]: null };

      case "IS NOT NULL":
        return { [field]: { not: null } };

      default:
        return null;
    }
  }

  /**
   * 解析值（尝试转换为数字或日期）
   */
  private static parseValue(value: string): any {
    // 尝试转换为数字
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }

    // 尝试转换为日期
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // 返回原始字符串
    return value;
  }

  /**
   * 执行数据库查询
   */
  private static async executeQuery(
    datasource: string,
    where: any,
    fields: string[]
  ): Promise<any[]> {
    // 构建 select 对象
    const select: any = {};
    fields.forEach((field) => {
      select[field] = true;
    });

    // 根据数据源执行查询
    switch (datasource) {
      case "users":
        return await prisma.user.findMany({
          where,
          select,
          take: 1000, // 限制最多返回 1000 条
        });

      case "projects":
        return await prisma.project.findMany({
          where,
          select,
          take: 1000,
        });

      case "tasks":
        return await prisma.task.findMany({
          where,
          select,
          take: 1000,
        });

      case "invoices":
        return await prisma.invoice.findMany({
          where,
          select,
          take: 1000,
        });

      case "timeEntries":
        // timeEntry 模型不存在，返回空数组
        console.warn("timeEntry 模型不存在");
        return [];

      default:
        throw new Error(`不支持的数据源: ${datasource}`);
    }
  }

  /**
   * 应用数据聚合
   */
  private static applyAggregation(data: any[], config: ReportConfig): any[] | undefined {
    const { chartType, chartConfig } = config;

    // 只有图表类型需要聚合
    if (chartType === "table") {
      return undefined;
    }

    if (!chartConfig.aggregation) {
      return undefined;
    }

    // 根据图表类型进行聚合
    if (chartType === "bar" || chartType === "line") {
      return this.aggregateByAxis(data, chartConfig);
    } else if (chartType === "pie") {
      return this.aggregateByGroup(data, chartConfig);
    }

    return undefined;
  }

  /**
   * 按 X 轴聚合（柱状图、折线图）
   */
  private static aggregateByAxis(data: any[], chartConfig: ChartConfig): any[] {
    const { xAxis, yAxis, aggregation } = chartConfig;

    if (!xAxis || !yAxis || !aggregation) {
      return [];
    }

    // 按 X 轴分组
    const groups = new Map<string, any[]>();

    data.forEach((row) => {
      const key = String(row[xAxis] || "未知");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // 对每组进行聚合
    const result: any[] = [];

    groups.forEach((rows, key) => {
      const aggregatedValue = this.aggregate(
        rows.map((r) => r[yAxis]),
        aggregation
      );

      result.push({
        [xAxis]: key,
        [yAxis]: aggregatedValue,
        count: rows.length,
      });
    });

    return result;
  }

  /**
   * 按分组字段聚合（饼图）
   */
  private static aggregateByGroup(data: any[], chartConfig: ChartConfig): any[] {
    const { groupBy, aggregation } = chartConfig;

    if (!groupBy || !aggregation) {
      return [];
    }

    // 按分组字段分组
    const groups = new Map<string, any[]>();

    data.forEach((row) => {
      const key = String(row[groupBy] || "未知");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // 对每组进行聚合
    const result: any[] = [];

    groups.forEach((rows, key) => {
      let value: number;

      if (aggregation === "COUNT") {
        value = rows.length;
      } else {
        // 对于其他聚合方式，需要指定聚合字段
        // 这里简化处理，使用 COUNT
        value = rows.length;
      }

      result.push({
        name: key,
        value: value,
        count: rows.length,
      });
    });

    return result;
  }

  /**
   * 执行聚合计算
   */
  private static aggregate(values: any[], aggregation: string): number {
    const numbers = values
      .map((v) => Number(v))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) {
      return 0;
    }

    switch (aggregation) {
      case "COUNT":
        return numbers.length;

      case "SUM":
        return numbers.reduce((sum, n) => sum + n, 0);

      case "AVG":
        return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

      case "MIN":
        return Math.min(...numbers);

      case "MAX":
        return Math.max(...numbers);

      default:
        return 0;
    }
  }
}
