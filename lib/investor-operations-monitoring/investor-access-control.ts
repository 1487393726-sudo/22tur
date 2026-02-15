/**
 * 投资者权限控制服务
 * Investor Access Control Service
 * 
 * 实现项目访问权限验证、数据可见性控制和导出权限验证
 * 需求: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import {
  InvestorProjectAccess,
  DataVisibility,
  AccessLevel,
  isValidAccessLevel
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
 * 权限控制错误
 */
export class AccessControlError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AccessControlError';
  }
}

/**
 * 错误代码
 */
export const AccessControlErrorCodes = {
  ACCESS_DENIED: 'ACCESS_DENIED',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  INVESTOR_NOT_FOUND: 'INVESTOR_NOT_FOUND',
  INVALID_ACCESS_LEVEL: 'INVALID_ACCESS_LEVEL',
  EXPORT_NOT_ALLOWED: 'EXPORT_NOT_ALLOWED',
  INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION'
} as const;

/**
 * 数据类型导出权限配置
 */
const EXPORT_PERMISSIONS: Record<string, AccessLevel[]> = {
  // 基础数据 - 所有级别可导出
  'project_summary': [AccessLevel.BASIC, AccessLevel.STANDARD, AccessLevel.FULL],
  'profit_loss_summary': [AccessLevel.BASIC, AccessLevel.STANDARD, AccessLevel.FULL],
  
  // 标准数据 - 标准和完整级别可导出
  'operations_data': [AccessLevel.STANDARD, AccessLevel.FULL],
  'employee_list': [AccessLevel.STANDARD, AccessLevel.FULL],
  'assessment_summary': [AccessLevel.STANDARD, AccessLevel.FULL],
  
  // 敏感数据 - 仅完整级别可导出
  'salary_details': [AccessLevel.FULL],
  'employee_details': [AccessLevel.FULL],
  'assessment_details': [AccessLevel.FULL],
  'social_insurance': [AccessLevel.FULL]
};

/**
 * 持股比例与访问级别映射
 */
const SHAREHOLDING_ACCESS_MAPPING = {
  // 持股 >= 30% 获得完整访问
  FULL_THRESHOLD: 30,
  // 持股 >= 10% 获得标准访问
  STANDARD_THRESHOLD: 10,
  // 持股 < 10% 获得基础访问
  BASIC_THRESHOLD: 0
};

/**
 * 投资者权限控制管理器
 */
export class InvestorAccessControl {
  /**
   * 验证投资者对项目的访问权限
   * 需求 8.1: 投资者只能访问其已投资的项目
   */
  async verifyProjectAccess(
    investorId: string,
    projectId: string
  ): Promise<boolean> {
    const prisma = await getPrisma();

    // 检查投资者项目访问权限表
    if (prisma.investorProjectAccess) {
      const access = await prisma.investorProjectAccess.findFirst({
        where: {
          investorId,
          projectId
        }
      });

      if (access) {
        return true;
      }
    }

    // 备选：检查投资记录表
    if (prisma.investment) {
      const investment = await prisma.investment.findFirst({
        where: {
          userId: investorId,
          projectId,
          status: { in: ['ACTIVE', 'COMPLETED'] }
        }
      });

      return !!investment;
    }

    return false;
  }

  /**
   * 获取投资者可访问的项目列表
   * 需求 8.1: 投资者只能访问其已投资的项目
   */
  async getAccessibleProjects(investorId: string): Promise<string[]> {
    const prisma = await getPrisma();
    const projectIds: string[] = [];

    // 从投资者项目访问权限表获取
    if (prisma.investorProjectAccess) {
      const accessRecords = await prisma.investorProjectAccess.findMany({
        where: { investorId },
        select: { projectId: true }
      });
      projectIds.push(...accessRecords.map((r: any) => r.projectId));
    }

    // 从投资记录表获取
    if (prisma.investment) {
      const investments = await prisma.investment.findMany({
        where: {
          userId: investorId,
          status: { in: ['ACTIVE', 'COMPLETED'] }
        },
        select: { projectId: true }
      });
      
      investments.forEach((inv: any) => {
        if (!projectIds.includes(inv.projectId)) {
          projectIds.push(inv.projectId);
        }
      });
    }

    return projectIds;
  }

