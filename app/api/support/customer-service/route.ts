import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const customerServices = await prisma.customerService.findMany({
      where: {
        status: "ACTIVE"
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json(customerServices);

  } catch (error) {
    console.error("获取客服信息失败:", error);
    return NextResponse.json(
      { error: "获取客服信息失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}