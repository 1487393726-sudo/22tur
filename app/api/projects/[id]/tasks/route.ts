import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// POST /api/projects/[id]/tasks - 创建任务
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
    const { title, description, priority = "MEDIUM", assigneeId, dueDate } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "任务标题不能为空" }, { status: 400 })
    }

    // 验证优先级
    const validPriorities = ["LOW", "MEDIUM", "HIGH"]
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: "无效的优先级" }, { status: 400 })
    }

    // 如果指定了负责人，验证是否是项目成员
    if (assigneeId) {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          projectId: resolvedParams.id,
          userId: assigneeId,
        },
      })

      if (!isMember) {
        return NextResponse.json({ error: "负责人不是项目成员" }, { status: 400 })
      }
    }

    // 创建任务
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        status: "TODO",
        projectId: resolvedParams.id,
        creatorId: session.user.id,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json({ error: "创建任务失败" }, { status: 500 })
  }
}
