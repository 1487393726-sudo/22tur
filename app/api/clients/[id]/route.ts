import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> };

// GET - 获取单个客户详情
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id: clientId } = await context.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: {
        id: clientId
      },
      include: {
        projects: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
            startDate: true,
            endDate: true
          }
        },
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 })
    }

    // 计算总项目价值
    const projects = await prisma.project.findMany({
      where: {
        clientId: clientId
      },
      select: {
        budget: true
      }
    })

    const totalProjectValue = projects.reduce((sum, project) => {
      return sum + (project.budget || 0)
    }, 0)

    const clientWithTotalValue = {
      ...client,
      totalProjectValue
    }

    return NextResponse.json(clientWithTotalValue)
  } catch (error) {
    console.error('获取客户详情失败:', error)
    return NextResponse.json(
      { error: '获取客户详情失败' },
      { status: 500 }
    )
  }
}

// PATCH - 更新客户信息
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { id: clientId } = await context.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()

    // 检查客户是否存在
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 })
    }

    // 如果更新名称，检查是否与其他客户重复
    if (body.name && body.name !== existingClient.name) {
      const duplicateClient = await prisma.client.findFirst({
        where: {
          name: {
            equals: body.name,
            mode: 'insensitive'
          },
          id: {
            not: clientId
          }
        }
      })

      if (duplicateClient) {
        return NextResponse.json(
          { error: '客户名称已存在' },
          { status: 400 }
        )
      }
    }

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

    const updatedClient = await prisma.client.update({
      where: {
        id: clientId
      },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone && { phone }),
        ...(website !== undefined && { website: website || null }),
        ...(industry && { industry }),
        ...(status && { status }),
        ...(contactPerson !== undefined && { contactPerson: contactPerson || null }),
        ...(position !== undefined && { position: position || null }),
        ...(address !== undefined && { address: address || null }),
        ...(description !== undefined && { description: description || null })
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('更新客户失败:', error)
    return NextResponse.json(
      { error: '更新客户失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除客户
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id: clientId } = await context.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查客户是否存在
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId
      },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 })
    }

    // 检查是否有关联的项目
    if (existingClient._count.projects > 0) {
      return NextResponse.json(
        { error: '无法删除有关联项目的客户，请先删除相关项目' },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: {
        id: clientId
      }
    })

    return NextResponse.json({ message: '客户删除成功' })
  } catch (error) {
    console.error('删除客户失败:', error)
    return NextResponse.json(
      { error: '删除客户失败' },
      { status: 500 }
    )
  }
}