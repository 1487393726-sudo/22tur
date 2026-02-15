import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/hr/staff - 获取人员列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const skill = searchParams.get("skill");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (skill) {
      where.skills = {
        contains: skill,
      };
    }

    const [staff, total] = await Promise.all([
      prisma.hRStaff.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          _count: {
            select: { assignments: true },
          },
        },
      }),
      prisma.hRStaff.count({ where }),
    ]);

    return NextResponse.json({
      data: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取人员列表失败:", error);
    return NextResponse.json({ error: "获取人员列表失败" }, { status: 500 });
  }
}

// POST /api/hr/staff - 创建人员（管理员）
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
      userId,
      name,
      title,
      skills,
      experience,
      certifications,
      bio,
      hourlyRate,
      dailyRate,
      monthlyRate,
      avatar,
      portfolio,
    } = body;

    if (!name || !title || !skills) {
      return NextResponse.json(
        { error: "姓名、职位和技能为必填项" },
        { status: 400 }
      );
    }

    const staff = await prisma.hRStaff.create({
      data: {
        userId: userId || null,
        name,
        title,
        skills: typeof skills === "string" ? skills : JSON.stringify(skills),
        experience: experience || 0,
        certifications: certifications
          ? typeof certifications === "string"
            ? certifications
            : JSON.stringify(certifications)
          : null,
        bio,
        hourlyRate,
        dailyRate,
        monthlyRate,
        avatar,
        portfolio: portfolio
          ? typeof portfolio === "string"
            ? portfolio
            : JSON.stringify(portfolio)
          : null,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("创建人员失败:", error);
    return NextResponse.json({ error: "创建人员失败" }, { status: 500 });
  }
}
