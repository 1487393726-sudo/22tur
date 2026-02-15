import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * 获取投资项目列表
 * GET /api/investment-projects
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // 查询项目和总数
    const [projects, total] = await Promise.all([
      prisma.investmentProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              files: true,
              projectInvestments: true,
            },
          },
        },
      }),
      prisma.investmentProject.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("获取项目列表错误:", error);
    return NextResponse.json(
      { error: "获取项目列表失败" },
      { status: 500 }
    );
  }
}

/**
 * 创建投资项目
 * POST /api/investment-projects
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      shortDesc,
      investmentAmount,
      expectedReturn,
      duration,
      minInvestment,
      maxInvestment,
      targetAmount,
      category,
      riskLevel,
      status,
      developmentDuration,
      implementationDuration,
      launchDuration,
    } = body;

    // 验证必填字段
    if (!title || !description || !investmentAmount || !expectedReturn || !duration) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 创建项目
    const project = await prisma.investmentProject.create({
      data: {
        title,
        description,
        shortDesc: shortDesc || null,
        investmentAmount,
        expectedReturn,
        duration,
        minInvestment: minInvestment || null,
        maxInvestment: maxInvestment || null,
        targetAmount: targetAmount || null,
        category: category || null,
        riskLevel: riskLevel || "MEDIUM",
        status: status || "DRAFT",
        createdBy: session.user.id,
        totalRaised: 0,
        investorCount: 0,
        viewCount: 0,
        developmentDuration: developmentDuration || null,
        implementationDuration: implementationDuration || null,
        launchDuration: launchDuration || null,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "项目创建成功",
        project,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("创建项目错误:", error);
    return NextResponse.json(
      { error: "创建项目失败" },
      { status: 500 }
    );
  }
}
