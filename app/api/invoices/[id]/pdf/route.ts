import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// GET /api/invoices/[id]/pdf - 生成并返回发票 PDF
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

    // 注意：这个 API 返回发票数据，实际的 PDF 生成在客户端完成
    // 如果需要服务器端生成 PDF，可以使用 puppeteer 或其他服务器端库
    return NextResponse.json({
      message: "请使用客户端 PDF 生成功能",
      invoice,
    })
  } catch (error) {
    console.error("Failed to process PDF request:", error)
    return NextResponse.json(
      { error: "处理 PDF 请求失败" },
      { status: 500 }
    )
  }
}
