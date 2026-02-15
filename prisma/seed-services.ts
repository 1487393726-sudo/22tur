import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建服务类目和示例服务数据...');

  // 创建服务类目
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: '设计服务',
        nameEn: 'Design Services',
        slug: 'design',
        description: '专业的品牌VI设计、3D产品建模、印刷设计、包装设计服务',
        icon: 'Palette',
        order: 1,
        isActive: true,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'development' },
      update: {},
      create: {
        name: '开发服务',
        nameEn: 'Development Services',
        slug: 'development',
        description: '网站、APP、小程序、软件系统开发服务',
        icon: 'Code',
        order: 2,
        isActive: true,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'production' },
      update: {},
      create: {
        name: '制作服务',
        nameEn: 'Production Services',
        slug: 'production',
        description: '纸类印刷、包装制作、服装定制、多媒体制作服务',
        icon: 'Package',
        order: 3,
        isActive: true,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'hr' },
      update: {},
      create: {
        name: '人力资源服务',
        nameEn: 'HR Services',
        slug: 'hr',
        description: '专业人才外包、营销策划、市场分析服务',
        icon: 'Users',
        order: 4,
        isActive: true,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'startup' },
      update: {},
      create: {
        name: '创业服务',
        nameEn: 'Startup Services',
        slug: 'startup',
        description: '数字化全透明创业孵化，让每一分钱都在您的实时监控之下',
        icon: 'Rocket',
        order: 5,
        isActive: true,
      },
    }),
  ]);

  console.log(`创建了 ${categories.length} 个服务类目`);

  const [designCategory, devCategory, prodCategory, hrCategory, startupCategory] = categories;

  // ==================== 设计服务项目 ====================
  // 一、品牌视觉识别系统 (VI) 套餐
  const designServices = await Promise.all([
    // VI 基础版
    prisma.serviceItem.upsert({
      where: { slug: 'vi-basic' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: 'VI基础版',
        nameEn: 'Basic VI Package',
        slug: 'vi-basic',
        description: '针对企业初创或品牌升级，提供基础视觉规范',
        priceType: 'FIXED',
        basePrice: 3800,
        unit: '套',
        deliveryDays: 7,
        features: JSON.stringify([
          'Logo设计（3个方案）',
          '标准色规范',
          '标准字体规范',
          '名片设计',
          '源文件交付（AI/PSD）',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 1,
      },
    }),
    // VI 标准版
    prisma.serviceItem.upsert({
      where: { slug: 'vi-standard' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: 'VI标准版',
        nameEn: 'Standard VI Package',
        slug: 'vi-standard',
        description: '完整的品牌视觉识别系统，适合成长型企业',
        priceType: 'FIXED',
        basePrice: 6800,
        unit: '套',
        deliveryDays: 14,
        features: JSON.stringify([
          '基础版全部内容',
          '社交媒体头像设计',
          '信封设计',
          '文件夹设计',
          '工作证设计',
          '5次修改机会',
        ]),
        status: 'ACTIVE',
        isFeatured: true,
        order: 2,
      },
    }),
    // VI 全案版
    prisma.serviceItem.upsert({
      where: { slug: 'vi-full' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: 'VI全案版',
        nameEn: 'Full VI Package',
        slug: 'vi-full',
        description: '企业级完整VI系统，包含全套应用规范',
        priceType: 'RANGE',
        minPrice: 12800,
        maxPrice: 28800,
        unit: '套',
        deliveryDays: 30,
        features: JSON.stringify([
          '标准版全部内容',
          '包装规范设计',
          '工作服设计',
          '导视系统设计',
          '完整VI手册',
          '商标注册指导',
          '专属设计师服务',
        ]),
        status: 'ACTIVE',
        order: 3,
      },
    }),

    // 二、3D 产品模型与空间设计
    // 3D 产品建模
    prisma.serviceItem.upsert({
      where: { slug: '3d-product-modeling' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '3D产品建模',
        nameEn: '3D Product Modeling',
        slug: '3d-product-modeling',
        description: '基础几何造型/工业结构建模，实现产品从无到有的视觉化',
        priceType: 'RANGE',
        minPrice: 800,
        maxPrice: 2500,
        unit: '件',
        deliveryDays: 5,
        features: JSON.stringify([
          '高精度建模',
          '多角度展示',
          '材质贴图',
          'STEP/OBJ格式交付',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 4,
      },
    }),
    // 高保真渲染
    prisma.serviceItem.upsert({
      where: { slug: '3d-rendering' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '高保真渲染',
        nameEn: 'High-Fidelity Rendering',
        slug: '3d-rendering',
        description: '4K超清图、材质模拟、光影处理',
        priceType: 'RANGE',
        minPrice: 500,
        maxPrice: 1200,
        unit: '张',
        deliveryDays: 3,
        features: JSON.stringify([
          '4K超清分辨率',
          '真实材质模拟',
          '专业光影处理',
          '多角度渲染',
        ]),
        status: 'ACTIVE',
        order: 5,
      },
    }),
    // 3D 拆解动画
    prisma.serviceItem.upsert({
      where: { slug: '3d-explode-animation' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '3D拆解动画',
        nameEn: '3D Explode Animation',
        slug: '3d-explode-animation',
        description: '产品内部结构展示、动态演示 (15-30秒)',
        priceType: 'RANGE',
        minPrice: 3000,
        maxPrice: 8000,
        unit: '条',
        deliveryDays: 10,
        features: JSON.stringify([
          '产品结构拆解',
          '动态演示效果',
          '15-30秒时长',
          'MP4/MOV格式交付',
        ]),
        status: 'ACTIVE',
        order: 6,
      },
    }),

    // 三、单项设计 - 办公及商务印刷
    // 名片设计
    prisma.serviceItem.upsert({
      where: { slug: 'business-card-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '名片设计',
        nameEn: 'Business Card Design',
        slug: 'business-card-design',
        description: '专业商务名片设计，彰显企业形象',
        priceType: 'FIXED',
        basePrice: 200,
        unit: '款',
        deliveryDays: 2,
        features: JSON.stringify([
          '2个设计方案',
          '3次修改',
          '源文件交付',
          '印刷指导',
        ]),
        status: 'ACTIVE',
        order: 7,
      },
    }),
    // 宣传单/折页设计
    prisma.serviceItem.upsert({
      where: { slug: 'flyer-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '宣传单/折页设计',
        nameEn: 'Flyer/Brochure Design',
        slug: 'flyer-design',
        description: '企业宣传单页、折页设计',
        priceType: 'RANGE',
        minPrice: 300,
        maxPrice: 600,
        unit: '面',
        deliveryDays: 3,
        features: JSON.stringify([
          '创意版式设计',
          '文案排版优化',
          '印刷规格指导',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        order: 8,
      },
    }),
    // 画册/手册设计
    prisma.serviceItem.upsert({
      where: { slug: 'catalog-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '画册/手册设计',
        nameEn: 'Catalog/Manual Design',
        slug: 'catalog-design',
        description: '企业画册、产品手册、宣传册设计',
        priceType: 'RANGE',
        minPrice: 150,
        maxPrice: 300,
        unit: 'P（页）',
        deliveryDays: 5,
        features: JSON.stringify([
          '专业版式设计',
          '图文排版',
          '印刷工艺建议',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 9,
      },
    }),
    // 邀请卡/明信片设计
    prisma.serviceItem.upsert({
      where: { slug: 'invitation-card-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '邀请卡/明信片设计',
        nameEn: 'Invitation/Postcard Design',
        slug: 'invitation-card-design',
        description: '活动邀请卡、节日明信片设计',
        priceType: 'RANGE',
        minPrice: 300,
        maxPrice: 800,
        unit: '款',
        deliveryDays: 3,
        features: JSON.stringify([
          '创意设计',
          '多种风格可选',
          '工艺效果建议',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        order: 10,
      },
    }),

    // 三、单项设计 - 广告与户外
    // 商业海报设计
    prisma.serviceItem.upsert({
      where: { slug: 'commercial-poster-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '商业海报设计',
        nameEn: 'Commercial Poster Design',
        slug: 'commercial-poster-design',
        description: '活动海报、促销海报、品牌海报设计',
        priceType: 'RANGE',
        minPrice: 500,
        maxPrice: 1500,
        unit: '张',
        deliveryDays: 3,
        features: JSON.stringify([
          '创意视觉设计',
          '2个方案选择',
          '3次修改',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 11,
      },
    }),
    // 户外招牌设计
    prisma.serviceItem.upsert({
      where: { slug: 'signage-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '户外招牌设计',
        nameEn: 'Signage Design',
        slug: 'signage-design',
        description: '门头招牌、户外广告牌设计',
        priceType: 'RANGE',
        minPrice: 800,
        maxPrice: 3000,
        unit: '款',
        deliveryDays: 5,
        features: JSON.stringify([
          '效果图展示',
          '材质工艺建议',
          '尺寸规格设计',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        order: 12,
      },
    }),

    // 三、单项设计 - 包装与礼品
    // 瓶身标签设计
    prisma.serviceItem.upsert({
      where: { slug: 'bottle-label-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '瓶身标签设计',
        nameEn: 'Bottle Label Design',
        slug: 'bottle-label-design',
        description: '饮料、化妆品、酒类瓶身标签设计',
        priceType: 'RANGE',
        minPrice: 800,
        maxPrice: 2000,
        unit: '款',
        deliveryDays: 5,
        features: JSON.stringify([
          '创意标签设计',
          '材质工艺建议',
          '印刷规格指导',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        order: 13,
      },
    }),
    // 包装盒/礼盒设计
    prisma.serviceItem.upsert({
      where: { slug: 'packaging-box-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '包装盒/礼盒设计',
        nameEn: 'Packaging Box Design',
        slug: 'packaging-box-design',
        description: '产品包装盒、礼品盒设计（含结构设计）',
        priceType: 'RANGE',
        minPrice: 1500,
        maxPrice: 5000,
        unit: '款',
        deliveryDays: 7,
        features: JSON.stringify([
          '外观视觉设计',
          '盒型结构设计',
          '刀版图制作',
          '3D效果图展示',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        isFeatured: true,
        order: 14,
      },
    }),
    // 定制礼品/工作服设计
    prisma.serviceItem.upsert({
      where: { slug: 'custom-gift-design' },
      update: {},
      create: {
        categoryId: designCategory.id,
        name: '定制礼品/工作服设计',
        nameEn: 'Custom Gift/Uniform Design',
        slug: 'custom-gift-design',
        description: '企业礼品、工作服、文化衫设计',
        priceType: 'RANGE',
        minPrice: 300,
        maxPrice: 1000,
        unit: '款',
        deliveryDays: 3,
        features: JSON.stringify([
          '创意图案设计',
          '效果图展示',
          '工艺建议',
          '源文件交付',
        ]),
        status: 'ACTIVE',
        order: 15,
      },
    }),
  ]);

  console.log(`创建了 ${designServices.length} 个设计服务`);

  // ==================== 开发服务项目 ====================
  const devServices = await Promise.all([
    // 网页开发 (Web)
    prisma.serviceItem.upsert({
      where: { slug: 'brand-website' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '品牌展示官网',
        nameEn: 'Brand Website',
        slug: 'brand-website',
        description: '5-8个页面，响应式适配（PC/手机），含基础SEO优化',
        priceType: 'FIXED',
        basePrice: 5000,
        unit: '项',
        deliveryDays: 14,
        features: JSON.stringify([
          '5-8个页面设计',
          '响应式适配（PC/手机）',
          '基础SEO优化',
          '后台管理系统',
          '1年免费维护',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 1,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'landing-page' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '营销型落地页',
        nameEn: 'Marketing Landing Page',
        slug: 'landing-page',
        description: '单页H5，强转化逻辑，动效丰富，适合活动推广',
        priceType: 'FIXED',
        basePrice: 1800,
        unit: '项',
        deliveryDays: 5,
        features: JSON.stringify([
          '单页H5设计',
          '强转化逻辑',
          '丰富动效',
          '数据埋点',
          '适配多端',
        ]),
        status: 'ACTIVE',
        order: 2,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'ecommerce-platform' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '大型电商平台',
        nameEn: 'E-commerce Platform',
        slug: 'ecommerce-platform',
        description: '多供应商/单商户版，含购物车、支付、订单管理系统',
        priceType: 'FIXED',
        basePrice: 25000,
        unit: '项',
        deliveryDays: 60,
        features: JSON.stringify([
          '多供应商/单商户版',
          '购物车系统',
          '支付对接（微信/支付宝）',
          '订单管理系统',
          '物流接口对接',
          '1年技术维护',
        ]),
        status: 'ACTIVE',
        isFeatured: true,
        order: 3,
      },
    }),
    // 应用开发 (App)
    prisma.serviceItem.upsert({
      where: { slug: 'miniprogram-custom' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '小程序定制',
        nameEn: 'Mini Program Custom',
        slug: 'miniprogram-custom',
        description: '微信/支付宝/抖音小程序，含商城、预约、会员积分',
        priceType: 'FIXED',
        basePrice: 12000,
        unit: '项',
        deliveryDays: 30,
        features: JSON.stringify([
          '微信/支付宝/抖音小程序',
          '商城功能',
          '预约系统',
          '会员积分',
          '后台管理',
          '3个月维护',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 4,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'mobile-app' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '移动应用 (iOS/Android)',
        nameEn: 'Mobile App Development',
        slug: 'mobile-app',
        description: '原生或跨平台开发，支持上架应用商店，功能深度定制',
        priceType: 'FIXED',
        basePrice: 50000,
        unit: '项',
        deliveryDays: 90,
        features: JSON.stringify([
          '原生/跨平台开发',
          '应用商店上架',
          '功能深度定制',
          'UI/UX设计',
          '接口对接',
          '1年技术维护',
        ]),
        status: 'ACTIVE',
        order: 5,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'desktop-app' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '桌面应用开发',
        nameEn: 'Desktop Application',
        slug: 'desktop-app',
        description: 'Windows/macOS 客户端软件，支持本地资源调用及离线办公',
        priceType: 'FIXED',
        basePrice: 15000,
        unit: '项',
        deliveryDays: 45,
        features: JSON.stringify([
          'Windows/macOS支持',
          '本地资源调用',
          '离线办公功能',
          '自动更新',
          '安装包制作',
        ]),
        status: 'ACTIVE',
        order: 6,
      },
    }),
    // 企业系统 (System)
    prisma.serviceItem.upsert({
      where: { slug: 'crm-erp-system' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '管理系统 (CRM/ERP)',
        nameEn: 'CRM/ERP System',
        slug: 'crm-erp-system',
        description: '客户关系管理、进销存、内部流程审批、财务报表',
        priceType: 'FIXED',
        basePrice: 30000,
        unit: '项',
        deliveryDays: 60,
        features: JSON.stringify([
          '客户关系管理',
          '进销存管理',
          '内部流程审批',
          '财务报表',
          '权限管理',
          '数据导出',
          '1年技术维护',
        ]),
        status: 'ACTIVE',
        isFeatured: true,
        order: 7,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'custom-system' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '公司独立系统定制',
        nameEn: 'Custom Enterprise System',
        slug: 'custom-system',
        description: '根据企业特殊业务逻辑，从底层架构开始自研的独立系统',
        priceType: 'FIXED',
        basePrice: 45000,
        unit: '项',
        deliveryDays: 90,
        features: JSON.stringify([
          '需求调研分析',
          '底层架构设计',
          '业务逻辑定制',
          '私有化部署',
          '源代码交付',
          '部署文档',
          '2年技术支持',
        ]),
        status: 'ACTIVE',
        order: 8,
      },
    }),
    // 产品工程 (Project)
    prisma.serviceItem.upsert({
      where: { slug: '3d-product-render' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '3D产品建模/渲染',
        nameEn: '3D Product Modeling & Rendering',
        slug: '3d-product-render',
        description: '高精度工业建模、4K效果图、360°旋转展示动画',
        priceType: 'FIXED',
        basePrice: 1500,
        unit: '项',
        deliveryDays: 7,
        features: JSON.stringify([
          '高精度工业建模',
          '4K效果图',
          '360°旋转展示',
          '多角度渲染',
          'STEP/OBJ格式交付',
        ]),
        status: 'ACTIVE',
        order: 9,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'structure-analysis' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '结构可行性分析',
        nameEn: 'Structure Feasibility Analysis',
        slug: 'structure-analysis',
        description: '针对3D模型进行生产落地优化，确保可注塑、可量产',
        priceType: 'FIXED',
        basePrice: 2000,
        unit: '项',
        deliveryDays: 5,
        features: JSON.stringify([
          '生产落地优化',
          '注塑可行性分析',
          '量产方案建议',
          '材料选型建议',
          '成本估算',
        ]),
        status: 'ACTIVE',
        order: 10,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'rapid-prototype' },
      update: {},
      create: {
        categoryId: devCategory.id,
        name: '快速原型/打样',
        nameEn: 'Rapid Prototyping',
        slug: 'rapid-prototype',
        description: '高精度3D打印、工业级SLA/SLS或手工样机制作',
        priceType: 'FIXED',
        basePrice: 500,
        unit: '件',
        deliveryDays: 3,
        features: JSON.stringify([
          '高精度3D打印',
          '工业级SLA/SLS',
          '手工样机制作',
          '多种材料可选',
          '顺丰包邮',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 11,
      },
    }),
  ]);

  console.log(`创建了 ${devServices.length} 个开发服务`);

  // ==================== 制作服务项目 ====================
  const prodServices = await Promise.all([
    prisma.serviceItem.upsert({
      where: { slug: 'business-card-printing' },
      update: {},
      create: {
        categoryId: prodCategory.id,
        name: '名片印刷',
        nameEn: 'Business Card Printing',
        slug: 'business-card-printing',
        description: '高品质名片印刷服务',
        priceType: 'RANGE',
        minPrice: 50,
        maxPrice: 200,
        unit: '盒',
        deliveryDays: 3,
        features: JSON.stringify(['200张/盒', '多种纸张可选', '覆膜/烫金可选', '圆角可选']),
        status: 'ACTIVE',
        order: 1,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'brochure-printing' },
      update: {},
      create: {
        categoryId: prodCategory.id,
        name: '宣传册印刷',
        nameEn: 'Brochure Printing',
        slug: 'brochure-printing',
        description: '企业宣传册、产品手册印刷',
        priceType: 'RANGE',
        minPrice: 5,
        maxPrice: 50,
        unit: '本',
        deliveryDays: 7,
        features: JSON.stringify(['多种尺寸', '铜版纸/哑粉纸', '骑马钉/胶装', '起订量100本']),
        status: 'ACTIVE',
        order: 2,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'packaging-production' },
      update: {},
      create: {
        categoryId: prodCategory.id,
        name: '包装制作',
        nameEn: 'Packaging Production',
        slug: 'packaging-production',
        description: '产品包装盒、包装袋定制',
        priceType: 'QUOTE',
        unit: '批',
        deliveryDays: 15,
        features: JSON.stringify(['包装设计', '材质选择', '打样确认', '批量生产']),
        status: 'ACTIVE',
        isPopular: true,
        order: 3,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'uniform-production' },
      update: {},
      create: {
        categoryId: prodCategory.id,
        name: '工作服定制',
        nameEn: 'Uniform Production',
        slug: 'uniform-production',
        description: '企业工作服、T恤、帽子定制',
        priceType: 'RANGE',
        minPrice: 50,
        maxPrice: 300,
        unit: '件',
        deliveryDays: 14,
        features: JSON.stringify(['多种款式', '刺绣/印花', '尺码定制', '起订量20件']),
        status: 'ACTIVE',
        order: 4,
      },
    }),
  ]);

  console.log(`创建了 ${prodServices.length} 个制作服务`);

  // ==================== 人力资源服务项目 ====================
  const hrServices = await Promise.all([
    prisma.serviceItem.upsert({
      where: { slug: 'marketing-specialist' },
      update: {},
      create: {
        categoryId: hrCategory.id,
        name: '营销专员外派',
        nameEn: 'Marketing Specialist',
        slug: 'marketing-specialist',
        description: '专业营销人才外派服务',
        priceType: 'FIXED',
        basePrice: 8000,
        unit: '月',
        features: JSON.stringify(['市场分析', '营销策划', '活动执行', '效果跟踪']),
        status: 'ACTIVE',
        isPopular: true,
        order: 1,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'planning-consultant' },
      update: {},
      create: {
        categoryId: hrCategory.id,
        name: '策划顾问',
        nameEn: 'Planning Consultant',
        slug: 'planning-consultant',
        description: '品牌策划、活动策划顾问服务',
        priceType: 'FIXED',
        basePrice: 12000,
        unit: '月',
        features: JSON.stringify(['品牌诊断', '策略规划', '方案制定', '执行指导']),
        status: 'ACTIVE',
        order: 2,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'business-liaison' },
      update: {},
      create: {
        categoryId: hrCategory.id,
        name: '商务对接专员',
        nameEn: 'Business Liaison',
        slug: 'business-liaison',
        description: '客户对接、商务洽谈服务',
        priceType: 'FIXED',
        basePrice: 6000,
        unit: '月',
        features: JSON.stringify(['客户维护', '商务洽谈', '合同跟进', '项目协调']),
        status: 'ACTIVE',
        order: 3,
      },
    }),
  ]);

  console.log(`创建了 ${hrServices.length} 个人力资源服务`);

  // ==================== 创业服务项目 (数字化全透明孵化) ====================
  const startupServices = await Promise.all([
    // 投资者门户系统 (Investor-ID Portal)
    prisma.serviceItem.upsert({
      where: { slug: 'investor-portal' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '投资者ID门户系统',
        nameEn: 'Investor-ID Portal System',
        slug: 'investor-portal',
        description: '专属Investor ID，实时同步投资全景、工程进度、财务数据',
        priceType: 'FIXED',
        basePrice: 5000,
        unit: '项',
        deliveryDays: 14,
        features: JSON.stringify([
          '专属Investor ID',
          '投资全景实时同步',
          '工程进度追踪',
          '财务数据透明',
          '移动端适配',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 1,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'equity-dashboard' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '实时投资全景仪表盘',
        nameEn: 'Real-time Equity Dashboard',
        slug: 'equity-dashboard',
        description: '投资热度图、资金构成、股权占比、全国排名实时展示',
        priceType: 'FIXED',
        basePrice: 3000,
        unit: '项',
        deliveryDays: 7,
        features: JSON.stringify([
          '投资热度图',
          '资金构成分析',
          '股权占比展示',
          '全国排名',
          '实时数据更新',
        ]),
        status: 'ACTIVE',
        order: 2,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'milestone-tracker' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '工程进度追踪系统',
        nameEn: 'Milestone Tracker System',
        slug: 'milestone-tracker',
        description: '设计/装修/开发/运营全阶段时间轴，实时照片/监控接入',
        priceType: 'FIXED',
        basePrice: 8000,
        unit: '项',
        deliveryDays: 14,
        features: JSON.stringify([
          '全阶段时间轴',
          '实时照片上传',
          '监控视频接入',
          '里程碑提醒',
          '进度报告生成',
        ]),
        status: 'ACTIVE',
        isFeatured: true,
        order: 3,
      },
    }),
    // 财务透明系统
    prisma.serviceItem.upsert({
      where: { slug: 'financial-clarity' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '财务透明度系统',
        nameEn: 'Financial Clarity System',
        slug: 'financial-clarity',
        description: '每日收支明细、发票扫描件、员工效能监控、自动财务报表',
        priceType: 'FIXED',
        basePrice: 15000,
        unit: '项',
        deliveryDays: 21,
        features: JSON.stringify([
          '每日收支明细',
          '发票扫描件存档',
          '员工效能监控',
          '自动财务报表',
          '年度损益表',
          '资产负债表',
        ]),
        status: 'ACTIVE',
        isPopular: true,
        order: 4,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'earning-wall' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '实时分红收益墙',
        nameEn: 'Real-time Earning Distribution Wall',
        slug: 'earning-wall',
        description: '每日营业额按投资比例自动计算分红，收益实时滚动更新',
        priceType: 'FIXED',
        basePrice: 6000,
        unit: '项',
        deliveryDays: 10,
        features: JSON.stringify([
          '每日营业额同步',
          '投资比例自动计算',
          '分红实时更新',
          '收益走势图',
          '提现功能',
        ]),
        status: 'ACTIVE',
        order: 5,
      },
    }),
    // 法律与合规
    prisma.serviceItem.upsert({
      where: { slug: 'compliance-system' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '法律合规系统',
        nameEn: 'Compliance System',
        slug: 'compliance-system',
        description: '电子发票、纳税凭证、电子合同管理、退出机制明确',
        priceType: 'FIXED',
        basePrice: 5000,
        unit: '项',
        deliveryDays: 7,
        features: JSON.stringify([
          '电子发票自动生成',
          '纳税凭证管理',
          '电子合同签署',
          '退出机制说明',
          '法律文档模板',
        ]),
        status: 'ACTIVE',
        order: 6,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'report-export' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '专业级数据导出',
        nameEn: 'Professional Report Export',
        slug: 'report-export',
        description: '极简/专业/图表多风格报表，支持PDF/Excel/CSV格式',
        priceType: 'FIXED',
        basePrice: 2000,
        unit: '项',
        deliveryDays: 3,
        features: JSON.stringify([
          '极简风格报表',
          '财务专业版报表',
          '图表可视化版',
          'PDF/Excel/CSV导出',
          '定制报表模板',
        ]),
        status: 'ACTIVE',
        order: 7,
      },
    }),
    // 传统创业服务
    prisma.serviceItem.upsert({
      where: { slug: 'bp-writing' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '商业计划书撰写',
        nameEn: 'Business Plan Writing',
        slug: 'bp-writing',
        description: '专业BP撰写与优化，投资人视角打磨',
        priceType: 'FIXED',
        basePrice: 3000,
        unit: '份',
        deliveryDays: 7,
        features: JSON.stringify([
          '市场分析',
          '商业模式梳理',
          '财务预测',
          '投资人视角优化',
          '路演PPT制作',
        ]),
        status: 'ACTIVE',
        order: 8,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'investor-matching' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '投资人资源对接',
        nameEn: 'Investor Matching',
        slug: 'investor-matching',
        description: '精准匹配投资人，路演辅导，融资谈判支持',
        priceType: 'FIXED',
        basePrice: 10000,
        unit: '次',
        features: JSON.stringify([
          '投资人精准匹配',
          '路演辅导',
          '融资谈判支持',
          '尽调准备',
          '条款协商',
        ]),
        status: 'ACTIVE',
        order: 9,
      },
    }),
    prisma.serviceItem.upsert({
      where: { slug: 'full-incubation' },
      update: {},
      create: {
        categoryId: startupCategory.id,
        name: '全程孵化加速',
        nameEn: 'Full Incubation Acceleration',
        slug: 'full-incubation',
        description: '从0到1全程陪跑，资源整合、团队搭建、市场推广',
        priceType: 'FIXED',
        basePrice: 50000,
        unit: '项',
        deliveryDays: 180,
        features: JSON.stringify([
          '从0到1全程陪跑',
          '资源整合',
          '团队搭建支持',
          '市场推广策略',
          '供应链对接',
          '渠道资源',
        ]),
        status: 'ACTIVE',
        isFeatured: true,
        order: 10,
      },
    }),
  ]);

  console.log(`创建了 ${startupServices.length} 个创业服务`);


  // ==================== 阶梯式全包服务套餐 ====================
  
  // 方案 A：小型活动推广包
  const promoPackage = await prisma.servicePackage.upsert({
    where: { slug: 'small-event-promo-package' },
    update: {},
    create: {
      categoryId: designCategory.id,
      name: '小型活动推广包',
      nameEn: 'Small Event Promotion Package',
      slug: 'small-event-promo-package',
      description: '主视觉海报×1、宣传单×1、易拉宝设计×1、社交媒体预热图×3，赠送100张加厚名片或1套活动胸牌制作',
      originalPrice: 3500,
      packagePrice: 2588,
      savings: 912,
      highlights: JSON.stringify([
        '节省912元',
        '主视觉海报×1',
        '宣传单×1',
        '易拉宝设计×1',
        '社交媒体图×3',
        '赠送100张名片',
      ]),
      status: 'ACTIVE',
      isPopular: true,
      order: 1,
    },
  });

  console.log('创建了小型活动推广包');

  // 方案 B：产品上市全案包
  const launchPackage = await prisma.servicePackage.upsert({
    where: { slug: 'product-launch-package' },
    update: {},
    create: {
      categoryId: designCategory.id,
      name: '产品上市全案包',
      nameEn: 'Product Launch Package',
      slug: 'product-launch-package',
      description: '产品3D建模×1、包装盒设计×1、瓶身/内包装设计×1、详情页设计×1，赠送渲染图3张+包装样稿顺丰包邮',
      originalPrice: 12000,
      packagePrice: 8800,
      savings: 3200,
      highlights: JSON.stringify([
        '节省3200元',
        '3D产品建模×1',
        '包装盒设计×1',
        '标签设计×1',
        '详情页设计×1',
        '赠送渲染图3张',
        '样稿顺丰包邮',
      ]),
      status: 'ACTIVE',
      order: 2,
    },
  });

  console.log('创建了产品上市全案包');

  // 方案 C：年度设计包托管
  const annualPackage = await prisma.servicePackage.upsert({
    where: { slug: 'annual-design-package' },
    update: {},
    create: {
      categoryId: designCategory.id,
      name: '年度设计包托管',
      nameEn: 'Annual Design Package',
      slug: 'annual-design-package',
      description: '全年不限次数的小型改图、日常海报、社交媒体图及物料制作跟进，相当于拥有一个专属设计部',
      originalPrice: 48000,
      packagePrice: 30000,
      savings: 18000,
      highlights: JSON.stringify([
        '节省18000元',
        '全年不限次数改图',
        '日常海报设计',
        '社交媒体图',
        '物料制作跟进',
        '专属设计师',
        '随叫随到',
      ]),
      status: 'ACTIVE',
      order: 3,
    },
  });

  console.log('创建了年度设计包托管');

  // VI全套服务套餐
  const viPackage = await prisma.servicePackage.upsert({
    where: { slug: 'vi-full-package' },
    update: {},
    create: {
      categoryId: designCategory.id,
      name: 'VI全套设计套餐',
      nameEn: 'Full VI Design Package',
      slug: 'vi-full-package',
      description: '包含Logo、名片、信纸、品牌手册等完整VI系统',
      originalPrice: 15999,
      packagePrice: 9999,
      savings: 6000,
      highlights: JSON.stringify(['节省6000元', '统一品牌风格', '专属设计师', '30天交付']),
      status: 'ACTIVE',
      isPopular: true,
      order: 4,
    },
  });

  // 关联套餐服务项目
  for (const item of [
    { packageId: viPackage.id, serviceId: designServices[0].id, quantity: 1 },
    { packageId: viPackage.id, serviceId: designServices[1].id, quantity: 1 },
  ]) {
    await prisma.servicePackageItem.upsert({
      where: { packageId_serviceId: { packageId: item.packageId, serviceId: item.serviceId } },
      update: {},
      create: item,
    });
  }

  console.log('创建了VI全套服务套餐');

  // 企业数字化套餐
  const digitalPackage = await prisma.servicePackage.upsert({
    where: { slug: 'digital-transformation-package' },
    update: {},
    create: {
      categoryId: devCategory.id,
      name: '企业数字化套餐',
      nameEn: 'Digital Transformation Package',
      slug: 'digital-transformation-package',
      description: '官网+小程序+品牌设计一站式服务',
      originalPrice: 35999,
      packagePrice: 25999,
      savings: 10000,
      highlights: JSON.stringify(['节省10000元', '一站式服务', '统一风格', '专属团队']),
      status: 'ACTIVE',
      order: 5,
    },
  });

  for (const item of [
    { packageId: digitalPackage.id, serviceId: devServices[0].id, quantity: 1 },
    { packageId: digitalPackage.id, serviceId: devServices[1].id, quantity: 1 },
    { packageId: digitalPackage.id, serviceId: designServices[0].id, quantity: 1 },
  ]) {
    await prisma.servicePackageItem.upsert({
      where: { packageId_serviceId: { packageId: item.packageId, serviceId: item.serviceId } },
      update: {},
      create: item,
    });
  }

  console.log('创建了企业数字化套餐');

  // ==================== 开发服务套餐 ====================
  
  // 创业启动包
  const startupPackage = await prisma.servicePackage.upsert({
    where: { slug: 'startup-launch-package' },
    update: {},
    create: {
      categoryId: devCategory.id,
      name: '创业启动包',
      nameEn: 'Startup Launch Package',
      slug: 'startup-launch-package',
      description: '品牌官网×1 + 微信小程序×1 + 基础VI设计，赠送1年域名+服务器托管+基础SEO优化',
      originalPrice: 22000,
      packagePrice: 15800,
      savings: 6200,
      highlights: JSON.stringify([
        '节省6200元',
        '品牌官网×1',
        '微信小程序×1',
        '基础VI设计',
        '赠送1年域名',
        '服务器托管',
        '基础SEO优化',
      ]),
      status: 'ACTIVE',
      isPopular: true,
      order: 6,
    },
  });

  console.log('创建了创业启动包');

  // 电商全套包
  const ecommercePackage = await prisma.servicePackage.upsert({
    where: { slug: 'ecommerce-full-package' },
    update: {},
    create: {
      categoryId: devCategory.id,
      name: '电商全套包',
      nameEn: 'E-commerce Full Package',
      slug: 'ecommerce-full-package',
      description: '电商平台开发 + 小程序商城 + 后台管理系统，赠送支付对接+物流接口+1年技术维护',
      originalPrice: 55000,
      packagePrice: 42000,
      savings: 13000,
      highlights: JSON.stringify([
        '节省13000元',
        '电商平台开发',
        '小程序商城',
        '后台管理系统',
        '支付对接',
        '物流接口',
        '1年技术维护',
      ]),
      status: 'ACTIVE',
      order: 7,
    },
  });

  console.log('创建了电商全套包');

  // 企业数字化转型包
  const enterprisePackage = await prisma.servicePackage.upsert({
    where: { slug: 'enterprise-digital-package' },
    update: {},
    create: {
      categoryId: devCategory.id,
      name: '企业数字化转型包',
      nameEn: 'Enterprise Digital Transformation Package',
      slug: 'enterprise-digital-package',
      description: 'CRM/ERP系统 + 移动APP + 数据大屏 + 私有化部署，赠送全套源代码+部署文档+2年技术支持',
      originalPrice: 120000,
      packagePrice: 88000,
      savings: 32000,
      highlights: JSON.stringify([
        '节省32000元',
        'CRM/ERP系统',
        '移动APP',
        '数据大屏',
        '私有化部署',
        '全套源代码',
        '部署文档',
        '2年技术支持',
      ]),
      status: 'ACTIVE',
      order: 8,
    },
  });

  console.log('创建了企业数字化转型包');

  // ==================== 创业服务套餐 ====================
  
  // 透明创业基础包
  const transparentBasicPackage = await prisma.servicePackage.upsert({
    where: { slug: 'transparent-startup-basic' },
    update: {},
    create: {
      categoryId: startupCategory.id,
      name: '透明创业基础包',
      nameEn: 'Transparent Startup Basic Package',
      slug: 'transparent-startup-basic',
      description: '投资者ID门户 + 实时投资仪表盘 + 工程进度追踪，赠送法律合规系统 + 首年数据存储',
      originalPrice: 16000,
      packagePrice: 12800,
      savings: 3200,
      highlights: JSON.stringify([
        '节省3200元',
        '投资者ID门户',
        '实时投资仪表盘',
        '工程进度追踪',
        '赠送法律合规系统',
        '首年数据存储',
      ]),
      status: 'ACTIVE',
      isPopular: true,
      order: 9,
    },
  });

  console.log('创建了透明创业基础包');

  // 全透明孵化包
  const transparentFullPackage = await prisma.servicePackage.upsert({
    where: { slug: 'transparent-startup-full' },
    update: {},
    create: {
      categoryId: startupCategory.id,
      name: '全透明孵化包',
      nameEn: 'Full Transparent Incubation Package',
      slug: 'transparent-startup-full',
      description: '基础包 + 财务透明系统 + 分红收益墙 + 专业报表导出，赠送商业计划书撰写 + 投资人路演辅导',
      originalPrice: 38000,
      packagePrice: 28800,
      savings: 9200,
      highlights: JSON.stringify([
        '节省9200元',
        '包含基础包全部功能',
        '财务透明系统',
        '分红收益墙',
        '专业报表导出',
        '赠送商业计划书',
        '投资人路演辅导',
      ]),
      status: 'ACTIVE',
      order: 10,
    },
  });

  console.log('创建了全透明孵化包');

  // 数字化孵化旗舰包
  const digitalIncubationPackage = await prisma.servicePackage.upsert({
    where: { slug: 'digital-incubation-flagship' },
    update: {},
    create: {
      categoryId: startupCategory.id,
      name: '数字化孵化旗舰包',
      nameEn: 'Digital Incubation Flagship Package',
      slug: 'digital-incubation-flagship',
      description: '全透明系统 + 全程孵化加速 + 投资人资源对接 + 私有化部署，专属项目经理 + 2年技术支持 + 源代码交付',
      originalPrice: 88000,
      packagePrice: 68000,
      savings: 20000,
      highlights: JSON.stringify([
        '节省20000元',
        '全透明系统',
        '全程孵化加速',
        '投资人资源对接',
        '私有化部署',
        '专属项目经理',
        '2年技术支持',
        '源代码交付',
      ]),
      status: 'ACTIVE',
      order: 11,
    },
  });

  console.log('创建了数字化孵化旗舰包');

  console.log('服务数据创建完成！');
  console.log('');
  console.log('📋 服务说明：');
  console.log('• 交付方式：设计稿提供源文件 (AI/PSD/STEP)；实物通过顺丰/德邦发送，全国包邮');
  console.log('• 修改规则：初稿提供 2-3 个方案，定稿前支持 3 次细节微调');
  console.log('• 制作周期：设计一般 3-5 天；制作根据工艺不同需 3-10 天');
  console.log('');
  console.log('💎 开发服务说明：');
  console.log('• 需求分析：开发类项目建议先进行技术方案沟通，我们将为您免费提供初步的技术选型方案');
  console.log('• 售后保障：所有系统类项目提供 1年免费技术维护 及 紧急漏洞修复');
  console.log('• 交付物：设计原稿、开发文档、测试报告、部署手册及源代码');
  console.log('• 私有化部署：所有独立系统均支持私有化部署，结项后交付全部源代码');
  console.log('');
  console.log('🚀 创业服务说明：');
  console.log('• 投资者承诺：我们不保证每一个项目都成为独角兽，但我们保证您对每一分钱的去向都有100%的知情权');
  console.log('• 数据安全：所有财务数据加密存储，支持私有化部署');
  console.log('• 合规保障：电子合同具有法律效力，明确投资期限与退出机制');
  console.log('• 实时透明：每日收支明细、工程进度、分红收益实时更新');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