  /**
   * 获取数据可见性配置
   * 需求 8.3, 8.4: 数据详细程度与持股比例和访问级别相关
   */
  async getDataVisibility(
    investorId: string,
    projectId: string
  ): Promise<DataVisibility> {
    const prisma = await getPrisma();

    // 默认无权限
    const defaultVisibility: DataVisibility = {
      canViewFinancials: false,
      canViewEmployeeDetails: false,
      canViewSalaryDetails: false,
      canViewAssessments: false,
      detailLevel: 'SUMMARY'
    };

    // 获取访问权限记录
    let accessLevel: AccessLevel = AccessLevel.BASIC;
    let shareholdingRatio = 0;

    if (prisma.investorProjectAccess) {
      const access = await prisma.investorProjectAccess.findFirst({
        where: { investorId, projectId }
      });

      if (access) {
        accessLevel = access.accessLevel as AccessLevel;
        shareholdingRatio = Number(access.shareholdingRatio);
      }
    }

    // 如果没有访问权限记录，尝试从投资记录计算
    if (shareholdingRatio === 0 && prisma.investment) {
      const investment = await prisma.investment.findFirst({
        where: {
          userId: investorId,
          projectId,
          status: { in: ['ACTIVE', 'COMPLETED'] }
        }
      });

      if (investment) {
        // 根据投资金额计算持股比例（简化计算）
        shareholdingRatio = await this.calculateShareholdingRatio(
          investorId,
          projectId
        );
        accessLevel = this.determineAccessLevel(shareholdingRatio);
      }
    }

    // 根据访问级别设置可见性
    return this.buildDataVisibility(accessLevel, shareholdingRatio);
  }

  /**
   * 验证数据导出权限
   * 需求 8.5: 导出数据应只包含有权限查看的内容
   */
  async verifyExportPermission(
    investorId: string,
    projectId: string,
    dataType: string
  ): Promise<boolean> {
    // 首先验证项目访问权限
    const hasAccess = await this.verifyProjectAccess(investorId, projectId);
    if (!hasAccess) {
      return false;
    }

    // 获取访问级别
    const visibility = await this.getDataVisibility(investorId, projectId);
    const accessLevel = this.getAccessLevelFromVisibility(visibility);

    // 检查数据类型的导出权限
    const allowedLevels = EXPORT_PERMISSIONS[dataType];
    if (!allowedLevels) {
      // 未定义的数据类型默认需要完整权限
      return accessLevel === AccessLevel.FULL;
    }

    return allowedLevels.includes(accessLevel);
  }

  /**
   * 获取投资者项目访问详情
   */
  async getProjectAccessDetails(
    investorId: string,
    projectId: string
  ): Promise<InvestorProjectAccess | null> {
    const prisma = await getPrisma();

    if (!prisma.investorProjectAccess) {
      // 尝试从投资记录构建访问详情
      return this.buildAccessFromInvestment(investorId, projectId);
    }

    const access = await prisma.investorProjectAccess.findFirst({
      where: { investorId, projectId }
    });

    if (!access) {
      return this.buildAccessFromInvestment(investorId, projectId);
    }

    return {
      id: access.id,
      investorId: access.investorId,
      projectId: access.projectId,
      shareholdingRatio: Number(access.shareholdingRatio),
      accessLevel: access.accessLevel as AccessLevel,
      grantedAt: access.grantedAt,
      grantedBy: access.grantedBy
    };
  }

  /**
   * 授予项目访问权限
   */
  async grantProjectAccess(
    investorId: string,
    projectId: string,
    shareholdingRatio: number,
    accessLevel: AccessLevel,
    grantedBy: string
  ): Promise<InvestorProjectAccess> {
    const prisma = await getPrisma();

    if (!isValidAccessLevel(accessLevel)) {
      throw new AccessControlError(
        `无效的访问级别: ${accessLevel}`,
        AccessControlErrorCodes.INVALID_ACCESS_LEVEL
      );
    }

    if (!prisma.investorProjectAccess) {
      throw new AccessControlError(
        '访问权限表不存在',
        AccessControlErrorCodes.ACCESS_DENIED
      );
    }

    // 检查是否已存在
    const existing = await prisma.investorProjectAccess.findFirst({
      where: { investorId, projectId }
    });

    let access;
    if (existing) {
      // 更新现有权限
      access = await prisma.investorProjectAccess.update({
        where: { id: existing.id },
        data: {
          shareholdingRatio,
          accessLevel,
          grantedBy
        }
      });
    } else {
      // 创建新权限
      access = await prisma.investorProjectAccess.create({
        data: {
          investorId,
          projectId,
          shareholdingRatio,
          accessLevel,
          grantedBy
        }
      });
    }

    return {
      id: access.id,
      investorId: access.investorId,
      projectId: access.projectId,
      shareholdingRatio: Number(access.shareholdingRatio),
      accessLevel: access.accessLevel as AccessLevel,
      grantedAt: access.grantedAt,
      grantedBy: access.grantedBy
    };
  }

  /**
   * 撤销项目访问权限
   */
  async revokeProjectAccess(
    investorId: string,
    projectId: string
  ): Promise<void> {
    const prisma = await getPrisma();

    if (!prisma.investorProjectAccess) {
      return;
    }

    await prisma.investorProjectAccess.deleteMany({
      where: { investorId, projectId }
    });
  }

