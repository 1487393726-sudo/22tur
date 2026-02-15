/**
 * 投资支付状态查询 API
 *
 * GET /api/project-investments/[id]/status
 *
 * 功能：
 * - 查询投资的支付状态
 * - 返回投资详情和支付交易信息
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id: investmentId } = await params;

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id: investmentId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            shortDesc: true,
            coverImage: true,
            expectedReturn: true,
            duration: true,
            status: true,
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json({ error: "投资记录不存在" }, { status: 404 });
    }

    // 验证权限：只能查看自己的投资或管理员可以查看所有
    if (investment.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权访问此投资记录" }, { status: 403 });
    }

    // 获取支付交易记录
    const paymentTransaction = await prisma.paymentTransaction.findFirst({
      where: { orderId: investmentId },
      orderBy: { createdAt: "desc" },
    });

    // 计算状态信息
    const statusInfo = getStatusInfo(investment.status);

    // 检查支付是否过期
    let isExpired = false;
    if (
      investment.status === "PENDING" &&
      paymentTransaction?.expiredAt &&
      new Date() > new Date(paymentTransaction.expiredAt)
    ) {
      isExpired = true;
    }

    return NextResponse.json({
      investment: {
        id: investment.id,
        amount: investment.amount,
        status: investment.status,
        transactionId: investment.transactionId,
        paymentMethod: investment.paymentMethod,
        paymentGateway: investment.paymentGateway,
        investedAt: investment.investedAt,
        completedAt: investment.completedAt,
        refundAmount: investment.refundAmount,
        refundReason: investment.refundReason,
        refundedAt: investment.refundedAt,
        project: investment.project,
      },
      paymentTransaction: paymentTransaction
        ? {
            id: paymentTransaction.id,
            status: paymentTransaction.status,
            paymentUrl: paymentTransaction.paymentUrl,
            qrCode: paymentTransaction.qrCode,
            paidAt: paymentTransaction.paidAt,
            expiredAt: paymentTransaction.expiredAt,
            failureReason: paymentTransaction.failureReason,
          }
        : null,
      statusInfo,
      isExpired,
    });
  } catch (error) {
    console.error("查询投资状态失败:", error);
    return NextResponse.json({ error: "查询状态失败" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 获取状态信息
function getStatusInfo(status: string) {
  const statusMap: Record<
    string,
    { label: string; color: string; description: string }
  > = {
    PENDING: {
      label: "待支付",
      color: "yellow",
      description: "请在30分钟内完成支付",
    },
    COMPLETED: {
      label: "已完成",
      color: "green",
      description: "投资成功，项目文件已解锁",
    },
    FAILED: {
      label: "支付失败",
      color: "red",
      description: "支付未成功，请重新尝试",
    },
    REFUNDED: {
      label: "已退款",
      color: "gray",
      description: "投资已退款",
    },
  };

  return statusMap[status] || {
    label: "未知状态",
    color: "gray",
    description: "",
  };
}
