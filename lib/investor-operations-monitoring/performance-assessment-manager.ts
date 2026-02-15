/**
 * 能力评估管理服务
 * Performance Assessment Manager Service
 * 
 * 实现团队和个人能力评估、评估历史趋势分析和能力预警机制
 * 需求: 7.1, 7.2, 7.4, 7.5
 */

import {
  PerformanceAssessment,
  TeamAssessment,
  AssessmentTrend,
  AssessmentInput,
  AlertType,
  AlertSeverity,
  LossAlert,
  calculateOverallScore,
  validateAssessmentData
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
 * 能力评估错误
 */
export class PerformanceAssessmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PerformanceAssessmentError';
  }
}

/**
 * 错误代码
 */
export const AssessmentErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  ASSESSMENT_NOT_FOUND: 'ASSESSMENT_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_ASSESSMENT: 'DUPLICATE_ASSESSMENT'
} as const;

/**
 * 能力预警阈值配置
 */
const CAPABILITY_ALERT_THRESHOLDS = {
  // 团队平均分下降超过此值触发预警
  TEAM_SCORE_DECLINE: 1.0,
  // 个人评分低于此值触发预警
  INDIVIDUAL_LOW_SCORE: 5.0,
  // 连续评估下降次数
  CONSECUTIVE_DECLINE_COUNT: 2
};

/**
 * 能力评估管理器
 */
export class PerformanceAssessmentManager {
  /**
   * 获取团队能力评估
   * 需求 7.1: 团队能力评估
   */
  async getTeamAssessment(
    projectId: string,
    assessmentPeriod?: string
  ): Promise<TeamAssessment> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new PerformanceAssessmentError(
        `项目不存在: ${projectId}`,
        AssessmentErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 获取项目所有员工的最新评估
    if (!prisma.projectEmployee || !prisma.performanceAssessment) {
      return this.createEmptyTeamAssessment(projectId, assessmentPeriod || 'N/A');
    }

    // 构建查询条件
    const whereCondition: any = {
      employee: { projectId }
    };
    if (assessmentPeriod) {
      whereCondition.assessmentPeriod = assessmentPeriod;
    }

    const assessments = await prisma.performanceAssessment.findMany({
      where: whereCondition,
      include: {
        employee: true
      },
      orderBy: { assessedAt: 'desc' }
    });

    if (assessments.length === 0) {
      return this.createEmptyTeamAssessment(projectId, assessmentPeriod || 'N/A');
    }

    // 如果没有指定评估周期，获取最新周期
    const latestPeriod = assessmentPeriod || assessments[0].assessmentPeriod;
    const periodAssessments = assessments.filter(
      (a: any) => a.assessmentPeriod === latestPeriod
    );

    // 计算团队平均分
    const employeeCount = periodAssessments.length;
    let totalProfessionalSkills = 0;
    let totalWorkAttitude = 0;
    let totalTeamwork = 0;
    let totalCommunication = 0;
    let totalProblemSolving = 0;
    let totalOverall = 0;

    periodAssessments.forEach((a: any) => {
      totalProfessionalSkills += Number(a.professionalSkills);
      totalWorkAttitude += Number(a.workAttitude);
      totalTeamwork += Number(a.teamwork);
      totalCommunication += Number(a.communication);
      totalProblemSolving += Number(a.problemSolving);
      totalOverall += Number(a.overallScore);
    });

    const averageScores = {
      professionalSkills: Number((totalProfessionalSkills / employeeCount).toFixed(2)),
      workAttitude: Number((totalWorkAttitude / employeeCount).toFixed(2)),
      teamwork: Number((totalTeamwork / employeeCount).toFixed(2)),
      communication: Number((totalCommunication / employeeCount).toFixed(2)),
      problemSolving: Number((totalProblemSolving / employeeCount).toFixed(2)),
      overall: Number((totalOverall / employeeCount).toFixed(2))
    };

    // 获取表现最好和需要改进的员工
    const sortedByScore = [...periodAssessments].sort(
      (a: any, b: any) => Number(b.overallScore) - Number(a.overallScore)
    );

    const topPerformers = sortedByScore.slice(0, 3).map((a: any) => ({
      employeeId: a.employeeId,
      name: a.employee.name,
      score: Number(a.overallScore)
    }));

    const needsImprovement = sortedByScore
      .filter((a: any) => Number(a.overallScore) < CAPABILITY_ALERT_THRESHOLDS.INDIVIDUAL_LOW_SCORE)
      .slice(0, 3)
      .map((a: any) => ({
        employeeId: a.employeeId,
        name: a.employee.name,
        score: Number(a.overallScore)
      }));

    return {
      projectId,
      assessmentPeriod: latestPeriod,
      averageScores,
      employeeCount,
      topPerformers,
      needsImprovement
    };
  }

