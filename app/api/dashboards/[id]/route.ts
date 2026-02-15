/**
 * 仪表板详情 API
 * GET - 获取仪表板详情
 * DELETE - 删除仪表板
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - 获取仪表板详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        widgets: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!dashboard) {
      return NextResponse.json({ error: "仪表板不存在" }, { status: 404 });
    }

    // 检查权限
    if (!dashboard.isPublic && dashboard.createdBy !== session.user.id) {
      return NextResponse.json({ error: "无权限访问" }, { status: 403 });
    }

    return NextResponse.json({
      dashboard: {
        ...dashboard,
        layout: dashboard.layout ? JSON.parse(dashboard.layout) : [],
        widgets: dashboard.widgets.map((w) => ({
          id: w.id,
          type: w.type.toLowerCase().replace("_", "-"),
          title: w.title,
          config: w.config ? JSON.parse(w.config) : {},
        })),
      },
    });
  } catch (error) {
    console.error("获取仪表板详情失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取失败" },
      { status: 500 }
    );
  }
}

// DELETE - 删除仪表板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return NextResponse.json({ error: "仪表板不存在" }, { status: 404 });
    }

    if (dashboard.createdBy !== session.user.id) {
      return NextResponse.json({ error: "无权限删除" }, { status: 403 });
    }

    // 删除仪表板（级联删除小部件）
    await prisma.dashboard.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除仪表板失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}
