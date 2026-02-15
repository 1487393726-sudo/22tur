import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')

    const where: any = {}
    if (type) where.type = type
    if (severity) where.severity = severity

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.securityEvent.count({ where })
    ])

    return NextResponse.json(events)
  } catch (error) {
    console.error('获取安全事件失败:', error)
    return NextResponse.json({ error: '获取安全事件失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { type, severity, description, ipAddress, userAgent, userId, details } = body

    if (!type || !severity || !description) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }

    const event = await prisma.securityEvent.create({
      data: {
        type,
        severity,
        description,
        ipAddress: ipAddress || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
        userId: userId || (session.user as any).id,
        details: details ? JSON.stringify(details) : null
      }
    })

    // 如果是严重事件，创建对应的审计日志
    if (severity === 'HIGH' || severity === 'CRITICAL') {
      await prisma.auditLog.create({
        data: {
          action: `SECURITY_EVENT: ${type}`,
          resource: 'SecurityEvent',
          resourceId: event.id,
          details: JSON.stringify({
            eventId: event.id,
            severity,
            description
          }),
          ipAddress: event.ipAddress || undefined,
          userId: (session.user as any).id,
          status: 'WARNING',
          risk: severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
        }
      })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('创建安全事件失败:', error)
    return NextResponse.json({ error: '创建安全事件失败' }, { status: 500 })
  }
}