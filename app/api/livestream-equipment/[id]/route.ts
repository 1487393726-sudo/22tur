import { NextRequest, NextResponse } from 'next/server';
import { getEquipmentById, getPackageById } from '@/lib/livestream/equipment-catalog';

// GET - 获取单个设备或套餐详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isPackage = searchParams.get('type') === 'package';

    if (isPackage) {
      // 获取套餐详情
      const pkg = getPackageById(id);
      if (!pkg) {
        return NextResponse.json(
          { success: false, error: '套餐不存在' },
          { status: 404 }
        );
      }

      // 获取套餐中每个设备的详细信息
      const itemsWithDetails = pkg.items.map(item => {
        const equipment = getEquipmentById(item.equipmentId);
        return {
          ...item,
          equipment,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          ...pkg,
          itemsWithDetails,
        },
      });
    } else {
      // 获取设备详情
      const equipment = getEquipmentById(id);
      if (!equipment) {
        return NextResponse.json(
          { success: false, error: '设备不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: equipment,
      });
    }
  } catch (error) {
    console.error('获取详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取详情失败' },
      { status: 500 }
    );
  }
}
