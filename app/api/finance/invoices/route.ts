import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 获取所有发票
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('获取发票列表失败:', error)
    return NextResponse.json(
      { error: '获取发票列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新发票
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const {
      invoiceNumber,
      clientId,
      projectId,
      amount,
      status,
      dueDate,
      description
    } = body

    // 验证必填字段
    if (!invoiceNumber || !clientId || !amount || !status || !dueDate) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 检查发票号是否已存在
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        number: {
          equals: invoiceNumber,
          mode: 'insensitive'
        }
      }
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: '发票号已存在' },
        { status: 400 }
      )
    }

    // 验证客户是否存在
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json(
        { error: '客户不存在' },
        { status: 400 }
      )
    }

    // 如果选择了项目，确保项目存在且与客户匹配
    if (projectId) {
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

    const dueDateObj = new Date(dueDate)

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        clientId,
        projectId: projectId || null,
        amount: Number(amount),
        status,
        dueDate: dueDateObj,
        description: description || null
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

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('创建发票失败:', error)
    return NextResponse.json(
      { error: '创建发票失败' },
      { status: 500 }
    )
  }
}