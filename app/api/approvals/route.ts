import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取当前用户
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json({ error: "会话无效" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "pending";

    let instances;

    if (type === "pending") {
      // 待我审批：查找分配给我的待处理节点
      const executions = await prisma.nodeExecution.findMany({
        where: {
          assignedTo: userId,
          status: "PENDING",
        },
        include: {
          instance: {
            include: {
              workflow: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          node: {
            select: {
              name: true,
              type: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      instances = executions.map((exec) => ({
        id: exec.instance.id,
        workflow: exec.instance.workflow,
        currentNode: exec.node,
        status: exec.instance.status,
        startedAt: exec.instance.startedAt,
      }));
    } else if (type === "initiated") {
      // 我发起的：查找我创建的所有实例
      instances = await prisma.workflowInstance.findMany({
        where: {
          startedBy: userId,
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
      });
    } else {
      // 已完成
      instances = await prisma.workflowInstance.findMany({
        where: {
          startedBy: userId,
          status: { in: ["COMPLETED", "FAILED", "CANCELLED"] },
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      });
    }

    return NextResponse.json({ instances });
  } catch (error) {
    console.error("获取审批列表失败:", error);
    return NextResponse.json(
      { error: "获取审批列表失败" },
      { status: 500 }
    );
  }
}
