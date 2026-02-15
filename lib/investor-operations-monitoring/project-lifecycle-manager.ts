/**
 * 项目生命周期管理服务
 * Project Lifecycle Manager Service
 * 
 * 实现项目阶段查询、更新、时间线获取、里程碑管理和延期记录功能
 */

import {
  ProjectPhase,
  ProjectPhaseRecord,
  Milestone,
  DelayRecord,
  ProjectTimeline,
  MilestoneStatus,
  isValidProjectPhase,
  isValidProgress,
  CreateMilestoneInput,
  UpdatePhaseInput,
  DelayRecordInput
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
 * 项目生命周期管理错误
 */
export class ProjectLifecycleError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProjectLifecycleError';
  }
}

/**
 * 错误代码
 */
export const LifecycleErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PHASE_RECORD_NOT_FOUND: 'PHASE_RECORD_NOT_FOUND',
  MILESTONE_NOT_FOUND: 'MILESTONE_NOT_FOUND',
  INVALID_PHASE: 'INVALID_PHASE',
  INVALID_PROGRESS: 'INVALID_PROGRESS',
  INVALID_PHASE_TRANSITION: 'INVALID_PHASE_TRANSITION',
  PHASE_ALREADY_EXISTS: 'PHASE_ALREADY_EXISTS'
} as const;

/**
 * 阶段顺序映射
 */
const PHASE_ORDER: Record<ProjectPhase, number> = {
  [ProjectPhase.DESIGN]: 0,
  [ProjectPhase.RENOVATION]: 1,
  [ProjectPhase.PRE_OPENING]: 2,
  [ProjectPhase.OPERATING]: 3
};

/**
 * 项目生命周期管理器
 */
export class ProjectLifecycleManager {
  /**
   * 获取项目当前阶段
   */
  async getCurrentPhase(projectId: string): Promise<ProjectPhase> {
    const prisma = await getPrisma();
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProjectLifecycleError(
        `项目不存在: ${projectId}`,
        LifecycleErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 使用默认值，因为新字段可能还未添加到数据库
    return (project.currentPhase || ProjectPhase.DESIGN) as ProjectPhase;
  }

  /**
   * 更新项目阶段
   */
  async updatePhase(input: UpdatePhaseInput, userId: string): Promise<void> {
    const { projectId, phase, reason } = input;
    const prisma = await getPrisma();

    if (!isValidProjectPhase(phase)) {
      throw new ProjectLifecycleError(
        `无效的项目阶段: ${phase}`,
        LifecycleErrorCodes.INVALID_PHASE
      );
    }

    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProjectLifecycleError(
        `项目不存在: ${projectId}`,
        LifecycleErrorCodes.PROJECT_NOT_FOUND
      );
    }

    const currentPhase = (project.currentPhase || ProjectPhase.DESIGN) as ProjectPhase;
    
    // 验证阶段转换是否有效（只能向前推进或保持不变）
    if (PHASE_ORDER[phase] < PHASE_ORDER[currentPhase]) {
      throw new ProjectLifecycleError(
        `无效的阶段转换: 不能从 ${currentPhase} 回退到 ${phase}`,
        LifecycleErrorCodes.INVALID_PHASE_TRANSITION
      );
    }

    // 更新项目当前阶段
    await prisma.investmentProject.update({
      where: { id: projectId },
      data: { 
        currentPhase: phase,
        phaseProgress: phase === currentPhase ? undefined : 0
      }
    });

    // 如果是新阶段，创建阶段记录
    if (phase !== currentPhase) {
      // 完成当前阶段记录
      if (prisma.projectPhaseRecord) {
        await prisma.projectPhaseRecord.updateMany({
          where: {
            projectId,
            phase: currentPhase,
            actualEndDate: null
          },
          data: {
            actualEndDate: new Date(),
            progress: 100
          }
        });

        // 创建新阶段记录
        const now = new Date();
        const expectedEndDate = new Date();
        expectedEndDate.setMonth(expectedEndDate.getMonth() + 3); // 默认3个月

        await prisma.projectPhaseRecord.create({
          data: {
            projectId,
            phase,
            startDate: now,
            expectedEndDate,
            progress: 0,
            notes: reason
          }
        });
      }
    }
  }

