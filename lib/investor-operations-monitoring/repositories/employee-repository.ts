/**
 * 员工仓库
 * Employee Repository
 * 
 * 处理项目员工、薪资、培训记录等数据库操作
 */

import { BaseRepository } from './base-repository';
import { TenureCategory, EmployeeStatus } from '@/types/investor-operations-monitoring';

export interface EmployeeListItem {
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
  status: EmployeeStatus;
}

export interface EmployeeDetail extends EmployeeListItem {
  emergencyContact: string;
  address: string;
  idLast4: string;
  recruitmentChannel: string;
  salary: {
    baseSalary: number;
    bonus: number;
    allowance: number;
    overtimePay: number;
  };
  trainingRecords: string[];
}

export interface EmployeeStats {
  totalCount: number;
  activeCount: number;
  onLeaveCount: number;
  vacantPositions: number;
  vacantPositionNames: string[];
}

export interface DailyAttendance {
  onDuty: number;
  onLeave: number;
  absent: number;
}

export interface SalaryTransparency {
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
}

export class EmployeeRepository extends BaseRepository {
  /**
   * 获取项目员工列表
   */
  async getEmployeesByProject(projectId: string): Promise<EmployeeListItem[]> {
    return this.executeQuery(async () => {
      const employees = await this.prisma.projectEmployee.findMany({
        where: { projectId },
        include: {
          salaries: {
            orderBy: { effectiveDate: 'desc' },
            take: 1,
          },
        },
        orderBy: { hireDate: 'asc' },
      });

      return employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        gender: emp.gender,
        age: this.calculateAge(emp.birthDate),
        position: emp.position,
        department: emp.department,
        education: emp.education,
        hireDate: emp.hireDate,
        tenure: this.calculateTenure(emp.hireDate),
        phone: this.maskPhone(emp.phone),
        status: emp.status as EmployeeStatus,
      }));
    }, `Failed to get employees for project ${projectId}`);
  }

  /**
   * 获取员工详情
   */
  async getEmployeeDetail(employeeId: string): Promise<EmployeeDetail | null> {
    return this.executeQuery(async () => {
      const employee = await this.prisma.projectEmployee.findUnique({
        where: { id: employeeId },
        include: {
          salaries: {
            orderBy: { effectiveDate: 'desc' },
            take: 1,
          },
          trainingRecords: {
            orderBy: { completedAt: 'desc' },
          },
        },
      });

      if (!employee) return null;

      const latestSalary = employee.salaries[0];

      return {
        id: employee.id,
        name: employee.name,
        gender: employee.gender,
        age: this.calculateAge(employee.birthDate),
        position: employee.position,
        department: employee.department,
        education: employee.education,
        hireDate: employee.hireDate,
        tenure: this.calculateTenure(employee.hireDate),
        phone: employee.phone,
        status: employee.status as EmployeeStatus,
        emergencyContact: employee.emergencyContact || '',
        address: employee.address || '',
        idLast4: employee.idNumber ? employee.idNumber.slice(-4) : '',
        recruitmentChannel: employee.recruitmentChannel || '',
        salary: latestSalary ? {
          baseSalary: latestSalary.baseSalary,
          bonus: latestSalary.bonus,
          allowance: latestSalary.allowance,
          overtimePay: latestSalary.overtimePay,
        } : {
          baseSalary: 0,
          bonus: 0,
          allowance: 0,
          overtimePay: 0,
        },
        trainingRecords: employee.trainingRecords.map(tr => tr.courseName),
      };
    }, `Failed to get employee detail ${employeeId}`);
  }

  /**
   * 获取员工统计
   */
  async getEmployeeStats(projectId: string): Promise<EmployeeStats> {
    return this.executeQuery(async () => {
      const employees = await this.prisma.projectEmployee.findMany({
        where: { projectId },
        select: {
          status: true,
          position: true,
        },
      });

      const totalCount = employees.length;
      const activeCount = employees.filter(e => e.status === 'ACTIVE').length;
      const onLeaveCount = employees.filter(e => e.status === 'ON_LEAVE').length;

      // 获取项目的预期岗位配置（这里简化处理）
      const expectedPositions = ['店长', '主厨', '服务员', '收银员', '清洁员'];
      const currentPositions = new Set(employees.map(e => e.position));
      const vacantPositionNames = expectedPositions.filter(p => !currentPositions.has(p));

      return {
        totalCount,
        activeCount,
        onLeaveCount,
        vacantPositions: vacantPositionNames.length,
        vacantPositionNames,
      };
    }, `Failed to get employee stats for project ${projectId}`);
  }

  /**
   * 获取当日出勤统计
   */
  async getDailyAttendance(projectId: string, date: Date = new Date()): Promise<DailyAttendance> {
    return this.executeQuery(async () => {
      const employees = await this.prisma.projectEmployee.findMany({
        where: { projectId },
        select: { status: true },
      });

      // 简化处理：根据员工状态计算出勤
      const onDuty = employees.filter(e => e.status === 'ACTIVE').length;
      const onLeave = employees.filter(e => e.status === 'ON_LEAVE').length;
      const absent = employees.filter(e => e.status === 'ABSENT').length;

      return { onDuty, onLeave, absent };
    }, `Failed to get daily attendance for project ${projectId}`);
  }

  /**
   * 获取薪资透明数据
   */
  async getSalaryTransparency(projectId: string): Promise<SalaryTransparency> {
    return this.executeQuery(async () => {
      const employees = await this.prisma.projectEmployee.findMany({
        where: { projectId },
        include: {
          salaries: {
            orderBy: { effectiveDate: 'desc' },
            take: 1,
          },
        },
      });

      let totalBaseSalary = 0;
      let totalBonus = 0;
      let totalAllowance = 0;
      let totalOvertimePay = 0;

      employees.forEach(emp => {
        const salary = emp.salaries[0];
        if (salary) {
          totalBaseSalary += salary.baseSalary;
          totalBonus += salary.bonus;
          totalAllowance += salary.allowance;
          totalOvertimePay += salary.overtimePay;
        }
      });

      const totalLaborCost = totalBaseSalary + totalBonus + totalAllowance + totalOvertimePay;
      const employeeCount = employees.length || 1;

      // 社保计算（按照标准比例估算）
      const socialInsuranceBase = totalBaseSalary;
      const socialInsurance = {
        pension: socialInsuranceBase * 0.16, // 养老保险 16%
        medical: socialInsuranceBase * 0.08, // 医疗保险 8%
        unemployment: socialInsuranceBase * 0.02, // 失业保险 2%
        workInjury: socialInsuranceBase * 0.01, // 工伤保险 1%
        maternity: socialInsuranceBase * 0.01, // 生育保险 1%
        housingFund: socialInsuranceBase * 0.12, // 住房公积金 12%
      };

      return {
        totalLaborCost: totalLaborCost + Object.values(socialInsurance).reduce((a, b) => a + b, 0),
        averageSalary: totalLaborCost / employeeCount,
        salaryComposition: {
          baseSalary: totalBaseSalary,
          bonus: totalBonus,
          allowance: totalAllowance,
          overtimePay: totalOvertimePay,
        },
        socialInsurance,
      };
    }, `Failed to get salary transparency for project ${projectId}`);
  }

  /**
   * 获取岗位薪资范围
   */
  async getSalaryRangeByPosition(projectId: string): Promise<Array<{
    position: string;
    minSalary: number;
    maxSalary: number;
    avgSalary: number;
    count: number;
  }>> {
    return this.executeQuery(async () => {
      const employees = await this.prisma.projectEmployee.findMany({
        where: { projectId },
        include: {
          salaries: {
            orderBy: { effectiveDate: 'desc' },
            take: 1,
          },
        },
      });

      const positionMap = new Map<string, number[]>();

      employees.forEach(emp => {
        const salary = emp.salaries[0];
        if (salary) {
          const totalSalary = salary.baseSalary + salary.bonus + salary.allowance + salary.overtimePay;
          if (!positionMap.has(emp.position)) {
            positionMap.set(emp.position, []);
          }
          positionMap.get(emp.position)!.push(totalSalary);
        }
      });

      return Array.from(positionMap.entries()).map(([position, salaries]) => ({
        position,
        minSalary: Math.min(...salaries),
        maxSalary: Math.max(...salaries),
        avgSalary: salaries.reduce((a, b) => a + b, 0) / salaries.length,
        count: salaries.length,
      }));
    }, `Failed to get salary range by position for project ${projectId}`);
  }

  /**
   * 计算年龄
   */
  private calculateAge(birthDate: Date | null): number {
    if (!birthDate) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * 计算工龄分类
   */
  private calculateTenure(hireDate: Date): TenureCategory {
    const now = new Date();
    const years = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (years < 1) return TenureCategory.NEW;
    if (years < 3) return TenureCategory.JUNIOR;
    if (years < 5) return TenureCategory.MID;
    return TenureCategory.SENIOR;
  }

  /**
   * 脱敏电话号码
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  }
}

// 导出单例实例
export const employeeRepository = new EmployeeRepository();
