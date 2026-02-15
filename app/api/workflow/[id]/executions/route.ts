import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET - 获取工作流执行记录
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

    const executions = await prisma.workflowInstance.findMany({
      where: { workflowId: id },
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(executions);
  } catch (error) {
    console.error("获取执行记录失败:", error);
    return NextResponse.json(
      { error: "获取执行记录失败" },
      { status: 500 }
    );
  }
}
