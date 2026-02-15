import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const { serviceId, type, amount } = await request.json();

    if (!serviceId || !type || !amount) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 验证服务是否存在
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({ error: "服务不存在" }, { status: 404 });
    }

    if (service.status !== "ACTIVE") {
      return NextResponse.json({ error: "服务不可用" }, { status: 400 });
    }

    // 验证金额
    if (service.price !== amount) {
      return NextResponse.json({ error: "金额不匹配" }, { status: 400 });
    }

    // 创建购买或投资记录
    if (type === "SERVICE") {
      const purchase = await prisma.purchase.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          amount: amount,
          status: "PENDING",
          paymentMethod: "BALANCE", // 默认支付方式
        }
      });

      // TODO: 这里应该集成真实的支付流程
      // 现在直接标记为已支付
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "PAID",
          paymentId: "DEMO_" + Date.now(),
          purchaseDate: new Date()
        }
      });

      return NextResponse.json({
        message: "购买成功",
        type: "PURCHASE",
        data: purchase
      });

    } else if (type === "INVESTMENT") {
      const investment = await prisma.investment.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          amount: amount,
          status: "ACTIVE",
          returnRate: service.price > 10000 ? 0.15 : 0.10, // 简单的回报率计算
          expectedReturn: amount * (service.price > 10000 ? 1.15 : 1.10),
          investmentDate: new Date(),
          maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 一年后到期
        }
      });

      return NextResponse.json({
        message: "投资成功",
        type: "INVESTMENT",
        data: investment
      });

    } else {
      return NextResponse.json(
        { error: "无效的类型" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("购买/投资失败:", error);
    return NextResponse.json(
      { error: "操作失败，请稍后重试" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}