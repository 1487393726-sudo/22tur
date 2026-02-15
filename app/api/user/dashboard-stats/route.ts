import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 并行获取统计数据
    const [purchasesCount, investmentsCount, tasksCount, documentsCount, notificationsCount] = await Promise.all([
      // 购买记录数量
      prisma.purchase.count({
        where: { userId: user.id }
      }),
      // 投资记录数量
      prisma.investment.count({
        where: { userId: user.id }
      }),
      // 用户任务数量（未完成的）
      prisma.userTask.count({
        where: { 
          userId: user.id,
          status: { in: ["TODO", "IN_PROGRESS"] }
        }
      }),
      // 用户文档数量
      prisma.userDocument.count({
        where: { userId: user.id }
      }),
      // 未读通知数量
      prisma.notification.count({
        where: { 
          userId: user.id,
          isRead: false
        }
      })
    ]);

    return NextResponse.json({
      purchases: purchasesCount,
      investments: investmentsCount,
      tasks: tasksCount,
      documents: documentsCount,
      notifications: notificationsCount
    });

  } catch (error) {
    console.error("获取仪表板统计数据失败:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}