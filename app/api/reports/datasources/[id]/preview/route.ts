import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reports/datasources/[id]/preview
 * 获取数据源的预览数据（前10条记录）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: datasourceId } = await params;
    const { searchParams } = new URL(request.url);
    const fieldsParam = searchParams.get("fields");
    const fields = fieldsParam ? fieldsParam.split(",") : [];

    // 根据数据源ID查询数据
    let data: any[] = [];
    let total = 0;

    switch (datasourceId) {
      case "users":
        const selectFields = fields.length > 0 ? buildSelectObject(fields) : undefined;
        data = await prisma.user.findMany({
          take: 10,
          select: selectFields || {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            departmentId: true,
            position: true,
            createdAt: true,
          },
        });
        total = await prisma.user.count();
        break;

      case "projects":
        data = await prisma.project.findMany({
          take: 10,
          select: fields.length > 0 ? buildSelectObject(fields) : {
            id: true,
            name: true,
            description: true,
            status: true,
            budget: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
        });
        total = await prisma.project.count();
        break;

      case "tasks":
        data = await prisma.task.findMany({
          take: 10,
          select: fields.length > 0 ? buildSelectObject(fields) : {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            createdAt: true,
          },
        });
        total = await prisma.task.count();
        break;

      case "invoices":
        data = await prisma.invoice.findMany({
          take: 10,
          select: fields.length > 0 ? buildSelectObject(fields) : {
            id: true,
            number: true,
            status: true,
            amount: true,
            dueDate: true,
            paidAt: true,
            createdAt: true,
          },
        });
        total = await prisma.invoice.count();
        break;

      case "timeEntries":
        // timeEntry 模型不存在，返回空数据
        data = [];
        total = 0;
        break;

      default:
        return NextResponse.json({ error: "无效的数据源" }, { status: 400 });
    }

    return NextResponse.json({
      data,
      total,
      preview: data.length,
    });
  } catch (error) {
    console.error("获取数据预览失败:", error);
    return NextResponse.json({ error: "获取数据预览失败" }, { status: 500 });
  }
}

// 辅助函数：构建 Prisma select 对象
function buildSelectObject(fields: string[]): Record<string, boolean> {
  const select: Record<string, boolean> = {};
  fields.forEach((field) => {
    select[field] = true;
  });
  return select;
}
