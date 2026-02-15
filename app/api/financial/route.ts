import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取财务记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}

    if (type && type !== 'all') {
      where.type = type
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.financialRecord.count({ where })
    ])

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取财务记录失败:', error)
    return NextResponse.json(
      { error: '获取财务记录失败' },
      { status: 500 }
    )
  }
}

// 创建财务记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, amount, description, fileName, filePath, userId, metadata } = body

    if (!type || !title || !amount || !userId) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const record = await prisma.financialRecord.create({
      data: {
        type,
        title,
        amount: parseFloat(amount),
        description,
        fileName,
        filePath,
        userId,
        status: 'PENDING',
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('创建财务记录失败:', error)
    return NextResponse.json(
      { error: '创建财务记录失败' },
      { status: 500 }
    )
  }
}