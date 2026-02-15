import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reports/datasources
 * 获取可用的数据源列表和字段信息
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 定义可用的数据源
    const datasources = [
      {
        id: "users",
        name: "用户",
        description: "系统用户数据",
        fields: [
          { name: "id", label: "ID", type: "string" },
          { name: "email", label: "邮箱", type: "string" },
          { name: "firstName", label: "名", type: "string" },
          { name: "lastName", label: "姓", type: "string" },
          { name: "role", label: "角色", type: "enum" },
          { name: "departmentId", label: "部门ID", type: "string" },
          { name: "position", label: "职位", type: "string" },
          { name: "createdAt", label: "创建时间", type: "datetime" },
        ],
      },
      {
        id: "projects",
        name: "项目",
        description: "项目管理数据",
        fields: [
          { name: "id", label: "ID", type: "string" },
          { name: "name", label: "项目名称", type: "string" },
          { name: "description", label: "描述", type: "text" },
          { name: "status", label: "状态", type: "enum" },
          { name: "budget", label: "预算", type: "number" },
          { name: "startDate", label: "开始日期", type: "date" },
          { name: "endDate", label: "结束日期", type: "date" },
          { name: "createdAt", label: "创建时间", type: "datetime" },
        ],
      },
      {
        id: "tasks",
        name: "任务",
        description: "任务管理数据",
        fields: [
          { name: "id", label: "ID", type: "string" },
          { name: "title", label: "任务标题", type: "string" },
          { name: "description", label: "描述", type: "text" },
          { name: "status", label: "状态", type: "enum" },
          { name: "priority", label: "优先级", type: "enum" },
          { name: "dueDate", label: "截止日期", type: "date" },
          { name: "createdAt", label: "创建时间", type: "datetime" },
        ],
      },
      {
        id: "invoices",
        name: "发票",
        description: "发票管理数据",
        fields: [
          { name: "id", label: "ID", type: "string" },
          { name: "number", label: "发票号", type: "string" },
          { name: "status", label: "状态", type: "enum" },
          { name: "amount", label: "金额", type: "number" },
          { name: "dueDate", label: "到期日期", type: "date" },
          { name: "paidAt", label: "支付日期", type: "date" },
          { name: "createdAt", label: "创建时间", type: "datetime" },
        ],
      },
      {
        id: "timeEntries",
        name: "时间记录",
        description: "工时跟踪数据",
        fields: [
          { name: "id", label: "ID", type: "string" },
          { name: "duration", label: "时长(分钟)", type: "number" },
          { name: "startTime", label: "开始时间", type: "datetime" },
          { name: "endTime", label: "结束时间", type: "datetime" },
          { name: "description", label: "描述", type: "text" },
          { name: "createdAt", label: "创建时间", type: "datetime" },
        ],
      },
    ];

    return NextResponse.json({ datasources });
  } catch (error) {
    console.error("获取数据源失败:", error);
    return NextResponse.json({ error: "获取数据源失败" }, { status: 500 });
  }
}
