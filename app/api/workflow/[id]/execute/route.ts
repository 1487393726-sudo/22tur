import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { workflowEngine } from "@/lib/workflow-engine";

const prisma = new PrismaClient();

// POST - 执行工作流
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { variables } = body;

    // 使用工作流引擎启动工作流
    const instanceId = await workflowEngine.startWorkflow(
      id,
      session.user.email,
      variables || {}
    );

    // 获取创建的实例
    const instance = await prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        workflow: true,
        executions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    console.error("执行工作流失败:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "执行工作流失败",
      },
      { status: 500 }
    );
  }
}
