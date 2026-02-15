import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { workflowEngine } from "@/lib/workflow-engine";

const prisma = new PrismaClient();

// POST - 审批节点执行
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
    const { action, notes } = body; // action: "approve" | "reject"

    // 获取节点执行记录
    const execution = await prisma.nodeExecution.findUnique({
      where: { id },
      include: {
        node: true,
        instance: true,
      },
    });

    if (!execution) {
      return NextResponse.json(
        { error: "执行记录不存在" },
        { status: 404 }
      );
    }

    // 检查权限（简化版，实际应该检查用户是否是审批人）
    if (
      execution.assignedTo &&
      execution.assignedTo !== session.user.id &&
      execution.assignedTo !== session.user.email
    ) {
      return NextResponse.json(
        { error: "您没有权限审批此任务" },
        { status: 403 }
      );
    }

    // 检查状态
    if (execution.status !== "PENDING") {
      return NextResponse.json(
        { error: "该任务已经处理过了" },
        { status: 400 }
      );
    }

    // 使用工作流引擎完成节点执行
    const status = action === "approve" ? "COMPLETED" : "FAILED";
    await workflowEngine.completeNodeExecution(id, status, notes);

    // 创建通知给申请人
    await prisma.notification.create({
      data: {
        userId: execution.instance.startedBy,
        type: action === "approve" ? "APPROVAL_APPROVED" : "APPROVAL_REJECTED",
        title: "审批结果通知",
        message: `您的审批请求"${execution.node.name}"已${action === "approve" ? "通过" : "拒绝"}`,
        actionUrl: `/workflow/instance/${execution.instanceId}`,
        isRead: false,
      },
    });

    // 获取更新后的执行记录
    const updatedExecution = await prisma.nodeExecution.findUnique({
      where: { id },
      include: {
        node: true,
        instance: {
          include: {
            workflow: true,
          },
        },
      },
    });

    return NextResponse.json(updatedExecution);
  } catch (error) {
    console.error("审批操作失败:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "审批操作失败",
      },
      { status: 500 }
    );
  }
}
