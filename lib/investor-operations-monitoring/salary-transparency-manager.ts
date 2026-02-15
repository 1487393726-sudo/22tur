/**
 * 薪资透明化管理服务
 * Salary Transparency Manager Service
 * 
 * 实现人力成本汇总、岗位薪资范围、薪资构成和五险一金明细
 * 需求: 6.1, 6.2, 6.3, 6.4
 */

import {
  LaborCostSummary,
  SalaryComposition,
  PositionSalaryRange,
  SocialInsurance,
  EmployeeSalary,
  EmployeeStatus,
  UpdateSalaryInput,
  calculateSocialInsuranceTotal
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
 * 薪资管理错误
 */
export class SalaryTransparencyError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SalaryTransparencyError';
  }
}

/**
 * 错误代码
 */
export const SalaryErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  SALARY_NOT_FOUND: 'SALARY_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  NO_EMPLOYEES: 'NO_EMPLOYEES'
} as const;

/**
 * 薪资透明化管理器
 */
export class SalaryTransparencyManager {
  /**
   * 获取项目人力成本汇总
   * 需求 6.1: 人力成本汇总
   */
  async getLaborCostSummary(projectId: string): Promise<LaborCostSummary> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new SalaryTransparencyError(
        `项目不存在: ${projectId}`,
        SalaryErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 获取在职员工及其薪资信息
    let employees: any[] = [];
    if (prisma.projectEmployee) {
      employees = await prisma.projectEmployee.findMany({
        where: { 
          projectId,
          status: EmployeeStatus.ACTIVE
        },
        include: {
          salaryInfo: true
        }
      });
    }

    const employeeCount = employees.length;
    
    if (employeeCount === 0) {
      return this.createEmptyLaborCostSummary(projectId);
    }

    // 计算薪资汇总
    let totalBaseSalary = 0;
    let totalBonus = 0;
    let totalAllowance = 0;
    let totalOvertime = 0;
    let totalPension = 0;
    let totalMedical = 0;
    let totalUnemployment = 0;
    let totalWorkInjury = 0;
    let totalMaternity = 0;
    let totalHousingFund = 0;

    employees.forEach((emp: any) => {
      if (emp.salaryInfo) {
        totalBaseSalary += Number(emp.salaryInfo.baseSalary) || 0;
        totalBonus += Number(emp.salaryInfo.bonus) || 0;
        totalAllowance += Number(emp.salaryInfo.allowance) || 0;
        totalOvertime += Number(emp.salaryInfo.overtimePay) || 0;
        totalPension += Number(emp.salaryInfo.pension) || 0;
        totalMedical += Number(emp.salaryInfo.medical) || 0;
        totalUnemployment += Number(emp.salaryInfo.unemployment) || 0;
        totalWorkInjury += Number(emp.salaryInfo.workInjury) || 0;
        totalMaternity += Number(emp.salaryInfo.maternity) || 0;
        totalHousingFund += Number(emp.salaryInfo.housingFund) || 0;
      }
    });

    const socialInsuranceTotal = totalPension + totalMedical + totalUnemployment + 
                                  totalWorkInjury + totalMaternity + totalHousingFund;
    
    const totalLaborCost = totalBaseSalary + totalBonus + totalAllowance + 
                           totalOvertime + socialInsuranceTotal;
    
    const averageSalary = employeeCount > 0 ? totalLaborCost / employeeCount : 0;

    // 计算薪资构成百分比
    const salaryComposition = this.calculateSalaryComposition(
      totalBaseSalary,
      totalBonus,
      totalAllowance,
      totalOvertime,
      socialInsuranceTotal
    );

    const socialInsuranceDetail: SocialInsurance = {
      pension: totalPension,
      medical: totalMedical,
      unemployment: totalUnemployment,
      workInjury: totalWorkInjury,
      maternity: totalMaternity,
      housingFund: totalHousingFund
    };

    return {
      projectId,
      totalLaborCost: Number(totalLaborCost.toFixed(2)),
      averageSalary: Number(averageSalary.toFixed(2)),
      employeeCount,
      salaryComposition,
      socialInsuranceTotal: Number(socialInsuranceTotal.toFixed(2)),
      socialInsuranceDetail
    };
  }

  /**
   * 获取岗位薪资范围
   * 需求 6.2: 岗位薪资范围分析
   */
  async getSalaryRangeByPosition(projectId: string): Promise<PositionSalaryRange[]> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new SalaryTransparencyError(
        `项目不存在: ${projectId}`,
        SalaryErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.projectEmployee) {
      return [];
    }

