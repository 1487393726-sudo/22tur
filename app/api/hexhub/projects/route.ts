import { NextRequest, NextResponse } from 'next/server'
import { HexHubProjectService } from '@/lib/hexhub/project-service'
import { HexHubAuditService } from '@/lib/hexhub/audit-service'

/**
 * GET /api/hexhub/projects - 列出项目
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '10')
    const status = searchParams.get('status')
    const visibility = searchParams.get('visibility')
    const userId = searchParams.get('userId')

    let projects

    if (userId) {
      // 获取用户的项目
      projects = await HexHubProjectService.listUserProjects(userId, {
        skip,
        take,
        status: status || undefined,
      })
    } else {
      // 获取所有项目
      projects = await HexHubProjectService.listProjects({
        skip,
        take,
        status: status || undefined,
        visibility: visibility || undefined,
      })
    }

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    })
  } catch (error) {
    console.error('获取项目列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取项目列表失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hexhub/projects - 创建项目
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, creatorId, visibility } = body

    // 验证必填字段
    if (!name || !creatorId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 创建项目
    const project = await HexHubProjectService.createProject({
      name,
      description,
      creatorId,
      visibility,
    })

    // 记录审计日志
    await HexHubAuditService.logAction({
      userId: creatorId,
      action: 'CREATE',
      resource: 'PROJECT',
      resourceId: project.id,
      details: JSON.stringify({ name, visibility }),
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('创建项目失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '创建项目失败' },
      { status: 500 }
    )
  }
}