  /**
   * 获取个人能力评估
   * 需求 7.2: 个人能力评估
   */
  async getIndividualAssessment(
    employeeId: string,
    assessmentPeriod?: string
  ): Promise<PerformanceAssessment | null> {
    const prisma = await getPrisma();

    if (!prisma.performanceAssessment) {
      return null;
    }

    const whereCondition: any = { employeeId };
    if (assessmentPeriod) {
      whereCondition.assessmentPeriod = assessmentPeriod;
    }

    const assessment = await prisma.performanceAssessment.findFirst({
      where: whereCondition,
      orderBy: { assessedAt: 'desc' }
    });

    if (!assessment) {
      return null;
    }

    return this.mapAssessmentToInterface(assessment);
  }

  /**
   * 获取评估历史趋势
   * 需求 7.4: 评估历史趋势分析
   */
  async getAssessmentTrend(employeeId: string): Promise<AssessmentTrend> {
    const prisma = await getPrisma();

    if (!prisma.performanceAssessment) {
      return this.createEmptyAssessmentTrend(employeeId);
    }

    const assessments = await prisma.performanceAssessment.findMany({
      where: { employeeId },
      orderBy: { assessedAt: 'asc' }
    });

    if (assessments.length === 0) {
      return this.createEmptyAssessmentTrend(employeeId);
    }

    const periods: string[] = [];
    const scores = {
      professionalSkills: [] as number[],
      workAttitude: [] as number[],
      teamwork: [] as number[],
      communication: [] as number[],
      problemSolving: [] as number[],
      overall: [] as number[]
    };

    assessments.forEach((a: any) => {
      periods.push(a.assessmentPeriod);
      scores.professionalSkills.push(Number(a.professionalSkills));
      scores.workAttitude.push(Number(a.workAttitude));
      scores.teamwork.push(Number(a.teamwork));
      scores.communication.push(Number(a.communication));
      scores.problemSolving.push(Number(a.problemSolving));
      scores.overall.push(Number(a.overallScore));
    });

    return {
      employeeId,
      periods,
      scores
    };
  }

  /**
   * 提交能力评估
   */
  async submitAssessment(
    input: AssessmentInput,
    assessedBy: string
  ): Promise<PerformanceAssessment> {
    const prisma = await getPrisma();

    // 验证输入数据
    const validation = validateAssessmentData(input);
    if (!validation.isValid) {
      throw new PerformanceAssessmentError(
        `评估数据验证失败: ${validation.errors.map(e => e.message).join(', ')}`,
        AssessmentErrorCodes.INVALID_INPUT,
        validation.errors
      );
    }

    if (!prisma.projectEmployee || !prisma.performanceAssessment) {
      throw new PerformanceAssessmentError(
        '评估表不存在',
        AssessmentErrorCodes.INVALID_INPUT
      );
    }

    // 检查员工是否存在
    const employee = await prisma.projectEmployee.findUnique({
      where: { id: input.employeeId }
    });

    if (!employee) {
      throw new PerformanceAssessmentError(
        `员工不存在: ${input.employeeId}`,
        AssessmentErrorCodes.EMPLOYEE_NOT_FOUND
      );
    }

    // 检查是否已存在同一周期的评估
    const existingAssessment = await prisma.performanceAssessment.findFirst({
      where: {
        employeeId: input.employeeId,
        assessmentPeriod: input.assessmentPeriod
      }
    });

    // 计算综合评分
    const overallScore = calculateOverallScore({
      professionalSkills: input.professionalSkills,
      workAttitude: input.workAttitude,
      teamwork: input.teamwork,
      communication: input.communication,
      problemSolving: input.problemSolving
    });

    const assessmentData = {
      employeeId: input.employeeId,
      assessmentPeriod: input.assessmentPeriod,
      professionalSkills: input.professionalSkills,
      workAttitude: input.workAttitude,
      teamwork: input.teamwork,
      communication: input.communication,
      problemSolving: input.problemSolving,
      overallScore,
      assessedBy,
      comments: input.comments
    };

    let assessment;
    if (existingAssessment) {
      // 更新现有评估
      assessment = await prisma.performanceAssessment.update({
        where: { id: existingAssessment.id },
        data: assessmentData
      });
    } else {
      // 创建新评估
      assessment = await prisma.performanceAssessment.create({
        data: assessmentData
      });
    }

    return this.mapAssessmentToInterface(assessment);
  }

