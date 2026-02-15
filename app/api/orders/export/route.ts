import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders/export - 导出订单数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate),
      };
    }

    const orders = await prisma.serviceOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        items: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (format === "csv") {
      // 生成 CSV
      const headers = [
        "订单编号",
        "客户姓名",
        "客户邮箱",
        "客户电话",
        "服务项目",
        "小计",
        "折扣",
        "税费",
        "总计",
        "订单状态",
        "支付状态",
        "创建时间",
      ];

      const rows = orders.map((order) => [
        order.orderNumber,
        `${order.client.firstName} ${order.client.lastName}`,
        order.client.email,
        order.client.phone || "",
        order.items.map((i) => i.service?.name || "").join("; "),
        order.subtotal.toString(),
        order.discount.toString(),
        order.tax.toString(),
        order.total.toString(),
        order.status,
        order.paymentStatus,
        new Date(order.createdAt).toLocaleString("zh-CN"),
      ]);

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
          "Content-Disposition": `attachment; filename="orders_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "json") {
      return NextResponse.json({
        exportDate: new Date().toISOString(),
        totalOrders: orders.length,
        orders: orders.map((order) => ({
          orderNumber: order.orderNumber,
          client: {
            name: `${order.client.firstName} ${order.client.lastName}`,
            email: order.client.email,
            phone: order.client.phone,
          },
          items: order.items.map((i) => ({
            service: i.service?.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        })),
      });
    }

    return NextResponse.json({ error: "不支持的导出格式" }, { status: 400 });
  } catch (error) {
    console.error("导出订单失败:", error);
    return NextResponse.json({ error: "导出订单失败" }, { status: 500 });
  }
}
