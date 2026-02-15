/**
 * 项目仓库
 * Project Repository
 * 
 * 处理投资项目相关的数据库操作
 */

import { BaseRepository, RepositoryError } from './base-repository';
import {
  ProjectPhase,
  ProjectType,
  IndustryType,
} from '@/types/investor-operations-monitoring';

export interface ProjectDetailResult {
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
}

export interface ProjectListItem {
  id: string;
  name: string;
  type: ProjectType;
  industry: IndustryType;
  currentPhase: ProjectPhase;
  investedAmount: number;
  shareholdingRatio: number;
}

export class ProjectRepository extends BaseRepository {
  /**
   * 根据 ID 获取项目基本信息
   */
  async getProjectById(projectId: string): Promise<ProjectDetailResult | null> {
    return this.executeQuery(async () => {
      const project = await this.prisma.investmentProject.findUnique({
        where: { id: projectId },
        include: {
          phaseRecords: {
            orderBy: { startDate: 'desc' },
            take: 1,
          },
        },
      });

      if (!project) return null;

      // 计算阶段进度
      const phaseProgress = this.calculatePhaseProgress(
        project.phaseRecords[0]?.phase as ProjectPhase || ProjectPhase.DESIGN
      );

      return {
        id: project.id,
        name: project.title,
        nameEn: project.titleEn || project.title,
        type: project.projectType as ProjectType,
        industry: project.industry as IndustryType,
        address: project.location,
        platform: project.platform,
        currentPhase: (project.phaseRecords[0]?.phase as ProjectPhase) || ProjectPhase.DESIGN,
        phaseProgress,
        investedAmount: project.targetAmount,
        shareholdingRatio: 0, // 需要从投资者关系中计算
        startDate: project.createdAt,
        operatingStartDate: project.operatingStartDate,
      };
    }, `Failed to get project ${projectId}`);
  }

  /**
   * 获取投资者可访问的项目列表
   */
  async getProjectsByInvestor(investorId: string): Promise<ProjectListItem[]> {
    return this.executeQuery(async () => {
      const accessRecords = await this.prisma.investorProjectAccess.findMany({
        where: {
          investorId,
          isActive: true,
        },
        include: {
          project: {
            include: {
              phaseRecords: {
                orderBy: { startDate: 'desc' },
                take: 1,
              },
              investments: {
                where: { userId: investorId },
              },
            },
          },
        },
      });

      return accessRecords.map(record => ({
        id: record.project.id,
        name: record.project.title,
        type: record.project.projectType as ProjectType,
        industry: record.project.industry as IndustryType,
        currentPhase: (record.project.phaseRecords[0]?.phase as ProjectPhase) || ProjectPhase.DESIGN,
        investedAmount: record.project.investments.reduce((sum, inv) => sum + inv.amount, 0),
        shareholdingRatio: record.shareholdingRatio,
      }));
    }, `Failed to get projects for investor ${investorId}`);
  }

  /**
   * 验证投资者对项目的访问权限
   */
  async verifyInvestorAccess(investorId: string, projectId: string): Promise<boolean> {
    return this.executeQuery(async () => {
      const access = await this.prisma.investorProjectAccess.findFirst({
        where: {
          investorId,
          projectId,
          isActive: true,
        },
      });
      return !!access;
    }, `Failed to verify access for investor ${investorId} to project ${projectId}`);
  }

  /**
   * 获取投资者在项目中的持股比例
   */
  async getShareholdingRatio(investorId: string, projectId: string): Promise<number> {
    return this.executeQuery(async () => {
      const access = await this.prisma.investorProjectAccess.findFirst({
        where: {
          investorId,
          projectId,
          isActive: true,
        },
      });
      return access?.shareholdingRatio || 0;
    }, `Failed to get shareholding ratio`);
  }

  /**
   * 获取项目生命周期记录
   */
  async getProjectLifecycle(projectId: string) {
    return this.executeQuery(async () => {
      const phaseRecords = await this.prisma.projectPhaseRecord.findMany({
        where: { projectId },
        orderBy: { startDate: 'asc' },
        include: {
          milestones: true,
          delayRecords: true,
        },
      });

      return phaseRecords.map(record => ({
        id: record.id,
        phase: record.phase as ProjectPhase,
        startDate: record.startDate,
        endDate: record.endDate,
        expectedEndDate: record.expectedEndDate,
        progress: record.progress,
        milestones: record.milestones.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          targetDate: m.targetDate,
          completedDate: m.completedDate,
          status: m.status,
        })),
        delays: record.delayRecords.map(d => ({
          id: d.id,
          reason: d.reason,
          delayDays: d.delayDays,
          recordedAt: d.recordedAt,
        })),
      }));
    }, `Failed to get lifecycle for project ${projectId}`);
  }

  /**
   * 计算阶段进度百分比
   */
  private calculatePhaseProgress(phase: ProjectPhase): number {
    const progressMap: Record<ProjectPhase, number> = {
      [ProjectPhase.DESIGN]: 25,
      [ProjectPhase.RENOVATION]: 50,
      [ProjectPhase.PRE_OPENING]: 75,
      [ProjectPhase.OPERATING]: 100,
    };
    return progressMap[phase] || 0;
  }
}

// 导出单例实例
export const projectRepository = new ProjectRepository();
