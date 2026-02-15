import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 获取所有客户
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 计算每个客户的总项目价值
    const clientsWithTotalValue = await Promise.all(
      clients.map(async (client) => {
        const projects = await prisma.project.findMany({
          where: {
            clientId: client.id
          },
          select: {
            budget: true
          }
        })

        const totalProjectValue = projects.reduce((sum, project) => {
          return sum + (project.budget || 0)
        }, 0)

        return {
          ...client,
          totalProjectValue
        }
      })
    )

    return NextResponse.json(clientsWithTotalValue)
  } catch (error) {
    console.error('获取客户列表失败:', error)
    return NextResponse.json(
      { error: '获取客户列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新客户
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      website,
      industry,
      status,
      contactPerson,
      position,
      address,
      description
    } = body

    // 验证必填字段
    if (!name || !phone || !industry || !status) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 检查客户名称是否已存在
    const existingClient = await prisma.client.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: '客户名称已存在' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone,
        website: website || null,
        industry,
        status,
        contactPerson: contactPerson || null,
        position: position || null,
        address: address || null,
        description: description || null
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('创建客户失败:', error)
    return NextResponse.json(
      { error: '创建客户失败' },
      { status: 500 }
    )
  }
}