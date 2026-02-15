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
 * 确认支付
 * POST /api/payments/confirm
 */
export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, paymentId } = await request.json();

    if (!paymentIntentId || !paymentId) {
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

    // 获取支付记录
    const payment = await prisma.paymentTransaction.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "支付记录不存在" },
        { status: 404 }
      );
    }

    // 检查权限
    if (payment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权确认此支付" },
        { status: 403 }
      );
    }

    // 从 Stripe 获取支付意图状态
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: "支付意图不存在" },
        { status: 404 }
      );
    }

    // 更新支付记录状态
    let paymentStatus = "FAILED";
    if (paymentIntent.status === "succeeded") {
      paymentStatus = "COMPLETED";
    } else if (paymentIntent.status === "processing") {
      paymentStatus = "PROCESSING";
    } else if (paymentIntent.status === "requires_payment_method") {
      paymentStatus = "PENDING";
    }

    const updatedPayment = await prisma.paymentTransaction.update({
      where: { id: paymentId },
      data: {
        status: paymentStatus,
        transactionId: paymentIntentId,
      },
    });

    // 如果支付成功，更新投资记录
    if (paymentStatus === "COMPLETED") {
      const investmentId = (payment.metadata as any)?.investmentId;

      if (investmentId) {
        await prisma.projectInvestment.update({
          where: { id: investmentId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        // 记录审计日志
        await logAudit({
          action: "INVESTMENT_COMPLETED",
          userId: session.user.id,
          resourceId: investmentId,
          resourceType: "ProjectInvestment",
          details: {
            paymentId,
            amount: payment.amount,
            paymentIntentId,
          },
        });
      }
    }

    // 记录审计日志
    await logAudit({
      action: "PAYMENT_CONFIRMED",
      userId: session.user.id,
      resourceId: paymentId,
      resourceType: "PaymentTransaction",
      details: {
        status: paymentStatus,
        paymentIntentId,
        stripeStatus: paymentIntent.status,
      },
    });

    return NextResponse.json({
      payment: updatedPayment,
      status: paymentStatus,
      message:
        paymentStatus === "COMPLETED"
          ? "支付成功，投资已完成"
          : "支付处理中，请稍候",
    });
  } catch (error) {
    console.error("确认支付失败:", error);
    return NextResponse.json(
      { error: "确认支付失败" },
      { status: 500 }
    );
  }
}
