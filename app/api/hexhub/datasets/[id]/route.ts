import { NextRequest, NextResponse } from 'next/server'
import { HexHubDatasetService } from '@/lib/hexhub/dataset-service'
import { HexHubAuditService } from '@/lib/hexhub/audit-service'

/**
 * GET /api/hexhub/datasets/[id] - 获取数据集详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await HexHubDatasetService.getDatasetById(params.id)

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: '数据集不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dataset,
    })
  } catch (error: any) {
    console.error('获取数据集失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取数据集失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hexhub/datasets/[id] - 更新数据集
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, status, size, recordCount } = body

    const dataset = await HexHubDatasetService.updateDataset(params.id, {
      name,
      description,
      status,
      size,
      recordCount,
    })

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: '数据集不存在' },
        { status: 404 }
      )
    }

    // 记录审计日志
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    await HexHubAuditService.logAction({
      action: 'UPDATE',
      resource: 'DATASET',
      resourceId: params.id,
      details: JSON.stringify(body),
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: dataset,
    })
  } catch (error: any) {
    console.error('更新数据集失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新数据集失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hexhub/datasets/[id] - 删除数据集
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await HexHubDatasetService.deleteDataset(params.id)

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: '数据集不存在' },
        { status: 404 }
      )
    }

    // 记录审计日志
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    await HexHubAuditService.logAction({
      action: 'DELETE',
      resource: 'DATASET',
      resourceId: params.id,
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      message: '数据集已删除',
    })
  } catch (error: any) {
    console.error('删除数据集失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '删除数据集失败' },
      { status: 500 }
    )
  }
}
