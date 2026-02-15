/**
 * 报表调度器管理 API
 * GET - 获取调度器状态和任务列表
 * POST - 创建/更新调度任务
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
  addScheduledTask,
  removeScheduledTask,
  getSchedulePresets,
  describeCronExpression,
} from "@/lib/report-scheduler";
import cron from "node-cron";

// GET - 获取调度器状态
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取调度器状态
    const status = getSchedulerStatus();

    // 获取所有调度任务
    const schedules = await prisma.reportSchedule.findMany({
      include: {
        report: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 格式化调度任务
    const tasks = schedules.map((s) => ({
      id: s.id,
      reportId: s.reportId,
      reportName: s.report.title,
      reportType: s.report.type,
      cronExpression: s.cronExpression,
      description: describeCronExpression(s.cronExpression),
      enabled: s.enabled,
      recipients: JSON.parse(s.recipients || "[]"),
      lastRunAt: s.lastRunAt,
      lastStatus: s.lastStatus,
      lastError: s.lastError,
      nextRunAt: s.nextRunAt,
      createdAt: s.createdAt,
    }));

    // 获取预设选项
    const presets = getSchedulePresets();

    return NextResponse.json({
      status,
      tasks,
      presets,
    });
  } catch (error) {
    console.error("获取调度器状态失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取失败" },
      { status: 500 }
    );
  }
}

// POST - 创建/更新调度任务或控制调度器
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { action, reportId, cronExpression, enabled, recipients } = body;

    // 控制调度器
    if (action === "start") {
      await startScheduler();
      return NextResponse.json({ success: true, message: "调度器已启动" });
    }

    if (action === "stop") {
      stopScheduler();
      return NextResponse.json({ success: true, message: "调度器已停止" });
    }

    // 创建/更新调度任务
    if (action === "create" || action === "update") {
      if (!reportId) {
        return NextResponse.json({ error: "缺少报表 ID" }, { status: 400 });
      }

      if (!cronExpression) {
        return NextResponse.json({ error: "缺少调度表达式" }, { status: 400 });
      }

      // 验证 cron 表达式
      if (!cron.validate(cronExpression)) {
        return NextResponse.json({ error: "无效的调度表达式" }, { status: 400 });
      }

      // 检查报表是否存在
      const report = await prisma.report.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        return NextResponse.json({ error: "报表不存在" }, { status: 404 });
      }

      // 创建或更新调度
      const schedule = await prisma.reportSchedule.upsert({
        where: { reportId },
        create: {
          reportId,
          cronExpression,
          enabled: enabled ?? true,
          recipients: JSON.stringify(recipients || []),
        },
        update: {
          cronExpression,
          enabled: enabled ?? true,
          recipients: JSON.stringify(recipients || []),
        },
      });

      // 更新调度器任务
      if (schedule.enabled) {
        await addScheduledTask({
          id: schedule.id,
          reportId: schedule.reportId,
          schedule: schedule.cronExpression,
          enabled: schedule.enabled,
          recipients: recipients || [],
        });
      } else {
        removeScheduledTask(schedule.id);
      }

      return NextResponse.json({
        success: true,
        schedule: {
          ...schedule,
          recipients: JSON.parse(schedule.recipients || "[]"),
        },
      });
    }

    // 删除调度任务
    if (action === "delete") {
      if (!reportId) {
        return NextResponse.json({ error: "缺少报表 ID" }, { status: 400 });
      }

      const schedule = await prisma.reportSchedule.findUnique({
        where: { reportId },
      });

      if (schedule) {
        removeScheduledTask(schedule.id);
        await prisma.reportSchedule.delete({
          where: { id: schedule.id },
        });
      }

      return NextResponse.json({ success: true, message: "调度已删除" });
    }

    // 切换启用状态
    if (action === "toggle") {
      if (!reportId) {
        return NextResponse.json({ error: "缺少报表 ID" }, { status: 400 });
      }

      const schedule = await prisma.reportSchedule.findUnique({
        where: { reportId },
      });

      if (!schedule) {
        return NextResponse.json({ error: "调度不存在" }, { status: 404 });
      }

      const updated = await prisma.reportSchedule.update({
        where: { id: schedule.id },
        data: { enabled: !schedule.enabled },
      });

      if (updated.enabled) {
        await addScheduledTask({
          id: updated.id,
          reportId: updated.reportId,
          schedule: updated.cronExpression,
          enabled: updated.enabled,
          recipients: JSON.parse(updated.recipients || "[]"),
        });
      } else {
        removeScheduledTask(updated.id);
      }

      return NextResponse.json({
        success: true,
        enabled: updated.enabled,
      });
    }

    return NextResponse.json({ error: "无效的操作" }, { status: 400 });
  } catch (error) {
    console.error("调度器操作失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "操作失败" },
      { status: 500 }
    );
  }
}
