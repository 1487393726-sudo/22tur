import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取服务类型列表
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const serviceTypes = await prisma.serviceType.findMany({
      where: {
        active: true,
        appointmentEnabled: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    const result = serviceTypes.map(st => ({
      id: st.id,
      name: st.name,
      description: st.description,
      icon: st.icon,
      price: st.price,
      duration: st.duration,
      location: st.location
    }));

    return NextResponse.json({ serviceTypes: result });
  } catch (error) {
    console.error('获取服务类型失败:', error);
    return NextResponse.json({ error: '获取服务类型失败' }, { status: 500 });
  }
}
