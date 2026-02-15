import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/cases/[id] - 获取案例详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const serviceCase = await prisma.serviceCase.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!serviceCase) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    return NextResponse.json(serviceCase);
  } catch (error) {
    console.error("获取案例详情失败:", error);
    return NextResponse.json({ error: "获取案例详情失败" }, { status: 500 });
  }
}

// PUT /api/services/cases/[id] - 更新案例
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const serviceCase = await prisma.serviceCase.findUnique({
      where: { id },
    });

    if (!serviceCase) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    if (body.titleEn !== undefined) updateData.titleEn = body.titleEn;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.images !== undefined) {
      updateData.images = body.images
        ? typeof body.images === "string"
          ? body.images
          : JSON.stringify(body.images)
        : null;
    }
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.clientName !== undefined) updateData.clientName = body.clientName;
    if (body.completedAt !== undefined) {
      updateData.completedAt = body.completedAt ? new Date(body.completedAt) : null;
    }
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    const updatedCase = await prisma.serviceCase.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("更新案例失败:", error);
    return NextResponse.json({ error: "更新案例失败" }, { status: 500 });
  }
}

// DELETE /api/services/cases/[id] - 删除案例
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.serviceCase.delete({
      where: { id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除案例失败:", error);
    return NextResponse.json({ error: "删除案例失败" }, { status: 500 });
  }
}
