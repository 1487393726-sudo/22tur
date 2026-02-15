import { NextRequest, NextResponse } from 'next/server'
import { HexHubProjectService } from '@/lib/hexhub/project-service'
import { HexHubAuditService } from '@/lib/hexhub/audit-service'

/**
 * GET /api/hexhub/projects/[id] - 获取项目详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await HexHubProjectService.getProjectById(params.id)

    if (!project) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error: any) {
    console.error('获取项目失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取项目失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hexhub/projects/[id] - 更新项目
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, status, visibility } = body

    const project = await HexHubProjectService.updateProject(params.id, {
      name,
      description,
      status,
      visibility,
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }

    // 记录审计日志
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    await HexHubAuditService.logAction({
      action: 'UPDATE',
      resource: 'PROJECT',
      resourceId: params.id,
      details: JSON.stringify(body),
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error: any) {
    console.error('更新项目失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新项目失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hexhub/projects/[id] - 删除项目
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await HexHubProjectService.deleteProject(params.id)

    if (!project) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }

    // 记录审计日志
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    await HexHubAuditService.logAction({
      action: 'DELETE',
      resource: 'PROJECT',
      resourceId: params.id,
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      message: '项目已删除',
    })
  } catch (error: any) {
    console.error('删除项目失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '删除项目失败' },
      { status: 500 }
    )
  }
}
