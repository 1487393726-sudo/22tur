/**
 * 员工透明化管理服务
 * Employee Transparency Manager Service
 * 
 * 实现员工统计、列表查询、详情管理和人员流动分析
 */

import {
  ProjectEmployee,
  EmployeeStats,
  TurnoverAnalysis,
  TrainingRecord,
  TenureCategory,
  EmployeeStatus,
  DateRange,
  CreateEmployeeInput,
  calculateTenureCategory,
  calculateTurnoverRate
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
 * 员工管理错误
 */
export class EmployeeTransparencyError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EmployeeTransparencyError';
  }
}

/**
 * 错误代码
 */
export const EmployeeErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_EMPLOYEE: 'DUPLICATE_EMPLOYEE'
} as const;

/**
 * 员工透明化管理器
 */
export class EmployeeTransparencyManager {
  /**
   * 获取项目员工统计
   */
  async getEmployeeStats(projectId: string): Promise<EmployeeStats> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new EmployeeTransparencyError(
        `项目不存在: ${projectId}`,
        EmployeeErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 获取员工数据
    let employees: any[] = [];
    if (prisma.projectEmployee) {
      employees = await prisma.projectEmployee.findMany({
        where: { projectId }
      });
    }

    // 计算统计数据
    const totalCount = employees.length;
    const activeCount = employees.filter(e => e.status === EmployeeStatus.ACTIVE).length;
    const resignedCount = employees.filter(e => e.status === EmployeeStatus.RESIGNED).length;
    const onLeaveCount = employees.filter(e => e.status === EmployeeStatus.ON_LEAVE).length;

    // 岗位分布
    const positionMap = new Map<string, number>();
    employees.forEach(e => {
      const count = positionMap.get(e.position) || 0;
      positionMap.set(e.position, count + 1);
    });
    const positionDistribution = Array.from(positionMap.entries())
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count);

    // 部门分布
    const departmentMap = new Map<string, number>();
    employees.forEach(e => {
      if (e.department) {
        const count = departmentMap.get(e.department) || 0;
        departmentMap.set(e.department, count + 1);
      }
    });
    const departmentDistribution = Array.from(departmentMap.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    // 工龄分布
    const tenureMap = new Map<TenureCategory, number>();
    Object.values(TenureCategory).forEach(t => tenureMap.set(t, 0));
    employees.forEach(e => {
      const tenure = calculateTenureCategory(new Date(e.hireDate));
      tenureMap.set(tenure, (tenureMap.get(tenure) || 0) + 1);
    });
    const tenureDistribution = Array.from(tenureMap.entries())
      .map(([tenure, count]) => ({ tenure, count }));

    return {
      projectId,
      totalCount,
      activeCount,
      resignedCount,
      onLeaveCount,
      positionDistribution,
      departmentDistribution,
      tenureDistribution
    };
  }

