import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/services/cases/[id]/related - 获取相关案例
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4");

    // 获取当前案例信息
    const currentCase = await prisma.serviceCase.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            categoryId: true,
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!currentCase) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    // 查找相关案例：优先同服务、同类别、同行业
    const relatedCases = await prisma.serviceCase.findMany({
      where: {
        id: { not: id }, // 排除当前案例
        OR: [
          // 同一服务的其他案例
          { serviceId: currentCase.serviceId },
          // 同一类别的案例
          {
            service: {
              categoryId: currentCase.service.categoryId,
            },
          },
          // 同一行业的案例
          ...(currentCase.industry
            ? [{ industry: currentCase.industry }]
            : []),
        ],
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      take: limit * 2, // 获取更多以便筛选
      include: {
        service: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            categoryId: true,
            category: {
              select: { id: true, name: true, nameEn: true },
            },
          },
        },
      },
    });

    // 计算相关性分数并排序
    const scoredCases = relatedCases.map((relatedCase) => {
      let relevanceScore = 0;

      // 同一服务 +3分
      if (relatedCase.serviceId === currentCase.serviceId) {
        relevanceScore += 3;
      }

      // 同一类别 +2分
      if (relatedCase.service.categoryId === currentCase.service.categoryId) {
        relevanceScore += 2;
      }

      // 同一行业 +1分
      if (
        currentCase.industry &&
        relatedCase.industry === currentCase.industry
      ) {
        relevanceScore += 1;
      }

      // 精选案例 +1分
      if (relatedCase.isFeatured) {
        relevanceScore += 1;
      }

      return {
        ...relatedCase,
        relevanceScore,
      };
    });

    // 按相关性分数排序
    scoredCases.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 移除分数字段，返回结果
    const result = scoredCases.slice(0, limit).map(({ relevanceScore, ...caseData }) => caseData);

    return NextResponse.json({
      data: result,
      currentCase: {
        id: currentCase.id,
        title: currentCase.title,
        serviceId: currentCase.serviceId,
        categoryId: currentCase.service.categoryId,
        industry: currentCase.industry,
      },
    });
  } catch (error) {
    console.error("获取相关案例失败:", error);
    return NextResponse.json(
      { error: "获取相关案例失败" },
      { status: 500 }
    );
  }
}
