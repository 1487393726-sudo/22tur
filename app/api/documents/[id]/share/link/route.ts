import { NextRequest, NextResponse } from "next/server";

// POST - 创建文档分享链接
// 注意：documentShare 模型当前不存在于 Prisma schema 中
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "文档分享功能暂未启用" },
    { status: 501 }
  );
}
