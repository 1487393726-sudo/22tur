import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/cases - 获取案例列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { isActive: true };

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (categoryId) {
      where.service = {
        categoryId,
      };
    }

    const [cases, total] = await Promise.all([
      prisma.serviceCase.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          service: {
            select: { id: true, name: true, nameEn: true },
          },
        },
      }),
      prisma.serviceCase.count({ where }),
    ]);

    return NextResponse.json({
      data: cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取案例列表失败:", error);
    return NextResponse.json({ error: "获取案例列表失败" }, { status: 500 });
  }
}

// POST /api/services/cases - 创建案例（管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const body = await request.json();
    const {
      serviceId,
      title,
      titleEn,
      description,
      descriptionEn,
      coverImage,
      images,
      videoUrl,
      clientName,
      completedAt,
      isFeatured,
      sortOrder,
    } = body;

    if (!serviceId || !title) {
      return NextResponse.json(
        { error: "服务ID和标题为必填项" },
        { status: 400 }
      );
    }

    // 验证服务存在
    const service = await prisma.serviceItem.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "服务不存在" }, { status: 404 });
    }

    const serviceCase = await prisma.serviceCase.create({
      data: {
        serviceId,
        title,
        titleEn: titleEn || null,
        description: description || null,
        descriptionEn: descriptionEn || null,
        coverImage: coverImage || null,
        images: images ? (typeof images === "string" ? images : JSON.stringify(images)) : null,
        videoUrl: videoUrl || null,
        clientName: clientName || null,
        completedAt: completedAt ? new Date(completedAt) : null,
        isFeatured: isFeatured || false,
        isActive: true,
        sortOrder: sortOrder || 0,
      },
      include: {
        service: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(serviceCase, { status: 201 });
  } catch (error) {
    console.error("创建案例失败:", error);
    return NextResponse.json({ error: "创建案例失败" }, { status: 500 });
  }
}
