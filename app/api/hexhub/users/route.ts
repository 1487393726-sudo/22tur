import { NextRequest, NextResponse } from 'next/server'
import { HexHubUserService } from '@/lib/hexhub/user-service'
import { HexHubAuditService } from '@/lib/hexhub/audit-service'

/**
 * GET /api/hexhub/users - 列出用户
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '10')
    const status = searchParams.get('status')
    const role = searchParams.get('role')

    const users = await HexHubUserService.listUsers({
      skip,
      take,
      status: status || undefined,
      role: role || undefined,
    })

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hexhub/users - 创建用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, firstName, lastName, role } = body

    // 验证必填字段
    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 创建用户
    const user = await HexHubUserService.createUser({
      email,
      username,
      password,
      firstName,
      lastName,
      role,
    })

    // 记录审计日志
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    await HexHubAuditService.logAction({
      action: 'CREATE',
      resource: 'USER',
      resourceId: user.id,
      details: JSON.stringify({ email, username }),
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '创建用户失败' },
      { status: 500 }
    )
  }
}