  /**
   * 更新访问级别
   */
  async updateAccessLevel(
    investorId: string,
    projectId: string,
    newAccessLevel: AccessLevel
  ): Promise<void> {
    const prisma = await getPrisma();

    if (!isValidAccessLevel(newAccessLevel)) {
      throw new AccessControlError(
        `无效的访问级别: ${newAccessLevel}`,
        AccessControlErrorCodes.INVALID_ACCESS_LEVEL
      );
    }

    if (!prisma.investorProjectAccess) {
      throw new AccessControlError(
        '访问权限表不存在',
        AccessControlErrorCodes.ACCESS_DENIED
      );
    }

    const access = await prisma.investorProjectAccess.findFirst({
      where: { investorId, projectId }
    });

    if (!access) {
      throw new AccessControlError(
        '访问权限记录不存在',
        AccessControlErrorCodes.ACCESS_DENIED
      );
    }

    await prisma.investorProjectAccess.update({
      where: { id: access.id },
      data: { accessLevel: newAccessLevel }
    });
  }

  // =====================================================
  // 私有辅助方法
  // =====================================================

  /**
   * 计算持股比例
   */
  private async calculateShareholdingRatio(
    investorId: string,
    projectId: string
  ): Promise<number> {
    const prisma = await getPrisma();

    if (!prisma.investment || !prisma.investmentProject) {
      return 0;
    }

    // 获取投资者在该项目的投资金额
    const investment = await prisma.investment.findFirst({
      where: {
        userId: investorId,
        projectId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      }
    });

    if (!investment) {
      return 0;
    }

    // 获取项目总投资金额
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project || !project.targetAmount || Number(project.targetAmount) === 0) {
      return 0;
    }

    const ratio = (Number(investment.amount) / Number(project.targetAmount)) * 100;
    return Math.min(100, Math.max(0, ratio));
  }

  /**
   * 根据持股比例确定访问级别
   */
  private determineAccessLevel(shareholdingRatio: number): AccessLevel {
    if (shareholdingRatio >= SHAREHOLDING_ACCESS_MAPPING.FULL_THRESHOLD) {
      return AccessLevel.FULL;
    }
    if (shareholdingRatio >= SHAREHOLDING_ACCESS_MAPPING.STANDARD_THRESHOLD) {
      return AccessLevel.STANDARD;
    }
    return AccessLevel.BASIC;
  }

  /**
   * 构建数据可见性配置
   */
  private buildDataVisibility(
    accessLevel: AccessLevel,
    shareholdingRatio: number
  ): DataVisibility {
    switch (accessLevel) {
      case AccessLevel.FULL:
        return {
          canViewFinancials: true,
          canViewEmployeeDetails: true,
          canViewSalaryDetails: true,
          canViewAssessments: true,
          detailLevel: 'FULL'
        };
      
      case AccessLevel.STANDARD:
        return {
          canViewFinancials: true,
          canViewEmployeeDetails: true,
          canViewSalaryDetails: false,
          canViewAssessments: true,
          detailLevel: 'DETAILED'
        };
      
      case AccessLevel.BASIC:
      default:
        return {
          canViewFinancials: true,
          canViewEmployeeDetails: false,
          canViewSalaryDetails: false,
          canViewAssessments: false,
          detailLevel: 'SUMMARY'
        };
    }
  }

  /**
   * 从可见性配置获取访问级别
   */
  private getAccessLevelFromVisibility(visibility: DataVisibility): AccessLevel {
    if (visibility.detailLevel === 'FULL') {
      return AccessLevel.FULL;
    }
    if (visibility.detailLevel === 'DETAILED') {
      return AccessLevel.STANDARD;
    }
    return AccessLevel.BASIC;
  }

  /**
   * 从投资记录构建访问详情
   */
  private async buildAccessFromInvestment(
    investorId: string,
    projectId: string
  ): Promise<InvestorProjectAccess | null> {
    const prisma = await getPrisma();

    if (!prisma.investment) {
      return null;
    }

    const investment = await prisma.investment.findFirst({
      where: {
        userId: investorId,
        projectId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      }
    });

    if (!investment) {
      return null;
    }

    const shareholdingRatio = await this.calculateShareholdingRatio(
      investorId,
      projectId
    );
    const accessLevel = this.determineAccessLevel(shareholdingRatio);

    return {
      id: `derived-${investorId}-${projectId}`,
      investorId,
      projectId,
      shareholdingRatio,
      accessLevel,
      grantedAt: investment.createdAt,
      grantedBy: 'system'
    };
  }
}

// 导出单例实例
export const investorAccessControl = new InvestorAccessControl();
