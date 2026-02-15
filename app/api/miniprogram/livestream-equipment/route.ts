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
  getAllUsedEquipment,
  getEquipmentByType,
  usedEquipmentPackages,
  type Equipment,
  type ConditionGrade,
} from '@/lib/livestream/equipment-catalog';

// 筛选和排序设备
function filterAndSortEquipment(
  equipment: Equipment[],
  options: {
    equipmentType?: 'new' | 'used' | 'all';
    condition?: ConditionGrade[];
    sortBy?: 'price_asc' | 'price_desc';
  }
): Equipment[] {
  let result = [...equipment];

  // 按新旧类型筛选
  if (options.equipmentType && options.equipmentType !== 'all') {
    result = result.filter(e => e.type === options.equipmentType);
  }

  // 按成色筛选（仅对二手设备有效）
  if (options.condition && options.condition.length > 0) {
    result = result.filter(e => 
      e.type === 'new' || (e.condition && options.condition!.includes(e.condition))
    );
  }

  // 排序
  if (options.sortBy === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (options.sortBy === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

// GET - 小程序获取直播设备列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'personal' | 'business' | 'professional' | 'broadcast' | null;
    const equipmentType = searchParams.get('equipmentType') as 'new' | 'used' | 'all' | null;
    const conditionParam = searchParams.get('condition');
    const sortBy = searchParams.get('sortBy') as 'price_asc' | 'price_desc' | null;
    const id = searchParams.get('id');

    // 如果请求单个设备详情
    if (id) {
      const allEquipment = getAllEquipment();
      const equipment = allEquipment.find(e => e.id === id);
      
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

    let equipment: Equipment[];
    let packages;

    // 根据分类筛选
    if (category) {
      switch (category) {
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
      packages = getPackagesByType(category);
    } else {
      equipment = getAllEquipment();
      packages = [...equipmentPackages, ...usedEquipmentPackages];
    }

    // 解析成色筛选参数
    const condition = conditionParam 
      ? conditionParam.split(',') as ConditionGrade[]
      : undefined;

    // 应用筛选和排序
    equipment = filterAndSortEquipment(equipment, {
      equipmentType: equipmentType || 'all',
      condition,
      sortBy: sortBy || undefined,
    });

    // 统计信息
    const allEquipment = getAllEquipment();
    const usedEquipment = getAllUsedEquipment();
    const stats = {
      totalEquipment: allEquipment.length,
      newEquipment: allEquipment.filter(e => e.type === 'new').length,
      usedEquipment: usedEquipment.length,
      totalPackages: equipmentPackages.length + usedEquipmentPackages.length,
      categories: {
        personal: { equipment: personalEquipment.length, packages: getPackagesByType('personal').length },
        business: { equipment: businessEquipment.length, packages: getPackagesByType('business').length },
        professional: { equipment: professionalEquipment.length, packages: getPackagesByType('professional').length },
        broadcast: { equipment: broadcastEquipment.length, packages: getPackagesByType('broadcast').length },
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        equipment,
        packages,
        services: servicesPricing,
        stats,
      },
    });
  } catch (error) {
    console.error('小程序获取直播设备失败:', error);
    return NextResponse.json(
      { success: false, error: '获取设备列表失败' },
      { status: 500 }
    );
  }
}

// POST - 提交设备咨询/预约
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, packageId, equipmentIds, name, phone, address, serviceType, message } = body;

    // 验证必填字段
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: '请填写姓名和联系电话' },
        { status: 400 }
      );
    }

    // 这里可以保存到数据库或发送通知
    // 暂时返回成功
    const inquiry = {
      id: `INQ${Date.now()}`,
      type: type || 'general',
      packageId,
      equipmentIds,
      customer: { name, phone, address },
      serviceType: serviceType || 'consultation',
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('收到设备咨询:', inquiry);

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: '咨询已提交，我们会尽快联系您',
    });
  } catch (error) {
    console.error('提交咨询失败:', error);
    return NextResponse.json(
      { success: false, error: '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}
