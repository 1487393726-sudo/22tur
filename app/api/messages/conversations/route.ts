import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/messages/conversations - 获取会话列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const currentUserId = session.user.id

    // 获取所有与当前用户相关的消息，按对话分组
    // 使用原始 SQL 查询以获得更好的性能
    const conversations = await prisma.$queryRaw<any[]>`
      SELECT 
        CASE 
          WHEN senderId = ${currentUserId} THEN receiverId
          ELSE senderId
        END as otherUserId,
        MAX(createdAt) as lastMessageTime,
        COUNT(*) as messageCount,
        SUM(CASE WHEN receiverId = ${currentUserId} AND isRead = false THEN 1 ELSE 0 END) as unreadCount
      FROM messages
      WHERE senderId = ${currentUserId} OR receiverId = ${currentUserId}
      GROUP BY otherUserId
      ORDER BY lastMessageTime DESC
    `

    // 获取对话用户的详细信息
    const userIds = conversations.map(c => c.otherUserId)
    
    if (userIds.length === 0) {
      return NextResponse.json([])
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        },
        ...(search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        status: true
      }
    })

    const userMap = new Map(users.map(u => [u.id, u]))

    // 获取每个会话的最后一条消息
    const lastMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: conv.otherUserId },
              { senderId: conv.otherUserId, receiverId: currentUserId }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            isRead: true
          }
        })
        return { otherUserId: conv.otherUserId, lastMessage: lastMsg }
      })
    )

    const lastMessageMap = new Map(
      lastMessages.map(lm => [lm.otherUserId, lm.lastMessage])
    )

    // 组合数据
    const formattedConversations = conversations
      .map(conv => {
        const user = userMap.get(conv.otherUserId)
        const lastMessage = lastMessageMap.get(conv.otherUserId)
        
        if (!user) return null

        return {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          userAvatar: user.avatar,
          userStatus: user.status || 'OFFLINE',
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt.toISOString(),
            isRead: lastMessage.isRead
          } : null,
          lastMessageTime: conv.lastMessageTime,
          messageCount: Number(conv.messageCount),
          unreadCount: Number(conv.unreadCount)
        }
      })
      .filter(Boolean) // 过滤掉 null 值

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('获取会话列表失败:', error)
    return NextResponse.json({ error: '获取会话列表失败' }, { status: 500 })
  }
}
