import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (status && status !== "all") {
      where.status = status;
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            duration: true,
            deliveryTime: true,
            features: true
          }
        }
      },
      orderBy: { purchaseDate: "desc" }
    });

    // 为每个购买记录添加进度信息（模拟数据）
    const purchasesWithProgress = purchases.map(purchase => {
      let progress = null;
      
      if (purchase.status === "PROCESSING") {
        // 模拟进度数据
        const steps = [
          { step: "订单确认", completed: true, completedAt: purchase.purchaseDate },
          { step: "服务准备", completed: true, completedAt: new Date(purchase.purchaseDate.getTime() + 24 * 60 * 60 * 1000).toISOString() },
          { step: "开发执行", completed: false },
          { step: "质量检查", completed: false },
          { step: "交付准备", completed: false },
          { step: "最终交付", completed: false }
        ];
        
        const completedSteps = steps.filter(s => s.completed).length;
        
        progress = {
          current: completedSteps,
          total: steps.length,
          status: "进行中",
          lastUpdate: new Date().toISOString(),
          details: steps
        };
      }

      return {
        ...purchase,
        progress
      };
    });

    return NextResponse.json(purchasesWithProgress);

  } catch (error) {
    console.error("获取购买记录失败:", error);
    return NextResponse.json(
      { error: "获取购买记录失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 更新购买状态
export async function PUT(request: NextRequest) {
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

    const { purchaseId, status, notes } = await request.json();

    if (!purchaseId || !status) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 验证购买记录属于当前用户
    const purchase = await prisma.purchase.findFirst({
      where: { 
        id: purchaseId,
        userId: user.id 
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: "购买记录不存在" }, { status: 404 });
    }

    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
        notes: notes || undefined
      }
    });

    return NextResponse.json({
      message: "状态更新成功",
      purchase: updatedPurchase
    });

  } catch (error) {
    console.error("更新购买状态失败:", error);
    return NextResponse.json(
      { error: "更新状态失败，请稍后重试" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}