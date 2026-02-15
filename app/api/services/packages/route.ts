import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/packages - 获取套餐列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const isPopular = searchParams.get("isPopular");

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = "ACTIVE";
    }

    if (isPopular === "true") {
      where.isPopular = true;
    }

    const packages = await prisma.servicePackage.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        category: {
          select: { id: true, name: true, nameEn: true, slug: true },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                basePrice: true,
                minPrice: true,
                maxPrice: true,
              },
            },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    // 解析JSON字段
    const result = packages.map((pkg) => ({
      ...pkg,
      highlights: pkg.highlights ? JSON.parse(pkg.highlights) : [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取套餐列表失败:", error);
    return NextResponse.json(
      { error: "获取套餐列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/services/packages - 创建套餐（管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const {
      categoryId,
      name,
      nameEn,
      slug,
      description,
      originalPrice,
      packagePrice,
      coverImage,
      highlights,
      status,
      isPopular,
      order,
      serviceIds, // 包含的服务ID数组
    } = body;

    if (!name || !nameEn || !slug || !description) {
      return NextResponse.json(
        { error: "名称、英文名称、slug和描述为必填项" },
        { status: 400 }
      );
    }

    if (originalPrice === undefined || packagePrice === undefined) {
      return NextResponse.json(
        { error: "原价和套餐价为必填项" },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existing = await prisma.servicePackage.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "该slug已存在" },
        { status: 400 }
      );
    }

    // 计算节省金额
    const savings = originalPrice - packagePrice;

    const pkg = await prisma.servicePackage.create({
      data: {
        categoryId,
        name,
        nameEn,
        slug,
        description,
        originalPrice,
        packagePrice,
        savings,
        coverImage,
        highlights: highlights ? JSON.stringify(highlights) : null,
        status: status || "ACTIVE",
        isPopular: isPopular || false,
        order: order ?? 0,
      },
    });

    // 如果提供了服务ID，创建关联
    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      await prisma.servicePackageItem.createMany({
        data: serviceIds.map((serviceId: string) => ({
          packageId: pkg.id,
          serviceId,
          quantity: 1,
        })),
      });
    }

    // 返回完整的套餐信息
    const result = await prisma.servicePackage.findUnique({
      where: { id: pkg.id },
      include: {
        category: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("创建套餐失败:", error);
    return NextResponse.json(
      { error: "创建套餐失败" },
      { status: 500 }
    );
  }
}
