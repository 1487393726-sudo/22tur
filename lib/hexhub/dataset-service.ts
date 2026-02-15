import hexhubPrisma from './prisma'

export class HexHubDatasetService {
  /**
   * 创建数据集
   */
  static async createDataset(data: {
    projectId: string
    name: string
    description?: string
    dataType: string
    format?: string
    ownerId: string
  }) {
    return hexhubPrisma.hexHubDataset.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        dataType: data.dataType,
        format: data.format || 'JSON',
        ownerId: data.ownerId,
      },
    })
  }

  /**
   * 获取数据集
   */
  static async getDataset(id: string) {
    return hexhubPrisma.hexHubDataset.findUnique({
      where: { id },
      include: {
        project: true,
        owner: true,
        records: {
          take: 100,
        },
      },
    })
  }

  /**
   * 列出项目的数据集
   */
  static async listProjectDatasets(
    projectId: string,
    options?: {
      skip?: number
      take?: number
      dataType?: string
      status?: string
    }
  ) {
    return hexhubPrisma.hexHubDataset.findMany({
      where: {
        projectId,
        dataType: options?.dataType,
        status: options?.status,
      },
      skip: options?.skip,
      take: options?.take,
      include: {
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 更新数据集
   */
  static async updateDataset(
    id: string,
    data: {
      name?: string
      description?: string
      status?: string
      size?: number
      recordCount?: number
    }
  ) {
    return hexhubPrisma.hexHubDataset.update({
      where: { id },
      data,
    })
  }

  /**
   * 删除数据集
   */
  static async deleteDataset(id: string) {
    return hexhubPrisma.hexHubDataset.delete({
      where: { id },
    })
  }

  /**
   * 添加数据记录
   */
  static async addDataRecord(
    datasetId: string,
    data: {
      data: string
      metadata?: string
      hash?: string
    }
  ) {
    return hexhubPrisma.hexHubDataRecord.create({
      data: {
        datasetId,
        data: data.data,
        metadata: data.metadata,
        hash: data.hash,
      },
    })
  }

  /**
   * 批量添加数据记录
   */
  static async addDataRecords(
    datasetId: string,
    records: Array<{
      data: string
      metadata?: string
      hash?: string
    }>
  ) {
    return hexhubPrisma.hexHubDataRecord.createMany({
      data: records.map((record) => ({
        datasetId,
        data: record.data,
        metadata: record.metadata,
        hash: record.hash,
      })),
    })
  }

  /**
   * 获取数据记录
   */
  static async getDataRecords(
    datasetId: string,
    options?: {
      skip?: number
      take?: number
    }
  ) {
    return hexhubPrisma.hexHubDataRecord.findMany({
      where: { datasetId },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 删除数据记录
   */
  static async deleteDataRecord(id: string) {
    return hexhubPrisma.hexHubDataRecord.delete({
      where: { id },
    })
  }

  /**
   * 清空数据集
   */
  static async clearDataset(datasetId: string) {
    return hexhubPrisma.hexHubDataRecord.deleteMany({
      where: { datasetId },
    })
  }
}
