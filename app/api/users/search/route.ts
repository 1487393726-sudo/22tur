import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// GET /api/users/search - 搜索用户
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 验证会话
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "会话已过期" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    // 搜索用户（按姓名或邮箱）
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
          { username: { contains: query } },
        ],
        status: "ACTIVE", // 只搜索活跃用户
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        position: true,
      },
      take: 20, // 限制返回数量
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Failed to search users:", error)
    return NextResponse.json({ error: "搜索用户失败" }, { status: 500 })
  }
}
