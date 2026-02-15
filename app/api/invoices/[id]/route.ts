import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// GET /api/invoices/[id] - 获取单个发票详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // 获取发票详情
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
            address: true,
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

    if (!invoice) {
      return NextResponse.json({ error: "发票不存在" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Failed to fetch invoice:", error)
    return NextResponse.json(
      { error: "获取发票失败" },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - 更新发票
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const { number, clientId, projectId, amount, status, dueDate, description } = body

    // 检查发票是否存在
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "发票不存在" }, { status: 404 })
    }

    // 如果更新发票号，检查是否与其他发票冲突
    if (number && number !== existingInvoice.number) {
      const duplicateInvoice = await prisma.invoice.findUnique({
        where: { number },
      })

      if (duplicateInvoice) {
        return NextResponse.json(
          { error: "发票号已存在" },
          { status: 400 }
        )
      }
    }

    // 更新发票
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(number && { number }),
        ...(clientId && { clientId }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(description !== undefined && { description }),
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

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error("Failed to update invoice:", error)
    return NextResponse.json(
      { error: "更新发票失败" },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - 删除发票
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // 检查发票是否存在
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      return NextResponse.json({ error: "发票不存在" }, { status: 404 })
    }

    // 删除发票
    await prisma.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ message: "发票已删除" })
  } catch (error) {
    console.error("Failed to delete invoice:", error)
    return NextResponse.json(
      { error: "删除发票失败" },
      { status: 500 }
    )
  }
}
