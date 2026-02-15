import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get("period") || "6months";

    // 计算日期范围
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // 获取财务数据 - 月度收入、支出、利润
    let financialData = [];
    try {
      financialData = await prisma.financialRecord.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        },
        select: {
          amount: true,
          type: true,
          createdAt: true,
        },
      });
    } catch (err) {
      console.warn("Failed to fetch financial data:", err);
      financialData = [];
    }

    // 按月份分组财务数据
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (5 - i));
      const monthStr = `${date.getMonth() + 1}月`;

      const monthData = financialData.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return (
          recordDate.getMonth() === date.getMonth() &&
          recordDate.getFullYear() === date.getFullYear()
        );
      });

      const revenue = monthData
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      const expenses = monthData
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      return {
        month: monthStr,
        revenue,
        expenses,
        profit: revenue - expenses,
      };
    });

    // 获取项目状态分布
    let projects = [];
    try {
      projects = await prisma.project.findMany({
        select: {
          status: true,
        },
      });
    } catch (err) {
      console.warn("Failed to fetch projects:", err);
      projects = [];
    }

    const projectStatusMap = new Map<string, number>();
    projects.forEach((project) => {
      const status = project.status || "pending";
      projectStatusMap.set(status, (projectStatusMap.get(status) || 0) + 1);
    });

    const projectStatusData = [
      {
        name: "已完成",
        value: projectStatusMap.get("completed") || 0,
        color: "#22c55e",
      },
      {
        name: "进行中",
        value: projectStatusMap.get("in_progress") || 0,
        color: "#3b82f6",
      },
      {
        name: "待开始",
        value: projectStatusMap.get("pending") || 0,
        color: "#f59e0b",
      },
      {
        name: "已暂停",
        value: projectStatusMap.get("paused") || 0,
        color: "#ef4444",
      },
    ];

    // 获取客户行业分布
    let clients = [];
    try {
      clients = await prisma.client.findMany({
        select: {
          industry: true,
        },
      });
    } catch (err) {
      console.warn("Failed to fetch clients:", err);
      clients = [];
    }

    const industryMap = new Map<string, number>();
    clients.forEach((client) => {
      const industry = client.industry || "其他";
      industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
    });

    const clientDistribution = Array.from(industryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"][index % 4],
      }))
      .slice(0, 4);

    // 获取员工绩效数据
    let employees = [];
    try {
      employees = await prisma.employee.findMany({
        select: {
          name: true,
          id: true,
        },
      });
    } catch (err) {
      console.warn("Failed to fetch employees:", err);
      employees = [];
    }

    const employeePerformance = await Promise.all(
      employees.map(async (emp) => {
        try {
          const tasks = await prisma.task.findMany({
            where: {
              assigneeId: emp.id,
              createdAt: {
                gte: startDate,
                lte: now,
              },
            },
            select: {
              status: true,
            },
          });

          const completed = tasks.filter((t) => t.status === "done").length;
          const inProgress = tasks.filter((t) => t.status === "in_progress")
            .length;
          const efficiency =
            tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

          return {
            name: emp.name,
            completed,
            inProgress,
            efficiency,
          };
        } catch (err) {
          console.warn(`Failed to fetch tasks for employee ${emp.id}:`, err);
          return {
            name: emp.name,
            completed: 0,
            inProgress: 0,
            efficiency: 0,
          };
        }
      })
    );

    // 获取任务完成趋势
    let tasks = [];
    try {
      tasks = await prisma.task.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        },
        select: {
          status: true,
          createdAt: true,
        },
      });
    } catch (err) {
      console.warn("Failed to fetch tasks:", err);
      tasks = [];
    }

    const taskCompletionTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (5 - i));
      const monthStr = `${date.getMonth() + 1}月`;

      const monthTasks = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return (
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });

      const completed = monthTasks.filter((t) => t.status === "done").length;
      const created = monthTasks.length;

      return {
        month: monthStr,
        completed,
        created,
      };
    });

    // 计算统计数据
    const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
    const totalProfit = monthlyRevenue.reduce((sum, m) => sum + m.profit, 0);
    const totalProjects = projects.length;
    const totalClients = clients.length;

    return NextResponse.json({
      monthlyRevenue,
      projectStatus: projectStatusData,
      clientDistribution,
      employeePerformance,
      taskCompletion: taskCompletionTrend,
      stats: {
        totalRevenue,
        totalExpenses,
        totalProfit,
        totalProjects,
        totalClients,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    // Return empty data structure instead of error to allow frontend fallback
    return NextResponse.json({
      monthlyRevenue: [],
      projectStatus: [],
      clientDistribution: [],
      employeePerformance: [],
      taskCompletion: [],
      stats: {
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        totalProjects: 0,
        totalClients: 0,
      },
    });
  }
}
