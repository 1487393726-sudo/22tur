import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/client-services/[id]/progress - 获取服务进度详情
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

    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        clientId: true,
        status: true,
        estimatedDelivery: true,
        actualDelivery: true,
        createdAt: true,
        milestones: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            dueDate: true,
            completedAt: true,
            status: true,
            deliverables: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 验证权限
    if (order.clientId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限查看此订单" }, { status: 403 });
    }

    // 计算进度统计
    const totalMilestones = order.milestones.length;
    const completedMilestones = order.milestones.filter(
      (m) => m.status === "COMPLETED"
    ).length;
    const inProgressMilestones = order.milestones.filter(
      (m) => m.status === "IN_PROGRESS"
    ).length;
    const pendingMilestones = order.milestones.filter(
      (m) => m.status === "PENDING"
    ).length;

    const progress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    // 解析交付物
    const milestonesWithDeliverables = order.milestones.map((milestone) => ({
      ...milestone,
      deliverables: milestone.deliverables
        ? JSON.parse(milestone.deliverables)
        : [],
    }));

    // 找到当前里程碑
    const currentMilestone = milestonesWithDeliverables.find(
      (m) => m.status === "IN_PROGRESS"
    ) || milestonesWithDeliverables.find((m) => m.status === "PENDING");

    // 计算预计完成时间
    let estimatedCompletion = order.estimatedDelivery;
    if (!estimatedCompletion && order.milestones.length > 0) {
      const lastMilestone = order.milestones[order.milestones.length - 1];
      estimatedCompletion = lastMilestone.dueDate;
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      progress,
      statistics: {
        total: totalMilestones,
        completed: completedMilestones,
        inProgress: inProgressMilestones,
        pending: pendingMilestones,
      },
      milestones: milestonesWithDeliverables,
      currentMilestone,
      estimatedCompletion,
      actualDelivery: order.actualDelivery,
      startDate: order.createdAt,
    });
  } catch (error) {
    console.error("获取服务进度失败:", error);
    return NextResponse.json(
      { error: "获取服务进度失败" },
      { status: 500 }
    );
  }
}
