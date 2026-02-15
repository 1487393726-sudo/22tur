import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// PUT - 移动任务（更新状态和顺序）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json({ error: "会话无效" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, order } = body;

    // 更新任务
    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assigneeId,
      assignedToName: task.assignee
        ? `${task.assignee.firstName} ${task.assignee.lastName}`
        : undefined,
      dueDate: task.dueDate,
    });
  } catch (error) {
    console.error("移动任务失败:", error);
    return NextResponse.json(
      { error: "移动任务失败" },
      { status: 500 }
    );
  }
}
