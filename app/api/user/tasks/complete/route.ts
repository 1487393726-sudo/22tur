import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "缺少任务ID" },
        { status: 400 }
      );
    }

    // 验证任务属于当前用户
    const task = await prisma.userTask.findFirst({
      where: { 
        id: taskId,
        userId: user.id 
      }
    });

    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    if (task.status === "COMPLETED") {
      return NextResponse.json(
        { error: "任务已完成" },
        { status: 400 }
      );
    }

    // 更新任务状态为已完成
    const updatedTask = await prisma.userTask.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        completedAt: new Date()
      }
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "任务已完成",
        message: `恭喜！您已完成任务：${task.title}`,
        type: "SUCCESS"
      }
    });

    return NextResponse.json({
      message: "任务已完成",
      task: updatedTask
    });

  } catch (error) {
    console.error("完成任务失败:", error);
    return NextResponse.json(
      { error: "完成任务失败，请稍后重试" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}