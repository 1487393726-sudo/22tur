import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/client-services - 获取用户已购服务列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {
      clientId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          package: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              slug: true,
              coverImage: true,
            },
          },
          items: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  nameEn: true,
                  coverImage: true,
                },
              },
            },
          },
          milestones: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    // 计算每个订单的进度
    const ordersWithProgress = orders.map((order) => {
      const totalMilestones = order.milestones.length;
      const completedMilestones = order.milestones.filter(
        (m) => m.status === "COMPLETED"
      ).length;
      const progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        progress,
        totalMilestones,
        completedMilestones,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        createdAt: order.createdAt,
        package: order.package,
        services: order.items.map((item) => ({
          id: item.service.id,
          name: item.service.name,
          nameEn: item.service.nameEn,
          coverImage: item.service.coverImage,
          quantity: item.quantity,
        })),
        currentMilestone: order.milestones.find(
          (m) => m.status === "IN_PROGRESS"
        ) || order.milestones.find((m) => m.status === "PENDING"),
      };
    });

    return NextResponse.json({
      data: ordersWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取客户服务列表失败:", error);
    return NextResponse.json(
      { error: "获取客户服务列表失败" },
      { status: 500 }
    );
  }
}
