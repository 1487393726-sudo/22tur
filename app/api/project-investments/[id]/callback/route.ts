/**
 * 投资支付回调 API
 *
 * POST /api/project-investments/[id]/callback
 *
 * 功能：
 * - 接收支付平台的回调通知
 * - 验证支付签名
 * - 更新投资状态为 COMPLETED
 * - 更新项目统计（募集金额、投资人数）
 * - 解锁项目文件访问权限
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// 验证 Stripe 签名
function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// 验证支付宝签名（简化版）
function verifyAlipaySignature(data: any, sign: string): boolean {
  // TODO: 实现支付宝签名验证
  // 开发环境跳过验证
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return false;
}

// 验证微信支付签名（简化版）
function verifyWechatSignature(data: any, sign: string): boolean {
  // TODO: 实现微信支付签名验证
  // 开发环境跳过验证
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return false;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: investmentId } = await params;
    const body = await request.json();

    console.log("📥 收到投资支付回调:", { investmentId, body });

    const {
      status,
      transactionId,
      platformTransactionId,
      amount,
      sign,
      paidAt,
      failureReason,
    } = body;

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id: investmentId },
      include: {
        project: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json({ error: "投资记录不存在" }, { status: 404 });
    }

    // 验证交易ID
    if (transactionId && investment.transactionId !== transactionId) {
      return NextResponse.json({ error: "交易ID不匹配" }, { status: 400 });
    }

    // 验证金额
    if (amount && Math.abs(investment.amount - amount) > 0.01) {
      return NextResponse.json({ error: "金额不匹配" }, { status: 400 });
    }

    // 验证签名（根据支付网关类型）
    if (sign) {
      let isValidSign = false;
      switch (investment.paymentGateway) {
        case "stripe":
          const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
          if (stripeSecret) {
            isValidSign = verifyStripeSignature(
              JSON.stringify(body),
              sign,
              stripeSecret
            );
          }
          break;
        case "alipay":
          isValidSign = verifyAlipaySignature(body, sign);
          break;
        case "wechat":
          isValidSign = verifyWechatSignature(body, sign);
          break;
        default:
          // 开发环境跳过验证
          isValidSign = process.env.NODE_ENV === "development";
      }

      if (!isValidSign) {
        console.error("❌ 签名验证失败");
        return NextResponse.json({ error: "签名验证失败" }, { status: 400 });
      }
    }

    // 检查投资状态（防止重复处理）
    if (investment.status !== "PENDING") {
      console.warn("⚠️ 投资已处理，当前状态:", investment.status);
      return NextResponse.json({
        success: true,
        message: "投资已处理",
        status: investment.status,
      });
    }

    // 根据支付状态处理
    if (status === "SUCCESS" || status === "COMPLETED") {
      // 支付成功
      await handlePaymentSuccess(investment, platformTransactionId, paidAt);
    } else if (status === "FAILED") {
      // 支付失败
      await handlePaymentFailure(investment, failureReason);
    } else if (status === "REFUNDED") {
      // 退款
      await handlePaymentRefund(investment, body.refundAmount, body.refundReason);
    }

    return NextResponse.json({
      success: true,
      message: "回调处理成功",
    });
  } catch (error) {
    console.error("❌ 处理投资支付回调失败:", error);
    return NextResponse.json(
      { error: "处理回调失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 处理支付成功
async function handlePaymentSuccess(
  investment: any,
  platformTransactionId?: string,
  paidAt?: string
) {
  console.log("✅ 处理支付成功:", investment.id);

  // 使用事务确保数据一致性
  await prisma.$transaction(async (tx) => {
    // 1. 更新投资状态
    await tx.projectInvestment.update({
      where: { id: investment.id },
      data: {
        status: "COMPLETED",
        completedAt: paidAt ? new Date(paidAt) : new Date(),
        transactionId: platformTransactionId || investment.transactionId,
      },
    });

    // 2. 更新项目统计
    await tx.investmentProject.update({
      where: { id: investment.projectId },
      data: {
        totalRaised: { increment: investment.amount },
        investorCount: { increment: 1 },
      },
    });

    // 3. 更新支付交易记录
    await tx.paymentTransaction.updateMany({
      where: { orderId: investment.id },
      data: {
        status: "SUCCESS",
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        transactionId: platformTransactionId,
      },
    });

    // 4. 创建财务记录
    await tx.financialRecord.create({
      data: {
        userId: investment.userId,
        type: "PAYMENT",
        title: `投资项目: ${investment.project.title}`,
        amount: investment.amount,
        status: "COMPLETED",
        description: `成功投资项目「${investment.project.title}」，金额 ¥${investment.amount.toLocaleString()}`,
        metadata: JSON.stringify({
          type: "PROJECT_INVESTMENT",
          investmentId: investment.id,
          projectId: investment.projectId,
          projectTitle: investment.project.title,
        }),
      },
    });

    // 5. 创建通知
    await tx.notification.create({
      data: {
        userId: investment.userId,
        title: "投资成功",
        message: `您已成功投资项目「${investment.project.title}」，金额 ¥${investment.amount.toLocaleString()}。项目文件已解锁，您可以随时查看。`,
        type: "SUCCESS",
        priority: "HIGH",
        actionUrl: `/investments/${investment.projectId}`,
        metadata: JSON.stringify({
          investmentId: investment.id,
          projectId: investment.projectId,
        }),
      },
    });
  });

  console.log("✅ 支付成功处理完成");
}

// 处理支付失败
async function handlePaymentFailure(investment: any, failureReason?: string) {
  console.log("❌ 处理支付失败:", investment.id);

  await prisma.$transaction(async (tx) => {
    // 1. 更新投资状态
    await tx.projectInvestment.update({
      where: { id: investment.id },
      data: {
        status: "FAILED",
        notes: failureReason || "支付失败",
      },
    });

    // 2. 更新支付交易记录
    await tx.paymentTransaction.updateMany({
      where: { orderId: investment.id },
      data: {
        status: "FAILED",
        failureReason: failureReason || "支付失败",
      },
    });

    // 3. 创建通知
    await tx.notification.create({
      data: {
        userId: investment.userId,
        title: "支付失败",
        message: `您对项目「${investment.project.title}」的投资支付失败。${failureReason ? `原因：${failureReason}` : "请重新尝试支付。"}`,
        type: "ERROR",
        priority: "HIGH",
        actionUrl: `/investments/${investment.projectId}/invest`,
      },
    });
  });

  console.log("❌ 支付失败处理完成");
}

// 处理退款
async function handlePaymentRefund(
  investment: any,
  refundAmount?: number,
  refundReason?: string
) {
  console.log("💰 处理退款:", investment.id);

  const actualRefundAmount = refundAmount || investment.amount;

  await prisma.$transaction(async (tx) => {
    // 1. 更新投资状态
    await tx.projectInvestment.update({
      where: { id: investment.id },
      data: {
        status: "REFUNDED",
        refundAmount: actualRefundAmount,
        refundReason: refundReason || "用户申请退款",
        refundedAt: new Date(),
      },
    });

    // 2. 如果之前是 COMPLETED 状态，需要回滚项目统计
    if (investment.status === "COMPLETED") {
      await tx.investmentProject.update({
        where: { id: investment.projectId },
        data: {
          totalRaised: { decrement: investment.amount },
          investorCount: { decrement: 1 },
        },
      });
    }

    // 3. 更新支付交易记录
    await tx.paymentTransaction.updateMany({
      where: { orderId: investment.id },
      data: {
        status: "REFUNDED",
        refundAmount: actualRefundAmount,
        refundedAt: new Date(),
      },
    });

    // 4. 创建财务记录
    await tx.financialRecord.create({
      data: {
        userId: investment.userId,
        type: "RECEIPT",
        title: `投资退款: ${investment.project.title}`,
        amount: actualRefundAmount,
        status: "COMPLETED",
        description: `项目「${investment.project.title}」投资退款，金额 ¥${actualRefundAmount.toLocaleString()}`,
        metadata: JSON.stringify({
          type: "INVESTMENT_REFUND",
          investmentId: investment.id,
          projectId: investment.projectId,
          refundReason,
        }),
      },
    });

    // 5. 创建通知
    await tx.notification.create({
      data: {
        userId: investment.userId,
        title: "退款成功",
        message: `您对项目「${investment.project.title}」的投资已退款，金额 ¥${actualRefundAmount.toLocaleString()}。`,
        type: "INFO",
        priority: "HIGH",
        actionUrl: `/user/investments`,
      },
    });
  });

  console.log("💰 退款处理完成");
}