  /**
   * 获取项目员工列表
   */
  async getEmployeeList(
    projectId: string,
    options?: {
      status?: EmployeeStatus;
      position?: string;
      department?: string;
      tenure?: TenureCategory;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{ employees: ProjectEmployee[]; total: number }> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new EmployeeTransparencyError(
        `项目不存在: ${projectId}`,
        EmployeeErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.projectEmployee) {
      return { employees: [], total: 0 };
    }

    // 构建查询条件
    const where: any = { projectId };
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.position) {
      where.position = options.position;
    }
    if (options?.department) {
      where.department = options.department;
    }

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 获取员工列表
    const [employees, total] = await Promise.all([
      prisma.projectEmployee.findMany({
        where,
        include: {
          trainingRecords: true,
          salaryInfo: true,
          assessments: {
            orderBy: { assessedAt: 'desc' },
            take: 1
          }
        },
        orderBy: { hireDate: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.projectEmployee.count({ where })
    ]);

    // 过滤工龄（如果指定）
    let filteredEmployees = employees;
    if (options?.tenure) {
      filteredEmployees = employees.filter((e: any) => {
        const tenure = calculateTenureCategory(new Date(e.hireDate));
        return tenure === options.tenure;
      });
    }

    // 转换为接口类型
    const result: ProjectEmployee[] = filteredEmployees.map((e: any) => ({
      id: e.id,
      projectId: e.projectId,
      name: e.name,
      position: e.position,
      department: e.department,
      hireDate: e.hireDate,
      tenure: calculateTenureCategory(new Date(e.hireDate)),
      recruitmentChannel: e.recruitmentChannel,
      status: e.status as EmployeeStatus,
      trainingRecords: e.trainingRecords || [],
      salaryInfo: e.salaryInfo,
      assessments: e.assessments || [],
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));

    return { employees: result, total };
  }

  /**
   * 获取员工详情
   */
  async getEmployeeDetail(
    projectId: string,
    employeeId: string
  ): Promise<ProjectEmployee> {
    const prisma = await getPrisma();

    if (!prisma.projectEmployee) {
      throw new EmployeeTransparencyError(
        `员工不存在: ${employeeId}`,
        EmployeeErrorCodes.EMPLOYEE_NOT_FOUND
      );
    }

    const employee = await prisma.projectEmployee.findFirst({
      where: { 
        id: employeeId,
        projectId 
      },
      include: {
        trainingRecords: {
          orderBy: { startDate: 'desc' }
        },
        salaryInfo: true,
        assessments: {
          orderBy: { assessedAt: 'desc' }
        }
      }
    });

    if (!employee) {
      throw new EmployeeTransparencyError(
        `员工不存在: ${employeeId}`,
        EmployeeErrorCodes.EMPLOYEE_NOT_FOUND
      );
    }

    return {
      id: employee.id,
      projectId: employee.projectId,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      hireDate: employee.hireDate,
      tenure: calculateTenureCategory(new Date(employee.hireDate)),
      recruitmentChannel: employee.recruitmentChannel,
      status: employee.status as EmployeeStatus,
      trainingRecords: employee.trainingRecords || [],
      salaryInfo: employee.salaryInfo,
      assessments: employee.assessments || [],
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }

  /**
   * 获取人员流动分析
   */
  async getTurnoverAnalysis(
    projectId: string,
    dateRange: DateRange
  ): Promise<TurnoverAnalysis> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new EmployeeTransparencyError(
        `项目不存在: ${projectId}`,
        EmployeeErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.projectEmployee) {
      return {
        projectId,
        dateRange,
        hiredCount: 0,
        resignedCount: 0,
        averageHeadcount: 0,
        turnoverRate: 0,
        monthlyTurnover: []
      };
    }

    // 获取时间范围内入职的员工
    const hiredEmployees = await prisma.projectEmployee.findMany({
      where: {
        projectId,
        hireDate: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      }
    });

    // 获取时间范围内离职的员工
    const resignedEmployees = await prisma.projectEmployee.findMany({
      where: {
        projectId,
        status: EmployeeStatus.RESIGNED,
        updatedAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      }
    });

    // 计算平均在职人数
    const startCount = await prisma.projectEmployee.count({
      where: {
        projectId,
        hireDate: { lt: dateRange.startDate },
        OR: [
          { status: EmployeeStatus.ACTIVE },
          { status: EmployeeStatus.ON_LEAVE },
          {
            status: EmployeeStatus.RESIGNED,
            updatedAt: { gt: dateRange.startDate }
          }
        ]
      }
    });

    const endCount = await prisma.projectEmployee.count({
      where: {
        projectId,
        hireDate: { lte: dateRange.endDate },
        OR: [
          { status: EmployeeStatus.ACTIVE },
          { status: EmployeeStatus.ON_LEAVE }
        ]
      }
    });

    const averageHeadcount = (startCount + endCount) / 2;
    const hiredCount = hiredEmployees.length;
    const resignedCount = resignedEmployees.length;
    const turnoverRate = calculateTurnoverRate(resignedCount, averageHeadcount);

    // 计算月度流动数据
    const monthlyTurnover = await this.calculateMonthlyTurnover(
      projectId,
      dateRange,
      prisma
    );

    return {
      projectId,
      dateRange,
      hiredCount,
      resignedCount,
      averageHeadcount,
      turnoverRate,
      monthlyTurnover
    };
  }

  /**
   * 创建员工
   */
  async createEmployee(input: CreateEmployeeInput): Promise<ProjectEmployee> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: input.projectId }
    });

    if (!project) {
      throw new EmployeeTransparencyError(
        `项目不存在: ${input.projectId}`,
        EmployeeErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.projectEmployee) {
      throw new EmployeeTransparencyError(
        '员工表不存在',
        EmployeeErrorCodes.INVALID_INPUT
      );
    }

    const tenure = calculateTenureCategory(input.hireDate);

    const employee = await prisma.projectEmployee.create({
      data: {
        projectId: input.projectId,
        name: input.name,
        position: input.position,
        department: input.department,
        hireDate: input.hireDate,
        tenureCategory: tenure,
        recruitmentChannel: input.recruitmentChannel,
        status: EmployeeStatus.ACTIVE
      }
    });

    return {
      id: employee.id,
      projectId: employee.projectId,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      hireDate: employee.hireDate,
      tenure,
      recruitmentChannel: employee.recruitmentChannel,
      status: EmployeeStatus.ACTIVE,
      trainingRecords: [],
      assessments: [],
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }

  /**
   * 更新员工状态
   */
  async updateEmployeeStatus(
    projectId: string,
    employeeId: string,
    status: EmployeeStatus
  ): Promise<ProjectEmployee> {
    const prisma = await getPrisma();

    if (!prisma.projectEmployee) {
      throw new EmployeeTransparencyError(
        `员工不存在: ${employeeId}`,
        EmployeeErrorCodes.EMPLOYEE_NOT_FOUND
      );
    }

    const employee = await prisma.projectEmployee.findFirst({
      where: { id: employeeId, projectId }
    });

    if (!employee) {
      throw new EmployeeTransparencyError(
        `员工不存在: ${employeeId}`,
        EmployeeErrorCodes.EMPLOYEE_NOT_FOUND
      );
    }

    const updated = await prisma.projectEmployee.update({
      where: { id: employeeId },
      data: { status },
      include: {
        trainingRecords: true,
        salaryInfo: true,
        assessments: true
      }
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      name: updated.name,
      position: updated.position,
      department: updated.department,
      hireDate: updated.hireDate,
      tenure: calculateTenureCategory(new Date(updated.hireDate)),
      recruitmentChannel: updated.recruitmentChannel,
      status: updated.status as EmployeeStatus,
      trainingRecords: updated.trainingRecords || [],
      salaryInfo: updated.salaryInfo,
      assessments: updated.assessments || [],
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  /**
   * 添加培训记录
   */
  async addTrainingRecord(
    employeeId: string,
    training: Omit<TrainingRecord, 'id' | 'employeeId' | 'createdAt'>
  ): Promise<TrainingRecord> {
    const prisma = await getPrisma();

    if (!prisma.trainingRecord) {
      throw new EmployeeTransparencyError(
        '培训记录表不存在',
        EmployeeErrorCodes.INVALID_INPUT
      );
    }

    const record = await prisma.trainingRecord.create({
      data: {
        employeeId,
        trainingName: training.trainingName,
        trainingType: training.trainingType,
        startDate: training.startDate,
        endDate: training.endDate,
        status: training.status,
        certificateUrl: training.certificateUrl
      }
    });

    return {
      id: record.id,
      employeeId: record.employeeId,
      trainingName: record.trainingName,
      trainingType: record.trainingType,
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status,
      certificateUrl: record.certificateUrl,
      createdAt: record.createdAt
    };
  }

  // =====================================================
  // 私有辅助方法
  // =====================================================

  /**
   * 计算月度流动数据
   */
  private async calculateMonthlyTurnover(
    projectId: string,
    dateRange: DateRange,
    prisma: any
  ): Promise<{ month: string; hired: number; resigned: number; rate: number }[]> {
    const result: { month: string; hired: number; resigned: number; rate: number }[] = [];
    
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // 按月遍历
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (current <= endDate) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      
      // 获取当月入职人数
      const hired = await prisma.projectEmployee.count({
        where: {
          projectId,
          hireDate: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      // 获取当月离职人数
      const resigned = await prisma.projectEmployee.count({
        where: {
          projectId,
          status: EmployeeStatus.RESIGNED,
          updatedAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      // 获取当月平均在职人数
      const avgCount = await prisma.projectEmployee.count({
        where: {
          projectId,
          hireDate: { lte: monthEnd },
          OR: [
            { status: EmployeeStatus.ACTIVE },
            { status: EmployeeStatus.ON_LEAVE },
            {
              status: EmployeeStatus.RESIGNED,
              updatedAt: { gt: monthEnd }
            }
          ]
        }
      });

      const rate = calculateTurnoverRate(resigned, avgCount);
      const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;

      result.push({ month: monthStr, hired, resigned, rate });

      // 移动到下个月
      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }
}

// 导出单例实例
export const employeeTransparencyManager = new EmployeeTransparencyManager();
