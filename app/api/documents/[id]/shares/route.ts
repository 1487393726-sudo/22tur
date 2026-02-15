import { NextRequest, NextResponse } from "next/server";

// GET - 获取文档分享列表
// 注意：documentShare 模型当前不存在于 Prisma schema 中
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    message: "文档分享功能暂未启用",
    shares: [],
  });
}
