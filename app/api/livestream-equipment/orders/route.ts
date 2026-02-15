import { NextRequest, NextResponse } from 'next/server';
import { getPackageById, getEquipmentById, servicesPricing } from '@/lib/livestream/equipment-catalog';

// POST - 提交直播设备订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type, // 'package' | 'equipment'
      packageId,
      equipmentItems, // [{ id, quantity }]
      customer,
      deliveryType,
      installationType,
      address,
      notes,
    } = body;

    // 验证客户信息
    if (!customer?.name || !customer?.phone) {
      return NextResponse.json(
        { success: false, error: '请填写完整的联系信息' },
        { status: 400 }
      );
    }

    if (!address?.city || !address?.detail) {
      return NextResponse.json(
        { success: false, error: '请填写完整的收货地址' },
        { status: 400 }
      );
    }

    let orderItems: Array<{
      id: string;
      name: string;
      model: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];
    let subtotal = 0;

    if (type === 'package' && packageId) {
      // 套餐订单
      const pkg = getPackageById(packageId);
      if (!pkg) {
        return NextResponse.json(
          { success: false, error: '套餐不存在' },
          { status: 404 }
        );
      }

      orderItems = pkg.items.map(item => ({
        id: item.equipmentId,
        name: item.name,
        model: item.model,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      }));
      subtotal = pkg.packagePrice;
    } else if (equipmentItems?.length > 0) {
      // 单品订单
      for (const item of equipmentItems) {
        const equipment = getEquipmentById(item.id);
        if (!equipment) {
          return NextResponse.json(
            { success: false, error: `设备 ${item.id} 不存在` },
            { status: 404 }
          );
        }
        const itemSubtotal = equipment.price * item.quantity;
        orderItems.push({
          id: equipment.id,
          name: equipment.name,
          model: equipment.model,
          quantity: item.quantity,
          unitPrice: equipment.price,
          subtotal: itemSubtotal,
        });
        subtotal += itemSubtotal;
      }
    } else {
      return NextResponse.json(
        { success: false, error: '请选择要购买的商品' },
        { status: 400 }
      );
    }

    // 计算配送费
    let deliveryFee = 0;
    const delivery = servicesPricing.delivery;
    switch (deliveryType) {
      case 'express':
        deliveryFee = delivery.express.price;
        break;
      case 'sameDay':
        deliveryFee = delivery.sameDay.price;
        break;
      case 'largeItem':
        deliveryFee = delivery.largeItem.price;
        break;
      default:
        deliveryFee = subtotal >= 500 ? 0 : delivery.standard.price;
    }

    // 计算安装费（乌鲁木齐市内）
    let installationFee = 0;
    const isUrumqi = address.city?.includes('乌鲁木齐');
    if (isUrumqi && installationType) {
      const installation = servicesPricing.installation;
      switch (installationType) {
        case 'standard':
          installationFee = installation.standard.price;
          break;
        case 'professional':
          installationFee = installation.professional.price;
          break;
        default:
          installationFee = 0;
      }
    }

    // 计算总价
    const totalPrice = subtotal + deliveryFee + installationFee;

    // 生成订单
    const order = {
      id: `LE${Date.now()}`,
      type: type === 'package' ? 'package' : 'equipment',
      packageId: type === 'package' ? packageId : null,
      items: orderItems,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      address: {
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
      },
      delivery: {
        type: deliveryType || 'standard',
        fee: deliveryFee,
      },
      installation: {
        type: installationType || 'none',
        fee: installationFee,
        isUrumqi,
      },
      pricing: {
        subtotal,
        deliveryFee,
        installationFee,
        total: totalPrice,
      },
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // TODO: 保存到数据库
    console.log('新订单:', order);

    return NextResponse.json({
      success: true,
      data: order,
      message: '订单提交成功，我们会尽快联系您确认',
    });
  } catch (error) {
    console.error('提交订单失败:', error);
    return NextResponse.json(
      { success: false, error: '提交订单失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// GET - 获取订单列表（需要认证）
export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取订单列表
    // 这里返回示例数据
    return NextResponse.json({
      success: true,
      data: {
        orders: [],
        total: 0,
      },
    });
  } catch (error) {
    console.error('获取订单失败:', error);
    return NextResponse.json(
      { success: false, error: '获取订单失败' },
      { status: 500 }
    );
  }
}
