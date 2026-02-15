import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/contracts/[id]/sign - 签署合同
export async function POST(
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
    const { signature, signatureType } = body;

    if (!signature) {
      return NextResponse.json({ error: "签名不能为空" }, { status: 400 });
    }

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

    const isAdmin = session.user.role === "ADMIN";
    const isClient = contract.order.clientId === session.user.id;

    // 检查权限
    if (!isAdmin && !isClient) {
      return NextResponse.json({ error: "无权签署此合同" }, { status: 403 });
    }

    const updateData: any = {};
    const now = new Date();

    // 客户签署
    if (isClient && !isAdmin) {
      if (contract.status !== "PENDING_CLIENT") {
        return NextResponse.json(
          { error: "合同当前状态不允许客户签署" },
          { status: 400 }
        );
      }
      updateData.clientSignature = signature;
      updateData.clientSignedAt = now;
      updateData.status = "PENDING_COMPANY";
    }

    // 公司签署（管理员）
    if (isAdmin && signatureType === "company") {
      if (contract.status !== "PENDING_COMPANY") {
        return NextResponse.json(
          { error: "合同当前状态不允许公司签署" },
          { status: 400 }
        );
      }
      updateData.companySignature = signature;
      updateData.companySignedAt = now;
      updateData.status = "SIGNED";
    }

    // 管理员代客户签署
    if (isAdmin && signatureType === "client") {
      if (contract.status !== "PENDING_CLIENT") {
        return NextResponse.json(
          { error: "合同当前状态不允许客户签署" },
          { status: 400 }
        );
      }
      updateData.clientSignature = signature;
      updateData.clientSignedAt = now;
      updateData.status = "PENDING_COMPANY";
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "无效的签署请求" }, { status: 400 });
    }

    const updatedContract = await prisma.serviceContract.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            client: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "签署成功",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("签署合同失败:", error);
    return NextResponse.json({ error: "签署合同失败" }, { status: 500 });
  }
}
