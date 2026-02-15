/**
 * 项目类型管理服务
 * Project Type Manager Service
 * 
 * 实现项目类型和行业分类管理、筛选功能
 */

import {
  ProjectType,
  IndustryType,
  ProjectPhase,
  isValidProjectType,
  isValidIndustryType,
  isValidProjectPhase
} from '@/types/investor-operations-monitoring';

// 使用动态导入避免 Prisma 类型问题
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaClient: any = null;

async function getPrisma() {
  if (!prismaClient) {
    const { prisma } = await import('@/lib/prisma');
    prismaClient = prisma;
  }
  return prismaClient;
}

/**
 * 项目类型管理错误
 */
export class ProjectTypeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProjectTypeError';
  }
}

/**
 * 错误代码
 */
export const TypeErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  INVALID_PROJECT_TYPE: 'INVALID_PROJECT_TYPE',
  INVALID_INDUSTRY_TYPE: 'INVALID_INDUSTRY_TYPE',
  INVALID_FILTER_PARAMS: 'INVALID_FILTER_PARAMS'
} as const;

/**
 * 项目筛选参数
 */
export interface ProjectFilterParams {
  projectType?: ProjectType;
  industryType?: IndustryType;
  currentPhase?: ProjectPhase;
  investorId?: string;
  minInvestment?: number;
  maxInvestment?: number;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'targetAmount' | 'currentPhase';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 项目筛选结果
 */
export interface ProjectFilterResult {
  projects: ProjectSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 项目摘要
 */
export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  projectType?: ProjectType;
  industryType?: IndustryType;
  currentPhase?: ProjectPhase;
  phaseProgress?: number;
  targetAmount: number;
  currentAmount: number;
  investorCount: number;
  createdAt: Date;
}

/**
 * 行业统计
 */
export interface IndustryStats {
  industryType: IndustryType;
  projectCount: number;
  totalInvestment: number;
  averageInvestment: number;
}

/**
 * 项目类型统计
 */
export interface ProjectTypeStats {
  projectType: ProjectType;
  projectCount: number;
  totalInvestment: number;
  averageInvestment: number;
}

/**
 * 项目类型管理器
 */
export class ProjectTypeManager {
  /**
   * 获取项目类型信息
   */
  async getProjectTypeInfo(projectId: string): Promise<{
    projectType?: ProjectType;
    industryType?: IndustryType;
    typeSpecificData?: Record<string, unknown>;
  }> {
    const prisma = await getPrisma();
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProjectTypeError(
        `项目不存在: ${projectId}`,
        TypeErrorCodes.PROJECT_NOT_FOUND
      );
    }

    return {
      projectType: project.projectType as ProjectType | undefined,
      industryType: project.industryType as IndustryType | undefined,
      typeSpecificData: this.getTypeSpecificData(
        project.projectType as ProjectType,
        project.industryType as IndustryType
      )
    };
  }

  /**
   * 更新项目类型
   */
  async updateProjectType(
    projectId: string,
    projectType: ProjectType,
    industryType: IndustryType
  ): Promise<void> {
    const prisma = await getPrisma();

    if (!isValidProjectType(projectType)) {
      throw new ProjectTypeError(
        `无效的项目类型: ${projectType}`,
        TypeErrorCodes.INVALID_PROJECT_TYPE
      );
    }

    if (!isValidIndustryType(industryType)) {
      throw new ProjectTypeError(
        `无效的行业类型: ${industryType}`,
        TypeErrorCodes.INVALID_INDUSTRY_TYPE
      );
    }

    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProjectTypeError(
        `项目不存在: ${projectId}`,
        TypeErrorCodes.PROJECT_NOT_FOUND
      );
    }

