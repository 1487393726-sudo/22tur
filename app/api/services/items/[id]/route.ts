import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/items/[id] - 获取服务详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 支持通过ID或slug查询
    const service = await prisma.serviceItem.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        options: true,
        cases: {
          where: { isFeatured: true },
          take: 6,
        },
        _count: {
          select: { cases: true, orderItems: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "服务项目不存在" },
        { status: 404 }
      );
    }

    // 解析JSON字段
    const result = {
      ...service,
      gallery: service.gallery ? JSON.parse(service.gallery) : [],
      features: service.features ? JSON.parse(service.features) : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取服务详情失败:", error);
    return NextResponse.json(
      { error: "获取服务详情失败" },
      { status: 500 }
    );
  }
}

// PUT /api/services/items/[id] - 更新服务项目
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

    // 检查服务是否存在
    const existing = await prisma.serviceItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "服务项目不存在" },
        { status: 404 }
      );
    }

    // 如果更新slug，检查是否与其他服务冲突
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.serviceItem.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "该slug已被使用" },
          { status: 400 }
        );
      }
    }

    // 如果更新categoryId，检查类目是否存在
    if (body.categoryId) {
      const category = await prisma.serviceCategory.findUnique({
        where: { id: body.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "服务类目不存在" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    const fields = [
      "categoryId", "name", "nameEn", "slug", "description", "descriptionEn",
      "priceType", "basePrice", "minPrice", "maxPrice", "unit",
      "deliveryDays", "deliveryNote", "coverImage", "status",
      "isPopular", "isFeatured", "order"
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // 处理JSON字段
    if (body.gallery !== undefined) {
      updateData.gallery = body.gallery ? JSON.stringify(body.gallery) : null;
    }
    if (body.features !== undefined) {
      updateData.features = body.features ? JSON.stringify(body.features) : null;
    }

    const service = await prisma.serviceItem.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        options: true,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("更新服务项目失败:", error);
    return NextResponse.json(
      { error: "更新服务项目失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/services/items/[id] - 删除服务项目
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
    const orderItemsCount = await prisma.serviceOrderItem.count({
      where: { serviceId: id },
    });

    if (orderItemsCount > 0) {
      return NextResponse.json(
        { error: "该服务已有订单记录，无法删除" },
        { status: 400 }
      );
    }

    await prisma.serviceItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除服务项目失败:", error);
    return NextResponse.json(
      { error: "删除服务项目失败" },
      { status: 500 }
    );
  }
}
