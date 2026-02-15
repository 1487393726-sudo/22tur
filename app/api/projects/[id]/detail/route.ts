/**
 * 项目完整详情 API
 * Project Complete Detail API
 * 
 * 聚合所有项目相关数据，包括生命周期、运营、员工、薪资、盈亏等
 * 支持真实数据库查询，同时保留模拟数据作为后备
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { projectDetailService } from '@/lib/investor-operations-monitoring/services/project-detail-service';
import { ProjectPhase, ProjectType, IndustryType, ExpenseCategory, TenureCategory, EmployeeStatus } from '@/types/investor-operations-monitoring';

// 是否使用真实数据库（可通过环境变量控制）
const USE_REAL_DATABASE = process.env.USE_REAL_DATABASE === 'true';

// 模拟项目详情数据（作为后备）
const mockProjectDetails: Record<string, ProjectDetailData> = {
  'proj-001': {
    id: 'proj-001',
    name: '星光餐饮连锁店',
    nameEn: 'Starlight Restaurant Chain',
    type: ProjectType.PHYSICAL,
    industry: IndustryType.CATERING,
    address: '北京市朝阳区建国路88号',
    currentPhase: ProjectPhase.OPERATING,
    phaseProgress: 100,
    investedAmount: 800000,
    shareholdingRatio: 85,
    startDate: new Date('2024-06-01'),
    operatingStartDate: new Date('2024-12-01'),
    dailyOperations: {
      date: new Date(),
      revenue: 28500,
      expenses: 18200,
      profit: 10300,
      customerCount: 156,
    },
    expenseBreakdown: [
      { category: ExpenseCategory.RAW_MATERIALS, amount: 8500, description: '食材采购' },
      { category: ExpenseCategory.LABOR, amount: 5200, description: '员工工资' },
      { category: ExpenseCategory.UTILITIES, amount: 1800, description: '水电费' },
      { category: ExpenseCategory.RENT, amount: 1500, description: '日均租金' },
      { category: ExpenseCategory.MARKETING, amount: 800, description: '营销推广' },
      { category: ExpenseCategory.OTHER, amount: 400, description: '其他支出' },
    ],
    annualExpenses: {
      rent: 540000,
      utilities: 72000,
      taxes: 85000,
      insurance: 25000,
      maintenance: 36000,
    },
    employeeStats: {
      totalCount: 28,
      activeCount: 25,
      onLeaveCount: 2,
      vacantPositions: 3,
      vacantPositionNames: ['厨师', '服务员', '收银员'],
    },
    dailyAttendance: {
      onDuty: 23,
      onLeave: 2,
      absent: 0,
    },
    employees: [
      {
        id: 'emp-001',
        name: '张伟',
        gender: '男',
        age: 35,
        position: '店长',
        department: '管理层',
        education: '本科',
        hireDate: new Date('2024-06-15'),
        tenure: TenureCategory.NEW,
        phone: '138****5678',
        emergencyContact: '李女士 139****1234',
        address: '北京市朝阳区**小区',
        idLast4: '5678',
        recruitmentChannel: '内部推荐',
        status: EmployeeStatus.ACTIVE,
        salary: { baseSalary: 12000, bonus: 3000, allowance: 1500, overtimePay: 0 },
        trainingRecords: ['管理培训', '食品安全培训', '消防安全培训'],
      },
      {
        id: 'emp-002',
        name: '王芳',
        gender: '女',
        age: 28,
        position: '主厨',
        department: '厨房',
        education: '专科',
        hireDate: new Date('2024-07-01'),
        tenure: TenureCategory.NEW,
        phone: '137****4321',
        emergencyContact: '王先生 136****5678',
        address: '北京市海淀区**小区',
        idLast4: '4321',
        recruitmentChannel: '招聘网站',
        status: EmployeeStatus.ACTIVE,
        salary: { baseSalary: 10000, bonus: 2000, allowance: 1000, overtimePay: 500 },
        trainingRecords: ['厨艺培训', '食品安全培训'],
      },
    ],
    salaryTransparency: {
      totalLaborCost: 156000,
      averageSalary: 6240,
      salaryComposition: { baseSalary: 120000, bonus: 18000, allowance: 12000, overtimePay: 6000 },
      socialInsurance: { pension: 24000, medical: 12000, unemployment: 3000, workInjury: 1500, maternity: 1500, housingFund: 18000 },
    },
    profitLossAnalysis: {
      totalRevenue: 2850000,
      totalExpenses: 2280000,
      totalProfit: 570000,
      profitMargin: 20,
      roi: 71.25,
      estimatedPaybackMonths: 14,
      monthlyTrend: [
        { month: '2024-12', revenue: 420000, expenses: 350000, profit: 70000 },
        { month: '2025-01', revenue: 480000, expenses: 380000, profit: 100000 },
      ],
    },
  },
  'proj-002': {
    id: 'proj-002',
    name: '智慧科技创新中心',
    nameEn: 'Smart Tech Innovation Center',
    type: ProjectType.ONLINE,
    industry: IndustryType.TECHNOLOGY,
    platform: 'SaaS云服务平台',
    currentPhase: ProjectPhase.OPERATING,
    phaseProgress: 100,
    investedAmount: 600000,
    shareholdingRatio: 82,
    startDate: new Date('2024-03-01'),
    operatingStartDate: new Date('2024-09-01'),
    dailyOperations: {
      date: new Date(),
      revenue: 45000,
      expenses: 28000,
      profit: 17000,
      customerCount: 85,
    },
    expenseBreakdown: [
      { category: ExpenseCategory.LABOR, amount: 18000, description: '技术团队工资' },
      { category: ExpenseCategory.EQUIPMENT, amount: 5000, description: '服务器费用' },
      { category: ExpenseCategory.MARKETING, amount: 3000, description: '市场推广' },
      { category: ExpenseCategory.OTHER, amount: 2000, description: '其他支出' },
    ],
    annualExpenses: { rent: 180000, utilities: 36000, taxes: 120000, insurance: 15000, maintenance: 48000 },
    employeeStats: {
      totalCount: 35,
      activeCount: 33,
      onLeaveCount: 2,
      vacantPositions: 5,
      vacantPositionNames: ['前端工程师', '后端工程师', '产品经理', 'UI设计师', '测试工程师'],
    },
    dailyAttendance: { onDuty: 31, onLeave: 2, absent: 0 },
    employees: [
      {
        id: 'emp-101',
        name: '李明',
        gender: '男',
        age: 32,
        position: '技术总监',
        department: '技术部',
        education: '硕士',
        hireDate: new Date('2024-03-15'),
        tenure: TenureCategory.NEW,
        phone: '139****8765',
        emergencyContact: '李女士 138****4321',
        address: '北京市中关村**小区',
        idLast4: '8765',
        recruitmentChannel: '猎头推荐',
        status: EmployeeStatus.ACTIVE,
        salary: { baseSalary: 25000, bonus: 8000, allowance: 3000, overtimePay: 0 },
        trainingRecords: ['技术管理培训', '敏捷开发培训'],
      },
    ],
    salaryTransparency: {
      totalLaborCost: 420000,
      averageSalary: 12000,
      salaryComposition: { baseSalary: 320000, bonus: 50000, allowance: 35000, overtimePay: 15000 },
      socialInsurance: { pension: 64000, medical: 32000, unemployment: 8000, workInjury: 4000, maternity: 4000, housingFund: 48000 },
    },
    profitLossAnalysis: {
      totalRevenue: 1800000,
      totalExpenses: 1120000,
      totalProfit: 680000,
      profitMargin: 37.8,
      roi: 113.3,
      estimatedPaybackMonths: 9,
      monthlyTrend: [
        { month: '2024-09', revenue: 280000, expenses: 200000, profit: 80000 },
        { month: '2024-10', revenue: 320000, expenses: 210000, profit: 110000 },
      ],
    },
  },
};

interface ProjectDetailData {
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
  dailyOperations: { date: Date; revenue: number; expenses: number; profit: number; customerCount: number };
  expenseBreakdown: Array<{ category: ExpenseCategory; amount: number; description: string }>;
  annualExpenses: { rent: number; utilities: number; taxes: number; insurance: number; maintenance: number };
  employeeStats: { totalCount: number; activeCount: number; onLeaveCount: number; vacantPositions: number; vacantPositionNames: string[] };
  dailyAttendance: { onDuty: number; onLeave: number; absent: number };
  employees: Array<{
    id: string; name: string; gender: string; age: number; position: string; department: string;
    education: string; hireDate: Date; tenure: TenureCategory; phone: string; emergencyContact: string;
    address: string; idLast4: string; recruitmentChannel: string; status: EmployeeStatus;
    salary: { baseSalary: number; bonus: number; allowance: number; overtimePay: number };
    trainingRecords: string[];
  }>;
  salaryTransparency: {
    totalLaborCost: number; averageSalary: number;
    salaryComposition: { baseSalary: number; bonus: number; allowance: number; overtimePay: number };
    socialInsurance: { pension: number; medical: number; unemployment: number; workInjury: number; maternity: number; housingFund: number };
  };
  profitLossAnalysis: {
    totalRevenue: number; totalExpenses: number; totalProfit: number; profitMargin: number;
    roi: number; estimatedPaybackMonths: number;
    monthlyTrend: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  };
}

// 模拟投资者项目访问权限
const investorProjectAccess: Record<string, string[]> = {
  'investor-001': ['proj-001', 'proj-002'],
  'investor-002': ['proj-001'],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: projectId } = await params;
    
    // 验证用户身份（开发环境允许匿名访问）
    const investorId = session?.user?.id || 'investor-001';
    
    // 尝试使用真实数据库
    if (USE_REAL_DATABASE) {
      try {
        const projectDetail = await projectDetailService.getProjectDetail(projectId, investorId);
        
        if (!projectDetail) {
          return NextResponse.json(
            { 
              error: 'ACCESS_DENIED',
              message: '您没有权限访问此项目或项目不存在',
              messageEn: 'You do not have permission to access this project or project not found'
            },
            { status: 403 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: projectDetail,
          source: 'database',
        });
      } catch (dbError) {
        console.warn('Database query failed, falling back to mock data:', dbError);
        // 数据库查询失败，回退到模拟数据
      }
    }
    
    // 使用模拟数据
    const accessibleProjects = investorProjectAccess[investorId] || ['proj-001', 'proj-002'];
    if (!accessibleProjects.includes(projectId)) {
      return NextResponse.json(
        { 
          error: 'ACCESS_DENIED',
          message: '您没有权限访问此项目',
          messageEn: 'You do not have permission to access this project'
        },
        { status: 403 }
      );
    }
    
    const projectDetail = mockProjectDetails[projectId];
    if (!projectDetail) {
      return NextResponse.json(
        { 
          error: 'PROJECT_NOT_FOUND',
          message: '项目不存在',
          messageEn: 'Project not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: projectDetail,
      source: 'mock',
    });
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR',
        message: '获取项目详情失败',
        messageEn: 'Failed to fetch project detail'
      },
      { status: 500 }
    );
  }
}
