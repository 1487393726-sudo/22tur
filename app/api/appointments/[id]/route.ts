import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/appointments/[id] - 获取预约详情
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

    const appointment = await prisma.clientAppointment.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "预约不存在" }, { status: 404 });
    }

    // 非管理员只能查看自己的预约
    if (session.user.role !== "ADMIN" && appointment.clientId !== session.user.id) {
      return NextResponse.json({ error: "无权限查看此预约" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("获取预约详情失败:", error);
    return NextResponse.json(
      { error: "获取预约详情失败" },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - 修改/取消预约
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
    const { scheduledAt, duration, topic, notes, status, rating, feedback } = body;

    const appointment = await prisma.clientAppointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "预约不存在" }, { status: 404 });
    }

    // 非管理员只能修改自己的预约
    if (session.user.role !== "ADMIN" && appointment.clientId !== session.user.id) {
      return NextResponse.json({ error: "无权限修改此预约" }, { status: 403 });
    }

    // 检查是否可以修改（24小时前）
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledAt);
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // 如果要修改时间或取消，必须在24小时前
    if ((scheduledAt || status === "CANCELLED") && hoursUntilAppointment < 24) {
      // 管理员可以随时修改
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "预约时间24小时内无法修改或取消" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (scheduledAt) {
      const newScheduledAt = new Date(scheduledAt);
      if (newScheduledAt <= now) {
        return NextResponse.json(
          { error: "预约时间必须是未来时间" },
          { status: 400 }
        );
      }
      updateData.scheduledAt = newScheduledAt;
    }

    if (duration !== undefined) {
      updateData.duration = duration;
    }

    if (topic !== undefined) {
      updateData.topic = topic;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status) {
      updateData.status = status;
    }

    // 评价只能在完成后添加
    if (rating !== undefined || feedback !== undefined) {
      if (appointment.status !== "COMPLETED") {
        return NextResponse.json(
          { error: "只能对已完成的预约进行评价" },
          { status: 400 }
        );
      }
      if (rating !== undefined) {
        updateData.rating = rating;
      }
      if (feedback !== undefined) {
        updateData.feedback = feedback;
      }
    }

    const updatedAppointment = await prisma.clientAppointment.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("修改预约失败:", error);
    return NextResponse.json(
      { error: "修改预约失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - 删除预约（仅管理员）
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

    await prisma.clientAppointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除预约失败:", error);
    return NextResponse.json(
      { error: "删除预约失败" },
      { status: 500 }
    );
  }
}
