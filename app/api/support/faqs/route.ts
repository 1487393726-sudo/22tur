import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {
      status: "ACTIVE"
    };

    if (category && category !== "all") {
      where.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { order: "asc" }
      ]
    });

    return NextResponse.json(faqs);

  } catch (error) {
    console.error("获取FAQ列表失败:", error);
    return NextResponse.json(
      { error: "获取FAQ列表失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}