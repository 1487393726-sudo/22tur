import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 获取系统设置
    const settings = await prisma.systemSetting.findFirst();
    
    if (!settings) {
      return NextResponse.json({
        company: {
          name: "创意代理公司",
          email: "info@creative-agency.com",
          phone: "+86 123-456-7890",
          address: "北京市朝阳区创意大厦88号",
          website: "https://creative-agency.com",
          description: "专注于创意设计和数字化解决方案",
        },
        system: {
          timezone: "Asia/Shanghai",
          language: "zh-CN",
          dateFormat: "YYYY-MM-DD",
          currency: "CNY",
        },
      });
    }

    return NextResponse.json(settings.data || {});
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 保存或更新系统设置
    const settings = await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        data,
        updatedAt: new Date(),
      },
      create: {
        id: "default",
        data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: settings.data,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
