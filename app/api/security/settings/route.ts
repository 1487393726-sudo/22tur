import { NextRequest, NextResponse } from "next/server";

// 默认安全设置
const DEFAULT_SECURITY_SETTINGS = [
  {
    id: "1",
    key: "password_min_length",
    value: "8",
    category: "password",
    description: "密码最小长度",
  },
  {
    id: "2",
    key: "session_timeout",
    value: "3600",
    category: "session",
    description: "会话超时时间（秒）",
  },
  {
    id: "3",
    key: "max_login_attempts",
    value: "5",
    category: "login",
    description: "最大登录尝试次数",
  },
];

// GET - 获取安全设置
// 注意：securitySettings 模型当前不存在于 Prisma schema 中
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let settings = DEFAULT_SECURITY_SETTINGS;

  if (category) {
    settings = settings.filter((s) => s.category === category);
  }

  return NextResponse.json({ settings });
}

// PUT - 更新安全设置
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: "安全设置功能暂未启用" },
    { status: 501 }
  );
}