    await prisma.investmentProject.update({
      where: { id: projectId },
      data: {
        projectType,
        industryType
      }
    });
  }

  /**
   * 筛选项目
   */
  async filterProjects(params: ProjectFilterParams): Promise<ProjectFilterResult> {
    const prisma = await getPrisma();
    const {
      projectType,
      industryType,
      currentPhase,
      investorId,
      minInvestment,
      maxInvestment,
      searchTerm,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    // 构建查询条件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (projectType && isValidProjectType(projectType)) {
      where.projectType = projectType;
    }

    if (industryType && isValidIndustryType(industryType)) {
      where.industryType = industryType;
    }

    if (currentPhase && isValidProjectPhase(currentPhase)) {
      where.currentPhase = currentPhase;
    }

    if (investorId) {
      where.investments = {
        some: {
          investorId
        }
      };
    }

    if (minInvestment !== undefined || maxInvestment !== undefined) {
      where.targetAmount = {};
      if (minInvestment !== undefined) {
        where.targetAmount.gte = minInvestment;
      }
      if (maxInvestment !== undefined) {
        where.targetAmount.lte = maxInvestment;
      }
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    // 获取总数
    const total = await prisma.investmentProject.count({ where });

    // 获取项目列表
    const projects = await prisma.investmentProject.findMany({
      where,
      include: {
        _count: {
          select: { investments: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const projectSummaries: ProjectSummary[] = projects.map((p: {
      id: string;
      name: string;
      description: string | null;
      projectType: string | null;
      industryType: string | null;
      currentPhase: string | null;
      phaseProgress: number | null;
      targetAmount: number;
      currentAmount: number;
      createdAt: Date;
      _count: { investments: number };
    }) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      projectType: p.projectType as ProjectType | undefined,
      industryType: p.industryType as IndustryType | undefined,
      currentPhase: p.currentPhase as ProjectPhase | undefined,
      phaseProgress: p.phaseProgress || undefined,
      targetAmount: p.targetAmount,
      currentAmount: p.currentAmount,
      investorCount: p._count.investments,
      createdAt: p.createdAt
    }));

    return {
      projects: projectSummaries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 获取行业列表及统计
   */
  async getIndustryStats(): Promise<IndustryStats[]> {
    const prisma = await getPrisma();

    const stats: IndustryStats[] = [];

    for (const industryType of Object.values(IndustryType)) {
      const projects = await prisma.investmentProject.findMany({
        where: { industryType },
        select: { targetAmount: true }
      });

      const projectCount = projects.length;
      const totalInvestment = projects.reduce(
        (sum: number, p: { targetAmount: number }) => sum + p.targetAmount,
        0
      );

      stats.push({
        industryType,
        projectCount,
        totalInvestment,
        averageInvestment: projectCount > 0 ? totalInvestment / projectCount : 0
      });
    }

    return stats.filter(s => s.projectCount > 0);
  }

  /**
   * 获取项目类型统计
   */
  async getProjectTypeStats(): Promise<ProjectTypeStats[]> {
    const prisma = await getPrisma();

    const stats: ProjectTypeStats[] = [];

    for (const projectType of Object.values(ProjectType)) {
      const projects = await prisma.investmentProject.findMany({
        where: { projectType },
        select: { targetAmount: true }
      });

      const projectCount = projects.length;
      const totalInvestment = projects.reduce(
        (sum: number, p: { targetAmount: number }) => sum + p.targetAmount,
        0
      );

      stats.push({
        projectType,
        projectCount,
        totalInvestment,
        averageInvestment: projectCount > 0 ? totalInvestment / projectCount : 0
      });
    }

    return stats.filter(s => s.projectCount > 0);
  }

  /**
   * 获取类型特定数据
   */
  private getTypeSpecificData(
    projectType?: ProjectType,
    industryType?: IndustryType
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    // 根据项目类型添加特定字段说明
    if (projectType === ProjectType.PHYSICAL) {
      data.requiredFields = ['location', 'area', 'capacity'];
      data.description = '现实版项目需要提供实体店铺信息';
    } else if (projectType === ProjectType.ONLINE) {
      data.requiredFields = ['platform', 'domain', 'techStack'];
      data.description = '网络专业版项目需要提供技术平台信息';
    }

    // 根据行业类型添加特定字段说明
    if (industryType) {
      data.industryRequirements = this.getIndustryRequirements(industryType);
    }

    return data;
  }

  /**
   * 获取行业特定要求
   */
  private getIndustryRequirements(industryType: IndustryType): string[] {
    const requirements: Record<IndustryType, string[]> = {
      [IndustryType.CATERING]: ['食品经营许可证', '卫生许可证', '消防验收'],
      [IndustryType.RETAIL]: ['营业执照', '商品质量检验报告'],
      [IndustryType.SERVICE]: ['服务资质证明', '从业人员资格证'],
      [IndustryType.TECHNOLOGY]: ['软件著作权', '专利证书', '信息安全等级保护'],
      [IndustryType.EDUCATION]: ['办学许可证', '教师资格证'],
      [IndustryType.HEALTHCARE]: ['医疗机构执业许可证', '医护人员执业证'],
      [IndustryType.OTHER]: ['相关行业资质证明']
    };

    return requirements[industryType] || [];
  }

  /**
   * 验证项目类型数据完整性
   */
  async validateProjectTypeData(projectId: string): Promise<{
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  }> {
    const prisma = await getPrisma();
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProjectTypeError(
        `项目不存在: ${projectId}`,
        TypeErrorCodes.PROJECT_NOT_FOUND
      );
    }

    const missingFields: string[] = [];
    const warnings: string[] = [];

    // 检查必填字段
    if (!project.projectType) {
      missingFields.push('projectType');
    }
    if (!project.industryType) {
      missingFields.push('industryType');
    }

    // 检查类型特定字段
    if (project.projectType === ProjectType.PHYSICAL) {
      if (!project.location) {
        warnings.push('现实版项目建议填写项目地址');
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }
}

// 导出单例实例
export const projectTypeManager = new ProjectTypeManager();
