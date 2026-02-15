import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ReportEngine } from "@/lib/report-engine";

// POST /api/reports/[id]/execute - 执行报表
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 验证会话
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "会话已过期" }, { status: 401 });
    }

    const reportId = params.id;

    // 获取报表配置
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "报表不存在" }, { status: 404 });
    }

    // 检查权限（只能执行自己创建的报表）
    if (report.createdBy !== session.userId) {
      return NextResponse.json({ error: "无权限执行此报表" }, { status: 403 });
    }

    // 执行报表
    const result = await ReportEngine.execute(report.config as any);

    return NextResponse.json({
      message: "报表执行成功",
      result,
    });
  } catch (error) {
    console.error("执行报表失败:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "执行报表失败",
      },
      { status: 500 }
    );
  }
}