  /**
   * 检查能力预警
   * 需求 7.5: 能力预警机制
   */
  async checkCapabilityAlert(projectId: string): Promise<LossAlert[]> {
    const prisma = await getPrisma();
    const alerts: LossAlert[] = [];

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new PerformanceAssessmentError(
        `项目不存在: ${projectId}`,
        AssessmentErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.performanceAssessment) {
      return alerts;
    }

    // 获取最近两个评估周期的团队评估
    const recentPeriods = await prisma.performanceAssessment.findMany({
      where: {
        employee: { projectId }
      },
      select: { assessmentPeriod: true },
      distinct: ['assessmentPeriod'],
      orderBy: { assessedAt: 'desc' },
      take: 2
    });

    if (recentPeriods.length < 2) {
      return alerts;
    }

    const [currentPeriod, previousPeriod] = recentPeriods;

    // 获取两个周期的团队评估
    const currentAssessment = await this.getTeamAssessment(projectId, currentPeriod.assessmentPeriod);
    const previousAssessment = await this.getTeamAssessment(projectId, previousPeriod.assessmentPeriod);

    // 检查团队平均分是否下降
    const scoreDiff = previousAssessment.averageScores.overall - currentAssessment.averageScores.overall;
    
    if (scoreDiff >= CAPABILITY_ALERT_THRESHOLDS.TEAM_SCORE_DECLINE) {
      alerts.push({
        id: `capability-alert-${projectId}-${Date.now()}`,
        projectId,
        alertType: AlertType.CAPABILITY_WARNING,
        severity: scoreDiff >= 2 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        title: '团队能力评分下降预警',
        message: `团队平均评分从 ${previousAssessment.averageScores.overall.toFixed(1)} 下降到 ${currentAssessment.averageScores.overall.toFixed(1)}，下降幅度 ${scoreDiff.toFixed(1)} 分`,
        thresholdValue: CAPABILITY_ALERT_THRESHOLDS.TEAM_SCORE_DECLINE,
        actualValue: scoreDiff,
        isRead: false,
        isResolved: false,
        createdAt: new Date()
      });
    }

    // 检查需要改进的员工
    if (currentAssessment.needsImprovement.length > 0) {
      alerts.push({
        id: `capability-alert-individual-${projectId}-${Date.now()}`,
        projectId,
        alertType: AlertType.CAPABILITY_WARNING,
        severity: AlertSeverity.LOW,
        title: '员工能力需要关注',
        message: `${currentAssessment.needsImprovement.length} 名员工评分低于 ${CAPABILITY_ALERT_THRESHOLDS.INDIVIDUAL_LOW_SCORE} 分，需要关注和培训`,
        thresholdValue: CAPABILITY_ALERT_THRESHOLDS.INDIVIDUAL_LOW_SCORE,
        actualValue: currentAssessment.needsImprovement[0]?.score,
        isRead: false,
        isResolved: false,
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * 获取员工所有评估记录
   */
  async getEmployeeAssessments(
    employeeId: string,
    options?: {
      page?: number;
      pageSize?: number;
    }
  ): Promise<{ assessments: PerformanceAssessment[]; total: number }> {
    const prisma = await getPrisma();

    if (!prisma.performanceAssessment) {
      return { assessments: [], total: 0 };
    }

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [assessments, total] = await Promise.all([
      prisma.performanceAssessment.findMany({
        where: { employeeId },
        orderBy: { assessedAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.performanceAssessment.count({
        where: { employeeId }
      })
    ]);

    return {
      assessments: assessments.map((a: any) => this.mapAssessmentToInterface(a)),
      total
    };
  }

  /**
   * 删除评估记录
   */
  async deleteAssessment(assessmentId: string): Promise<void> {
    const prisma = await getPrisma();

    if (!prisma.performanceAssessment) {
      throw new PerformanceAssessmentError(
        '评估表不存在',
        AssessmentErrorCodes.INVALID_INPUT
      );
    }

    const assessment = await prisma.performanceAssessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      throw new PerformanceAssessmentError(
        `评估记录不存在: ${assessmentId}`,
        AssessmentErrorCodes.ASSESSMENT_NOT_FOUND
      );
    }

    await prisma.performanceAssessment.delete({
      where: { id: assessmentId }
    });
  }

  // =====================================================
  // 私有辅助方法
  // =====================================================

  /**
   * 映射数据库记录到接口类型
   */
  private mapAssessmentToInterface(assessment: any): PerformanceAssessment {
    return {
      id: assessment.id,
      employeeId: assessment.employeeId,
      assessmentPeriod: assessment.assessmentPeriod,
      professionalSkills: Number(assessment.professionalSkills),
      workAttitude: Number(assessment.workAttitude),
      teamwork: Number(assessment.teamwork),
      communication: Number(assessment.communication),
      problemSolving: Number(assessment.problemSolving),
      overallScore: Number(assessment.overallScore),
      assessedBy: assessment.assessedBy,
      assessedAt: assessment.assessedAt,
      comments: assessment.comments
    };
  }

  /**
   * 创建空的团队评估
   */
  private createEmptyTeamAssessment(projectId: string, assessmentPeriod: string): TeamAssessment {
    return {
      projectId,
      assessmentPeriod,
      averageScores: {
        professionalSkills: 0,
        workAttitude: 0,
        teamwork: 0,
        communication: 0,
        problemSolving: 0,
        overall: 0
      },
      employeeCount: 0,
      topPerformers: [],
      needsImprovement: []
    };
  }

  /**
   * 创建空的评估趋势
   */
  private createEmptyAssessmentTrend(employeeId: string): AssessmentTrend {
    return {
      employeeId,
      periods: [],
      scores: {
        professionalSkills: [],
        workAttitude: [],
        teamwork: [],
        communication: [],
        problemSolving: [],
        overall: []
      }
    };
  }
}

// 导出单例实例
export const performanceAssessmentManager = new PerformanceAssessmentManager();
