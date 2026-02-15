import { NextRequest, NextResponse } from 'next/server';
import {
  getAllEquipment,
  getPackagesByType,
  equipmentPackages,
  servicesPricing,
  personalEquipment,
  businessEquipment,
  professionalEquipment,
  broadcastEquipment,
} from '@/lib/livestream/equipment-catalog';

// GET - 获取直播设备列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'personal' | 'business' | 'professional' | 'broadcast' | null;
    const category = searchParams.get('category'); // 设备分类
    const includePackages = searchParams.get('packages') === 'true';
    const includeServices = searchParams.get('services') === 'true';

    let equipment;
    let packages;

    // 根据类型筛选设备
    if (type) {
      switch (type) {
        case 'personal':
          equipment = personalEquipment;
          break;
        case 'business':
          equipment = businessEquipment;
          break;
        case 'professional':
          equipment = professionalEquipment;
          break;
        case 'broadcast':
          equipment = broadcastEquipment;
          break;
        default:
          equipment = getAllEquipment();
      }
      packages = getPackagesByType(type);
    } else {
      equipment = getAllEquipment();
      packages = equipmentPackages;
    }

    // 根据分类筛选
    if (category) {
      equipment = equipment.filter(e => e.category === category);
    }

    const response: Record<string, unknown> = {
      success: true,
      data: {
        equipment,
        total: equipment.length,
      },
    };

    // 包含套餐信息
    if (includePackages) {
      response.data = {
        ...response.data as object,
        packages,
        packagesTotal: Array.isArray(packages) ? packages.length : 0,
      };
    }

    // 包含服务价格
    if (includeServices) {
      response.data = {
        ...response.data as object,
        services: servicesPricing,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取直播设备失败:', error);
    return NextResponse.json(
      { success: false, error: '获取设备列表失败' },
      { status: 500 }
    );
  }
}
