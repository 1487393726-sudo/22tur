import { NextRequest, NextResponse } from "next/server";

// DELETE - 删除文档分享
// 注意：documentShare 模型当前不存在于 Prisma schema 中
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; shareId: string } }
) {
  return NextResponse.json(
    { error: "文档分享功能暂未启用" },
    { status: 501 }
  );
}
