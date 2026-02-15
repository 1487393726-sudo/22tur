import hexhubPrisma from './prisma'

export class HexHubProjectService {
  /**
   * 创建项目
   */
  static async createProject(data: {
    name: string
    description?: string
    creatorId: string
    visibility?: string
  }) {
    return hexhubPrisma.hexHubProject.create({
      data: {
        name: data.name,
        description: data.description,
        creatorId: data.creatorId,
        visibility: data.visibility || 'PRIVATE',
      },
    })
  }

  /**
   * 获取项目
   */
  static async getProject(id: string) {
    return hexhubPrisma.hexHubProject.findUnique({
      where: { id },
      include: {
        creator: true,
        datasets: true,
        members: true,
        analytics: true,
      },
    })
  }

  /**
   * 列出用户的项目
   */
  static async listUserProjects(
    userId: string,
    options?: {
      skip?: number
      take?: number
      status?: string
    }
  ) {
    return hexhubPrisma.hexHubProject.findMany({
      where: {
        creatorId: userId,
        status: options?.status,
      },
      skip: options?.skip,
      take: options?.take,
      include: {
        creator: true,
        datasets: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 列出所有项目
   */
  static async listProjects(options?: {
    skip?: number
    take?: number
    status?: string
    visibility?: string
  }) {
    return hexhubPrisma.hexHubProject.findMany({
      where: {
        status: options?.status,
        visibility: options?.visibility,
      },
      skip: options?.skip,
      take: options?.take,
      include: {
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 更新项目
   */
  static async updateProject(
    id: string,
    data: {
      name?: string
      description?: string
      status?: string
      visibility?: string
    }
  ) {
    return hexhubPrisma.hexHubProject.update({
      where: { id },
      data,
    })
  }

  /**
   * 删除项目
   */
  static async deleteProject(id: string) {
    return hexhubPrisma.hexHubProject.delete({
      where: { id },
    })
  }

  /**
   * 添加项目成员
   */
  static async addProjectMember(
    projectId: string,
    userId: string,
    role: string = 'VIEWER'
  ) {
    return hexhubPrisma.hexHubProjectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
    })
  }

  /**
   * 移除项目成员
   */
  static async removeProjectMember(projectId: string, userId: string) {
    return hexhubPrisma.hexHubProjectMember.deleteMany({
      where: {
        projectId,
        userId,
      },
    })
  }

  /**
   * 获取项目成员
   */
  static async getProjectMembers(projectId: string) {
    return hexhubPrisma.hexHubProjectMember.findMany({
      where: { projectId },
    })
  }
}
