import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET - 获取工作流列表
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      include: {
        _count: {
          select: {
            nodes: true,
            instances: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("获取工作流列表失败:", error);
    return NextResponse.json(
      { error: "获取工作流列表失败" },
      { status: 500 }
    );
  }
}

// POST - 创建工作流
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      name,
      description,
      category,
      status,
      triggerType,
      priority,
      nodes,
      transitions,
    } = body;

    // 验证必填字段
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "工作流名称不能为空" },
        { status: 400 }
      );
    }

    // 创建工作流
    const workflow = await prisma.workflow.create({
      data: {
        name: name.trim(),
        description: description || "",
        category: category || "APPROVAL",
        trigger: triggerType || "MANUAL",
        triggerConfig: JSON.stringify({ priority: priority || "MEDIUM" }),
        isActive: status === "ACTIVE",
        createdBy: session.user.id,
      },
    });

    // 创建节点
    if (nodes && Array.isArray(nodes)) {
      const nodeMap = new Map<string, string>(); // 临时ID -> 真实ID

      for (const node of nodes) {
        const createdNode = await prisma.workflowNode.create({
          data: {
            workflowId: workflow.id,
            name: node.name,
            type: node.type,
            position: node.position ? JSON.stringify(node.position) : "{}",
            config: node.config ? JSON.stringify(node.config) : "{}",
          },
        });
        // 保存临时ID映射
        const tempId = `${node.type}-${nodes.indexOf(node)}`;
        nodeMap.set(tempId, createdNode.id);
      }

      // 创建转换（连接线）
      if (transitions && Array.isArray(transitions)) {
        for (const transition of transitions) {
          const fromNodeId = nodeMap.get(transition.fromNodeId) || transition.fromNodeId;
          const toNodeId = nodeMap.get(transition.toNodeId) || transition.toNodeId;

          await prisma.workflowTransition.create({
            data: {
              fromNodeId: fromNodeId,
              toNodeId: toNodeId,
              condition: transition.condition,
            },
          });
        }
      }
    }

    // 返回完整的工作流数据
    const fullWorkflow = await prisma.workflow.findUnique({
      where: { id: workflow.id },
      include: {
        nodes: {
          include: {
            fromTransitions: true,
            toTransitions: true
          }
        },
        _count: {
          select: {
            nodes: true,
            instances: true,
          },
        },
      },
    });

    return NextResponse.json(fullWorkflow, { status: 201 });
  } catch (error) {
    console.error("创建工作流失败:", error);
    return NextResponse.json({ error: "创建工作流失败" }, { status: 500 });
  }
}
