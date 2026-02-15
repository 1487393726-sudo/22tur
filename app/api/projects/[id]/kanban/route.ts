import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET - 获取看板数据
export async function GET(
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

    // 获取项目任务
    const tasks = await prisma.task.findMany({
      where: {
        projectId: id,
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
      orderBy: {
        createdAt: "asc",
      },
    });

    // 辅助函数：映射任务
    const mapTask = (task: typeof tasks[0]) => ({
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
      order: 0,
    });

    // 按状态分组任务
    const columns = [
      {
        id: "todo",
        title: "待办",
        status: "TODO",
        tasks: tasks.filter((task) => task.status === "TODO").map(mapTask),
      },
      {
        id: "in-progress",
        title: "进行中",
        status: "IN_PROGRESS",
        tasks: tasks.filter((task) => task.status === "IN_PROGRESS").map(mapTask),
      },
      {
        id: "review",
        title: "待审核",
        status: "REVIEW",
        tasks: tasks.filter((task) => task.status === "REVIEW").map(mapTask),
      },
      {
        id: "done",
        title: "已完成",
        status: "DONE",
        tasks: tasks.filter((task) => task.status === "DONE" || task.status === "COMPLETED").map(mapTask),
      },
    ];

    return NextResponse.json({ columns });
  } catch (error) {
    console.error("获取看板数据失败:", error);
    return NextResponse.json(
      { error: "获取看板数据失败" },
      { status: 500 }
    );
  }
}
