import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders/[id]/milestones - 获取订单里程碑
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;

    // 验证订单存在且有权限
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      select: { id: true, clientId: true },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && order.clientId !== session.user.id) {
      return NextResponse.json({ error: "无权查看此订单" }, { status: 403 });
    }

    const milestones = await prisma.orderMilestone.findMany({
      where: { orderId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("获取里程碑失败:", error);
    return NextResponse.json({ error: "获取里程碑失败" }, { status: 500 });
  }
}

// POST /api/orders/[id]/milestones - 创建里程碑（管理员）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, dueDate, order: milestoneOrder } = body;

    if (!title) {
      return NextResponse.json({ error: "里程碑标题不能为空" }, { status: 400 });
    }

    // 验证订单存在
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 获取当前最大顺序
    const maxOrder = await prisma.orderMilestone.findFirst({
      where: { orderId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const milestone = await prisma.orderMilestone.create({
      data: {
        orderId: id,
        title,
        description,
        status: "PENDING",
        order: milestoneOrder ?? (maxOrder?.order ?? 0) + 1,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("创建里程碑失败:", error);
    return NextResponse.json({ error: "创建里程碑失败" }, { status: 500 });
  }
}
