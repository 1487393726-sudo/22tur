import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎬 开始创建直播设备市场种子数据...');

  // 创建设备分类
  const categories = await Promise.all([
    prisma.equipmentCategory.upsert({
      where: { slug: 'lighting' },
      update: {},
      create: {
        name: '灯光设备',
        nameEn: 'Lighting',
        slug: 'lighting',
        description: '专业直播灯光设备，包括环形灯、柔光灯、补光灯等',
        icon: 'Lightbulb',
        order: 1,
        isActive: true,
      },
    }),
    prisma.equipmentCategory.upsert({
      where: { slug: 'computer' },
      update: {},
      create: {
        name: '电脑设备',
        nameEn: 'Computer',
        slug: 'computer',
        description: '直播专用电脑、笔记本、迷你主机等',
        icon: 'Monitor',
        order: 2,
        isActive: true,
      },
    }),
    prisma.equipmentCategory.upsert({
      where: { slug: 'camera' },
      update: {},
      create: {
        name: '摄像机',
        nameEn: 'Camera',
        slug: 'camera',
        description: '高清摄像机、网络摄像头、运动相机等',
        icon: 'Camera',
        order: 3,
        isActive: true,
      },
    }),
    prisma.equipmentCategory.upsert({
      where: { slug: 'microphone' },
      update: {},
      create: {
        name: '麦克风',
        nameEn: 'Microphone',
        slug: 'microphone',
        description: '电容麦克风、动圈麦克风、领夹麦克风等',
        icon: 'Mic',
        order: 4,
        isActive: true,
      },
    }),
    prisma.equipmentCategory.upsert({
      where: { slug: 'audio-interface' },
      update: {},
      create: {
        name: '声卡',
        nameEn: 'Audio Interface',
        slug: 'audio-interface',
        description: '外置声卡、USB声卡、专业音频接口等',
        icon: 'AudioLines',
        order: 5,
        isActive: true,
      },
    }),
    prisma.equipmentCategory.upsert({
      where: { slug: 'stand' },
      update: {},
      create: {
        name: '支架',
        nameEn: 'Stand',
        slug: 'stand',
        description: '手机支架、相机支架、麦克风支架、灯光支架等',
        icon: 'Grip',
        order: 6,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ 创建了 ${categories.length} 个设备分类`);

  // 获取分类ID映射
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.id;
    return acc;
  }, {} as Record<string, string>);

  // 创建设备数据
  const equipmentData = [
    // 灯光设备
    {
      name: '专业环形补光灯 18寸',
      nameEn: 'Professional Ring Light 18 inch',
      description: '18寸大尺寸环形灯，三色温可调，亮度无极调节，适合美妆、带货直播',
      price: 299,
      originalPrice: 399,
      categoryId: categoryMap['lighting'],
      targetSegments: JSON.stringify(['PERSONAL', 'PROFESSIONAL']),
      priceTier: 'ENTRY',
      specifications: JSON.stringify({
        '尺寸': '18英寸/45cm',
        '功率': '55W',
        '色温': '3200K-5600K',
        '亮度': '0-100%无极调节',
        '供电': 'AC 110-240V',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 100,
      status: 'ACTIVE',
      brand: 'NEEWER',
      featured: true,
    },
    {
      name: '双色温LED柔光灯板',
      nameEn: 'Bi-Color LED Soft Light Panel',
      description: '专业级LED柔光灯，CRI>95高显色，适合专业直播间布光',
      price: 599,
      originalPrice: 799,
      categoryId: categoryMap['lighting'],
      targetSegments: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']),
      priceTier: 'MID',
      specifications: JSON.stringify({
        '功率': '100W',
        '色温': '3200K-5600K',
        'CRI': '>95',
        '调光': '0-100%',
        '尺寸': '60x45cm',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 50,
      status: 'ACTIVE',
      brand: 'Godox',
    },
    {
      name: '便携式口袋补光灯',
      nameEn: 'Portable Pocket Fill Light',
      description: '小巧便携，内置电池，适合户外直播和移动场景',
      price: 129,
      originalPrice: 169,
      categoryId: categoryMap['lighting'],
      targetSegments: JSON.stringify(['PERSONAL']),
      priceTier: 'ENTRY',
      specifications: JSON.stringify({
        '功率': '10W',
        '色温': '3000K-6500K',
        '电池': '4000mAh',
        '续航': '约2小时',
        '尺寸': '12x8x2cm',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 200,
      status: 'ACTIVE',
      brand: 'Ulanzi',
    },
    // 电脑设备
    {
      name: '直播专用迷你主机 i7',
      nameEn: 'Streaming Mini PC i7',
      description: 'Intel i7处理器，32GB内存，1TB SSD，专为直播优化',
      price: 4999,
      originalPrice: 5999,
      categoryId: categoryMap['computer'],
      targetSegments: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']),
      priceTier: 'HIGH',
      specifications: JSON.stringify({
        'CPU': 'Intel Core i7-12700',
        '内存': '32GB DDR4',
        '存储': '1TB NVMe SSD',
        '显卡': 'Intel UHD 770',
        '接口': 'USB3.2x4, HDMI, DP, 2.5G网口',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 30,
      status: 'ACTIVE',
      brand: 'Intel NUC',
      featured: true,
    },
    {
      name: '入门级直播电脑主机',
      nameEn: 'Entry Level Streaming PC',
      description: 'AMD Ryzen 5处理器，16GB内存，适合入门直播用户',
      price: 2999,
      originalPrice: 3499,
      categoryId: categoryMap['computer'],
      targetSegments: JSON.stringify(['PERSONAL']),
      priceTier: 'MID',
      specifications: JSON.stringify({
        'CPU': 'AMD Ryzen 5 5600G',
        '内存': '16GB DDR4',
        '存储': '512GB NVMe SSD',
        '显卡': 'AMD Radeon Graphics',
        '接口': 'USB3.0x4, HDMI, DP',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 50,
      status: 'ACTIVE',
      brand: 'AMD',
    },
    {
      name: '高性能直播工作站',
      nameEn: 'High Performance Streaming Workstation',
      description: 'Intel i9处理器，64GB内存，RTX 4070显卡，企业级直播解决方案',
      price: 12999,
      originalPrice: 14999,
      categoryId: categoryMap['computer'],
      targetSegments: JSON.stringify(['ENTERPRISE']),
      priceTier: 'HIGH',
      specifications: JSON.stringify({
        'CPU': 'Intel Core i9-13900K',
        '内存': '64GB DDR5',
        '存储': '2TB NVMe SSD',
        '显卡': 'NVIDIA RTX 4070',
        '接口': 'USB3.2x6, Thunderbolt 4, HDMI 2.1, DP 1.4',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 10,
      status: 'ACTIVE',
      brand: 'Custom Build',
    },
    // 摄像机
    {
      name: '4K高清网络摄像头',
      nameEn: '4K HD Webcam',
      description: '4K超高清，自动对焦，内置降噪麦克风，即插即用',
      price: 499,
      originalPrice: 699,
      categoryId: categoryMap['camera'],
      targetSegments: JSON.stringify(['PERSONAL', 'PROFESSIONAL']),
      priceTier: 'MID',
      specifications: JSON.stringify({
        '分辨率': '4K 30fps / 1080P 60fps',
        '视角': '90°广角',
        '对焦': '自动对焦',
        '麦克风': '双立体声降噪麦克风',
        '接口': 'USB 3.0',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 80,
      status: 'ACTIVE',
      brand: 'Logitech',
      featured: true,
    },
    {
      name: '入门级1080P摄像头',
      nameEn: 'Entry 1080P Webcam',
      description: '1080P高清，性价比之选，适合入门直播用户',
      price: 199,
      originalPrice: 249,
      categoryId: categoryMap['camera'],
      targetSegments: JSON.stringify(['PERSONAL']),
      priceTier: 'ENTRY',
      specifications: JSON.stringify({
        '分辨率': '1080P 30fps',
        '视角': '78°',
        '对焦': '定焦',
        '麦克风': '内置单麦克风',
        '接口': 'USB 2.0',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 150,
      status: 'ACTIVE',
      brand: 'Generic',
    },
    {
      name: '专业直播摄像机 PTZ',
      nameEn: 'Professional PTZ Camera',
      description: 'PTZ云台摄像机，20倍光学变焦，支持NDI协议，适合专业直播间',
      price: 8999,
      originalPrice: 10999,
      categoryId: categoryMap['camera'],
      targetSegments: JSON.stringify(['ENTERPRISE']),
      priceTier: 'HIGH',
      specifications: JSON.stringify({
        '分辨率': '4K 60fps',
        '变焦': '20倍光学变焦',
        '协议': 'NDI, RTMP, SRT',
        '云台': '水平355°, 垂直120°',
        '接口': 'HDMI, SDI, USB, 网口',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 15,
      status: 'ACTIVE',
      brand: 'PTZOptics',
    },
    // 麦克风
    {
      name: '专业电容麦克风套装',
      nameEn: 'Professional Condenser Microphone Kit',
      description: '大振膜电容麦克风，心形指向，录音级音质，含防震架和防喷罩',
      price: 699,
      originalPrice: 899,
      categoryId: categoryMap['microphone'],
      targetSegments: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']),
      priceTier: 'MID',
      specifications: JSON.stringify({
        '类型': '大振膜电容麦克风',
        '指向': '心形指向',
        '频响': '20Hz-20kHz',
        '灵敏度': '-34dB',
        '接口': 'XLR',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 60,
      status: 'ACTIVE',
      brand: 'Audio-Technica',
      featured: true,
    },
    {
      name: 'USB即插即用麦克风',
      nameEn: 'USB Plug and Play Microphone',
      description: 'USB直连电脑，无需声卡，适合入门直播和游戏语音',
      price: 199,
      originalPrice: 299,
      categoryId: categoryMap['microphone'],
      targetSegments: JSON.stringify(['PERSONAL']),
      priceTier: 'ENTRY',
      specifications: JSON.stringify({
        '类型': '电容麦克风',
        '指向': '心形指向',
        '频响': '50Hz-16kHz',
        '采样率': '48kHz/16bit',
        '接口': 'USB',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 120,
      status: 'ACTIVE',
      brand: 'Blue',
    },
    {
      name: '无线领夹麦克风',
      nameEn: 'Wireless Lavalier Microphone',
      description: '2.4G无线传输，一拖二，适合户外直播和访谈',
      price: 399,
      originalPrice: 499,
      categoryId: categoryMap['microphone'],
      targetSegments: JSON.stringify(['PERSONAL', 'PROFESSIONAL']),
      priceTier: 'MID',
      specifications: JSON.stringify({
        '类型': '全向领夹麦克风',
        '传输': '2.4G无线',
        '距离': '50米',
        '续航': '6小时',
        '接口': 'Type-C/Lightning/3.5mm',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 90,
      status: 'ACTIVE',
      brand: 'RODE',
    },
    // 声卡
    {
      name: '专业直播声卡',
      nameEn: 'Professional Streaming Audio Interface',
      description: '多种音效，变声功能，支持48V幻象供电，适合专业直播',
      price: 599,
      originalPrice: 799,
      categoryId: categoryMap['audio-interface'],
      targetSegments: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']),
      priceTier: 'MID',
      specifications: JSON.stringify({
        '通道': '2进2出',
        '采样率': '192kHz/24bit',
        '幻象供电': '48V',
        '音效': '混响、变声、闪避等',
        '接口': 'USB-C',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 70,
      status: 'ACTIVE',
      brand: 'Focusrite',
      featured: true,
    },
    {
      name: '入门级USB声卡',
      nameEn: 'Entry USB Audio Interface',
      description: '即插即用，基础音效，适合入门直播用户',
      price: 199,
      originalPrice: 299,
      categoryId: categoryMap['audio-interface'],
      targetSegments: JSON.stringify(['PERSONAL']),
      priceTier: 'ENTRY',
      specifications: JSON.stringify({
        '通道': '1进1出',
        '采样率': '48kHz/16bit',
        '音效': '基础混响',
        '接口': 'USB',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 100,
      status: 'ACTIVE',
      brand: 'Generic',
    },
    {
      name: '多通道专业调音台',
      nameEn: 'Multi-Channel Professional Mixer',
      description: '12通道调音台，内置效果器，适合多人直播和活动',
      price: 2999,
      originalPrice: 3499,
      categoryId: categoryMap['audio-interface'],
      targetSegments: JSON.stringify(['ENTERPRISE']),
      priceTier: 'HIGH',
      specifications: JSON.stringify({
        '通道': '12通道',
        '采样率': '192kHz/24bit',
        '效果器': '内置DSP效果器',
        '接口': 'USB, XLR, TRS',
        '功能': '多轨录音、直播推流',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 20,
      status: 'ACTIVE',
      brand: 'Yamaha',
    },
    // 支架
    {
      name: '桌面悬臂麦克风支架',
      nameEn: 'Desktop Boom Arm Microphone Stand',
      description: '可调节悬臂支架，360°旋转，适合桌面直播',
      price: 129,
      originalPrice: 169,
      categoryId: categoryMap['stand'],
      targetSegments: JSON.stringify(['PERSONAL', 'PROFESSIONAL']),
      priceTier: 'ENTRY',
      specifications: JSON.stringify({
        '材质': '钢制',
        '承重': '2kg',
        '臂长': '80cm',
        '夹持': '桌面夹持',
        '旋转': '360°',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 150,
      status: 'ACTIVE',
      brand: 'Generic',
    },
    {
      name: '落地三脚架灯光支架',
      nameEn: 'Floor Tripod Light Stand',
      description: '2.1米高度可调，适合灯光和相机',
      price: 99,
      originalPrice: 149,
      categoryId: categoryMap['stand'],
      targetSegments: JSON.stringify(['PERSONAL', 'PROFESSIONAL']),
      priceTier: 'ENTRY',
      specifications: JSON.stringify({
        '材质': '铝合金',
        '高度': '0.8-2.1米',
        '承重': '5kg',
        '折叠': '可折叠',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 200,
      status: 'ACTIVE',
      brand: 'Generic',
    },
    {
      name: '专业直播桌面支架套装',
      nameEn: 'Professional Desktop Stand Kit',
      description: '包含手机支架、平板支架、相机支架，一站式解决方案',
      price: 399,
      originalPrice: 599,
      categoryId: categoryMap['stand'],
      targetSegments: JSON.stringify(['PROFESSIONAL', 'ENTERPRISE']),
      priceTier: 'MID',
      specifications: JSON.stringify({
        '包含': '手机支架x2、平板支架x1、相机支架x1',
        '材质': '铝合金+ABS',
        '承重': '各2kg',
        '调节': '多角度可调',
      }),
      images: JSON.stringify(['/placeholder.jpg']),
      stock: 80,
      status: 'ACTIVE',
      brand: 'Ulanzi',
    },
  ];

  const equipment = await Promise.all(
    equipmentData.map((item) =>
      prisma.equipment.create({ data: item })
    )
  );

  console.log(`✅ 创建了 ${equipment.length} 个设备产品`);

  // 创建设备套餐
  const bundles = await Promise.all([
    // 普通用户套餐
    prisma.equipmentBundle.create({
      data: {
        name: '入门直播套装',
        nameEn: 'Entry Streaming Kit',
        description: '适合个人用户的入门级直播设备套装，包含基础灯光、摄像头、麦克风和支架',
        price: 699,
        originalPrice: 926,
        targetSegment: 'PERSONAL',
        images: JSON.stringify(['/placeholder.jpg']),
        status: 'ACTIVE',
        featured: true,
        items: {
          create: [
            { equipmentId: equipment.find(e => e.name === '便携式口袋补光灯')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '入门级1080P摄像头')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === 'USB即插即用麦克风')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '桌面悬臂麦克风支架')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '落地三脚架灯光支架')!.id, quantity: 1 },
          ],
        },
      },
    }),
    // 行业用户套餐
    prisma.equipmentBundle.create({
      data: {
        name: '专业直播套装',
        nameEn: 'Professional Streaming Kit',
        description: '适合行业用户的专业级直播设备套装，包含专业灯光、4K摄像头、电容麦克风、声卡和支架',
        price: 2499,
        originalPrice: 3224,
        targetSegment: 'PROFESSIONAL',
        images: JSON.stringify(['/placeholder.jpg']),
        status: 'ACTIVE',
        featured: true,
        items: {
          create: [
            { equipmentId: equipment.find(e => e.name === '专业环形补光灯 18寸')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '双色温LED柔光灯板')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '4K高清网络摄像头')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '专业电容麦克风套装')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '专业直播声卡')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '桌面悬臂麦克风支架')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '落地三脚架灯光支架')!.id, quantity: 2 },
          ],
        },
      },
    }),
    // 企业用户套餐
    prisma.equipmentBundle.create({
      data: {
        name: '企业直播间全套方案',
        nameEn: 'Enterprise Streaming Room Solution',
        description: '适合企业用户的完整直播间解决方案，包含高端设备、专业工作站和全套配件',
        price: 25999,
        originalPrice: 32493,
        targetSegment: 'ENTERPRISE',
        images: JSON.stringify(['/placeholder.jpg']),
        status: 'ACTIVE',
        featured: true,
        items: {
          create: [
            { equipmentId: equipment.find(e => e.name === '双色温LED柔光灯板')!.id, quantity: 3 },
            { equipmentId: equipment.find(e => e.name === '高性能直播工作站')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '专业直播摄像机 PTZ')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '专业电容麦克风套装')!.id, quantity: 2 },
            { equipmentId: equipment.find(e => e.name === '无线领夹麦克风')!.id, quantity: 2 },
            { equipmentId: equipment.find(e => e.name === '多通道专业调音台')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '专业直播桌面支架套装')!.id, quantity: 1 },
            { equipmentId: equipment.find(e => e.name === '落地三脚架灯光支架')!.id, quantity: 3 },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ 创建了 ${bundles.length} 个设备套餐`);

  console.log('🎉 直播设备市场种子数据创建完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
