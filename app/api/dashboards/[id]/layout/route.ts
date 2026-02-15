import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-logger";
import { Layout } from "react-grid-layout";

interface Widget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  title: string;
  config?: Record<string, any>;
}

/**
 * 获取仪表板布局
 * GET /api/dashboards/[id]/layout
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 获取当前用户
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 获取仪表板
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return NextResponse.json(
        { error: "仪表板不存在" },
        { status: 404 }
      );
    }

    // 检查权限
    if (
      dashboard.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "无权访问此仪表板" },
        { status: 403 }
      );
    }

    // 解析布局和小部件
    const layout = dashboard.layout ? JSON.parse(dashboard.layout) : [];
    const widgets = dashboard.widgets ? JSON.parse(dashboard.widgets) : [];

    return NextResponse.json({
      id: dashboard.id,
      name: dashboard.name,
      layout,
      widgets,
      createdAt: dashboard.createdAt,
      updatedAt: dashboard.updatedAt,
    });
  } catch (error) {
    console.error("获取仪表板布局失败:", error);
    return NextResponse.json(
      { error: "获取仪表板布局失败" },
      { status: 500 }
    );
  }
}

/**
 * 保存仪表板布局
 * POST /api/dashboards/[id]/layout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { layout, widgets } = await request.json();

    if (!layout || !widgets) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 获取当前用户
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 获取仪表板
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return NextResponse.json(
        { error: "仪表板不存在" },
        { status: 404 }
      );
    }

    // 检查权限
    if (
      dashboard.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "无权编辑此仪表板" },
        { status: 403 }
      );
    }

    // 验证布局和小部件数据
    if (!Array.isArray(layout) || !Array.isArray(widgets)) {
      return NextResponse.json(
        { error: "无效的布局或小部件数据" },
        { status: 400 }
      );
    }

    // 更新仪表板
    const updated = await prisma.dashboard.update({
      where: { id },
      data: {
        layout: JSON.stringify(layout),
        widgets: JSON.stringify(widgets),
        updatedAt: new Date(),
      },
    });

    // 记录审计日志
    await logAudit({
      action: "DASHBOARD_LAYOUT_SAVED",
      userId: session.user.id,
      resourceId: id,
      resourceType: "Dashboard",
      details: {
        widgetCount: widgets.length,
        layoutItemCount: layout.length,
      },
    });

    return NextResponse.json({
      dashboard: updated,
      message: "仪表板布局已保存",
    });
  } catch (error) {
    console.error("保存仪表板布局失败:", error);
    return NextResponse.json(
      { error: "保存仪表板布局失败" },
      { status: 500 }
    );
  }
}
