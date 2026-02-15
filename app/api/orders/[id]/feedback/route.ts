import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/orders/[id]/feedback - 提交订单反馈
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { milestoneId, feedback, rating } = body;

    // 验证订单
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      select: { id: true, clientId: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (order.clientId !== session.user.id) {
      return NextResponse.json({ error: "无权操作此订单" }, { status: 403 });
    }

    // 如果是针对特定里程碑的反馈
    if (milestoneId) {
      const milestone = await prisma.orderMilestone.findFirst({
        where: { id: milestoneId, orderId: id },
      });

      if (!milestone) {
        return NextResponse.json({ error: "里程碑不存在" }, { status: 404 });
      }

      const updatedMilestone = await prisma.orderMilestone.update({
        where: { id: milestoneId },
        data: { feedback },
      });

      return NextResponse.json({
        message: "反馈提交成功",
        milestone: updatedMilestone,
      });
    }

    // 订单整体反馈（更新订单备注）
    const updatedOrder = await prisma.serviceOrder.update({
      where: { id },
      data: {
        clientNote: feedback,
      },
    });

    return NextResponse.json({
      message: "反馈提交成功",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("提交反馈失败:", error);
    return NextResponse.json({ error: "提交反馈失败" }, { status: 500 });
  }
}
