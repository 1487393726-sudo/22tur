import { NextRequest, NextResponse } from 'next/server'
import { HexHubUserService } from '@/lib/hexhub/user-service'
import { HexHubAuditService } from '@/lib/hexhub/audit-service'

/**
 * GET /api/hexhub/users/[id] - 获取用户详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await HexHubUserService.getUserById(params.id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('获取用户失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取用户失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hexhub/users/[id] - 更新用户
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { firstName, lastName, avatar, status } = body

    const user = await HexHubUserService.updateUser(params.id, {
      firstName,
      lastName,
      avatar,
      status,
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 记录审计日志
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    await HexHubAuditService.logAction({
      action: 'UPDATE',
      resource: 'USER',
      resourceId: params.id,
      details: JSON.stringify(body),
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('更新用户失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新用户失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hexhub/users/[id] - 删除用户
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await HexHubUserService.deleteUser(params.id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 记录审计日志
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    await HexHubAuditService.logAction({
      action: 'DELETE',
      resource: 'USER',
      resourceId: params.id,
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      message: '用户已删除',
    })
  } catch (error: any) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '删除用户失败' },
      { status: 500 }
    )
  }
}