  /**
   * 获取项目时间线
   */
  async getTimeline(projectId: string): Promise<ProjectTimeline> {
    const prisma = await getPrisma();
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProjectLifecycleError(
        `项目不存在: ${projectId}`,
        LifecycleErrorCodes.PROJECT_NOT_FOUND
      );
    }

    let phases: ProjectPhaseRecord[] = [];

    // 尝试获取阶段记录（如果表存在）
    if (prisma.projectPhaseRecord) {
      const phaseRecords = await prisma.projectPhaseRecord.findMany({
        where: { projectId },
        include: {
          milestones: true,
          delayRecords: true
        },
        orderBy: { startDate: 'asc' }
      });

      phases = phaseRecords.map((record: {
        id: string;
        projectId: string;
        phase: string;
        startDate: Date;
        expectedEndDate: Date;
        actualEndDate: Date | null;
        progress: number;
        notes: string | null;
        milestones: Array<{
          id: string;
          phaseRecordId: string;
          name: string;
          description: string | null;
          expectedDate: Date;
          completedDate: Date | null;
          status: string;
          createdAt: Date;
        }>;
        delayRecords: Array<{
          id: string;
          phaseRecordId: string;
          delayDays: number;
          reason: string;
          newExpectedDate: Date;
          recordedBy: string;
          recordedAt: Date;
        }>;
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        id: record.id,
        projectId: record.projectId,
        phase: record.phase as ProjectPhase,
        startDate: record.startDate,
        expectedEndDate: record.expectedEndDate,
        actualEndDate: record.actualEndDate || undefined,
        progress: record.progress,
        notes: record.notes || undefined,
        milestones: record.milestones.map((m: {
          id: string;
          phaseRecordId: string;
          name: string;
          description: string | null;
          expectedDate: Date;
          completedDate: Date | null;
          status: string;
          createdAt: Date;
        }) => ({
          id: m.id,
          phaseRecordId: m.phaseRecordId,
          name: m.name,
          description: m.description || undefined,
          expectedDate: m.expectedDate,
          completedDate: m.completedDate || undefined,
          status: m.status as MilestoneStatus,
          createdAt: m.createdAt
        })),
        delays: record.delayRecords.map((d: {
          id: string;
          phaseRecordId: string;
          delayDays: number;
          reason: string;
          newExpectedDate: Date;
          recordedBy: string;
          recordedAt: Date;
        }) => ({
          id: d.id,
          phaseRecordId: d.phaseRecordId,
          delayDays: d.delayDays,
          reason: d.reason,
          newExpectedDate: d.newExpectedDate,
          recordedBy: d.recordedBy,
          recordedAt: d.recordedAt
        })),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }));
    }

    const currentPhase = (project.currentPhase || ProjectPhase.DESIGN) as ProjectPhase;
    const overallProgress = this.calculateOverallProgress(phases, currentPhase);
    const estimatedCompletionDate = this.estimateCompletionDate(phases);

