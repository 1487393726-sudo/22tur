import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/messages - 获取消息列表（两个用户之间的对话）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('userId') // 对话的另一方用户ID
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    if (!otherUserId) {
      return NextResponse.json({ error: '缺少用户ID参数' }, { status: 400 })
    }

    const currentUserId = session.user.id

    // 查询两个用户之间的所有消息
    const where = {
      OR: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }, // 按时间升序，最早的在前
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.message.count({ where })
    ])

    // 格式化消息数据
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      subject: msg.subject,
      content: msg.content,
      type: msg.type,
      priority: msg.priority,
      isRead: msg.isRead,
      isReplied: msg.isReplied,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null,
      readAt: msg.readAt?.toISOString(),
      repliedAt: msg.repliedAt?.toISOString(),
      createdAt: msg.createdAt.toISOString(),
      sender: {
        id: msg.sender.id,
        name: `${msg.sender.firstName} ${msg.sender.lastName}`,
        email: msg.sender.email,
        avatar: msg.sender.avatar
      },
      receiver: {
        id: msg.receiver.id,
        name: `${msg.receiver.firstName} ${msg.receiver.lastName}`,
        email: msg.receiver.email,
        avatar: msg.receiver.avatar
      }
    }))

    return NextResponse.json({
      data: formattedMessages,
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
    console.error('获取消息失败:', error)
    return NextResponse.json({ error: '获取消息失败' }, { status: 500 })
  }
}

// POST /api/messages - 发送新消息
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const {
      receiverId,
      subject = '',
      content,
      type = 'MESSAGE',
      priority = 'NORMAL',
      attachments = null
    } = body

    // 验证必填字段
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: '缺少必要字段：receiverId 和 content' },
        { status: 400 }
      )
    }

    // 验证接收者是否存在
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true }
    })

    if (!receiver) {
      return NextResponse.json({ error: '接收者不存在' }, { status: 404 })
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        subject,
        content,
        type,
        priority,
        attachments: attachments ? JSON.stringify(attachments) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    // 创建通知给接收者
    const senderName = `${message.sender.firstName} ${message.sender.lastName}`.trim() || '用户'
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        title: '新消息',
        message: `${senderName} 给您发送了一条消息`,
        actionUrl: `/messages?userId=${(session.user as any).id}`,
        priority: priority === 'URGENT' ? 'HIGH' : 'MEDIUM'
      }
    })

    // 格式化返回数据
    const formattedMessage = {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      subject: message.subject,
      content: message.content,
      type: message.type,
      priority: message.priority,
      isRead: message.isRead,
      isReplied: message.isReplied,
      attachments: message.attachments ? JSON.parse(message.attachments) : null,
      readAt: message.readAt?.toISOString(),
      repliedAt: message.repliedAt?.toISOString(),
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        email: message.sender.email,
        avatar: message.sender.avatar
      },
      receiver: {
        id: message.receiver.id,
        name: `${message.receiver.firstName} ${message.receiver.lastName}`,
        email: message.receiver.email,
        avatar: message.receiver.avatar
      }
    }

    return NextResponse.json(formattedMessage, { status: 201 })
  } catch (error) {
    console.error('发送消息失败:', error)
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 })
  }
}
