import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// PUT /api/projects/[id]/members/[memberId] - 更新成员角色
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
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
    const { role } = body

    if (!role) {
      return NextResponse.json({ error: "缺少角色" }, { status: 400 })
    }

    // 验证角色
    const validRoles = ["LEADER", "MEMBER", "VIEWER"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "无效的角色" }, { status: 400 })
    }

    // 检查成员是否存在
    const existingMember = await prisma.projectMember.findUnique({
      where: { id: resolvedParams.memberId },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 })
    }

    if (existingMember.projectId !== resolvedParams.id) {
      return NextResponse.json({ error: "成员不属于该项目" }, { status: 400 })
    }

    // 更新角色
    const updatedMember = await prisma.projectMember.update({
      where: { id: resolvedParams.memberId },
      data: { role },
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

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Failed to update member role:", error)
    return NextResponse.json({ error: "更新角色失败" }, { status: 500 })
  }
}

// DELETE /api/projects/[id]/members/[memberId] - 移除项目成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
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

    // 检查成员是否存在
    const existingMember = await prisma.projectMember.findUnique({
      where: { id: resolvedParams.memberId },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 })
    }

    if (existingMember.projectId !== resolvedParams.id) {
      return NextResponse.json({ error: "成员不属于该项目" }, { status: 400 })
    }

    // 删除成员
    await prisma.projectMember.delete({
      where: { id: resolvedParams.memberId },
    })

    return NextResponse.json({ message: "成员已移除" })
  } catch (error) {
    console.error("Failed to remove member:", error)
    return NextResponse.json({ error: "移除成员失败" }, { status: 500 })
  }
}
