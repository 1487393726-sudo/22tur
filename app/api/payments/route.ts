import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-logger";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

/**
 * 获取支付历史
 * GET /api/payments
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // 获取当前用户
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 构建查询条件
    const where: any = {};

    if (userId) {
      // 只能查看自己的支付或管理员查看所有
      if (session.user.id !== userId && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "无权查看此用户的支付记录" },
          { status: 403 }
        );
      }
      where.userId = userId;
    } else {
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    // 获取总数
    const total = await prisma.paymentTransaction.count({ where });

    // 获取分页数据
    const payments = await prisma.paymentTransaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取支付历史失败:", error);
    return NextResponse.json(
      { error: "获取支付历史失败" },
      { status: 500 }
    );
  }
}

/**
 * 创建支付意图
 * POST /api/payments/create-intent
 */
export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency,
      description,
      investmentId,
      email,
      name,
    } = await request.json();

    // 验证输入
    if (!amount || amount <= 0 || !investmentId) {
      return NextResponse.json(
        { error: "无效的支付信息" },
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

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "投资记录不存在" },
        { status: 404 }
      );
    }

    // 检查权限
    if (investment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权支付此投资" },
        { status: 403 }
      );
    }

    // 检查投资状态
    if (investment.status !== "PENDING") {
      return NextResponse.json(
        { error: "投资已支付或已取消" },
        { status: 400 }
      );
    }

    // 创建 Stripe 支付意图
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency || "cny",
      description: description || `投资项目 - ${investmentId}`,
      metadata: {
        investmentId,
        userId: session.user.id,
      },
      receipt_email: email,
    });

    // 保存支付记录
    const payment = await prisma.paymentTransaction.create({
      data: {
        userId: session.user.id,
        amount: amount / 100, // 转换回元
        currency: currency || "cny",
        status: "PENDING",
        paymentGateway: "STRIPE",
        transactionId: paymentIntent.id,
        description,
        metadata: {
          investmentId,
          email,
          name,
        },
      },
    });

    // 记录审计日志
    await logAudit({
      action: "PAYMENT_INTENT_CREATED",
      userId: session.user.id,
      resourceId: payment.id,
      resourceType: "PaymentTransaction",
      details: {
        amount,
        currency,
        investmentId,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("创建支付意图失败:", error);
    return NextResponse.json(
      { error: "创建支付意图失败" },
      { status: 500 }
    );
  }
}
