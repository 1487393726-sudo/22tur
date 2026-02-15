/**
 * 仪表板 API
 * GET - 获取仪表板列表
 * POST - 创建仪表板
 * PUT - 更新仪表板
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - 获取仪表板列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const [dashboards, total] = await Promise.all([
      prisma.dashboard.findMany({
        where: {
          OR: [{ createdBy: session.user.id }, { isPublic: true }],
        },
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true },
          },
          widgets: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.dashboard.count({
        where: {
          OR: [{ createdBy: session.user.id }, { isPublic: true }],
        },
      }),
    ]);

    return NextResponse.json({
      dashboards: dashboards.map((d) => ({
        ...d,
        layout: d.layout ? JSON.parse(d.layout) : [],
        widgetCount: d.widgets.length,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取仪表板列表失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取失败" },
      { status: 500 }
    );
  }
}

// POST - 创建仪表板
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, layout, widgets, isPublic } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }

    // 创建仪表板
    const dashboard = await prisma.dashboard.create({
      data: {
        title: title.trim(),
        description: description || "",
        layout: typeof layout === "string" ? layout : JSON.stringify(layout || []),
        isPublic: isPublic || false,
        createdBy: session.user.id,
      },
    });

    // 创建小部件
    if (widgets && widgets.length > 0) {
      await prisma.dashboardWidget.createMany({
        data: widgets.map((w: any) => ({
          dashboardId: dashboard.id,
          title: w.title,
          type: w.type.toUpperCase().replace("-", "_"),
          config: JSON.stringify(w.config || {}),
          position: 0,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      dashboard: {
        ...dashboard,
        layout: JSON.parse(dashboard.layout),
      },
    });
  } catch (error) {
    console.error("创建仪表板失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}

// PUT - 更新仪表板
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, layout, widgets, isPublic } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少仪表板 ID" }, { status: 400 });
    }

    // 检查权限
    const existing = await prisma.dashboard.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "仪表板不存在" }, { status: 404 });
    }

    if (existing.createdBy !== session.user.id) {
      return NextResponse.json({ error: "无权限修改" }, { status: 403 });
    }

    // 更新仪表板
    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        title: title?.trim() || existing.title,
        description: description ?? existing.description,
        layout: layout
          ? typeof layout === "string"
            ? layout
            : JSON.stringify(layout)
          : existing.layout,
        isPublic: isPublic ?? existing.isPublic,
      },
    });

    // 更新小部件
    if (widgets) {
      // 删除旧小部件
      await prisma.dashboardWidget.deleteMany({
        where: { dashboardId: id },
      });

      // 创建新小部件
      if (widgets.length > 0) {
        await prisma.dashboardWidget.createMany({
          data: widgets.map((w: any, index: number) => ({
            dashboardId: id,
            title: w.title,
            type: w.type.toUpperCase().replace("-", "_"),
            config: JSON.stringify(w.config || {}),
            position: index,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      dashboard: {
        ...dashboard,
        layout: JSON.parse(dashboard.layout),
      },
    });
  } catch (error) {
    console.error("更新仪表板失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}
