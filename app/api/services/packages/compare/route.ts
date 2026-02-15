import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/services/packages/compare - 套餐对比
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "请提供要对比的套餐ID（用逗号分隔）" },
        { status: 400 }
      );
    }

    const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (ids.length < 2) {
      return NextResponse.json(
        { error: "至少需要2个套餐进行对比" },
        { status: 400 }
      );
    }

    if (ids.length > 5) {
      return NextResponse.json(
        { error: "最多支持5个套餐同时对比" },
        { status: 400 }
      );
    }

    // 获取套餐详情
    const packages = await prisma.servicePackage.findMany({
      where: {
        OR: [
          ...ids.map((id) => ({ id })),
          ...ids.map((id) => ({ slug: id })),
        ],
        status: "ACTIVE",
      },
      include: {
        category: {
          select: { id: true, name: true, nameEn: true, slug: true },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                basePrice: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (packages.length < 2) {
      return NextResponse.json(
        { error: "未找到足够的有效套餐进行对比" },
        { status: 404 }
      );
    }

    // 收集所有服务项用于对比
    const allServiceIds = new Set<string>();
    packages.forEach((pkg) => {
      pkg.items.forEach((item) => {
        allServiceIds.add(item.serviceId);
      });
    });

    // 构建对比矩阵
    const comparisonMatrix: Record<string, Record<string, boolean | number>> = {};
    
    allServiceIds.forEach((serviceId) => {
      comparisonMatrix[serviceId] = {};
      packages.forEach((pkg) => {
        const item = pkg.items.find((i) => i.serviceId === serviceId);
        comparisonMatrix[serviceId][pkg.id] = item ? item.quantity : 0;
      });
    });

    // 获取服务名称映射
    const serviceNames: Record<string, { name: string; nameEn: string }> = {};
    packages.forEach((pkg) => {
      pkg.items.forEach((item) => {
        if (!serviceNames[item.serviceId]) {
          serviceNames[item.serviceId] = {
            name: item.service.name,
            nameEn: item.service.nameEn,
          };
        }
      });
    });

    // 格式化套餐数据
    const formattedPackages = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      nameEn: pkg.nameEn,
      slug: pkg.slug,
      description: pkg.description,
      originalPrice: pkg.originalPrice,
      packagePrice: pkg.packagePrice,
      savings: pkg.savings,
      savingsPercent: Math.round((pkg.savings / pkg.originalPrice) * 100),
      highlights: pkg.highlights ? JSON.parse(pkg.highlights) : [],
      isPopular: pkg.isPopular,
      category: pkg.category,
      serviceCount: pkg.items.length,
    }));

    // 计算价格差异
    const priceComparison = {
      lowest: Math.min(...packages.map((p) => p.packagePrice)),
      highest: Math.max(...packages.map((p) => p.packagePrice)),
      average: packages.reduce((sum, p) => sum + p.packagePrice, 0) / packages.length,
    };

    return NextResponse.json({
      packages: formattedPackages,
      comparison: {
        matrix: comparisonMatrix,
        serviceNames,
        priceComparison,
        totalServices: allServiceIds.size,
      },
    });
  } catch (error) {
    console.error("套餐对比失败:", error);
    return NextResponse.json(
      { error: "套餐对比失败" },
      { status: 500 }
    );
  }
}
