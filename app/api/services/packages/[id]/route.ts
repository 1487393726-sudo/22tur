import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/packages/[id] - 获取套餐详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 支持通过ID或slug查询
    const pkg = await prisma.servicePackage.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        items: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "套餐不存在" },
        { status: 404 }
      );
    }

    // 解析JSON字段
    const result = {
      ...pkg,
      highlights: pkg.highlights ? JSON.parse(pkg.highlights) : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取套餐详情失败:", error);
    return NextResponse.json(
      { error: "获取套餐详情失败" },
      { status: 500 }
    );
  }
}

// PUT /api/services/packages/[id] - 更新套餐
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // 检查套餐是否存在
    const existing = await prisma.servicePackage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "套餐不存在" },
        { status: 404 }
      );
    }

    // 如果更新slug，检查是否与其他套餐冲突
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.servicePackage.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "该slug已被使用" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    const fields = [
      "categoryId", "name", "nameEn", "slug", "description",
      "originalPrice", "packagePrice", "coverImage",
      "status", "isPopular", "order"
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // 重新计算节省金额
    if (body.originalPrice !== undefined || body.packagePrice !== undefined) {
      const originalPrice = body.originalPrice ?? existing.originalPrice;
      const packagePrice = body.packagePrice ?? existing.packagePrice;
      updateData.savings = originalPrice - packagePrice;
    }

    // 处理JSON字段
    if (body.highlights !== undefined) {
      updateData.highlights = body.highlights ? JSON.stringify(body.highlights) : null;
    }

    const pkg = await prisma.servicePackage.update({
      where: { id },
      data: updateData,
    });

    // 如果提供了新的服务ID列表，更新关联
    if (body.serviceIds && Array.isArray(body.serviceIds)) {
      // 删除现有关联
      await prisma.servicePackageItem.deleteMany({
        where: { packageId: id },
      });

      // 创建新关联
      if (body.serviceIds.length > 0) {
        await prisma.servicePackageItem.createMany({
          data: body.serviceIds.map((serviceId: string) => ({
            packageId: id,
            serviceId,
            quantity: 1,
          })),
        });
      }
    }

    // 返回完整的套餐信息
    const result = await prisma.servicePackage.findUnique({
      where: { id },
      include: {
        category: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("更新套餐失败:", error);
    return NextResponse.json(
      { error: "更新套餐失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/services/packages/[id] - 删除套餐
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

    // 检查是否有关联的订单
    const ordersCount = await prisma.serviceOrder.count({
      where: { packageId: id },
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: "该套餐已有订单记录，无法删除" },
        { status: 400 }
      );
    }

    // 删除套餐（关联的ServicePackageItem会级联删除）
    await prisma.servicePackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除套餐失败:", error);
    return NextResponse.json(
      { error: "删除套餐失败" },
      { status: 500 }
    );
  }
}
