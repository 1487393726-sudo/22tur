import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/hr/staff/[id] - 获取人员详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;

    const staff = await prisma.hRStaff.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            client: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "人员不存在" }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error("获取人员详情失败:", error);
    return NextResponse.json({ error: "获取人员详情失败" }, { status: 500 });
  }
}

// PUT /api/hr/staff/[id] - 更新人员信息
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

    const staff = await prisma.hRStaff.findUnique({
      where: { id },
    });

    if (!staff) {
      return NextResponse.json({ error: "人员不存在" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.title) updateData.title = body.title;
    if (body.skills) {
      updateData.skills =
        typeof body.skills === "string" ? body.skills : JSON.stringify(body.skills);
    }
    if (body.experience !== undefined) updateData.experience = body.experience;
    if (body.certifications !== undefined) {
      updateData.certifications = body.certifications
        ? typeof body.certifications === "string"
          ? body.certifications
          : JSON.stringify(body.certifications)
        : null;
    }
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.hourlyRate !== undefined) updateData.hourlyRate = body.hourlyRate;
    if (body.dailyRate !== undefined) updateData.dailyRate = body.dailyRate;
    if (body.monthlyRate !== undefined) updateData.monthlyRate = body.monthlyRate;
    if (body.status) updateData.status = body.status;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.portfolio !== undefined) {
      updateData.portfolio = body.portfolio
        ? typeof body.portfolio === "string"
          ? body.portfolio
          : JSON.stringify(body.portfolio)
        : null;
    }

    const updatedStaff = await prisma.hRStaff.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error("更新人员失败:", error);
    return NextResponse.json({ error: "更新人员失败" }, { status: 500 });
  }
}

// DELETE /api/hr/staff/[id] - 删除人员
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

    // 检查是否有进行中的任务
    const activeAssignments = await prisma.hRAssignment.count({
      where: { staffId: id, status: "ACTIVE" },
    });

    if (activeAssignments > 0) {
      return NextResponse.json(
        { error: "该人员有进行中的任务，无法删除" },
        { status: 400 }
      );
    }

    await prisma.hRStaff.delete({
      where: { id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除人员失败:", error);
    return NextResponse.json({ error: "删除人员失败" }, { status: 500 });
  }
}
