import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 生成合同号
function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SC${year}${month}${day}${random}`;
}

// 生成合同内容
function generateContractContent(order: any): string {
  const items = order.items
    .map(
      (item: any) =>
        `- ${item.service?.name || "服务项目"}: ¥${item.unitPrice} x ${item.quantity}`
    )
    .join("\n");

  return `
服务合同

甲方（服务提供方）：[公司名称]
乙方（客户）：${order.client?.firstName || ""} ${order.client?.lastName || ""}

一、服务内容
${items}

二、服务费用
小计：¥${order.subtotal}
折扣：¥${order.discount || 0}
税费：¥${order.tax || 0}
总计：¥${order.total}

三、付款方式
乙方应在合同签署后 7 个工作日内支付全部服务费用。

四、服务期限
自合同签署之日起生效，至服务完成之日止。

五、双方权利义务
1. 甲方应按照约定提供服务，保证服务质量。
2. 乙方应按时支付服务费用，配合甲方完成服务。

六、违约责任
任何一方违反本合同约定，应承担相应的违约责任。

七、争议解决
本合同的解释和执行均适用中华人民共和国法律。

订单编号：${order.orderNumber}
合同生成日期：${new Date().toLocaleDateString("zh-CN")}
`.trim();
}

// GET /api/contracts - 获取合同列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};

    // 非管理员只能看自己的合同
    if (session.user.role !== "ADMIN") {
      where.order = {
        clientId: session.user.id,
      };
    }

    if (status) {
      where.status = status;
    }

    const [contracts, total] = await Promise.all([
      prisma.serviceContract.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              client: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      }),
      prisma.serviceContract.count({ where }),
    ]);

    return NextResponse.json({
      data: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取合同列表失败:", error);
    return NextResponse.json({ error: "获取合同列表失败" }, { status: 500 });
  }
}

// POST /api/contracts - 创建合同（基于订单自动生成）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, title } = body;

    if (!orderId) {
      return NextResponse.json({ error: "订单ID不能为空" }, { status: 400 });
    }

    // 获取订单信息
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            service: {
              select: { id: true, name: true, nameEn: true },
            },
          },
        },
        package: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查权限
    if (session.user.role !== "ADMIN" && order.clientId !== session.user.id) {
      return NextResponse.json({ error: "无权操作此订单" }, { status: 403 });
    }

    // 检查是否已有合同
    const existingContract = await prisma.serviceContract.findUnique({
      where: { orderId },
    });

    if (existingContract) {
      return NextResponse.json(
        { error: "该订单已有合同", contract: existingContract },
        { status: 400 }
      );
    }

    // 生成合同内容
    const content = generateContractContent(order);
    const terms = JSON.stringify([
      "服务内容以订单详情为准",
      "付款后 7 个工作日内开始服务",
      "服务完成后提供验收报告",
      "质保期为服务完成后 30 天",
    ]);

    // 创建合同
    const contract = await prisma.serviceContract.create({
      data: {
        contractNumber: generateContractNumber(),
        orderId,
        title: title || `服务合同 - ${order.orderNumber}`,
        content,
        terms,
        status: "PENDING_CLIENT",
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            client: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error("创建合同失败:", error);
    return NextResponse.json({ error: "创建合同失败" }, { status: 500 });
  }
}
