import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/categories/[id] - 获取单个服务类目
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        services: {
          where: { status: "ACTIVE" },
          orderBy: { order: "asc" },
        },
        packages: {
          where: { status: "ACTIVE" },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "服务类目不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("获取服务类目失败:", error);
    return NextResponse.json(
      { error: "获取服务类目失败" },
      { status: 500 }
    );
  }
}

// PUT /api/services/categories/[id] - 更新服务类目
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
    const { name, nameEn, slug, description, icon, order, isActive } = body;

    // 检查类目是否存在
    const existing = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "服务类目不存在" },
        { status: 404 }
      );
    }

    // 如果更新slug，检查是否与其他类目冲突
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.serviceCategory.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "该slug已被使用" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameEn && { nameEn }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("更新服务类目失败:", error);
    return NextResponse.json(
      { error: "更新服务类目失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/services/categories/[id] - 删除服务类目
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

    // 检查是否有关联的服务
    const servicesCount = await prisma.serviceItem.count({
      where: { categoryId: id },
    });

    if (servicesCount > 0) {
      return NextResponse.json(
        { error: "该类目下还有服务项目，无法删除" },
        { status: 400 }
      );
    }

    await prisma.serviceCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除服务类目失败:", error);
    return NextResponse.json(
      { error: "删除服务类目失败" },
      { status: 500 }
    );
  }
}
