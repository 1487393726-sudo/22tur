import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/hr/assignments - 获取任务分配列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const staffId = searchParams.get("staffId");
    const clientId = searchParams.get("clientId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    // 非管理员只能看自己的任务
    if (session.user.role !== "ADMIN") {
      where.clientId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (staffId) {
      where.staffId = staffId;
    }

    if (clientId && session.user.role === "ADMIN") {
      where.clientId = clientId;
    }

    const [assignments, total] = await Promise.all([
      prisma.hRAssignment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          staff: {
            select: { id: true, name: true, title: true, avatar: true },
          },
          client: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.hRAssignment.count({ where }),
    ]);

    return NextResponse.json({
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取任务列表失败:", error);
    return NextResponse.json({ error: "获取任务列表失败" }, { status: 500 });
  }
}

// POST /api/hr/assignments - 创建任务分配（管理员）
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
      staffId,
      clientId,
      orderId,
      title,
      description,
      taskType,
      startDate,
      endDate,
      duration,
      rate,
      rateType,
      deliverables,
    } = body;

    if (!staffId || !clientId || !title || !startDate || !endDate || !rate || !rateType) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 验证人员存在且可用
    const staff = await prisma.hRStaff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return NextResponse.json({ error: "人员不存在" }, { status: 404 });
    }

    // 计算总金额
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    let totalAmount = 0;

    switch (rateType) {
      case "HOURLY":
        totalAmount = rate * days * 8; // 假设每天8小时
        break;
      case "DAILY":
        totalAmount = rate * days;
        break;
      case "MONTHLY":
        totalAmount = rate * Math.ceil(days / 30);
        break;
      case "FIXED":
        totalAmount = rate;
        break;
      default:
        totalAmount = rate;
    }

    const assignment = await prisma.hRAssignment.create({
      data: {
        staffId,
        clientId,
        orderId: orderId || null,
        title,
        description: description || null,
        taskType: taskType || "STRATEGY",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: duration || "CUSTOM",
        rate,
        rateType,
        totalAmount,
        deliverables: deliverables
          ? typeof deliverables === "string"
            ? deliverables
            : JSON.stringify(deliverables)
          : null,
        status: "ACTIVE",
      },
      include: {
        staff: {
          select: { id: true, name: true, title: true },
        },
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // 更新人员状态为已分配
    await prisma.hRStaff.update({
      where: { id: staffId },
      data: { status: "ASSIGNED" },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("创建任务失败:", error);
    return NextResponse.json({ error: "创建任务失败" }, { status: 500 });
  }
}
