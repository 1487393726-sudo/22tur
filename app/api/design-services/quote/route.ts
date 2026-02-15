import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      serviceId, 
      industryId, 
      projectDetails, 
      timeline, 
      budget, 
      contactInfo 
    } = body;

    // 验证必填字段
    if (!serviceId || !contactInfo?.email || !contactInfo?.name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 创建设计服务咨询记录
    const quote = await prisma.designServiceQuote.create({
      data: {
        serviceId,
        industryId,
        projectDetails: projectDetails || "",
        timeline: timeline || "",
        budget: budget || "",
        contactName: contactInfo.name,
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone || "",
        contactCompany: contactInfo.company || "",
        status: "PENDING",
        quoteNumber: `DSQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      }
    });

    // 发送确认邮件（这里可以集成邮件服务）
    // await sendQuoteConfirmationEmail(quote);

    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        createdAt: quote.createdAt
      }
    });

  } catch (error) {
    console.error("Failed to create design service quote:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 获取用户的设计服务咨询记录
    const quotes = await prisma.designServiceQuote.findMany({
      where: {
        contactEmail: session.user.email
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      quotes
    });

  } catch (error) {
    console.error("Failed to fetch design service quotes:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}