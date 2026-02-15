import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 获取所有交易记录
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      include: {
        client: {
          select: {
            name: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('获取交易记录失败:', error)
    return NextResponse.json(
      { error: '获取交易记录失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新交易记录
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      amount,
      description,
      category,
      date,
      clientId,
      projectId
    } = body

    // 验证必填字段
    if (!type || !amount || !description || !category || !date) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 如果选择了项目，确保项目存在且与客户匹配
    if (projectId && clientId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })

      if (!project || project.clientId !== clientId) {
        return NextResponse.json(
          { error: '项目与客户不匹配' },
          { status: 400 }
        )
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: Number(amount),
        description,
        category,
        date: new Date(date),
        clientId: clientId || null,
        projectId: projectId || null
      },
      include: {
        client: {
          select: {
            name: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('创建交易记录失败:', error)
    return NextResponse.json(
      { error: '创建交易记录失败' },
      { status: 500 }
    )
  }
}