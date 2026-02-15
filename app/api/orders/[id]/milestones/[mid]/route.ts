import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/orders/[id]/milestones/[mid] - 更新里程碑
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id, mid } = await params;
    const body = await request.json();

    // 验证订单和里程碑
    const milestone = await prisma.orderMilestone.findFirst({
      where: { id: mid, orderId: id },
      include: {
        order: {
          select: { clientId: true },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: "里程碑不存在" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isClient = milestone.order.clientId === session.user.id;

    if (!isAdmin && !isClient) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const updateData: any = {};

    // 管理员可以更新所有字段
    if (isAdmin) {
      if (body.title) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.status) {
        updateData.status = body.status;
        if (body.status === "COMPLETED") {
          updateData.completedAt = new Date();
        }
      }
      if (body.dueDate) updateData.dueDate = new Date(body.dueDate);
      if (body.order !== undefined) updateData.order = body.order;
      if (body.deliverables) updateData.deliverables = body.deliverables;
    }

    // 客户只能提交反馈
    if (isClient && body.feedback) {
      updateData.feedback = body.feedback;
    }

    const updatedMilestone = await prisma.orderMilestone.update({
      where: { id: mid },
      data: updateData,
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error("更新里程碑失败:", error);
    return NextResponse.json({ error: "更新里程碑失败" }, { status: 500 });
  }
}

// DELETE /api/orders/[id]/milestones/[mid] - 删除里程碑（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id, mid } = await params;

    const milestone = await prisma.orderMilestone.findFirst({
      where: { id: mid, orderId: id },
    });

    if (!milestone) {
      return NextResponse.json({ error: "里程碑不存在" }, { status: 404 });
    }

    await prisma.orderMilestone.delete({
      where: { id: mid },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除里程碑失败:", error);
    return NextResponse.json({ error: "删除里程碑失败" }, { status: 500 });
  }
}
