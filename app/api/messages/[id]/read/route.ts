import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT /api/messages/[id]/read - 标记消息为已读
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const messageId = params.id

    // 检查消息是否存在
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        receiverId: true,
        isRead: true
      }
    })

    if (!message) {
      return NextResponse.json({ error: '消息不存在' }, { status: 404 })
    }

    // 只有接收者可以标记消息为已读
    if (message.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: '无权限标记此消息为已读' },
        { status: 403 }
      )
    }

    // 如果已经是已读状态，直接返回
    if (message.isRead) {
      return NextResponse.json({ message: '消息已经是已读状态' })
    }

    // 更新消息为已读
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
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

    // 格式化返回数据
    const formattedMessage = {
      id: updatedMessage.id,
      senderId: updatedMessage.senderId,
      receiverId: updatedMessage.receiverId,
      subject: updatedMessage.subject,
      content: updatedMessage.content,
      type: updatedMessage.type,
      priority: updatedMessage.priority,
      isRead: updatedMessage.isRead,
      isReplied: updatedMessage.isReplied,
      attachments: updatedMessage.attachments ? JSON.parse(updatedMessage.attachments) : null,
      readAt: updatedMessage.readAt?.toISOString(),
      repliedAt: updatedMessage.repliedAt?.toISOString(),
      createdAt: updatedMessage.createdAt.toISOString(),
      sender: {
        id: updatedMessage.sender.id,
        name: `${updatedMessage.sender.firstName} ${updatedMessage.sender.lastName}`,
        email: updatedMessage.sender.email,
        avatar: updatedMessage.sender.avatar
      },
      receiver: {
        id: updatedMessage.receiver.id,
        name: `${updatedMessage.receiver.firstName} ${updatedMessage.receiver.lastName}`,
        email: updatedMessage.receiver.email,
        avatar: updatedMessage.receiver.avatar
      }
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error('标记消息已读失败:', error)
    return NextResponse.json({ error: '标记消息已读失败' }, { status: 500 })
  }
}

// POST /api/messages/[id]/read - 批量标记会话中的所有消息为已读
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const otherUserId = params.id // 这里的 id 是对话的另一方用户ID

    // 批量更新所有未读消息
    const result = await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      message: '批量标记成功',
      count: result.count
    })
  } catch (error) {
    console.error('批量标记消息已读失败:', error)
    return NextResponse.json({ error: '批量标记消息已读失败' }, { status: 500 })
  }
}
