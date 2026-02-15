import { NextRequest, NextResponse } from "next/server";

// GET - 获取时间记录列表
// 注意：timeEntry 模型当前不存在于 Prisma schema 中
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "时间记录功能暂未启用",
    data: [],
    total: 0,
  });
}

// POST - 创建时间记录
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "时间记录功能暂未启用" },
    { status: 501 }
  );
}
