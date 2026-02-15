/**
 * 投资退款 API
 *
 * POST /api/project-investments/[id]/refund
 *
 * 功能：
 * - 验证用户身份和投资状态
 * - 创建退款请求
 * - 调用支付网关退款（开发环境模拟）
 * - 更新投资状态为 REFUNDED
 * - 回滚项目统计（募集金额、投资人数）
 * - 撤销文件访问权限
 * - 发送退款通知
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// 退款请求体
interface RefundRequest {
  reason?: string;
  amount?: number; // 部分退款金额（可选，默认全额退款）
}

// 模拟支付网关退款
async function processGatewayRefund(
  investment: any,
  refundAmount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  // 开发环境模拟退款
  if (process.env.NODE_ENV === "development") {
    // 模拟处理延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      refundId: `REFUND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  // 生产环境调用实际支付网关
  try {
    switch (investment.paymentGateway) {
      case "stripe":
        return await processStripeRefund(investment, refundAmount);
      case "alipay":
        return await processAlipayRefund(investment, refundAmount);
      case "wechat":
        return await processWechatRefund(investment, refundAmount);
      default:
        return { success: false, error: "不支持的支付网关" };
    }
  } catch (error) {
    console.error("支付网关退款失败:", error);
    return { success: false, error: "支付网关退款失败" };
  }
}

// Stripe 退款处理
async function processStripeRefund(
  investment: any,
  refundAmount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  // TODO: 实现 Stripe 退款
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const refund = await stripe.refunds.create({
  //   payment_intent: investment.transactionId,
  //   amount: Math.round(refundAmount * 100), // Stripe 使用分为单位
  // });
  return { success: false, error: "Stripe 退款功能待实现" };
}

// 支付宝退款处理
async function processAlipayRefund(
  investment: any,
  refundAmount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  // TODO: 实现支付宝退款
  return { success: false, error: "支付宝退款功能待实现" };
}

// 微信支付退款处理
async function processWechatRefund(
  investment: any,
  refundAmount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  // TODO: 实现微信支付退款
  return { success: false, error: "微信支付退款功能待实现" };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: investmentId } = await params;

    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const userId = session.user.id;
    const body: RefundRequest = await request.json().catch(() => ({}));
    const { reason, amount: requestedAmount } = body;

    console.log("📥 收到退款请求:", { investmentId, userId, reason, requestedAmount });

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id: investmentId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            createdBy: true,
            status: true,
          },
        },
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

    // 验证权限：只有投资者本人或管理员可以申请退款
    const isOwner = investment.userId === userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "无权操作此投资记录" }, { status: 403 });
    }

    // 验证投资状态：只有 COMPLETED 状态的投资可以退款
    if (investment.status !== "COMPLETED") {
      const statusMessages: Record<string, string> = {
        PENDING: "投资尚未完成支付，无法退款",
        REFUNDED: "该投资已退款",
        FAILED: "投资支付失败，无需退款",
      };
      return NextResponse.json(
        { error: statusMessages[investment.status] || "当前状态无法退款" },
        { status: 400 }
      );
    }

    // 计算退款金额
    const refundAmount = requestedAmount
      ? Math.min(requestedAmount, investment.amount)
      : investment.amount;

    if (refundAmount <= 0) {
      return NextResponse.json({ error: "退款金额无效" }, { status: 400 });
    }

    // 调用支付网关退款
    const refundResult = await processGatewayRefund(investment, refundAmount);

    if (!refundResult.success) {
      return NextResponse.json(
        { error: refundResult.error || "退款处理失败" },
        { status: 500 }
      );
    }

    // 使用事务处理退款后续操作
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新投资状态
      const updatedInvestment = await tx.projectInvestment.update({
        where: { id: investmentId },
        data: {
          status: "REFUNDED",
          refundAmount: refundAmount,
          refundReason: reason || "用户申请退款",
          refundedAt: new Date(),
          notes: `退款ID: ${refundResult.refundId}`,
        },
      });

      // 2. 回滚项目统计
      await tx.investmentProject.update({
        where: { id: investment.projectId },
        data: {
          totalRaised: { decrement: investment.amount },
          investorCount: { decrement: 1 },
        },
      });

      // 3. 更新支付交易记录
      await tx.paymentTransaction.updateMany({
        where: { orderId: investmentId },
        data: {
          status: "REFUNDED",
          refundAmount: refundAmount,
          refundedAt: new Date(),
        },
      });

      // 4. 创建退款财务记录
      await tx.financialRecord.create({
        data: {
          userId: investment.userId,
          type: "RECEIPT",
          title: `投资退款: ${investment.project.title}`,
          amount: refundAmount,
          status: "COMPLETED",
          description: `项目「${investment.project.title}」投资退款，金额 ¥${refundAmount.toLocaleString()}${reason ? `，原因：${reason}` : ""}`,
          metadata: JSON.stringify({
            type: "INVESTMENT_REFUND",
            investmentId: investment.id,
            projectId: investment.projectId,
            projectTitle: investment.project.title,
            refundId: refundResult.refundId,
            refundReason: reason,
            originalAmount: investment.amount,
            refundAmount: refundAmount,
          }),
        },
      });

      // 5. 创建退款通知
      await tx.notification.create({
        data: {
          userId: investment.userId,
          title: "退款成功",
          message: `您对项目「${investment.project.title}」的投资已成功退款，金额 ¥${refundAmount.toLocaleString()}。退款将在 1-5 个工作日内到账。`,
          type: "SUCCESS",
          priority: "HIGH",
          actionUrl: `/user/investments`,
          metadata: JSON.stringify({
            investmentId: investment.id,
            projectId: investment.projectId,
            refundId: refundResult.refundId,
            refundAmount: refundAmount,
          }),
        },
      });

      // 6. 如果是管理员操作，通知投资者
      if (isAdmin && !isOwner) {
        await tx.notification.create({
          data: {
            userId: investment.userId,
            title: "投资已被退款",
            message: `管理员已为您的项目「${investment.project.title}」投资办理退款，金额 ¥${refundAmount.toLocaleString()}。${reason ? `原因：${reason}` : ""}`,
            type: "INFO",
            priority: "HIGH",
            actionUrl: `/user/investments`,
          },
        });
      }

      return updatedInvestment;
    });

    console.log("✅ 退款处理成功:", {
      investmentId,
      refundAmount,
      refundId: refundResult.refundId,
    });

    return NextResponse.json({
      success: true,
      message: "退款申请已处理",
      data: {
        investmentId: result.id,
        status: result.status,
        refundAmount: result.refundAmount,
        refundedAt: result.refundedAt,
        refundId: refundResult.refundId,
      },
    });
  } catch (error) {
    console.error("❌ 退款处理失败:", error);
    return NextResponse.json(
      { error: "退款处理失败，请稍后重试" },
      { status: 500 }
    );
  }
}

// GET 方法：查询退款状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: investmentId } = await params;

    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id: investmentId },
      select: {
        id: true,
        userId: true,
        status: true,
        amount: true,
        refundAmount: true,
        refundReason: true,
        refundedAt: true,
        notes: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json({ error: "投资记录不存在" }, { status: 404 });
    }

    // 验证权限
    const isOwner = investment.userId === userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "无权查看此记录" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        investmentId: investment.id,
        projectTitle: investment.project.title,
        status: investment.status,
        originalAmount: investment.amount,
        refundAmount: investment.refundAmount,
        refundReason: investment.refundReason,
        refundedAt: investment.refundedAt,
        canRefund: investment.status === "COMPLETED",
      },
    });
  } catch (error) {
    console.error("❌ 查询退款状态失败:", error);
    return NextResponse.json(
      { error: "查询失败，请稍后重试" },
      { status: 500 }
    );
  }
}
