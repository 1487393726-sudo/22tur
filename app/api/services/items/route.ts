import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/items - 获取服务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const categorySlug = searchParams.get("categorySlug");
    const status = searchParams.get("status");
    const isPopular = searchParams.get("isPopular");
    const isFeatured = searchParams.get("isFeatured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    // 按类目ID过滤
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 按类目slug过滤
    if (categorySlug) {
      const category = await prisma.serviceCategory.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    // 按状态过滤
    if (status) {
      where.status = status;
    } else {
      where.status = "ACTIVE";
    }

    // 按热门过滤
    if (isPopular === "true") {
      where.isPopular = true;
    }

    // 按推荐过滤
    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    const [services, total] = await Promise.all([
      prisma.serviceItem.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, nameEn: true, slug: true },
          },
          options: true,
          _count: {
            select: { cases: true, orderItems: true },
          },
        },
      }),
      prisma.serviceItem.count({ where }),
    ]);

    return NextResponse.json({
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取服务列表失败:", error);
    return NextResponse.json(
      { error: "获取服务列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/services/items - 创建服务项目（管理员）
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
      descriptionEn,
      priceType,
      basePrice,
      minPrice,
      maxPrice,
      unit,
      deliveryDays,
      deliveryNote,
      coverImage,
      gallery,
      features,
      status,
      isPopular,
      isFeatured,
      order,
    } = body;

    if (!categoryId || !name || !nameEn || !slug || !description) {
      return NextResponse.json(
        { error: "类目ID、名称、英文名称、slug和描述为必填项" },
        { status: 400 }
      );
    }

    // 检查类目是否存在
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "服务类目不存在" },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existing = await prisma.serviceItem.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "该slug已存在" },
        { status: 400 }
      );
    }

    const service = await prisma.serviceItem.create({
      data: {
        categoryId,
        name,
        nameEn,
        slug,
        description,
        descriptionEn,
        priceType: priceType || "FIXED",
        basePrice,
        minPrice,
        maxPrice,
        unit,
        deliveryDays,
        deliveryNote,
        coverImage,
        gallery: gallery ? JSON.stringify(gallery) : null,
        features: features ? JSON.stringify(features) : null,
        status: status || "ACTIVE",
        isPopular: isPopular || false,
        isFeatured: isFeatured || false,
        order: order ?? 0,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("创建服务项目失败:", error);
    return NextResponse.json(
      { error: "创建服务项目失败" },
      { status: 500 }
    );
  }
}