    // 获取在职员工及其薪资信息
    const employees = await prisma.projectEmployee.findMany({
      where: { 
        projectId,
        status: EmployeeStatus.ACTIVE
      },
      include: {
        salaryInfo: true
      }
    });

    // 按岗位分组
    const positionMap = new Map<string, number[]>();
    
    employees.forEach((emp: any) => {
      if (emp.salaryInfo) {
        const totalSalary = this.calculateTotalSalary(emp.salaryInfo);
        const salaries = positionMap.get(emp.position) || [];
        salaries.push(totalSalary);
        positionMap.set(emp.position, salaries);
      }
    });

    // 计算每个岗位的薪资范围
    const result: PositionSalaryRange[] = [];
    
    positionMap.forEach((salaries, position) => {
      if (salaries.length > 0) {
        const minSalary = Math.min(...salaries);
        const maxSalary = Math.max(...salaries);
        const averageSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length;
        
        result.push({
          position,
          minSalary: Number(minSalary.toFixed(2)),
          maxSalary: Number(maxSalary.toFixed(2)),
          averageSalary: Number(averageSalary.toFixed(2)),
          employeeCount: salaries.length
        });
      }
    });

    // 按员工数量降序排序
    return result.sort((a, b) => b.employeeCount - a.employeeCount);
  }

  /**
   * 获取薪资构成分析
   * 需求 6.3: 薪资构成分析
   */
  async getSalaryComposition(projectId: string): Promise<SalaryComposition> {
    const summary = await this.getLaborCostSummary(projectId);
    return summary.salaryComposition;
  }

  /**
   * 获取五险一金明细
   * 需求 6.4: 五险一金明细
   */
  async getSocialInsuranceDetail(projectId: string): Promise<{
    projectId: string;
    employeeCount: number;
    totalAmount: number;
    detail: SocialInsurance;
    perEmployeeAverage: SocialInsurance;
    breakdown: { category: string; amount: number; percentage: number }[];
  }> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new SalaryTransparencyError(
        `项目不存在: ${projectId}`,
        SalaryErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.projectEmployee) {
      return this.createEmptySocialInsuranceDetail(projectId);
    }

    // 获取在职员工及其薪资信息
    const employees = await prisma.projectEmployee.findMany({
      where: { 
        projectId,
        status: EmployeeStatus.ACTIVE
      },
      include: {
        salaryInfo: true
      }
    });

    const employeeCount = employees.filter((e: any) => e.salaryInfo).length;
    
    if (employeeCount === 0) {
      return this.createEmptySocialInsuranceDetail(projectId);
    }

    // 汇总五险一金
    let totalPension = 0;
    let totalMedical = 0;
    let totalUnemployment = 0;
    let totalWorkInjury = 0;
    let totalMaternity = 0;
    let totalHousingFund = 0;

    employees.forEach((emp: any) => {
      if (emp.salaryInfo) {
        totalPension += Number(emp.salaryInfo.pension) || 0;
        totalMedical += Number(emp.salaryInfo.medical) || 0;
        totalUnemployment += Number(emp.salaryInfo.unemployment) || 0;
        totalWorkInjury += Number(emp.salaryInfo.workInjury) || 0;
        totalMaternity += Number(emp.salaryInfo.maternity) || 0;
        totalHousingFund += Number(emp.salaryInfo.housingFund) || 0;
      }
    });

    const totalAmount = totalPension + totalMedical + totalUnemployment + 
                        totalWorkInjury + totalMaternity + totalHousingFund;

    const detail: SocialInsurance = {
      pension: Number(totalPension.toFixed(2)),
      medical: Number(totalMedical.toFixed(2)),
      unemployment: Number(totalUnemployment.toFixed(2)),
      workInjury: Number(totalWorkInjury.toFixed(2)),
      maternity: Number(totalMaternity.toFixed(2)),
      housingFund: Number(totalHousingFund.toFixed(2))
    };

    const perEmployeeAverage: SocialInsurance = {
      pension: Number((totalPension / employeeCount).toFixed(2)),
      medical: Number((totalMedical / employeeCount).toFixed(2)),
      unemployment: Number((totalUnemployment / employeeCount).toFixed(2)),
      workInjury: Number((totalWorkInjury / employeeCount).toFixed(2)),
      maternity: Number((totalMaternity / employeeCount).toFixed(2)),
      housingFund: Number((totalHousingFund / employeeCount).toFixed(2))
    };

    // 计算各项占比
    const breakdown = [
      { category: '养老保险', amount: totalPension, percentage: totalAmount > 0 ? (totalPension / totalAmount) * 100 : 0 },
      { category: '医疗保险', amount: totalMedical, percentage: totalAmount > 0 ? (totalMedical / totalAmount) * 100 : 0 },
      { category: '失业保险', amount: totalUnemployment, percentage: totalAmount > 0 ? (totalUnemployment / totalAmount) * 100 : 0 },
      { category: '工伤保险', amount: totalWorkInjury, percentage: totalAmount > 0 ? (totalWorkInjury / totalAmount) * 100 : 0 },
      { category: '生育保险', amount: totalMaternity, percentage: totalAmount > 0 ? (totalMaternity / totalAmount) * 100 : 0 },
      { category: '住房公积金', amount: totalHousingFund, percentage: totalAmount > 0 ? (totalHousingFund / totalAmount) * 100 : 0 }
    ].map(item => ({
      ...item,
      amount: Number(item.amount.toFixed(2)),
      percentage: Number(item.percentage.toFixed(2))
    }));

    return {
      projectId,
      employeeCount,
      totalAmount: Number(totalAmount.toFixed(2)),
      detail,
      perEmployeeAverage,
      breakdown
    };
  }

  /**
   * 更新员工薪资
   */
  async updateSalary(input: UpdateSalaryInput): Promise<EmployeeSalary> {
    const prisma = await getPrisma();

    if (!prisma.projectEmployee || !prisma.employeeSalary) {
      throw new SalaryTransparencyError(
        '薪资表不存在',
        SalaryErrorCodes.INVALID_INPUT
      );
    }

    // 检查员工是否存在
    const employee = await prisma.projectEmployee.findUnique({
      where: { id: input.employeeId }
    });

    if (!employee) {
      throw new SalaryTransparencyError(
        `员工不存在: ${input.employeeId}`,
        SalaryErrorCodes.EMPLOYEE_NOT_FOUND
      );
    }

    // 创建或更新薪资记录
    const salaryData = {
      employeeId: input.employeeId,
      baseSalary: input.baseSalary,
      bonus: input.bonus || 0,
      allowance: input.allowance || 0,
      overtimePay: input.overtimePay || 0,
      pension: input.pension || 0,
      medical: input.medical || 0,
      unemployment: input.unemployment || 0,
      workInjury: input.workInjury || 0,
      maternity: input.maternity || 0,
      housingFund: input.housingFund || 0,
      effectiveDate: input.effectiveDate
    };

    const salary = await prisma.employeeSalary.upsert({
      where: { employeeId: input.employeeId },
      update: salaryData,
      create: salaryData
    });

    return {
      id: salary.id,
      employeeId: salary.employeeId,
      baseSalary: Number(salary.baseSalary),
      bonus: Number(salary.bonus),
      allowance: Number(salary.allowance),
      overtimePay: Number(salary.overtimePay),
      socialInsurance: {
        pension: Number(salary.pension),
        medical: Number(salary.medical),
        unemployment: Number(salary.unemployment),
        workInjury: Number(salary.workInjury),
        maternity: Number(salary.maternity),
        housingFund: Number(salary.housingFund)
      },
      effectiveDate: salary.effectiveDate,
      createdAt: salary.createdAt
    };
  }

  /**
   * 获取员工薪资详情
   */
  async getEmployeeSalary(employeeId: string): Promise<EmployeeSalary | null> {
    const prisma = await getPrisma();

    if (!prisma.employeeSalary) {
      return null;
    }

    const salary = await prisma.employeeSalary.findUnique({
      where: { employeeId }
    });

    if (!salary) {
      return null;
    }

    return {
      id: salary.id,
      employeeId: salary.employeeId,
      baseSalary: Number(salary.baseSalary),
      bonus: Number(salary.bonus),
      allowance: Number(salary.allowance),
      overtimePay: Number(salary.overtimePay),
      socialInsurance: {
        pension: Number(salary.pension),
        medical: Number(salary.medical),
        unemployment: Number(salary.unemployment),
        workInjury: Number(salary.workInjury),
        maternity: Number(salary.maternity),
        housingFund: Number(salary.housingFund)
      },
      effectiveDate: salary.effectiveDate,
      createdAt: salary.createdAt
    };
  }

  // =====================================================
  // 私有辅助方法
  // =====================================================

  /**
   * 计算薪资构成
   */
  private calculateSalaryComposition(
    baseSalary: number,
    bonus: number,
    allowance: number,
    overtime: number,
    socialInsurance: number
  ): SalaryComposition {
    const total = baseSalary + bonus + allowance + overtime + socialInsurance;
    
    if (total === 0) {
      return {
        baseSalary: 0,
        baseSalaryPercentage: 0,
        bonus: 0,
        bonusPercentage: 0,
        allowance: 0,
        allowancePercentage: 0,
        overtime: 0,
        overtimePercentage: 0,
        socialInsurance: 0,
        socialInsurancePercentage: 0,
        total: 0
      };
    }

    return {
      baseSalary: Number(baseSalary.toFixed(2)),
      baseSalaryPercentage: Number(((baseSalary / total) * 100).toFixed(2)),
      bonus: Number(bonus.toFixed(2)),
      bonusPercentage: Number(((bonus / total) * 100).toFixed(2)),
      allowance: Number(allowance.toFixed(2)),
      allowancePercentage: Number(((allowance / total) * 100).toFixed(2)),
      overtime: Number(overtime.toFixed(2)),
      overtimePercentage: Number(((overtime / total) * 100).toFixed(2)),
      socialInsurance: Number(socialInsurance.toFixed(2)),
      socialInsurancePercentage: Number(((socialInsurance / total) * 100).toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }

  /**
   * 计算员工总薪资
   */
  private calculateTotalSalary(salaryInfo: any): number {
    const baseSalary = Number(salaryInfo.baseSalary) || 0;
    const bonus = Number(salaryInfo.bonus) || 0;
    const allowance = Number(salaryInfo.allowance) || 0;
    const overtimePay = Number(salaryInfo.overtimePay) || 0;
    const pension = Number(salaryInfo.pension) || 0;
    const medical = Number(salaryInfo.medical) || 0;
    const unemployment = Number(salaryInfo.unemployment) || 0;
    const workInjury = Number(salaryInfo.workInjury) || 0;
    const maternity = Number(salaryInfo.maternity) || 0;
    const housingFund = Number(salaryInfo.housingFund) || 0;

    return baseSalary + bonus + allowance + overtimePay + 
           pension + medical + unemployment + workInjury + maternity + housingFund;
  }

  /**
   * 创建空的人力成本汇总
   */
  private createEmptyLaborCostSummary(projectId: string): LaborCostSummary {
    return {
      projectId,
      totalLaborCost: 0,
      averageSalary: 0,
      employeeCount: 0,
      salaryComposition: {
        baseSalary: 0,
        baseSalaryPercentage: 0,
        bonus: 0,
        bonusPercentage: 0,
        allowance: 0,
        allowancePercentage: 0,
        overtime: 0,
        overtimePercentage: 0,
        socialInsurance: 0,
        socialInsurancePercentage: 0,
        total: 0
      },
      socialInsuranceTotal: 0,
      socialInsuranceDetail: {
        pension: 0,
        medical: 0,
        unemployment: 0,
        workInjury: 0,
        maternity: 0,
        housingFund: 0
      }
    };
  }

  /**
   * 创建空的五险一金明细
   */
  private createEmptySocialInsuranceDetail(projectId: string) {
    return {
      projectId,
      employeeCount: 0,
      totalAmount: 0,
      detail: {
        pension: 0,
        medical: 0,
        unemployment: 0,
        workInjury: 0,
        maternity: 0,
        housingFund: 0
      },
      perEmployeeAverage: {
        pension: 0,
        medical: 0,
        unemployment: 0,
        workInjury: 0,
        maternity: 0,
        housingFund: 0
      },
      breakdown: [
        { category: '养老保险', amount: 0, percentage: 0 },
        { category: '医疗保险', amount: 0, percentage: 0 },
        { category: '失业保险', amount: 0, percentage: 0 },
        { category: '工伤保险', amount: 0, percentage: 0 },
        { category: '生育保险', amount: 0, percentage: 0 },
        { category: '住房公积金', amount: 0, percentage: 0 }
      ]
    };
  }
}

// 导出单例实例
export const salaryTransparencyManager = new SalaryTransparencyManager();
