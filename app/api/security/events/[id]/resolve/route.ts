import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST /api/security/events/[id]/resolve - 解决安全事件（快捷方式）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { notes, action = 'resolve' } = body

    const { id } = await params
    
    // 检查事件是否存在
    const existingEvent = await prisma.securityEvent.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: '安全事件不存在' }, { status: 404 })
    }

    // 确定新状态
    const newStatus = action === 'ignore' ? 'IGNORED' : 'RESOLVED'

    // 更新事件
    const updateData: any = {
      resolved: true,
      resolvedBy: (session.user as any).id,
      resolvedAt: new Date()
    }

    // 如果提供了备注，添加到 details 中
    const existingDetails = existingEvent.details ? JSON.parse(existingEvent.details) : {}
    if (notes) {
      updateData.details = JSON.stringify({
        ...existingDetails,
        resolutionNotes: notes,
        status: newStatus,
        resolvedAt: new Date().toISOString(),
        action
      })
    }

    const event = await prisma.securityEvent.update({
      where: { id },
      data: updateData,
      include: {
        resolver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // 创建审计日志
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'UPDATE',
        resource: 'SecurityEvent',
        resourceId: id,
        details: JSON.stringify({
          previousResolved: existingEvent.resolved,
          newStatus,
          action,
          notes
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'SUCCESS',
        risk: 'MEDIUM'
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('解决安全事件失败:', error)
    return NextResponse.json({ error: '解决安全事件失败' }, { status: 500 })
  }
}
