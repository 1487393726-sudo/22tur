import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { Service } from "@/lib/types/services";

const prisma = new PrismaClient();

// Mock data for core services
const coreServices: Service[] = [
  {
    id: "service-design-001",
    category: "design",
    title: "设计服务",
    titleEn: "Design Services",
    description: "从品牌视觉到用户体验，打造令人印象深刻的设计作品",
    descriptionEn: "From brand visuals to user experience, creating impressive design works",
    icon: "palette",
    features: ["UI/UX设计", "品牌设计", "平面设计", "3D设计"],
    featuresEn: ["UI/UX Design", "Brand Design", "Graphic Design", "3D Design"],
    priceRange: {
      min: 5000,
      max: 50000,
      unit: "CNY"
    },
    deliveryTime: "2-4 weeks",
    popular: true,
    order: 1
  },
  {
    id: "service-dev-001",
    category: "development",
    title: "开发服务",
    titleEn: "Development Services",
    description: "专业的技术团队，为您构建高性能、可扩展的数字产品",
    descriptionEn: "Professional tech team building high-performance, scalable digital products",
    icon: "code",
    features: ["Web开发", "移动应用", "小程序", "企业系统"],
    featuresEn: ["Web Development", "Mobile Apps", "Mini Programs", "Enterprise Systems"],
    priceRange: {
      min: 10000,
      max: 100000,
      unit: "CNY"
    },
    deliveryTime: "4-12 weeks",
    popular: true,
    order: 2
  },
  {
    id: "service-startup-001",
    category: "startup",
    title: "创业服务",
    titleEn: "Startup Services",
    description: "从想法到产品，全方位支持您的创业之旅",
    descriptionEn: "From idea to product, comprehensive support for your entrepreneurial journey",
    icon: "rocket",
    features: ["商业计划", "MVP开发", "融资对接", "项目孵化"],
    featuresEn: ["Business Planning", "MVP Development", "Funding Connection", "Project Incubation"],
    priceRange: {
      min: 20000,
      max: 200000,
      unit: "CNY"
    },
    deliveryTime: "3-6 months",
    popular: true,
    order: 3
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    // Filter core services
    let filteredServices = [...coreServices];

    if (category && category !== "all") {
      filteredServices = filteredServices.filter(s => s.category === category);
    }

    // Try to fetch from database if available
    try {
      const where: any = {
        status: "ACTIVE"
      };

      if (category && category !== "all") {
        where.category = category;
      }

      if (type && type !== "all") {
        where.type = type.toUpperCase();
      }

      const dbServices = await prisma.service.findMany({
        where,
        orderBy: {
          createdAt: "desc"
        }
      });

      // Combine database services with core services
      if (dbServices && dbServices.length > 0) {
        filteredServices = [...filteredServices, ...dbServices];
      }
    } catch (dbError) {
      // If database query fails, just use mock data
      console.warn("Database query failed, using mock data:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: filteredServices,
      count: filteredServices.length
    });

  } catch (error) {
    console.error("获取服务列表失败:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "获取服务列表失败",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}