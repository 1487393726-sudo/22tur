import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/categories - 获取所有服务类目
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where = includeInactive ? {} : { isActive: true };

    const categories = await prisma.serviceCategory.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { services: true, packages: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("获取服务类目失败:", error);
    return NextResponse.json(
      { error: "获取服务类目失败" },
      { status: 500 }
    );
  }
}

// POST /api/services/categories - 创建服务类目（管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const { name, nameEn, slug, description, icon, order, isActive } = body;

    if (!name || !nameEn || !slug) {
      return NextResponse.json(
        { error: "名称、英文名称和slug为必填项" },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existing = await prisma.serviceCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "该slug已存在" },
        { status: 400 }
      );
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        nameEn,
        slug,
        description,
        icon,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("创建服务类目失败:", error);
    return NextResponse.json(
      { error: "创建服务类目失败" },
      { status: 500 }
    );
  }
}
