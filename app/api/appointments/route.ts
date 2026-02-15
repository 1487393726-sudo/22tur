import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/appointments - 获取预约列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};

    // 非管理员只能看自己的预约
    if (session.user.role !== "ADMIN") {
      where.clientId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    const [appointments, total] = await Promise.all([
      prisma.clientAppointment.findMany({
        where,
        orderBy: { scheduledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.clientAppointment.count({ where }),
    ]);

    return NextResponse.json({
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取预约列表失败:", error);
    return NextResponse.json(
      { error: "获取预约列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - 创建预约
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const { type, serviceId, scheduledAt, duration, topic, notes } = body;

    if (!type || !scheduledAt) {
      return NextResponse.json(
        { error: "预约类型和时间为必填项" },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledAt);

    // 验证预约时间必须是未来时间
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "预约时间必须是未来时间" },
        { status: 400 }
      );
    }

    // 检查时间段是否已被占用
    const appointmentDuration = duration || 60;
    const endTime = new Date(scheduledDate.getTime() + appointmentDuration * 60 * 1000);

    const conflictingAppointment = await prisma.clientAppointment.findFirst({
      where: {
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        OR: [
          {
            // 新预约开始时间在已有预约时间段内
            scheduledAt: {
              lte: scheduledDate,
            },
            AND: {
              scheduledAt: {
                gte: new Date(scheduledDate.getTime() - appointmentDuration * 60 * 1000),
              },
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "该时间段已被预约，请选择其他时间" },
        { status: 409 }
      );
    }

    const appointment = await prisma.clientAppointment.create({
      data: {
        clientId: session.user.id,
        type,
        serviceId,
        scheduledAt: scheduledDate,
        duration: appointmentDuration,
        status: "SCHEDULED",
        topic,
        notes,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("创建预约失败:", error);
    return NextResponse.json(
      { error: "创建预约失败" },
      { status: 500 }
    );
  }
}
