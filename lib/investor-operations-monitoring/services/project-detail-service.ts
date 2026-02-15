/**
 * 项目详情服务
 * Project Detail Service
 * 
 * 聚合所有仓库数据，提供完整的项目详情
 */

import { projectRepository } from '../repositories/project-repository';
import { operationsRepository } from '../repositories/operations-repository';
import { employeeRepository } from '../repositories/employee-repository';
import { profitLossRepository } from '../repositories/profit-loss-repository';
import {
  ProjectPhase,
  ProjectType,
  IndustryType,
  ExpenseCategory,
  TenureCategory,
  EmployeeStatus,
} from '@/types/investor-operations-monitoring';

export interface ProjectDetailResponse {
  id: string;
  name: string;
  nameEn: string;
  type: ProjectType;
  industry: IndustryType;
  address?: string;
  platform?: string;
  currentPhase: ProjectPhase;
  phaseProgress: number;
  investedAmount: number;
  shareholdingRatio: number;
  startDate: Date;
  operatingStartDate?: Date;
  dailyOperations: {
    date: Date;
    revenue: number;
    expenses: number;
    profit: number;
    customerCount: number;
  };
  expenseBreakdown: Array<{
    category: ExpenseCategory;
    amount: number;
    description: string;
  }>;
  annualExpenses: {
    rent: number;
    utilities: number;
    taxes: number;
    insurance: number;
    maintenance: number;
  };
  employeeStats: {
    totalCount: number;
    activeCount: number;
    onLeaveCount: number;
    vacantPositions: number;
    vacantPositionNames: string[];
  };
  dailyAttendance: {
    onDuty: number;
    onLeave: number;
    absent: number;
  };
  employees: Array<{
    id: string;
    name: string;
    gender: string;
    age: number;
    position: string;
    department: string;
    education: string;
    hireDate: Date;
    tenure: TenureCategory;
    phone: string;
    emergencyContact: string;
    address: string;
    idLast4: string;
    recruitmentChannel: string;
    status: EmployeeStatus;
    salary: {
      baseSalary: number;
      bonus: number;
      allowance: number;
      overtimePay: number;
    };
    trainingRecords: string[];
  }>;
  salaryTransparency: {
    totalLaborCost: number;
    averageSalary: number;
    salaryComposition: {
      baseSalary: number;
      bonus: number;
      allowance: number;
      overtimePay: number;
    };
    socialInsurance: {
      pension: number;
      medical: number;
      unemployment: number;
      workInjury: number;
      maternity: number;
      housingFund: number;
    };
  };
  profitLossAnalysis: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    profitMargin: number;
    roi: number;
    estimatedPaybackMonths: number;
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
  };
}

export class ProjectDetailService {
  /**
   * 获取项目完整详情
   */
  async getProjectDetail(
    projectId: string,
    investorId: string
  ): Promise<ProjectDetailResponse | null> {
    // 验证访问权限
    const hasAccess = await projectRepository.verifyInvestorAccess(investorId, projectId);
    if (!hasAccess) {
      return null;
    }

    // 获取基本项目信息
    const project = await projectRepository.getProjectById(projectId);
    if (!project) {
      return null;
    }

    // 获取持股比例
    const shareholdingRatio = await projectRepository.getShareholdingRatio(investorId, projectId);

    // 并行获取所有数据
    const [
      todayOperations,
      annualExpenses,
      employeeStats,
      dailyAttendance,
      employees,
      salaryTransparency,
      profitLossAnalysis,
    ] = await Promise.all([
      operationsRepository.getDailyOperations(projectId, new Date()),
      operationsRepository.getAnnualExpensesEstimate(projectId),
      employeeRepository.getEmployeeStats(projectId),
      employeeRepository.getDailyAttendance(projectId),
      this.getEmployeesWithDetails(projectId),
      employeeRepository.getSalaryTransparency(projectId),
      profitLossRepository.getProfitLossAnalysis(projectId, project.investedAmount),
    ]);

    return {
      id: project.id,
      name: project.name,
      nameEn: project.nameEn,
      type: project.type,
      industry: project.industry,
      address: project.address,
      platform: project.platform,
      currentPhase: project.currentPhase,
      phaseProgress: project.phaseProgress,
      investedAmount: project.investedAmount,
      shareholdingRatio,
      startDate: project.startDate,
      operatingStartDate: project.operatingStartDate,
      dailyOperations: todayOperations || {
        date: new Date(),
        revenue: 0,
        expenses: 0,
        profit: 0,
        customerCount: 0,
      },
      expenseBreakdown: todayOperations?.expenseBreakdown || [],
      annualExpenses,
      employeeStats,
      dailyAttendance,
      employees,
      salaryTransparency,
      profitLossAnalysis,
    };
  }

  /**
   * 获取员工列表（包含详情）
   */
  private async getEmployeesWithDetails(projectId: string) {
    const employeeList = await employeeRepository.getEmployeesByProject(projectId);
    
    const employeesWithDetails = await Promise.all(
      employeeList.map(async (emp) => {
        const detail = await employeeRepository.getEmployeeDetail(emp.id);
        return detail || {
          ...emp,
          emergencyContact: '',
          address: '',
          idLast4: '',
          recruitmentChannel: '',
          salary: { baseSalary: 0, bonus: 0, allowance: 0, overtimePay: 0 },
          trainingRecords: [],
        };
      })
    );

    return employeesWithDetails;
  }
}

// 导出单例实例
export const projectDetailService = new ProjectDetailService();
