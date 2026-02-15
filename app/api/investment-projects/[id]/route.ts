import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * 获取单个投资项目
 * GET /api/investment-projects/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.investmentProject.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: {
          orderBy: { order: "asc" },
        },
        projectInvestments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { investedAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    // 增加浏览计数
    await prisma.investmentProject.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("获取项目详情错误:", error);
    return NextResponse.json(
      { error: "获取项目详情失败" },
      { status: 500 }
    );
  }
}

/**
 * 更新投资项目
 * PUT /api/investment-projects/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查项目是否存在
    const existingProject = await prisma.investmentProject.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    // 验证权限（仅创建者或管理员可以更新）
    if (
      existingProject.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
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

    // 更新项目
    const project = await prisma.investmentProject.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(investmentAmount && { investmentAmount }),
        ...(expectedReturn && { expectedReturn }),
        ...(duration && { duration }),
        ...(minInvestment !== undefined && { minInvestment }),
        ...(maxInvestment !== undefined && { maxInvestment }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(category !== undefined && { category }),
        ...(riskLevel && { riskLevel }),
        ...(status && { status }),
        ...(developmentDuration !== undefined && { developmentDuration }),
        ...(implementationDuration !== undefined && { implementationDuration }),
        ...(launchDuration !== undefined && { launchDuration }),
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

    return NextResponse.json({
      message: "项目更新成功",
      project,
    });
  } catch (error: any) {
    console.error("更新项目错误:", error);
    return NextResponse.json(
      { error: "更新项目失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除投资项目
 * DELETE /api/investment-projects/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查项目是否存在
    const existingProject = await prisma.investmentProject.findUnique({
      where: { id: params.id },
      include: {
        projectInvestments: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    // 验证权限
    if (
      existingProject.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 检查是否有投资记录
    if (existingProject.projectInvestments.length > 0) {
      return NextResponse.json(
        { error: "该项目已有投资记录，无法删除" },
        { status: 400 }
      );
    }

    // 删除项目（级联删除文件和访问日志）
    await prisma.investmentProject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "项目删除成功",
    });
  } catch (error: any) {
    console.error("删除项目错误:", error);
    return NextResponse.json(
      { error: "删除项目失败" },
      { status: 500 }
    );
  }
}
