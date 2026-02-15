import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id]/members - 获取项目成员列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    // 获取项目成员
    const members = await prisma.projectMember.findMany({
      where: { projectId: resolvedParams.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            position: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // LEADER 优先
        { joinedAt: "asc" },
      ],
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Failed to fetch project members:", error)
    return NextResponse.json({ error: "获取成员列表失败" }, { status: 500 })
  }
}

// POST /api/projects/[id]/members - 添加项目成员
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    const body = await request.json()
    const { userId, role = "MEMBER" } = body

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 })
    }

    // 验证角色
    const validRoles = ["LEADER", "MEMBER", "VIEWER"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "无效的角色" }, { status: 400 })
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 检查是否已经是成员
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: resolvedParams.id,
          userId: userId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "用户已经是项目成员" }, { status: 400 })
    }

    // 添加成员
    const member = await prisma.projectMember.create({
      data: {
        projectId: resolvedParams.id,
        userId: userId,
        role: role,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            position: true,
          },
        },
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Failed to add project member:", error)
    return NextResponse.json({ error: "添加成员失败" }, { status: 500 })
  }
}
