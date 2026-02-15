import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/addresses - 获取地址列表
export async function GET(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      list: addresses.map(addr => ({
        id: addr.id,
        name: addr.name,
        phone: addr.phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        address: addr.address,
        isDefault: addr.isDefault,
        latitude: addr.latitude,
        longitude: addr.longitude
      }))
    });
  } catch (error) {
    console.error('获取地址列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/addresses - 添加地址
export async function POST(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, province, city, district, address, isDefault, latitude, longitude, postalCode } = body;

    if (!name || !phone || !province || !city || !district || !address) {
      return NextResponse.json(
        { success: false, error: '请填写完整信息' },
        { status: 400 }
      );
    }

    // 如果设为默认，先取消其他默认地址
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    // 检查是否是第一个地址，自动设为默认
    const addressCount = await prisma.userAddress.count({
      where: { userId: user.id }
    });

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: user.id,
        name,
        phone,
        province,
        city,
        district,
        address,
        postalCode,
        latitude,
        longitude,
        isDefault: isDefault || addressCount === 0
      }
    });

    return NextResponse.json({
      success: true,
      id: newAddress.id,
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加地址失败:', error);
    return NextResponse.json(
      { success: false, error: '添加失败' },
      { status: 500 }
    );
  }
}
