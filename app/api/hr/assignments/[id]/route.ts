import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/hr/assignments/[id] - 获取任务详情
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

    const assignment = await prisma.hRAssignment.findUnique({
      where: { id },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            title: true,
            avatar: true,
            skills: true,
            experience: true,
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    // 检查权限
    if (
      session.user.role !== "ADMIN" &&
      assignment.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "无权查看此任务" }, { status: 403 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("获取任务详情失败:", error);
    return NextResponse.json({ error: "获取任务详情失败" }, { status: 500 });
  }
}

// PUT /api/hr/assignments/[id] - 更新任务状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const assignment = await prisma.hRAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isClient = assignment.clientId === session.user.id;

    if (!isAdmin && !isClient) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const updateData: any = {};

    // 管理员可以更新所有字段
    if (isAdmin) {
      if (body.title) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.status) {
        updateData.status = body.status;
        if (body.status === "COMPLETED") {
          updateData.completedAt = new Date();
        }
      }
      if (body.deliverables) {
        updateData.deliverables =
          typeof body.deliverables === "string"
            ? body.deliverables
            : JSON.stringify(body.deliverables);
      }
      if (body.report) updateData.report = body.report;
    }

    // 客户可以签名确认
    if (isClient && body.clientSignature) {
      updateData.clientSignature = body.clientSignature;
    }

    const updatedAssignment = await prisma.hRAssignment.update({
      where: { id },
      data: updateData,
      include: {
        staff: {
          select: { id: true, name: true, title: true },
        },
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // 如果任务完成，检查人员是否还有其他进行中的任务
    if (body.status === "COMPLETED") {
      const activeAssignments = await prisma.hRAssignment.count({
        where: {
          staffId: assignment.staffId,
          status: "ACTIVE",
        },
      });

      if (activeAssignments === 0) {
        await prisma.hRStaff.update({
          where: { id: assignment.staffId },
          data: { status: "AVAILABLE" },
        });
      }
    }

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("更新任务失败:", error);
    return NextResponse.json({ error: "更新任务失败" }, { status: 500 });
  }
}
