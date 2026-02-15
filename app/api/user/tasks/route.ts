import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 获取用户任务列表
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
    const priority = searchParams.get("priority");

    const where: any = { userId: user.id };
    
    if (status && status !== "all") {
      where.status = status;
    }
    
    if (priority && priority !== "all") {
      where.priority = priority;
    }

    const tasks = await prisma.userTask.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json(tasks);

  } catch (error) {
    console.error("获取任务列表失败:", error);
    return NextResponse.json(
      { error: "获取任务列表失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 创建新任务
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

    const { title, description, priority = "MEDIUM", dueDate } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "任务标题不能为空" },
        { status: 400 }
      );
    }

    const task = await prisma.userTask.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "TODO"
      }
    });

    return NextResponse.json({
      message: "任务创建成功",
      task
    });

  } catch (error) {
    console.error("创建任务失败:", error);
    return NextResponse.json(
      { error: "创建任务失败，请稍后重试" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 更新任务
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

    const { taskId, title, description, priority, dueDate } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "缺少任务ID" },
        { status: 400 }
      );
    }

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "任务标题不能为空" },
        { status: 400 }
      );
    }

    // 验证任务属于当前用户
    const existingTask = await prisma.userTask.findFirst({
      where: { 
        id: taskId,
        userId: user.id 
      }
    });

    if (!existingTask) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      priority
    };

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    const task = await prisma.userTask.update({
      where: { id: taskId },
      data: updateData
    });

    return NextResponse.json({
      message: "任务更新成功",
      task
    });

  } catch (error) {
    console.error("更新任务失败:", error);
    return NextResponse.json(
      { error: "更新任务失败，请稍后重试" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 删除任务
export async function DELETE(request: NextRequest) {
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
    const existingTask = await prisma.userTask.findFirst({
      where: { 
        id: taskId,
        userId: user.id 
      }
    });

    if (!existingTask) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    await prisma.userTask.delete({
      where: { id: taskId }
    });

    return NextResponse.json({
      message: "任务删除成功"
    });

  } catch (error) {
    console.error("删除任务失败:", error);
    return NextResponse.json(
      { error: "删除任务失败，请稍后重试" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}