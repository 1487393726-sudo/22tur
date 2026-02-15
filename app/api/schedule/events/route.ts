import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')

    const where: any = {
      OR: [
        { organizerId: token.sub },
        { attendees: { some: { userId: token.sub } } }
      ]
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (type && type !== 'all') {
      where.type = type
    }

    const events = await prisma.event.findMany({
      where,
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
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // 转换数据格式
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      allDay: event.isAllDay,
      resource: {
        id: event.id,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        description: event.description,
        location: event.location,
        type: event.type,
        priority: event.priority,
        status: event.status,
        attendees: event.attendees.map(attendee => ({
          id: attendee.user.id,
          name: `${attendee.user.firstName} ${attendee.user.lastName}`,
          email: attendee.user.email,
          avatar: attendee.user.avatar,
          status: attendee.status,
          role: attendee.role
        }))
      }
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      isAllDay,
      attendees,
      reminders
    } = body

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        type: type || 'MEETING',
        priority: priority || 'MEDIUM',
        isAllDay: isAllDay || false,
        status: 'SCHEDULED',
        organizerId: token.sub,
        attendees: attendees ? {
          create: attendees.map((attendeeId: string) => ({
            userId: attendeeId,
            status: 'INVITED'
          }))
        } : undefined,
        reminders: reminders ? {
          create: reminders.map((reminder: any) => ({
            type: reminder.type,
            minutes: reminder.minutes
          }))
        } : undefined
      },
      include: {
        attendees: {
          include: {
            user: true
          }
        }
      }
    })

    // 发送通知给参与者
    if (attendees && attendees.length > 0) {
      await Promise.all(
        attendees.map(async (attendeeId: string) => {
          await prisma.notification.create({
            data: {
              userId: attendeeId,
              title: '新会议邀请',
              message: `您被邀请参加：${title}`,
              type: 'EVENT',
              priority: priority || 'MEDIUM',
              actionUrl: `/schedule/events/${event.id}`,
              metadata: JSON.stringify({
                eventId: event.id,
                eventTitle: title
              })
            }
          })
        })
      )
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}