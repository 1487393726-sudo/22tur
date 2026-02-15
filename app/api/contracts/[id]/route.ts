import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/contracts/[id] - 获取合同详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.serviceContract.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            client: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            items: {
              include: {
                service: {
                  select: { id: true, name: true, nameEn: true, description: true },
                },
              },
            },
            package: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "合同不存在" }, { status: 404 });
    }

    // 检查权限
    if (
      session.user.role !== "ADMIN" &&
      contract.order.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "无权查看此合同" }, { status: 403 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("获取合同详情失败:", error);
    return NextResponse.json({ error: "获取合同详情失败" }, { status: 500 });
  }
}

// PUT /api/contracts/[id] - 更新合同
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const contract = await prisma.serviceContract.findUnique({
      where: { id },
      include: {
        order: {
          select: { clientId: true },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "合同不存在" }, { status: 404 });
    }

    // 检查权限
    if (
      session.user.role !== "ADMIN" &&
      contract.order.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: "无权修改此合同" }, { status: 403 });
    }

    // 只有草稿状态可以修改内容
    if (contract.status !== "DRAFT" && body.content) {
      return NextResponse.json(
        { error: "合同已发送，无法修改内容" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    if (body.content && contract.status === "DRAFT") {
      updateData.content = body.content;
    }
    if (body.terms && contract.status === "DRAFT") {
      updateData.terms = JSON.stringify(body.terms);
    }
    if (body.status) updateData.status = body.status;

    const updatedContract = await prisma.serviceContract.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
          },
        },
      },
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error("更新合同失败:", error);
    return NextResponse.json({ error: "更新合同失败" }, { status: 500 });
  }
}
