import { NextRequest, NextResponse } from "next/server";

// GET - 获取单个时间记录
// 注意：timeEntry 模型当前不存在于 Prisma schema 中
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "时间记录功能暂未启用" },
    { status: 501 }
  );
}

// PUT - 更新时间记录
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "时间记录功能暂未启用" },
    { status: 501 }
  );
}

// DELETE - 删除时间记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "时间记录功能暂未启用" },
    { status: 501 }
  );
}