    return {
      projectId,
      phases,
      currentPhase,
      overallProgress,
      estimatedCompletionDate
    };
  }

  /**
   * 创建里程碑
   */
  async createMilestone(input: CreateMilestoneInput): Promise<Milestone> {
    const { phaseRecordId, name, description, expectedDate } = input;
    const prisma = await getPrisma();

    if (!prisma.projectPhaseRecord) {
      throw new ProjectLifecycleError(
        '阶段记录功能尚未启用',
        LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND
      );
    }

    const phaseRecord = await prisma.projectPhaseRecord.findUnique({
      where: { id: phaseRecordId }
    });

    if (!phaseRecord) {
      throw new ProjectLifecycleError(
        `阶段记录不存在: ${phaseRecordId}`,
        LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND
      );
    }

    const milestone = await prisma.projectMilestone.create({
      data: {
        phaseRecordId,
        name,
        description,
        expectedDate,
        status: MilestoneStatus.PENDING
      }
    });

    return {
      id: milestone.id,
      phaseRecordId: milestone.phaseRecordId,
      name: milestone.name,
      description: milestone.description || undefined,
      expectedDate: milestone.expectedDate,
      completedDate: milestone.completedDate || undefined,
      status: milestone.status as MilestoneStatus,
      createdAt: milestone.createdAt
    };
  }

  /**
   * 完成里程碑
   */
  async completeMilestone(milestoneId: string): Promise<void> {
    const prisma = await getPrisma();

    if (!prisma.projectMilestone) {
      throw new ProjectLifecycleError(
        '里程碑功能尚未启用',
        LifecycleErrorCodes.MILESTONE_NOT_FOUND
      );
    }

    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId }
    });

    if (!milestone) {
      throw new ProjectLifecycleError(
        `里程碑不存在: ${milestoneId}`,
        LifecycleErrorCodes.MILESTONE_NOT_FOUND
      );
    }

    await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        status: MilestoneStatus.COMPLETED,
        completedDate: new Date()
      }
    });

    // 更新阶段进度
    await this.updatePhaseProgress(milestone.phaseRecordId);
  }

  /**
   * 记录阶段延期
   */
  async recordDelay(input: DelayRecordInput, userId: string): Promise<DelayRecord> {
    const { phaseRecordId, delayDays, reason, newExpectedDate } = input;
    const prisma = await getPrisma();

    if (!prisma.projectPhaseRecord) {
      throw new ProjectLifecycleError(
        '阶段记录功能尚未启用',
        LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND
      );
    }

    const phaseRecord = await prisma.projectPhaseRecord.findUnique({
      where: { id: phaseRecordId }
    });

    if (!phaseRecord) {
      throw new ProjectLifecycleError(
        `阶段记录不存在: ${phaseRecordId}`,
        LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND
      );
    }

    // 创建延期记录
    const delay = await prisma.phaseDelayRecord.create({
      data: {
        phaseRecordId,
        delayDays,
        reason,
        newExpectedDate,
        recordedBy: userId
      }
    });

    // 更新阶段预期结束日期
    await prisma.projectPhaseRecord.update({
      where: { id: phaseRecordId },
      data: { expectedEndDate: newExpectedDate }
    });

    // 标记相关里程碑为延期
    if (prisma.projectMilestone) {
      await prisma.projectMilestone.updateMany({
        where: {
          phaseRecordId,
          status: MilestoneStatus.PENDING,
          expectedDate: { lt: new Date() }
        },
        data: { status: MilestoneStatus.DELAYED }
      });
    }

    return {
      id: delay.id,
      phaseRecordId: delay.phaseRecordId,
      delayDays: delay.delayDays,
      reason: delay.reason,
      newExpectedDate: delay.newExpectedDate,
      recordedBy: delay.recordedBy,
      recordedAt: delay.recordedAt
    };
  }

  /**
   * 更新阶段进度
   */
  async updateProgress(phaseRecordId: string, progress: number): Promise<void> {
    const prisma = await getPrisma();

    if (!isValidProgress(progress)) {
      throw new ProjectLifecycleError(
        `无效的进度值: ${progress}，必须在 0-100 之间`,
        LifecycleErrorCodes.INVALID_PROGRESS
      );
    }

    if (!prisma.projectPhaseRecord) {
      throw new ProjectLifecycleError(
        '阶段记录功能尚未启用',
        LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND
      );
    }

    const phaseRecord = await prisma.projectPhaseRecord.findUnique({
      where: { id: phaseRecordId },
      select: { projectId: true }
    });

    if (!phaseRecord) {
      throw new ProjectLifecycleError(
        `阶段记录不存在: ${phaseRecordId}`,
        LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND
      );
    }

    await prisma.projectPhaseRecord.update({
      where: { id: phaseRecordId },
      data: { progress }
    });

    // 同步更新项目的阶段进度
    await prisma.investmentProject.update({
      where: { id: phaseRecord.projectId },
      data: { phaseProgress: progress }
    });
  }

  /**
   * 初始化项目生命周期
   */
  async initializeLifecycle(projectId: string): Promise<ProjectPhaseRecord> {
    const prisma = await getPrisma();

    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProjectLifecycleError(
        `项目不存在: ${projectId}`,
        LifecycleErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.projectPhaseRecord) {
      throw new ProjectLifecycleError(
        '阶段记录功能尚未启用',
        LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND
      );
    }

    // 检查是否已有阶段记录
    const existingRecord = await prisma.projectPhaseRecord.findFirst({
      where: { projectId }
    });

    if (existingRecord) {
      throw new ProjectLifecycleError(
        `项目已有生命周期记录`,
        LifecycleErrorCodes.PHASE_ALREADY_EXISTS
      );
    }

    const now = new Date();
    const expectedEndDate = new Date();
    expectedEndDate.setMonth(expectedEndDate.getMonth() + 3);

    const record = await prisma.projectPhaseRecord.create({
      data: {
        projectId,
        phase: ProjectPhase.DESIGN,
        startDate: now,
        expectedEndDate,
        progress: 0
      }
    });

    return {
      id: record.id,
      projectId: record.projectId,
      phase: record.phase as ProjectPhase,
      startDate: record.startDate,
      expectedEndDate: record.expectedEndDate,
      actualEndDate: record.actualEndDate || undefined,
      progress: record.progress,
      notes: record.notes || undefined,
      milestones: [],
      delays: [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  /**
   * 计算整体进度
   */
  private calculateOverallProgress(phases: ProjectPhaseRecord[], currentPhase: ProjectPhase): number {
    const totalPhases = Object.keys(ProjectPhase).length;
    const currentPhaseIndex = PHASE_ORDER[currentPhase];
    
    // 已完成阶段的权重
    const completedPhasesProgress = (currentPhaseIndex / totalPhases) * 100;
    
    // 当前阶段的进度贡献
    const currentPhaseRecord = phases.find(p => p.phase === currentPhase);
    const currentPhaseProgress = currentPhaseRecord?.progress || 0;
    const currentPhaseContribution = (currentPhaseProgress / totalPhases);
    
    return Math.round(completedPhasesProgress + currentPhaseContribution);
  }

  /**
   * 估算完成日期
   */
  private estimateCompletionDate(phases: ProjectPhaseRecord[]): Date | undefined {
    // 找到最后一个阶段的预期结束日期
    const operatingPhase = phases.find(p => p.phase === ProjectPhase.OPERATING);
    if (operatingPhase) {
      return operatingPhase.expectedEndDate;
    }

    // 如果没有运营阶段，基于当前阶段估算
    const lastPhase = phases[phases.length - 1];
    if (!lastPhase) return undefined;

    const remainingPhases = Object.keys(ProjectPhase).length - PHASE_ORDER[lastPhase.phase] - 1;
    const estimatedDate = new Date(lastPhase.expectedEndDate);
    estimatedDate.setMonth(estimatedDate.getMonth() + remainingPhases * 3); // 每阶段3个月

    return estimatedDate;
  }

  /**
   * 根据里程碑完成情况更新阶段进度
   */
  private async updatePhaseProgress(phaseRecordId: string): Promise<void> {
    const prisma = await getPrisma();

    if (!prisma.projectMilestone) return;

    const milestones = await prisma.projectMilestone.findMany({
      where: { phaseRecordId }
    });

    if (milestones.length === 0) return;

    const completedCount = milestones.filter((m: { status: string }) => m.status === MilestoneStatus.COMPLETED).length;
    const progress = Math.round((completedCount / milestones.length) * 100);

    await this.updateProgress(phaseRecordId, progress);
  }
}

// 导出单例实例
export const projectLifecycleManager = new ProjectLifecycleManager();
