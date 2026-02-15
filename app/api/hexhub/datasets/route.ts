import { NextRequest, NextResponse } from 'next/server'
import { HexHubDatasetService } from '@/lib/hexhub/dataset-service'
import { HexHubAuditService } from '@/lib/hexhub/audit-service'

/**
 * GET /api/hexhub/datasets - 列出数据集
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '10')
    const dataType = searchParams.get('dataType')
    const status = searchParams.get('status')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: '缺少 projectId 参数' },
        { status: 400 }
      )
    }

    const datasets = await HexHubDatasetService.listProjectDatasets(
      projectId,
      {
        skip,
        take,
        dataType: dataType || undefined,
        status: status || undefined,
      }
    )

    return NextResponse.json({
      success: true,
      data: datasets,
      count: datasets.length,
    })
  } catch (error) {
    console.error('获取数据集列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取数据集列表失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hexhub/datasets - 创建数据集
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, name, description, dataType, format, ownerId } = body

    // 验证必填字段
    if (!projectId || !name || !dataType || !ownerId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 创建数据集
    const dataset = await HexHubDatasetService.createDataset({
      projectId,
      name,
      description,
      dataType,
      format,
      ownerId,
    })

    // 记录审计日志
    await HexHubAuditService.logAction({
      userId: ownerId,
      action: 'CREATE',
      resource: 'DATASET',
      resourceId: dataset.id,
      details: JSON.stringify({ name, dataType, projectId }),
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: dataset,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('创建数据集失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '创建数据集失败' },
      { status: 500 }
    )
  }
}
