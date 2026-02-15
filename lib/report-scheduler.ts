/**
 * 报表调度器
 * 支持定时生成报表并发送通知
 */

import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { executeReport } from "@/lib/report-engine";
import { sendEmail } from "@/lib/email";

// 调度任务类型
interface ScheduledTask {
  id: string;
  reportId: string;
  schedule: string; // cron 表达式
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  recipients: string[];
}

// 调度器状态
interface SchedulerState {
  isRunning: boolean;
  tasks: Map<string, cron.ScheduledTask>;
  config: {
    maxConcurrent: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

// 全局调度器状态
const schedulerState: SchedulerState = {
  isRunning: false,
  tasks: new Map(),
  config: {
    maxConcurrent: 3,
    retryAttempts: 3,
    retryDelay: 5000,
  },
};

/**
 * 获取调度器状态
 */
export function getSchedulerStatus() {
  return {
    isRunning: schedulerState.isRunning,
    activeTasks: schedulerState.tasks.size,
    config: schedulerState.config,
  };
}

/**
 * 启动调度器
 */
export async function startScheduler(): Promise<void> {
  if (schedulerState.isRunning) {
    console.log("[ReportScheduler] 调度器已在运行");
    return;
  }

  console.log("[ReportScheduler] 启动报表调度器...");
  schedulerState.isRunning = true;

  // 从数据库加载调度任务
  await loadScheduledTasks();

  console.log("[ReportScheduler] 调度器已启动");
}

/**
 * 停止调度器
 */
export function stopScheduler(): void {
  if (!schedulerState.isRunning) {
    console.log("[ReportScheduler] 调度器未运行");
    return;
  }

  console.log("[ReportScheduler] 停止报表调度器...");

  // 停止所有任务
  schedulerState.tasks.forEach((task, id) => {
    task.stop();
    console.log(`[ReportScheduler] 已停止任务: ${id}`);
  });

  schedulerState.tasks.clear();
  schedulerState.isRunning = false;

  console.log("[ReportScheduler] 调度器已停止");
}

/**
 * 从数据库加载调度任务
 */
async function loadScheduledTasks(): Promise<void> {
  try {
    // 查找所有启用的报表调度
    const schedules = await prisma.reportSchedule.findMany({
      where: { enabled: true },
      include: {
        report: true,
      },
    });

    for (const schedule of schedules) {
      // 解析 recipients JSON 字符串
      let recipients: string[] = [];
      try {
        recipients = JSON.parse(schedule.recipients || "[]");
      } catch {
        recipients = [];
      }

      await addScheduledTask({
        id: schedule.id,
        reportId: schedule.reportId,
        schedule: schedule.cronExpression,
        enabled: schedule.enabled,
        lastRun: schedule.lastRunAt || undefined,
        recipients,
      });
    }

    console.log(`[ReportScheduler] 已加载 ${schedules.length} 个调度任务`);
  } catch (error) {
    console.error("[ReportScheduler] 加载调度任务失败:", error);
  }
}


/**
 * 添加调度任务
 */
export async function addScheduledTask(task: ScheduledTask): Promise<boolean> {
  try {
    // 验证 cron 表达式
    if (!cron.validate(task.schedule)) {
      console.error(`[ReportScheduler] 无效的 cron 表达式: ${task.schedule}`);
      return false;
    }

    // 如果任务已存在，先停止
    if (schedulerState.tasks.has(task.id)) {
      schedulerState.tasks.get(task.id)?.stop();
      schedulerState.tasks.delete(task.id);
    }

    // 创建新任务
    const cronTask = cron.schedule(task.schedule, async () => {
      await executeScheduledReport(task);
    });

    schedulerState.tasks.set(task.id, cronTask);
    console.log(`[ReportScheduler] 已添加任务: ${task.id}, 调度: ${task.schedule}`);

    return true;
  } catch (error) {
    console.error(`[ReportScheduler] 添加任务失败: ${task.id}`, error);
    return false;
  }
}

/**
 * 移除调度任务
 */
export function removeScheduledTask(taskId: string): boolean {
  const task = schedulerState.tasks.get(taskId);
  if (task) {
    task.stop();
    schedulerState.tasks.delete(taskId);
    console.log(`[ReportScheduler] 已移除任务: ${taskId}`);
    return true;
  }
  return false;
}

/**
 * 执行调度报表
 */
async function executeScheduledReport(task: ScheduledTask): Promise<void> {
  console.log(`[ReportScheduler] 开始执行报表: ${task.reportId}`);

  try {
    // 获取报表
    const report = await prisma.report.findUnique({
      where: { id: task.reportId },
      include: { creator: true },
    });

    if (!report) {
      console.error(`[ReportScheduler] 报表不存在: ${task.reportId}`);
      return;
    }

    // 执行报表
    const result = await executeReport(report.config as any);

    // 更新最后执行时间
    await prisma.reportSchedule.update({
      where: { id: task.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: "SUCCESS",
        lastError: null,
      },
    });

    // 发送通知
    if (task.recipients && task.recipients.length > 0) {
      await sendReportNotification(report, result, task.recipients);
    }

    // 创建系统通知
    await createReportNotification(report, task, "success");

    console.log(`[ReportScheduler] 报表执行成功: ${task.reportId}`);
  } catch (error) {
    console.error(`[ReportScheduler] 报表执行失败: ${task.reportId}`, error);

    // 更新失败状态
    await prisma.reportSchedule.update({
      where: { id: task.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: "FAILED",
        lastError: error instanceof Error ? error.message : "未知错误",
      },
    });

    // 创建失败通知
    await createReportNotification(
      { id: task.reportId, name: "报表" } as any,
      task,
      "failed",
      error instanceof Error ? error.message : "未知错误"
    );
  }
}

/**
 * 发送报表邮件通知
 */
async function sendReportNotification(
  report: any,
  result: any,
  recipients: string[]
): Promise<void> {
  const subject = `[定时报表] ${report.name} - ${new Date().toLocaleDateString("zh-CN")}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">📊 定时报表通知</h2>
      <p>您订阅的报表已自动生成：</p>
      
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>报表名称：</strong>${report.name}</p>
        <p><strong>数据总数：</strong>${result.total} 条</p>
        <p><strong>生成时间：</strong>${new Date().toLocaleString("zh-CN")}</p>
      </div>
      
      <p>请登录系统查看完整报表内容。</p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px;">
        此邮件由系统自动发送，如需取消订阅，请在系统中修改报表调度设置。
      </p>
    </div>
  `;

  for (const email of recipients) {
    try {
      await sendEmail({
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error(`[ReportScheduler] 发送邮件失败: ${email}`, error);
    }
  }
}

/**
 * 创建系统通知
 */
async function createReportNotification(
  report: any,
  task: ScheduledTask,
  status: "success" | "failed",
  errorMessage?: string
): Promise<void> {
  try {
    // 获取报表创建者
    const schedule = await prisma.reportSchedule.findUnique({
      where: { id: task.id },
      include: { report: { include: { creator: true } } },
    });

    if (!schedule?.report?.creator) return;

    const title = status === "success" ? "定时报表生成成功" : "定时报表生成失败";
    const message =
      status === "success"
        ? `报表"${report.name}"已自动生成，共 ${task.recipients?.length || 0} 位收件人已收到通知。`
        : `报表"${report.name}"生成失败：${errorMessage}`;

    await prisma.notification.create({
      data: {
        userId: schedule.report.creator.id,
        title,
        message,
        type: status === "success" ? "SYSTEM" : "ALERT",
        actionUrl: `/reports/${report.id}`,
      },
    });
  } catch (error) {
    console.error("[ReportScheduler] 创建通知失败:", error);
  }
}

/**
 * 获取预设调度选项
 */
export function getSchedulePresets() {
  return [
    { label: "每天早上 8:00", value: "0 8 * * *", description: "每天早上 8 点执行" },
    { label: "每天下午 6:00", value: "0 18 * * *", description: "每天下午 6 点执行" },
    { label: "每周一早上 9:00", value: "0 9 * * 1", description: "每周一早上 9 点执行" },
    { label: "每月 1 日早上 9:00", value: "0 9 1 * *", description: "每月 1 日早上 9 点执行" },
    { label: "每小时", value: "0 * * * *", description: "每小时整点执行" },
  ];
}

/**
 * 解析 cron 表达式为可读描述
 */
export function describeCronExpression(cronExpr: string): string {
  const presets = getSchedulePresets();
  const preset = presets.find((p) => p.value === cronExpr);
  if (preset) return preset.description;

  // 简单解析
  const parts = cronExpr.split(" ");
  if (parts.length !== 5) return cronExpr;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  if (dayOfWeek !== "*" && dayOfMonth === "*") {
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `每周${days[parseInt(dayOfWeek)]} ${hour}:${minute.padStart(2, "0")}`;
  }

  if (dayOfMonth !== "*") {
    return `每月 ${dayOfMonth} 日 ${hour}:${minute.padStart(2, "0")}`;
  }

  if (hour !== "*") {
    return `每天 ${hour}:${minute.padStart(2, "0")}`;
  }

  return cronExpr;
}
