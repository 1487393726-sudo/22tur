import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/client-services/[id] - 获取服务订单详情
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
      include: {
        package: {
          include: {
            category: true,
          },
        },
        items: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        milestones: {
          orderBy: { createdAt: "asc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        contract: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 验证权限：只能查看自己的订单
    if (order.clientId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限查看此订单" }, { status: 403 });
    }

    // 计算进度
    const totalMilestones = order.milestones.length;
    const completedMilestones = order.milestones.filter(
      (m) => m.status === "COMPLETED"
    ).length;
    const progress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    return NextResponse.json({
      ...order,
      progress,
      totalMilestones,
      completedMilestones,
    });
  } catch (error) {
    console.error("获取服务订单详情失败:", error);
    return NextResponse.json(
      { error: "获取服务订单详情失败" },
      { status: 500 }
    );
  }
}
