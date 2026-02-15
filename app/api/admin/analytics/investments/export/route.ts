/**
 * 投资数据导出 API
 *
 * GET /api/admin/analytics/investments/export - 导出投资数据
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    // 构建查询条件
    const where: any = {};
    if (startDate && endDate) {
      where.investedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (status) {
      where.status = status;
    }
    if (projectId) {
      where.projectId = projectId;
    }

    // 获取投资数据
    const investments = await prisma.projectInvestment.findMany({
      where,
      orderBy: { investedAt: "desc" },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        project: {
          select: { title: true },
        },
      },
    });

    if (format === "csv") {
      return exportCSV(investments);
    } else if (format === "json") {
      return exportJSON(investments);
    } else {
      return NextResponse.json({ error: "不支持的导出格式" }, { status: 400 });
    }
  } catch (error) {
    console.error("导出投资数据失败:", error);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}

// 导出 CSV
function exportCSV(investments: any[]) {
  const headers = [
    "投资ID",
    "投资者姓名",
    "投资者邮箱",
    "项目名称",
    "投资金额",
    "状态",
    "支付方式",
    "投资时间",
    "完成时间",
    "退款金额",
    "退款原因",
  ];

  const rows = investments.map((inv) => [
    inv.id,
    `${inv.user.firstName} ${inv.user.lastName}`,
    inv.user.email,
    inv.project.title,
    inv.amount,
    getStatusLabel(inv.status),
    inv.paymentMethod || "",
    formatDate(inv.investedAt),
    inv.completedAt ? formatDate(inv.completedAt) : "",
    inv.refundAmount || "",
    inv.refundReason || "",
  ]);

  // 生成 CSV 内容
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // 添加 BOM 以支持中文
  const bom = "\uFEFF";
  const csvWithBom = bom + csvContent;

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="investments_${formatDateForFilename(new Date())}.csv"`,
    },
  });
}

// 导出 JSON
function exportJSON(investments: any[]) {
  const data = investments.map((inv) => ({
    id: inv.id,
    investor: {
      name: `${inv.user.firstName} ${inv.user.lastName}`,
      email: inv.user.email,
    },
    project: inv.project.title,
    amount: inv.amount,
    status: inv.status,
    statusLabel: getStatusLabel(inv.status),
    paymentMethod: inv.paymentMethod,
    investedAt: inv.investedAt,
    completedAt: inv.completedAt,
    refundAmount: inv.refundAmount,
    refundReason: inv.refundReason,
  }));

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="investments_${formatDateForFilename(new Date())}.json"`,
    },
  });
}

// 状态标签
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "待支付",
    COMPLETED: "已完成",
    REFUNDED: "已退款",
    FAILED: "失败",
  };
  return labels[status] || status;
}

// 格式化日期
function formatDate(date: Date): string {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 格式化日期用于文件名
function formatDateForFilename(date: Date): string {
  return date.toISOString().split("T")[0];
}
