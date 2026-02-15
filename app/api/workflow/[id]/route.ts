import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET - 获取工作流详情
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

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        nodes: {
          include: {
            fromTransitions: true,
            toTransitions: true
          }
        },
        instances: {
          take: 10,
          orderBy: { startedAt: "desc" },
        },
        _count: {
          select: {
            nodes: true,
            instances: true,
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "工作流不存在" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("获取工作流详情失败:", error);
    return NextResponse.json(
      { error: "获取工作流详情失败" },
      { status: 500 }
    );
  }
}

// PUT - 更新工作流
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

    const { id } = await params;
    const body = await request.json();

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        isActive: body.status === 'ACTIVE',
        trigger: body.triggerType,
        triggerConfig: body.config ? JSON.stringify(body.config) : undefined,
      },
      include: {
        nodes: {
          include: {
            fromTransitions: true,
            toTransitions: true
          }
        },
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("更新工作流失败:", error);
    return NextResponse.json({ error: "更新工作流失败" }, { status: 500 });
  }
}

// DELETE - 删除工作流
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

    // 先获取所有节点 ID
    const nodes = await prisma.workflowNode.findMany({
      where: { workflowId: id },
      select: { id: true }
    });
    const nodeIds = nodes.map(n => n.id);

    // 删除相关的转换
    await prisma.workflowTransition.deleteMany({
      where: {
        OR: [
          { fromNodeId: { in: nodeIds } },
          { toNodeId: { in: nodeIds } }
        ]
      },
    });

    // 删除节点
    await prisma.workflowNode.deleteMany({
      where: { workflowId: id },
    });

    await prisma.workflow.delete({
      where: { id },
    });

    return NextResponse.json({ message: "工作流已删除" });
  } catch (error) {
    console.error("删除工作流失败:", error);
    return NextResponse.json({ error: "删除工作流失败" }, { status: 500 });
  }
}
