import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, role } = body

    // 检查事件存在
    const event = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 更新或创建参会状态
    const attendee = await prisma.eventAttendee.upsert({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: token.sub
        }
      },
      update: {
        status,
        responseAt: new Date(),
        ...(role && { role })
      },
      create: {
        eventId: params.id,
        userId: token.sub,
        status,
        responseAt: new Date(),
        role: role || 'ATTENDEE'
      }
    })

    // 通知组织者
    if (event.organizerId !== token.sub) {
      await prisma.notification.create({
        data: {
          userId: event.organizerId,
          title: '参会状态更新',
          message: `有人更新了 "${event.title}" 的参会状态为：${status}`,
          type: 'EVENT',
          priority: 'MEDIUM',
          actionUrl: `/schedule/events/${event.id}`
        }
      })
    }

    return NextResponse.json(attendee)
  } catch (error) {
    console.error('Failed to update attendee status:', error)
    return NextResponse.json(
      { error: 'Failed to update attendee status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查事件存在
    const event = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 删除参会记录
    await prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: token.sub
        }
      }
    })

    // 通知组织者
    if (event.organizerId !== token.sub) {
      await prisma.notification.create({
        data: {
          userId: event.organizerId,
          title: '参与者退出',
          message: `有人退出了 "${event.title}"`,
          type: 'EVENT',
          priority: 'MEDIUM',
          actionUrl: `/schedule/events/${event.id}`
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove attendee:', error)
    return NextResponse.json(
      { error: 'Failed to remove attendee' },
      { status: 500 }
    )
  }
}