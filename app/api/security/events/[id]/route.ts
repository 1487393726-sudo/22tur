import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/security/events/[id] - 获取单个安全事件详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params
    const event = await prisma.securityEvent.findUnique({
      where: { id },
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

    if (!event) {
      return NextResponse.json({ error: '安全事件不存在' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('获取安全事件失败:', error)
    return NextResponse.json({ error: '获取安全事件失败' }, { status: 500 })
  }
}

// PUT /api/security/events/[id] - 更新安全事件
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes } = body

    const { id } = await params
    
    // 检查事件是否存在
    const existingEvent = await prisma.securityEvent.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: '安全事件不存在' }, { status: 404 })
    }

    // 更新事件
    const updateData: any = {
      resolved: status === 'RESOLVED' || status === 'IGNORED'
    }

    // 如果状态变为已解决或已忽略，记录处理人和时间
    if (status === 'RESOLVED' || status === 'IGNORED') {
      updateData.resolvedBy = (session.user as any).id
      updateData.resolvedAt = new Date()
    }

    // 如果提供了备注，添加到 details 中
    const existingDetails = existingEvent.details ? JSON.parse(existingEvent.details) : {}
    if (notes) {
      updateData.details = JSON.stringify({
        ...existingDetails,
        resolutionNotes: notes,
        status,
        resolvedAt: new Date().toISOString()
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
          newStatus: status,
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
    console.error('更新安全事件失败:', error)
    return NextResponse.json({ error: '更新安全事件失败' }, { status: 500 })
  }
}

// DELETE /api/security/events/[id] - 删除安全事件
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params
    
    // 检查事件是否存在
    const event = await prisma.securityEvent.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ error: '安全事件不存在' }, { status: 404 })
    }

    // 删除事件
    await prisma.securityEvent.delete({
      where: { id }
    })

    // 创建审计日志
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'DELETE',
        resource: 'SecurityEvent',
        resourceId: id,
        details: JSON.stringify({
          eventType: event.type,
          severity: event.severity,
          description: event.description
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'SUCCESS',
        risk: 'HIGH'
      }
    })

    return NextResponse.json({ message: '安全事件已删除' })
  } catch (error) {
    console.error('删除安全事件失败:', error)
    return NextResponse.json({ error: '删除安全事件失败' }, { status: 500 })
  }
}
