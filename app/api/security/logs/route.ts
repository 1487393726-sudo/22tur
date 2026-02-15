import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 只有管理员可以查看审计日志
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // 最多100条
    
    // 筛选参数
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const status = searchParams.get('status')
    const risk = searchParams.get('risk')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    // 构建查询条件
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (action) {
      where.action = action
    }
    
    if (resource) {
      where.resource = { contains: resource, mode: 'insensitive' }
    }
    
    if (status) {
      where.status = status
    }
    
    if (risk) {
      where.risk = risk
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }
    
    // 全文搜索（搜索资源、详情）
    if (search) {
      where.OR = [
        { resource: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 查询日志和总数
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ])

    // 格式化日志数据
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details ? JSON.parse(log.details) : null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      status: log.status,
      risk: log.risk,
      timestamp: log.createdAt.toISOString(),
      user: log.user ? {
        id: log.user.id,
        name: `${log.user.firstName} ${log.user.lastName}`,
        email: log.user.email,
        avatar: log.user.avatar
      } : null,
      // 兼容旧的 level 字段
      level: log.status === 'SUCCESS' ? 'INFO' : log.status === 'WARNING' ? 'WARN' : 'ERROR'
    }))

    return NextResponse.json({
      data: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('获取安全日志失败:', error)
    return NextResponse.json({ error: '获取安全日志失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { action, resource, details, level = 'INFO' } = body

    if (!action || !resource) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }

    // 将 level 映射到 status 和 risk
    const statusMap: Record<string, string> = {
      'INFO': 'SUCCESS',
      'WARN': 'WARNING',
      'ERROR': 'FAILED'
    }
    const riskMap: Record<string, string> = {
      'INFO': 'LOW',
      'WARN': 'MEDIUM',
      'ERROR': 'HIGH'
    }

    const log = await prisma.auditLog.create({
      data: {
        action,
        resource,
        details: details ? JSON.stringify(details) : null,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userId: (session.user as any).id,
        status: statusMap[level] || 'SUCCESS',
        risk: riskMap[level] || 'LOW'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // 格式化返回数据
    const formattedLog = {
      ...log,
      user: log.user ? {
        id: log.user.id,
        name: `${log.user.firstName} ${log.user.lastName}`,
        email: log.user.email
      } : null,
      level // 保持兼容性
    }

    return NextResponse.json(formattedLog)
  } catch (error) {
    console.error('创建安全日志失败:', error)
    return NextResponse.json({ error: '创建安全日志失败' }, { status: 500 })
  }
}