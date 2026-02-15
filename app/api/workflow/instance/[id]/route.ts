import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { workflowEngine } from "@/lib/workflow-engine";

const prisma = new PrismaClient();

// GET - 获取工作流实例详情
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

    const { id } = await params;

    // 使用工作流引擎获取实例状态
    const instance = await workflowEngine.getInstanceStatus(id);

    if (!instance) {
      return NextResponse.json({ error: "实例不存在" }, { status: 404 });
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error("获取实例详情失败:", error);
    return NextResponse.json(
      { error: "获取实例详情失败" },
      { status: 500 }
    );
  }
}

// DELETE - 取消工作流实例
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 使用工作流引擎取消工作流
    await workflowEngine.cancelWorkflow(id);

    return NextResponse.json({ message: "工作流已取消" });
  } catch (error) {
    console.error("取消工作流失败:", error);
    return NextResponse.json({ error: "取消工作流失败" }, { status: 500 });
  }
}
