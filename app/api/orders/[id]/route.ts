import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 有效的状态转换
const validStatusTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

// GET /api/orders/[id] - 获取订单详情
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
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        package: true,
        items: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        contract: true,
        milestones: {
          orderBy: { createdAt: "asc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 非管理员只能查看自己的订单
    if (session.user.role !== "ADMIN" && order.clientId !== session.user.id) {
      return NextResponse.json({ error: "无权限查看此订单" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("获取订单详情失败:", error);
    return NextResponse.json(
      { error: "获取订单详情失败" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - 更新订单状态
export async function PUT(
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
    const { status, paymentStatus, internalNote, estimatedDelivery } = body;

    // 获取当前订单
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 非管理员只能取消自己的待处理订单
    if (session.user.role !== "ADMIN") {
      if (order.clientId !== session.user.id) {
        return NextResponse.json({ error: "无权限修改此订单" }, { status: 403 });
      }
      // 客户只能取消待处理的订单
      if (status && status !== "CANCELLED") {
        return NextResponse.json(
          { error: "您只能取消订单" },
          { status: 403 }
        );
      }
      if (status === "CANCELLED" && order.status !== "PENDING") {
        return NextResponse.json(
          { error: "只能取消待处理的订单" },
          { status: 400 }
        );
      }
    }

    // 验证状态转换
    if (status && status !== order.status) {
      const allowedTransitions = validStatusTransitions[order.status] || [];
      if (!allowedTransitions.includes(status)) {
        return NextResponse.json(
          { error: `无法从 ${order.status} 转换到 ${status}` },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === "COMPLETED") {
        updateData.actualDelivery = new Date();
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (internalNote !== undefined) {
      updateData.internalNote = internalNote;
    }

    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    const updatedOrder = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            service: true,
          },
        },
        milestones: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("更新订单失败:", error);
    return NextResponse.json(
      { error: "更新订单失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - 删除订单（仅管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 只能删除已取消的订单
    if (order.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "只能删除已取消的订单" },
        { status: 400 }
      );
    }

    await prisma.serviceOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除订单失败:", error);
    return NextResponse.json(
      { error: "删除订单失败" },
      { status: 500 }
    );
  }
}
