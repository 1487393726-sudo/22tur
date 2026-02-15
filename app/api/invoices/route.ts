import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// GET /api/invoices - 获取发票列表
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 验证会话
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "会话已过期" }, { status: 401 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")

    // 构建查询条件
    const where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    // 获取发票列表
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch invoices:", error)
    return NextResponse.json(
      { error: "获取发票列表失败" },
      { status: 500 }
    )
  }
}

// POST /api/invoices - 创建发票
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 验证会话
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "会话已过期" }, { status: 401 })
    }

    const body = await request.json()
    const { number, clientId, projectId, amount, status, dueDate, description } = body

    // 验证必填字段
    if (!number || !clientId || !amount || !dueDate) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      )
    }

    // 检查发票号是否已存在
    const existingInvoice = await prisma.invoice.findUnique({
      where: { number },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: "发票号已存在" },
        { status: 400 }
      )
    }

    // 验证客户是否存在
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json(
        { error: "客户不存在" },
        { status: 400 }
      )
    }

    // 如果有项目ID，验证项目是否存在
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        return NextResponse.json(
          { error: "项目不存在" },
          { status: 400 }
        )
      }
    }

    // 创建发票
    const invoice = await prisma.invoice.create({
      data: {
        number,
        clientId,
        projectId: projectId || null,
        amount: parseFloat(amount),
        status: status || "DRAFT",
        dueDate: new Date(dueDate),
        description: description || null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Failed to create invoice:", error)
    return NextResponse.json(
      { error: "创建发票失败" },
      { status: 500 }
    )
  }
}
