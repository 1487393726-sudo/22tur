import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: {
        id: (await params).id
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attendees: {
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
          }
        },
        reminders: true,
        notes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 检查访问权限
    const hasPermission = event.organizerId === token.sub || 
      event.attendees.some(attendee => attendee.userId === token.sub)

    if (!hasPermission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      type,
      priority,
      status,
      isAllDay
    } = body

    // 检查事件存在和权限
    const existingEvent = await prisma.event.findUnique({
      where: { id: (await params).id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existingEvent.organizerId !== token.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const event = await prisma.event.update({
      where: {
        id: (await params).id
      },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(isAllDay !== undefined && { isAllDay })
      },
      include: {
        attendees: {
          include: {
            user: true
          }
        }
      }
    })

    // 通知参与者事件已更新
    if (event.attendees.length > 0) {
      await Promise.all(
        event.attendees.map(async (attendee) => {
          if (attendee.userId !== token.sub) {
            await prisma.notification.create({
              data: {
                userId: attendee.userId,
                title: '会议更新',
                message: `会议 "${event.title}" 已更新`,
                type: 'EVENT',
                priority: 'MEDIUM',
                actionUrl: `/schedule/events/${event.id}`
              }
            })
          }
        })
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查事件存在和权限
    const existingEvent = await prisma.event.findUnique({
      where: { id: (await params).id },
      include: {
        attendees: true
      }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existingEvent.organizerId !== token.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.event.delete({
      where: {
        id: (await params).id
      }
    })

    // 通知参与者事件已取消
    if (existingEvent.attendees.length > 0) {
      await Promise.all(
        existingEvent.attendees.map(async (attendee) => {
          if (attendee.userId !== token.sub) {
            await prisma.notification.create({
              data: {
                userId: attendee.userId,
                title: '会议取消',
                message: `会议 "${existingEvent.title}" 已取消`,
                type: 'EVENT',
                priority: 'MEDIUM'
              }
            })
          }
        })
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}