import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取常见问题列表
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = { active: true };
    if (category) {
      where.category = category;
    }

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { viewCount: 'desc' }
      ],
      take: limit
    });

    const items = faqs.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('获取FAQ失败:', error);
    return NextResponse.json({ error: '获取FAQ失败' }, { status: 500 });
  }
}
