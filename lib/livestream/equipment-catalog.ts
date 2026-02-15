/**
 * 直播设备销售目录 - 2026版
 * 四种类型：个人入门、商家标准、互联网专业、记者广播级
 * 支持一手产品和二手设备销售
 */

// ==================== 二手设备类型定义 ====================

// 设备类型：一手/二手
export type EquipmentType = 'new' | 'used';

// 成色等级
export type ConditionGrade = '99new' | '95new' | '90new' | '80new';

// 设备来源
export type EquipmentSource = 'official' | 'enterprise' | 'personal';

// 瑕疵信息
export interface DefectInfo {
  location: string;           // 瑕疵位置
  description: string;        // 瑕疵描述
  severity: 'minor' | 'moderate'; // 严重程度
  image?: string;             // 瑕疵图片
}

// 延保选项
export interface ExtendedWarranty {
  id: string;
  name: string;
  period: string;
  price: number;
  coverage: string[];
}

// 质保信息
export interface WarrantyInfo {
  period: string;             // 质保期限（如"6个月"）
  scope: string[];            // 质保范围
  returnPolicy: string;       // 退换政策
  extendedOptions?: ExtendedWarranty[]; // 延保选项
}

// 成色配置
export const conditionConfig: Record<ConditionGrade, { label: string; color: string; desc: string }> = {
  '99new': { label: '99新', color: '#10b981', desc: '几乎全新，无使用痕迹' },
  '95new': { label: '95新', color: '#3b82f6', desc: '轻微使用痕迹，功能完好' },
  '90new': { label: '9成新', color: '#f59e0b', desc: '正常使用痕迹，功能完好' },
  '80new': { label: '8成新', color: '#ef4444', desc: '明显使用痕迹，功能正常' },
};

// 来源配置
export const sourceConfig: Record<EquipmentSource, { label: string; desc: string }> = {
  'official': { label: '官方回收', desc: '官方认证，品质保障' },
  'enterprise': { label: '企业置换', desc: '企业批量置换，来源可靠' },
  'personal': { label: '个人寄售', desc: '个人用户寄售，经过检测' },
};

// ==================== 类型定义 ====================
export interface Equipment {
  id: string;
  name: string;
  model: string;
  brand: string;
  description: string;
  specs: string[];
  originalPrice: number;      // 全新原价/市场原价
  price: number;              // 当前售价
  image?: string;
  category: string;
  stock: number;
  
  // 二手设备字段
  type?: EquipmentType;       // 设备类型：new/used，默认为new
  condition?: ConditionGrade; // 成色等级（二手设备必填）
  conditionDesc?: string;     // 成色描述
  usageDuration?: string;     // 使用时长（如"6个月"）
  purchaseDate?: string;      // 原购买日期
  source?: EquipmentSource;   // 设备来源
  sourceInfo?: string;        // 来源详情（脱敏）
  realImages?: string[];      // 实拍图片（多角度）
  defects?: DefectInfo[];     // 瑕疵信息
  inspectionReport?: string;  // 检测报告URL
  warranty?: WarrantyInfo;    // 质保信息
  certifications?: string[];  // 认证标识
}

// 套餐类型
export type PackageType = 'new' | 'used' | 'mixed';

export interface EquipmentPackage {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'professional' | 'broadcast';
  description: string;
  targetUser: string;
  items: PackageItem[];
  originalTotal: number;    // 单买总价
  packagePrice: number;     // 套餐价
  savings: number;          // 节省金额
  deliveryFee: number;      // 配送费
  installationFee: number;  // 上门安装调试费
  totalPrice: number;       // 总价（套餐+配送+安装）
  warranty: string;
  features: string[];
  tag?: string;
  
  // 二手套餐字段
  packageType?: PackageType;      // 套餐类型：new/used/mixed，默认为new
  conditionSummary?: string;      // 成色概述（二手套餐）
  newEquipmentPrice?: number;     // 对应全新套餐价格（用于对比）
}

export interface PackageItem {
  equipmentId: string;
  name: string;
  model: string;
  quantity: number;
  unitPrice: number;
  
  // 二手设备字段
  type?: EquipmentType;           // 设备类型
  condition?: ConditionGrade;     // 成色（二手设备）
  realImage?: string;             // 实拍图片
}

// ==================== 一、个人入门套餐 (手机直播) ====================
export const personalEquipment: Equipment[] = [
  // 手机支架
  {
    id: 'pe-001',
    name: '手机直播支架',
    model: 'ULANZI MT-50',
    brand: '优篮子',
    description: '铝合金材质，360°旋转云台，高度可调50-160cm',
    specs: ['铝合金材质', '承重2kg', '高度50-160cm', '360°云台', '折叠便携'],
    originalPrice: 199,
    price: 159,
    category: 'stand',
    stock: 100,
  },
  {
    id: 'pe-002',
    name: '桌面手机支架',
    model: 'JOBY GripTight PRO',
    brand: 'JOBY',
    description: '专业级桌面支架，适合4.7-6.7寸手机',
    specs: ['ABS+金属材质', '适配4.7-6.7寸', '可调角度', '防滑底座'],
    originalPrice: 299,
    price: 239,
    category: 'stand',
    stock: 80,
  },
  // 补光灯
  {
    id: 'pe-003',
    name: '环形补光灯 10寸',
    model: 'NEEWER RL-10',
    brand: 'NEEWER',
    description: '10寸LED环形灯，3200K-5600K可调色温，带手机夹',
    specs: ['10寸直径', '3200K-5600K色温', '亮度可调', 'USB供电', '含手机夹'],
    originalPrice: 199,
    price: 149,
    category: 'light',
    stock: 150,
  },
  {
    id: 'pe-004',
    name: '环形补光灯 14寸',
    model: 'NEEWER RL-14',
    brand: 'NEEWER',
    description: '14寸大尺寸环形灯，双色温，带遥控器',
    specs: ['14寸直径', '双色温调节', '10档亮度', '遥控器控制', '含三脚架'],
    originalPrice: 399,
    price: 319,
    category: 'light',
    stock: 100,
  },
  // 麦克风
  {
    id: 'pe-005',
    name: '领夹式无线麦克风',
    model: 'BOYA BY-WM4 PRO',
    brand: 'BOYA',
    description: '2.4G无线传输，60米距离，手机/相机通用',
    specs: ['2.4G无线', '60米传输', '6小时续航', '手机/相机通用', '降噪功能'],
    originalPrice: 499,
    price: 399,
    category: 'audio',
    stock: 80,
  },
  {
    id: 'pe-006',
    name: '手机直播麦克风',
    model: 'RODE VideoMic Me-L',
    brand: 'RODE',
    description: 'Lightning接口，即插即用，心形指向',
    specs: ['Lightning接口', '心形指向', '即插即用', '金属机身', '防风罩'],
    originalPrice: 599,
    price: 499,
    category: 'audio',
    stock: 60,
  },
  // 配件
  {
    id: 'pe-007',
    name: '手机稳定器',
    model: 'DJI OM 6',
    brand: 'DJI',
    description: '三轴稳定，智能跟随，手势控制',
    specs: ['三轴稳定', '智能跟随', '手势控制', '15小时续航', '折叠设计'],
    originalPrice: 999,
    price: 899,
    category: 'accessory',
    stock: 50,
  },
  {
    id: 'pe-008',
    name: '直播背景布',
    model: 'NEEWER 1.5x2m',
    brand: 'NEEWER',
    description: '纯色背景布，无纺布材质，多色可选',
    specs: ['1.5x2米', '无纺布', '可水洗', '多色可选', '含支架'],
    originalPrice: 129,
    price: 99,
    category: 'accessory',
    stock: 200,
  },
];

// ==================== 二、商家标准套餐 (独立直播间) ====================
export const businessEquipment: Equipment[] = [
  // 电脑设备
  {
    id: 'be-001',
    name: '直播专用笔记本',
    model: 'ThinkPad E14 Gen5',
    brand: 'Lenovo',
    description: 'i5-1340P/16G/512G SSD，14寸FHD，适合OBS推流',
    specs: ['i5-1340P处理器', '16GB内存', '512GB SSD', '14寸FHD', 'WiFi6'],
    originalPrice: 5299,
    price: 4799,
    category: 'computer',
    stock: 30,
  },
  {
    id: 'be-002',
    name: '直播一体机',
    model: 'HP ProOne 440 G9',
    brand: 'HP',
    description: 'i5-12500/16G/512G，23.8寸FHD，内置摄像头',
    specs: ['i5-12500处理器', '16GB内存', '512GB SSD', '23.8寸FHD', '内置摄像头'],
    originalPrice: 6499,
    price: 5899,
    category: 'computer',
    stock: 20,
  },
  // 摄像设备
  {
    id: 'be-003',
    name: '高清USB摄像头',
    model: 'Logitech C920 PRO',
    brand: 'Logitech',
    description: '1080P/30fps，自动对焦，双麦克风',
    specs: ['1080P/30fps', '自动对焦', '双立体声麦克风', '78°视角', 'USB即插即用'],
    originalPrice: 699,
    price: 599,
    category: 'camera',
    stock: 100,
  },
  {
    id: 'be-004',
    name: '4K直播摄像头',
    model: 'Logitech BRIO 4K',
    brand: 'Logitech',
    description: '4K/30fps，HDR，5倍数码变焦',
    specs: ['4K/30fps', 'HDR支持', '5倍数码变焦', '90°视角', 'Windows Hello'],
    originalPrice: 1499,
    price: 1299,
    category: 'camera',
    stock: 50,
  },
  // 灯光设备
  {
    id: 'be-005',
    name: 'LED平板补光灯',
    model: 'GODOX SL60W',
    brand: 'GODOX',
    description: '60W LED常亮灯，5600K日光，静音风扇',
    specs: ['60W功率', '5600K色温', 'CRI95+', '静音风扇', '保荣卡口'],
    originalPrice: 899,
    price: 749,
    category: 'light',
    stock: 80,
  },
  {
    id: 'be-006',
    name: '柔光箱套装',
    model: 'GODOX 60x90cm',
    brand: 'GODOX',
    description: '60x90cm柔光箱，含灯架，柔和光线',
    specs: ['60x90cm', '快装设计', '双层柔光布', '含2.8m灯架', '保荣卡口'],
    originalPrice: 399,
    price: 329,
    category: 'light',
    stock: 100,
  },
  {
    id: 'be-007',
    name: '美颜补光灯',
    model: 'NEEWER 18寸环形灯',
    brand: 'NEEWER',
    description: '18寸专业环形灯，双色温，带手机/相机支架',
    specs: ['18寸直径', '3200K-5600K', '无极调光', '含2m支架', '手机/相机夹'],
    originalPrice: 599,
    price: 499,
    category: 'light',
    stock: 60,
  },
  // 音频设备
  {
    id: 'be-008',
    name: 'USB电容麦克风',
    model: 'Blue Yeti',
    brand: 'Blue',
    description: '四种指向模式，即插即用，专业录音级',
    specs: ['四种指向模式', 'USB即插即用', '16bit/48kHz', '增益控制', '耳机监听'],
    originalPrice: 999,
    price: 849,
    category: 'audio',
    stock: 70,
  },
  {
    id: 'be-009',
    name: '桌面麦克风支架',
    model: 'RODE PSA1',
    brand: 'RODE',
    description: '专业悬臂支架，360°旋转，承重1.1kg',
    specs: ['悬臂设计', '360°旋转', '承重1.1kg', '桌面夹持', '隐藏走线'],
    originalPrice: 799,
    price: 699,
    category: 'audio',
    stock: 50,
  },
  // 直播背景
  {
    id: 'be-010',
    name: '绿幕背景套装',
    model: 'Elgato Green Screen',
    brand: 'Elgato',
    description: '可伸缩绿幕，免支架，一键收纳',
    specs: ['1.8x2m', '免支架设计', '一键收纳', '防皱材质', '便携箱'],
    originalPrice: 1299,
    price: 1099,
    category: 'background',
    stock: 40,
  },
  {
    id: 'be-011',
    name: '直播背景墙',
    model: 'NEEWER 背景架套装',
    brand: 'NEEWER',
    description: '2.6x3m背景架，含3色背景布',
    specs: ['2.6x3m支架', '含白/黑/绿背景布', '可调高度', '便携收纳', '稳固底座'],
    originalPrice: 499,
    price: 399,
    category: 'background',
    stock: 60,
  },
  // 配件
  {
    id: 'be-012',
    name: '直播控制台',
    model: 'Elgato Stream Deck MK.2',
    brand: 'Elgato',
    description: '15键可编程，LCD按键，一键切换场景',
    specs: ['15个LCD按键', '可编程', '即插即用', '可调支架', 'OBS集成'],
    originalPrice: 1199,
    price: 999,
    category: 'accessory',
    stock: 30,
  },
];

// ==================== 三、互联网专业套餐 (网红/MCN) ====================
export const professionalEquipment: Equipment[] = [
  // 相机设备
  {
    id: 'pro-001',
    name: '全画幅微单相机',
    model: 'Sony A7C II',
    brand: 'Sony',
    description: '3300万像素，4K60p，实时眼部对焦',
    specs: ['3300万像素', '4K60p视频', '实时眼部AF', '5轴防抖', '翻转屏'],
    originalPrice: 14999,
    price: 13999,
    category: 'camera',
    stock: 15,
  },
  {
    id: 'pro-002',
    name: '直播专用镜头',
    model: 'Sony FE 24-70mm F2.8 GM II',
    brand: 'Sony',
    description: '恒定F2.8大光圈，G大师镜头',
    specs: ['24-70mm焦段', 'F2.8恒定光圈', 'G大师系列', '线性马达', '防尘防滴'],
    originalPrice: 15999,
    price: 14999,
    category: 'lens',
    stock: 10,
  },
  {
    id: 'pro-003',
    name: '定焦直播镜头',
    model: 'Sony FE 35mm F1.4 GM',
    brand: 'Sony',
    description: 'F1.4超大光圈，人像直播首选',
    specs: ['35mm焦距', 'F1.4大光圈', 'G大师系列', '11片光圈叶片', '轻量化设计'],
    originalPrice: 11999,
    price: 10999,
    category: 'lens',
    stock: 12,
  },
  // 采集设备
  {
    id: 'pro-004',
    name: '4K采集卡',
    model: 'Elgato 4K60 Pro MK.2',
    brand: 'Elgato',
    description: 'PCIe采集卡，4K60 HDR，超低延迟',
    specs: ['4K60 HDR', 'PCIe接口', '超低延迟', 'HDR10支持', '即时回放'],
    originalPrice: 2499,
    price: 2199,
    category: 'capture',
    stock: 25,
  },
  {
    id: 'pro-005',
    name: 'USB采集卡',
    model: 'Elgato HD60 X',
    brand: 'Elgato',
    description: 'USB3.0采集，4K30/1080P60，VRR支持',
    specs: ['4K30/1080P60', 'USB3.0', 'VRR支持', '超低延迟', '即插即用'],
    originalPrice: 1399,
    price: 1199,
    category: 'capture',
    stock: 40,
  },
  // 灯光设备
  {
    id: 'pro-006',
    name: 'LED影视灯',
    model: 'GODOX SL150W II',
    brand: 'GODOX',
    description: '150W大功率，5600K日光，APP控制',
    specs: ['150W功率', '5600K色温', 'CRI96+', 'APP控制', '静音设计'],
    originalPrice: 1899,
    price: 1699,
    category: 'light',
    stock: 30,
  },
  {
    id: 'pro-007',
    name: '双色温LED灯',
    model: 'Aputure 300d II',
    brand: 'Aputure',
    description: '300W功率，5500K日光，专业影视级',
    specs: ['300W功率', '5500K色温', 'CRI97+', '无线控制', '保荣卡口'],
    originalPrice: 5999,
    price: 5499,
    category: 'light',
    stock: 15,
  },
  {
    id: 'pro-008',
    name: '柔光箱套装',
    model: 'Aputure Light Dome II',
    brand: 'Aputure',
    description: '90cm深抛物面柔光箱，专业柔光效果',
    specs: ['90cm直径', '深抛物面', '快装设计', '含网格', '保荣卡口'],
    originalPrice: 1999,
    price: 1799,
    category: 'light',
    stock: 20,
  },
  // 音频设备
  {
    id: 'pro-009',
    name: '专业电容麦克风',
    model: 'Shure SM7B',
    brand: 'Shure',
    description: '广播级动圈麦克风，播客/直播首选',
    specs: ['动圈式', '心形指向', '50Hz-20kHz', '内置防震', '防喷罩'],
    originalPrice: 3299,
    price: 2999,
    category: 'audio',
    stock: 25,
  },
  {
    id: 'pro-010',
    name: '音频接口',
    model: 'Focusrite Scarlett 2i2',
    brand: 'Focusrite',
    description: '专业USB音频接口，2进2出，录音室级',
    specs: ['2进2出', 'USB-C', '24bit/192kHz', '幻象电源', '直接监听'],
    originalPrice: 1299,
    price: 1099,
    category: 'audio',
    stock: 40,
  },
  {
    id: 'pro-011',
    name: '调音台',
    model: 'RODE RODECaster Pro II',
    brand: 'RODE',
    description: '专业播客调音台，4路输入，内置音效',
    specs: ['4路输入', '内置音效', '多轨录音', '蓝牙连接', '触摸屏'],
    originalPrice: 5999,
    price: 5499,
    category: 'audio',
    stock: 15,
  },
  // 电脑设备
  {
    id: 'pro-012',
    name: '直播工作站',
    model: 'Apple Mac Studio M2 Max',
    brand: 'Apple',
    description: 'M2 Max芯片，32GB内存，512GB SSD',
    specs: ['M2 Max芯片', '32GB统一内存', '512GB SSD', '多路4K输出', '雷雳4'],
    originalPrice: 19999,
    price: 18999,
    category: 'computer',
    stock: 10,
  },
  {
    id: 'pro-013',
    name: '专业显示器',
    model: 'ASUS ProArt PA279CV',
    brand: 'ASUS',
    description: '27寸4K，100% sRGB，USB-C供电',
    specs: ['27寸4K', '100% sRGB', 'USB-C 65W', 'HDR10', '出厂校色'],
    originalPrice: 3999,
    price: 3599,
    category: 'monitor',
    stock: 20,
  },
];

// ==================== 四、记者广播级套餐 (专业媒体) ====================
export const broadcastEquipment: Equipment[] = [
  // 摄像机
  {
    id: 'bc-001',
    name: '广播级摄像机',
    model: 'Sony PXW-Z280',
    brand: 'Sony',
    description: '4K 3CMOS，17倍光学变焦，专业广播级',
    specs: ['4K 3CMOS', '17倍光学变焦', 'HDR-HLG', '双SD卡槽', 'SDI输出'],
    originalPrice: 45999,
    price: 42999,
    category: 'camera',
    stock: 5,
  },
  {
    id: 'bc-002',
    name: '电影级摄像机',
    model: 'Sony FX6',
    brand: 'Sony',
    description: '全画幅电影机，4K120p，双原生ISO',
    specs: ['全画幅CMOS', '4K120p', '双原生ISO', 'S-Cinetone', 'E卡口'],
    originalPrice: 39999,
    price: 36999,
    category: 'camera',
    stock: 8,
  },
  {
    id: 'bc-003',
    name: '广播级镜头',
    model: 'Sony FE PZ 28-135mm F4 G OSS',
    brand: 'Sony',
    description: '电动变焦，恒定F4，专业视频镜头',
    specs: ['28-135mm', 'F4恒定', '电动变焦', '光学防抖', '静音对焦'],
    originalPrice: 18999,
    price: 17499,
    category: 'lens',
    stock: 6,
  },
  // 监视器
  {
    id: 'bc-004',
    name: '导演监视器',
    model: 'Atomos Ninja V+',
    brand: 'Atomos',
    description: '5.2寸HDR监视器，8K ProRes RAW录制',
    specs: ['5.2寸HDR', '8K ProRes RAW', '1000nit亮度', 'HDMI/SDI', '触摸屏'],
    originalPrice: 6999,
    price: 6299,
    category: 'monitor',
    stock: 15,
  },
  {
    id: 'bc-005',
    name: '17寸导播监视器',
    model: 'Lilliput BM170-4KS',
    brand: 'Lilliput',
    description: '17寸4K SDI监视器，3D LUT，波形监视',
    specs: ['17寸4K', '4路SDI输入', '3D LUT', '波形/矢量', '机架安装'],
    originalPrice: 8999,
    price: 7999,
    category: 'monitor',
    stock: 10,
  },
  // 灯光设备
  {
    id: 'bc-006',
    name: '影视级LED灯',
    model: 'ARRI Skypanel S60-C',
    brand: 'ARRI',
    description: '专业影视灯，全彩RGB，DMX控制',
    specs: ['全彩RGB', 'DMX512控制', 'CRI95+', '静音设计', '保荣卡口'],
    originalPrice: 35999,
    price: 32999,
    category: 'light',
    stock: 5,
  },
  {
    id: 'bc-007',
    name: '便携LED灯组',
    model: 'Aputure Nova P300c',
    brand: 'Aputure',
    description: '300W RGBWW，全彩可调，便携设计',
    specs: ['300W RGBWW', '2000K-10000K', 'CRI98+', 'APP控制', '便携箱'],
    originalPrice: 12999,
    price: 11999,
    category: 'light',
    stock: 8,
  },
  // 音频设备
  {
    id: 'bc-008',
    name: '无线麦克风系统',
    model: 'Sennheiser EW 100 G4',
    brand: 'Sennheiser',
    description: '专业无线系统，100米传输，自动扫频',
    specs: ['UHF无线', '100米传输', '自动扫频', '金属机身', '含领夹麦'],
    originalPrice: 5999,
    price: 5499,
    category: 'audio',
    stock: 15,
  },
  {
    id: 'bc-009',
    name: '枪式采访麦克风',
    model: 'Sennheiser MKH 416',
    brand: 'Sennheiser',
    description: '广播级枪式麦克风，超心形指向',
    specs: ['超心形指向', '40Hz-20kHz', '低噪声', '防潮设计', '含防风罩'],
    originalPrice: 8999,
    price: 7999,
    category: 'audio',
    stock: 10,
  },
  {
    id: 'bc-010',
    name: '便携调音台',
    model: 'Sound Devices MixPre-6 II',
    brand: 'Sound Devices',
    description: '6路输入，32bit浮点录音，专业级',
    specs: ['6路输入', '32bit浮点', 'USB音频接口', '时间码', '蓝牙控制'],
    originalPrice: 9999,
    price: 8999,
    category: 'audio',
    stock: 8,
  },
  // 传输设备
  {
    id: 'bc-011',
    name: '无线图传',
    model: 'Teradek Bolt 4K 750',
    brand: 'Teradek',
    description: '4K无线图传，750英尺传输，零延迟',
    specs: ['4K HDR', '750英尺', '零延迟', 'SDI/HDMI', '多接收'],
    originalPrice: 29999,
    price: 27999,
    category: 'transmission',
    stock: 5,
  },
  {
    id: 'bc-012',
    name: '直播编码器',
    model: 'Teradek VidiU Go',
    brand: 'Teradek',
    description: '4G/WiFi双模，多平台推流，便携设计',
    specs: ['4G/WiFi', 'H.264编码', '多平台推流', '内置电池', 'HDMI输入'],
    originalPrice: 8999,
    price: 7999,
    category: 'transmission',
    stock: 12,
  },
  // 三脚架
  {
    id: 'bc-013',
    name: '专业摄像三脚架',
    model: 'Sachtler Ace XL',
    brand: 'Sachtler',
    description: '液压云台，承重8kg，专业广播级',
    specs: ['液压云台', '承重8kg', '75mm碗口', '快装板', '含脚架包'],
    originalPrice: 6999,
    price: 6299,
    category: 'tripod',
    stock: 15,
  },
];

// ==================== 五、二手设备 (各分类) ====================

// 二手个人入门设备
export const usedPersonalEquipment: Equipment[] = [
  {
    id: 'used-pe-001',
    name: '手机直播支架',
    model: 'ULANZI MT-50',
    brand: '优篮子',
    description: '铝合金材质，360°旋转云台，高度可调50-160cm',
    specs: ['铝合金材质', '承重2kg', '高度50-160cm', '360°云台', '折叠便携'],
    originalPrice: 199,
    price: 99,
    category: 'stand',
    stock: 5,
    type: 'used',
    condition: '95new',
    conditionDesc: '轻微使用痕迹，功能完好，云台旋转顺滑',
    usageDuration: '3个月',
    purchaseDate: '2025-10-01',
    source: 'personal',
    sourceInfo: '个人用户寄售',
    realImages: ['/images/used/pe-001-1.jpg', '/images/used/pe-001-2.jpg'],
    defects: [],
    warranty: {
      period: '3个月',
      scope: ['主体结构', '云台功能'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['功能检测合格'],
  },
  {
    id: 'used-pe-003',
    name: '环形补光灯 10寸',
    model: 'NEEWER RL-10',
    brand: 'NEEWER',
    description: '10寸LED环形灯，3200K-5600K可调色温，带手机夹',
    specs: ['10寸直径', '3200K-5600K色温', '亮度可调', 'USB供电', '含手机夹'],
    originalPrice: 199,
    price: 89,
    category: 'light',
    stock: 8,
    type: 'used',
    condition: '90new',
    conditionDesc: '正常使用痕迹，灯珠完好，亮度正常',
    usageDuration: '6个月',
    purchaseDate: '2025-07-15',
    source: 'official',
    sourceInfo: '官方回收翻新',
    realImages: ['/images/used/pe-003-1.jpg', '/images/used/pe-003-2.jpg'],
    defects: [
      { location: '底座', description: '轻微划痕', severity: 'minor' },
    ],
    warranty: {
      period: '3个月',
      scope: ['灯珠', '电源适配器'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['官方检测认证'],
  },
  {
    id: 'used-pe-005',
    name: '领夹式无线麦克风',
    model: 'BOYA BY-WM4 PRO',
    brand: 'BOYA',
    description: '2.4G无线传输，60米距离，手机/相机通用',
    specs: ['2.4G无线', '60米传输', '6小时续航', '手机/相机通用', '降噪功能'],
    originalPrice: 499,
    price: 259,
    category: 'audio',
    stock: 3,
    type: 'used',
    condition: '95new',
    conditionDesc: '几乎全新，仅拆封测试，功能完好',
    usageDuration: '1个月',
    purchaseDate: '2025-12-01',
    source: 'personal',
    sourceInfo: '个人用户寄售',
    realImages: ['/images/used/pe-005-1.jpg', '/images/used/pe-005-2.jpg'],
    defects: [],
    warranty: {
      period: '6个月',
      scope: ['发射器', '接收器', '领夹麦'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['功能检测合格'],
  },
];

// 二手商家标准设备
export const usedBusinessEquipment: Equipment[] = [
  {
    id: 'used-be-001',
    name: '直播专用笔记本',
    model: 'ThinkPad E14 Gen5',
    brand: 'Lenovo',
    description: 'i5-1340P/16G/512G SSD，14寸FHD，适合OBS推流',
    specs: ['i5-1340P处理器', '16GB内存', '512GB SSD', '14寸FHD', 'WiFi6'],
    originalPrice: 5299,
    price: 3299,
    category: 'computer',
    stock: 2,
    type: 'used',
    condition: '95new',
    conditionDesc: '机身轻微使用痕迹，屏幕完好，电池健康度95%',
    usageDuration: '8个月',
    purchaseDate: '2025-05-01',
    source: 'enterprise',
    sourceInfo: '某MCN机构置换',
    realImages: ['/images/used/be-001-1.jpg', '/images/used/be-001-2.jpg', '/images/used/be-001-3.jpg'],
    defects: [],
    inspectionReport: '/reports/be-001-inspection.pdf',
    warranty: {
      period: '6个月',
      scope: ['主机保修', '免费检测', '优先维修'],
      returnPolicy: '7天无理由退换',
      extendedOptions: [
        { id: 'ext-be-001-1', name: '延保1年', period: '1年', price: 399, coverage: ['主机', '电池'] },
      ],
    },
    certifications: ['官方检测认证', '企业来源认证'],
  },
  {
    id: 'used-be-003',
    name: '高清USB摄像头',
    model: 'Logitech C920 PRO',
    brand: 'Logitech',
    description: '1080P/30fps，自动对焦，双麦克风',
    specs: ['1080P/30fps', '自动对焦', '双立体声麦克风', '78°视角', 'USB即插即用'],
    originalPrice: 699,
    price: 399,
    category: 'camera',
    stock: 5,
    type: 'used',
    condition: '99new',
    conditionDesc: '几乎全新，无使用痕迹，功能完好',
    usageDuration: '2个月',
    purchaseDate: '2025-11-01',
    source: 'official',
    sourceInfo: '官方回收',
    realImages: ['/images/used/be-003-1.jpg', '/images/used/be-003-2.jpg'],
    defects: [],
    warranty: {
      period: '6个月',
      scope: ['摄像头主体', '数据线'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['官方检测认证'],
  },
  {
    id: 'used-be-008',
    name: 'USB电容麦克风',
    model: 'Blue Yeti',
    brand: 'Blue',
    description: '四种指向模式，即插即用，专业录音级',
    specs: ['四种指向模式', 'USB即插即用', '16bit/48kHz', '增益控制', '耳机监听'],
    originalPrice: 999,
    price: 549,
    category: 'audio',
    stock: 3,
    type: 'used',
    condition: '95new',
    conditionDesc: '轻微使用痕迹，录音效果完好',
    usageDuration: '6个月',
    purchaseDate: '2025-07-01',
    source: 'enterprise',
    sourceInfo: '某直播公司置换',
    realImages: ['/images/used/be-008-1.jpg', '/images/used/be-008-2.jpg'],
    defects: [
      { location: '底座', description: '轻微磨损', severity: 'minor' },
    ],
    warranty: {
      period: '6个月',
      scope: ['麦克风主体', 'USB线缆'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['功能检测合格'],
  },
];

// 二手专业设备
export const usedProfessionalEquipment: Equipment[] = [
  {
    id: 'used-pro-001',
    name: '全画幅微单相机',
    model: 'Sony A7C II',
    brand: 'Sony',
    description: '3300万像素，4K60p，实时眼部对焦',
    specs: ['3300万像素', '4K60p视频', '实时眼部AF', '5轴防抖', '翻转屏'],
    originalPrice: 14999,
    price: 9999,
    category: 'camera',
    stock: 2,
    type: 'used',
    condition: '95new',
    conditionDesc: '机身轻微使用痕迹，屏幕完好，快门数约5000次',
    usageDuration: '8个月',
    purchaseDate: '2025-05-01',
    source: 'enterprise',
    sourceInfo: '某MCN机构置换',
    realImages: [
      '/images/used/pro-001-front.jpg',
      '/images/used/pro-001-back.jpg',
      '/images/used/pro-001-top.jpg',
      '/images/used/pro-001-detail.jpg',
    ],
    defects: [],
    inspectionReport: '/reports/pro-001-inspection.pdf',
    warranty: {
      period: '6个月',
      scope: ['主机保修', '免费检测', '优先维修'],
      returnPolicy: '7天无理由退换',
      extendedOptions: [
        { id: 'ext-pro-001-1', name: '延保1年', period: '1年', price: 599, coverage: ['主机', '镜头卡口'] },
      ],
    },
    certifications: ['官方检测认证'],
  },
  {
    id: 'used-pro-003',
    name: '定焦直播镜头',
    model: 'Sony FE 35mm F1.4 GM',
    brand: 'Sony',
    description: 'F1.4超大光圈，人像直播首选',
    specs: ['35mm焦距', 'F1.4大光圈', 'G大师系列', '11片光圈叶片', '轻量化设计'],
    originalPrice: 11999,
    price: 7999,
    category: 'lens',
    stock: 1,
    type: 'used',
    condition: '90new',
    conditionDesc: '正常使用痕迹，镜片无划痕，对焦顺滑',
    usageDuration: '12个月',
    purchaseDate: '2025-01-15',
    source: 'personal',
    sourceInfo: '摄影师个人寄售',
    realImages: ['/images/used/pro-003-1.jpg', '/images/used/pro-003-2.jpg'],
    defects: [
      { location: '镜身', description: '轻微磨损', severity: 'minor' },
    ],
    warranty: {
      period: '3个月',
      scope: ['光学元件', '对焦马达'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['功能检测合格'],
  },
  {
    id: 'used-pro-009',
    name: '专业电容麦克风',
    model: 'Shure SM7B',
    brand: 'Shure',
    description: '广播级动圈麦克风，播客/直播首选',
    specs: ['动圈式', '心形指向', '50Hz-20kHz', '内置防震', '防喷罩'],
    originalPrice: 3299,
    price: 1999,
    category: 'audio',
    stock: 2,
    type: 'used',
    condition: '95new',
    conditionDesc: '轻微使用痕迹，录音效果完美',
    usageDuration: '6个月',
    purchaseDate: '2025-07-01',
    source: 'enterprise',
    sourceInfo: '某播客工作室置换',
    realImages: ['/images/used/pro-009-1.jpg', '/images/used/pro-009-2.jpg'],
    defects: [],
    warranty: {
      period: '6个月',
      scope: ['麦克风主体', '防喷罩'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['官方检测认证'],
  },
];

// 二手广播级设备
export const usedBroadcastEquipment: Equipment[] = [
  {
    id: 'used-bc-002',
    name: '电影级摄像机',
    model: 'Sony FX6',
    brand: 'Sony',
    description: '全画幅电影机，4K120p，双原生ISO',
    specs: ['全画幅CMOS', '4K120p', '双原生ISO', 'S-Cinetone', 'E卡口'],
    originalPrice: 39999,
    price: 26999,
    category: 'camera',
    stock: 1,
    type: 'used',
    condition: '90new',
    conditionDesc: '正常使用痕迹，传感器完好，功能正常',
    usageDuration: '18个月',
    purchaseDate: '2024-07-01',
    source: 'enterprise',
    sourceInfo: '某影视公司置换',
    realImages: [
      '/images/used/bc-002-1.jpg',
      '/images/used/bc-002-2.jpg',
      '/images/used/bc-002-3.jpg',
    ],
    defects: [
      { location: '机身底部', description: '轻微磨损', severity: 'minor' },
    ],
    inspectionReport: '/reports/bc-002-inspection.pdf',
    warranty: {
      period: '6个月',
      scope: ['主机保修', '传感器', '免费检测'],
      returnPolicy: '7天无理由退换',
      extendedOptions: [
        { id: 'ext-bc-002-1', name: '延保1年', period: '1年', price: 1299, coverage: ['主机', '传感器', '卡口'] },
      ],
    },
    certifications: ['官方检测认证', '企业来源认证'],
  },
  {
    id: 'used-bc-008',
    name: '无线麦克风系统',
    model: 'Sennheiser EW 100 G4',
    brand: 'Sennheiser',
    description: '专业无线系统，100米传输，自动扫频',
    specs: ['UHF无线', '100米传输', '自动扫频', '金属机身', '含领夹麦'],
    originalPrice: 5999,
    price: 3499,
    category: 'audio',
    stock: 2,
    type: 'used',
    condition: '95new',
    conditionDesc: '轻微使用痕迹，信号稳定，功能完好',
    usageDuration: '10个月',
    purchaseDate: '2025-03-01',
    source: 'official',
    sourceInfo: '官方回收',
    realImages: ['/images/used/bc-008-1.jpg', '/images/used/bc-008-2.jpg'],
    defects: [],
    warranty: {
      period: '6个月',
      scope: ['发射器', '接收器', '领夹麦'],
      returnPolicy: '7天无理由退换',
    },
    certifications: ['官方检测认证'],
  },
];

// ==================== 套餐配置 ====================
export const equipmentPackages: EquipmentPackage[] = [
  // 一、个人入门套餐
  {
    id: 'pkg-personal-basic',
    name: '手机直播入门套餐',
    type: 'personal',
    description: '适合个人主播、短视频创作者，手机直播必备',
    targetUser: '个人主播、短视频博主、带货新手',
    items: [
      { equipmentId: 'pe-001', name: '手机直播支架', model: 'ULANZI MT-50', quantity: 1, unitPrice: 159 },
      { equipmentId: 'pe-003', name: '环形补光灯 10寸', model: 'NEEWER RL-10', quantity: 1, unitPrice: 149 },
      { equipmentId: 'pe-005', name: '领夹式无线麦克风', model: 'BOYA BY-WM4 PRO', quantity: 1, unitPrice: 399 },
      { equipmentId: 'pe-008', name: '直播背景布', model: 'NEEWER 1.5x2m', quantity: 1, unitPrice: 99 },
    ],
    originalTotal: 806,
    packagePrice: 688,
    savings: 118,
    deliveryFee: 0,
    installationFee: 0,
    totalPrice: 688,
    warranty: '1年质保',
    features: ['即买即用', '轻便携带', '适合新手', '免费教程'],
    tag: '入门首选',
  },
  {
    id: 'pkg-personal-pro',
    name: '手机直播进阶套餐',
    type: 'personal',
    description: '升级版手机直播套装，画质音质全面提升',
    targetUser: '有一定粉丝基础的个人主播',
    items: [
      { equipmentId: 'pe-002', name: '桌面手机支架', model: 'JOBY GripTight PRO', quantity: 1, unitPrice: 239 },
      { equipmentId: 'pe-004', name: '环形补光灯 14寸', model: 'NEEWER RL-14', quantity: 1, unitPrice: 319 },
      { equipmentId: 'pe-006', name: '手机直播麦克风', model: 'RODE VideoMic Me-L', quantity: 1, unitPrice: 499 },
      { equipmentId: 'pe-007', name: '手机稳定器', model: 'DJI OM 6', quantity: 1, unitPrice: 899 },
      { equipmentId: 'pe-008', name: '直播背景布', model: 'NEEWER 1.5x2m', quantity: 2, unitPrice: 99 },
    ],
    originalTotal: 2154,
    packagePrice: 1888,
    savings: 266,
    deliveryFee: 0,
    installationFee: 400,
    totalPrice: 2288,
    warranty: '1年质保',
    features: ['专业音质', '稳定画面', '多场景背景', '乌鲁木齐市内上门安装'],
    tag: '推荐',
  },

  // 二、商家标准套餐
  {
    id: 'pkg-business-basic',
    name: '商家直播基础套餐',
    type: 'business',
    description: '适合小型商家、店铺直播，性价比之选',
    targetUser: '淘宝/抖音店铺、小型电商',
    items: [
      { equipmentId: 'be-001', name: '直播专用笔记本', model: 'ThinkPad E14 Gen5', quantity: 1, unitPrice: 4799 },
      { equipmentId: 'be-003', name: '高清USB摄像头', model: 'Logitech C920 PRO', quantity: 1, unitPrice: 599 },
      { equipmentId: 'be-007', name: '美颜补光灯', model: 'NEEWER 18寸环形灯', quantity: 1, unitPrice: 499 },
      { equipmentId: 'be-008', name: 'USB电容麦克风', model: 'Blue Yeti', quantity: 1, unitPrice: 849 },
      { equipmentId: 'be-011', name: '直播背景墙', model: 'NEEWER 背景架套装', quantity: 1, unitPrice: 399 },
    ],
    originalTotal: 7145,
    packagePrice: 6288,
    savings: 857,
    deliveryFee: 100,
    installationFee: 400,
    totalPrice: 6788,
    warranty: '2年质保',
    features: ['OBS推流', '1080P画质', '专业收音', '乌鲁木齐市内上门安装调试'],
    tag: '性价比',
  },
  {
    id: 'pkg-business-standard',
    name: '商家直播标准套餐',
    type: 'business',
    description: '独立直播间标配，4K画质，专业灯光',
    targetUser: '中型电商、品牌直播间',
    items: [
      { equipmentId: 'be-002', name: '直播一体机', model: 'HP ProOne 440 G9', quantity: 1, unitPrice: 5899 },
      { equipmentId: 'be-004', name: '4K直播摄像头', model: 'Logitech BRIO 4K', quantity: 1, unitPrice: 1299 },
      { equipmentId: 'be-005', name: 'LED平板补光灯', model: 'GODOX SL60W', quantity: 2, unitPrice: 749 },
      { equipmentId: 'be-006', name: '柔光箱套装', model: 'GODOX 60x90cm', quantity: 2, unitPrice: 329 },
      { equipmentId: 'be-008', name: 'USB电容麦克风', model: 'Blue Yeti', quantity: 1, unitPrice: 849 },
      { equipmentId: 'be-009', name: '桌面麦克风支架', model: 'RODE PSA1', quantity: 1, unitPrice: 699 },
      { equipmentId: 'be-010', name: '绿幕背景套装', model: 'Elgato Green Screen', quantity: 1, unitPrice: 1099 },
      { equipmentId: 'be-012', name: '直播控制台', model: 'Elgato Stream Deck MK.2', quantity: 1, unitPrice: 999 },
    ],
    originalTotal: 13000,
    packagePrice: 10888,
    savings: 2112,
    deliveryFee: 200,
    installationFee: 500,
    totalPrice: 11588,
    warranty: '2年质保',
    features: ['4K画质', '专业三点布光', '绿幕抠像', '一键切换场景', '乌鲁木齐市内上门安装调试'],
    tag: '推荐',
  },

  // 三、互联网专业套餐
  {
    id: 'pkg-professional-standard',
    name: '网红直播专业套餐',
    type: 'professional',
    description: '适合MCN机构、头部主播，电影级画质',
    targetUser: '网红主播、MCN机构、游戏主播',
    items: [
      { equipmentId: 'pro-001', name: '全画幅微单相机', model: 'Sony A7C II', quantity: 1, unitPrice: 13999 },
      { equipmentId: 'pro-003', name: '定焦直播镜头', model: 'Sony FE 35mm F1.4 GM', quantity: 1, unitPrice: 10999 },
      { equipmentId: 'pro-005', name: 'USB采集卡', model: 'Elgato HD60 X', quantity: 1, unitPrice: 1199 },
      { equipmentId: 'pro-006', name: 'LED影视灯', model: 'GODOX SL150W', quantity: 2, unitPrice: 1699 },
      { equipmentId: 'pro-008', name: '柔光箱套装', model: 'Aputure Light Dome II', quantity: 2, unitPrice: 1799 },
      { equipmentId: 'pro-009', name: '专业电容麦克风', model: 'Shure SM7B', quantity: 1, unitPrice: 2999 },
      { equipmentId: 'pro-010', name: '音频接口', model: 'Focusrite Scarlett 2i2', quantity: 1, unitPrice: 1099 },
      { equipmentId: 'pro-013', name: '专业显示器', model: 'ASUS ProArt PA279CV', quantity: 1, unitPrice: 3599 },
    ],
    originalTotal: 40889,
    packagePrice: 35888,
    savings: 5001,
    deliveryFee: 300,
    installationFee: 500,
    totalPrice: 36688,
    warranty: '2年质保 + 1年延保',
    features: ['电影级画质', '大光圈虚化', '专业收音', '色彩准确', '乌鲁木齐市内上门安装调试'],
    tag: '专业级',
  },
  {
    id: 'pkg-professional-ultimate',
    name: '网红直播旗舰套餐',
    type: 'professional',
    description: '顶级配置，多机位直播，专业导播',
    targetUser: '头部MCN、大型直播间、电商直播基地',
    items: [
      { equipmentId: 'pro-001', name: '全画幅微单相机', model: 'Sony A7C II', quantity: 2, unitPrice: 13999 },
      { equipmentId: 'pro-002', name: '直播专用镜头', model: 'Sony FE 24-70mm F2.8 GM II', quantity: 1, unitPrice: 14999 },
      { equipmentId: 'pro-003', name: '定焦直播镜头', model: 'Sony FE 35mm F1.4 GM', quantity: 1, unitPrice: 10999 },
      { equipmentId: 'pro-004', name: '4K采集卡', model: 'Elgato 4K60 Pro MK.2', quantity: 2, unitPrice: 2199 },
      { equipmentId: 'pro-007', name: '双色温LED灯', model: 'Aputure 300d II', quantity: 2, unitPrice: 5499 },
      { equipmentId: 'pro-008', name: '柔光箱套装', model: 'Aputure Light Dome II', quantity: 2, unitPrice: 1799 },
      { equipmentId: 'pro-011', name: '调音台', model: 'RODE RODECaster Pro II', quantity: 1, unitPrice: 5499 },
      { equipmentId: 'pro-012', name: '直播工作站', model: 'Apple Mac Studio M2 Max', quantity: 1, unitPrice: 18999 },
      { equipmentId: 'pro-013', name: '专业显示器', model: 'ASUS ProArt PA279CV', quantity: 2, unitPrice: 3599 },
    ],
    originalTotal: 105582,
    packagePrice: 88888,
    savings: 16694,
    deliveryFee: 500,
    installationFee: 500,
    totalPrice: 89888,
    warranty: '3年质保 + 终身技术支持',
    features: ['双机位切换', '4K60采集', '专业调音', '多平台推流', '乌鲁木齐市内上门安装调试'],
    tag: '旗舰',
  },

  // 四、记者广播级套餐
  {
    id: 'pkg-broadcast-standard',
    name: '记者采访套餐',
    type: 'broadcast',
    description: '适合新闻记者、纪录片拍摄，便携专业',
    targetUser: '新闻记者、自媒体记者、纪录片团队',
    items: [
      { equipmentId: 'bc-002', name: '电影级摄像机', model: 'Sony FX6', quantity: 1, unitPrice: 36999 },
      { equipmentId: 'bc-003', name: '广播级镜头', model: 'Sony FE PZ 28-135mm F4 G OSS', quantity: 1, unitPrice: 17499 },
      { equipmentId: 'bc-004', name: '导演监视器', model: 'Atomos Ninja V+', quantity: 1, unitPrice: 6299 },
      { equipmentId: 'bc-008', name: '无线麦克风系统', model: 'Sennheiser EW 100 G4', quantity: 1, unitPrice: 5499 },
      { equipmentId: 'bc-009', name: '枪式采访麦克风', model: 'Sennheiser MKH 416', quantity: 1, unitPrice: 7999 },
      { equipmentId: 'bc-012', name: '直播编码器', model: 'Teradek VidiU Go', quantity: 1, unitPrice: 7999 },
      { equipmentId: 'bc-013', name: '专业摄像三脚架', model: 'Sachtler Ace XL', quantity: 1, unitPrice: 6299 },
    ],
    originalTotal: 88593,
    packagePrice: 78888,
    savings: 9705,
    deliveryFee: 500,
    installationFee: 500,
    totalPrice: 79888,
    warranty: '3年质保 + 优先维修',
    features: ['电影级画质', '4K120p', '专业收音', '现场直播', '乌鲁木齐市内上门安装调试'],
    tag: '专业媒体',
  },
  {
    id: 'pkg-broadcast-ultimate',
    name: '广播级直播旗舰套餐',
    type: 'broadcast',
    description: '电视台级别配置，多机位导播，无线传输',
    targetUser: '电视台、大型活动直播、专业制作公司',
    items: [
      { equipmentId: 'bc-001', name: '广播级摄像机', model: 'Sony PXW-Z280', quantity: 2, unitPrice: 42999 },
      { equipmentId: 'bc-002', name: '电影级摄像机', model: 'Sony FX6', quantity: 1, unitPrice: 36999 },
      { equipmentId: 'bc-003', name: '广播级镜头', model: 'Sony FE PZ 28-135mm F4 G OSS', quantity: 2, unitPrice: 17499 },
      { equipmentId: 'bc-005', name: '17寸导播监视器', model: 'Lilliput BM170-4KS', quantity: 1, unitPrice: 7999 },
      { equipmentId: 'bc-006', name: '影视级LED灯', model: 'ARRI Skypanel S60-C', quantity: 2, unitPrice: 32999 },
      { equipmentId: 'bc-007', name: '便携LED灯组', model: 'Aputure Nova P300c', quantity: 2, unitPrice: 11999 },
      { equipmentId: 'bc-008', name: '无线麦克风系统', model: 'Sennheiser EW 100 G4', quantity: 2, unitPrice: 5499 },
      { equipmentId: 'bc-010', name: '便携调音台', model: 'Sound Devices MixPre-6 II', quantity: 1, unitPrice: 8999 },
      { equipmentId: 'bc-011', name: '无线图传', model: 'Teradek Bolt 4K 750', quantity: 1, unitPrice: 27999 },
      { equipmentId: 'bc-013', name: '专业摄像三脚架', model: 'Sachtler Ace XL', quantity: 3, unitPrice: 6299 },
    ],
    originalTotal: 339882,
    packagePrice: 288888,
    savings: 50994,
    deliveryFee: 1000,
    installationFee: 500,
    totalPrice: 290388,
    warranty: '3年质保 + 终身技术支持 + 优先维修',
    features: ['广播级画质', '多机位导播', '无线图传', '专业灯光', '乌鲁木齐市内上门安装调试'],
    tag: '广播旗舰',
  },
];

// ==================== 六、二手套餐配置 ====================
export const usedEquipmentPackages: EquipmentPackage[] = [
  // 二手商家基础套餐
  {
    id: 'pkg-used-business-basic',
    name: '商家直播基础套餐（二手）',
    type: 'business',
    description: '适合小型商家、店铺直播，超高性价比二手套装',
    targetUser: '预算有限的小型电商',
    items: [
      { equipmentId: 'used-be-001', name: '直播专用笔记本', model: 'ThinkPad E14 Gen5', quantity: 1, unitPrice: 3299, type: 'used', condition: '95new' },
      { equipmentId: 'used-be-003', name: '高清USB摄像头', model: 'Logitech C920 PRO', quantity: 1, unitPrice: 399, type: 'used', condition: '99new' },
      { equipmentId: 'be-007', name: '美颜补光灯', model: 'NEEWER 18寸环形灯', quantity: 1, unitPrice: 499, type: 'new' },
      { equipmentId: 'used-be-008', name: 'USB电容麦克风', model: 'Blue Yeti', quantity: 1, unitPrice: 549, type: 'used', condition: '95new' },
    ],
    originalTotal: 7145,
    packagePrice: 4288,
    savings: 2857,
    deliveryFee: 100,
    installationFee: 400,
    totalPrice: 4788,
    warranty: '6个月质保',
    features: ['超值二手', '功能完好', '专业检测', '乌鲁木齐市内上门安装'],
    tag: '超值',
    packageType: 'mixed',
    conditionSummary: '整体95新，功能完好',
    newEquipmentPrice: 6288,
  },
  // 二手专业套餐
  {
    id: 'pkg-used-professional-standard',
    name: '网红直播专业套餐（二手）',
    type: 'professional',
    description: '适合预算有限的MCN机构、主播，电影级画质',
    targetUser: '预算有限的网红主播、小型MCN',
    items: [
      { equipmentId: 'used-pro-001', name: '全画幅微单相机', model: 'Sony A7C II', quantity: 1, unitPrice: 9999, type: 'used', condition: '95new', realImage: '/images/used/pro-001-front.jpg' },
      { equipmentId: 'used-pro-003', name: '定焦直播镜头', model: 'Sony FE 35mm F1.4 GM', quantity: 1, unitPrice: 7999, type: 'used', condition: '90new', realImage: '/images/used/pro-003-1.jpg' },
      { equipmentId: 'pro-005', name: 'USB采集卡', model: 'Elgato HD60 X', quantity: 1, unitPrice: 1199, type: 'new' },
      { equipmentId: 'pro-006', name: 'LED影视灯', model: 'GODOX SL150W', quantity: 2, unitPrice: 1699, type: 'new' },
      { equipmentId: 'used-pro-009', name: '专业电容麦克风', model: 'Shure SM7B', quantity: 1, unitPrice: 1999, type: 'used', condition: '95new', realImage: '/images/used/pro-009-1.jpg' },
      { equipmentId: 'pro-010', name: '音频接口', model: 'Focusrite Scarlett 2i2', quantity: 1, unitPrice: 1099, type: 'new' },
    ],
    originalTotal: 40889,
    packagePrice: 24888,
    savings: 16001,
    deliveryFee: 300,
    installationFee: 500,
    totalPrice: 25688,
    warranty: '6个月质保',
    features: ['电影级画质', '超值二手', '专业检测', '乌鲁木齐市内上门安装调试'],
    tag: '超值专业',
    packageType: 'mixed',
    conditionSummary: '核心设备95新，功能完好',
    newEquipmentPrice: 35888,
  },
  // 纯二手个人套餐
  {
    id: 'pkg-used-personal-basic',
    name: '手机直播入门套餐（二手）',
    type: 'personal',
    description: '适合预算有限的新手主播，超低价入门',
    targetUser: '预算有限的新手主播',
    items: [
      { equipmentId: 'used-pe-001', name: '手机直播支架', model: 'ULANZI MT-50', quantity: 1, unitPrice: 99, type: 'used', condition: '95new' },
      { equipmentId: 'used-pe-003', name: '环形补光灯 10寸', model: 'NEEWER RL-10', quantity: 1, unitPrice: 89, type: 'used', condition: '90new' },
      { equipmentId: 'used-pe-005', name: '领夹式无线麦克风', model: 'BOYA BY-WM4 PRO', quantity: 1, unitPrice: 259, type: 'used', condition: '95new' },
    ],
    originalTotal: 806,
    packagePrice: 388,
    savings: 418,
    deliveryFee: 0,
    installationFee: 0,
    totalPrice: 388,
    warranty: '3个月质保',
    features: ['超低价入门', '功能完好', '专业检测', '免费教程'],
    tag: '超值入门',
    packageType: 'used',
    conditionSummary: '整体9成新以上，功能完好',
    newEquipmentPrice: 688,
  },
];

// ==================== 服务价格 ====================
export const servicesPricing = {
  // 配送服务
  delivery: {
    standard: { name: '标准配送', price: 0, description: '3-5个工作日送达', minOrder: 500 },
    express: { name: '加急配送', price: 50, description: '1-2个工作日送达' },
    sameDay: { name: '同城当日达', price: 100, description: '当日送达（限同城）' },
    largeItem: { name: '大件物流', price: 200, description: '大型设备专车配送' },
  },
  // 安装服务（乌鲁木齐市内上门服务）
  installation: {
    standard: { 
      name: '上门安装调试（乌鲁木齐市内）', 
      price: 400, 
      priceRange: '400-500',
      description: '设备安装调试正常运行，含设备组装、线缆连接、软件配置、直播测试、使用培训',
      duration: '2-4小时',
      includes: ['设备组装', '线缆连接', '软件安装', 'OBS/直播软件配置', '直播测试', '使用培训', '确保正常运行'],
      serviceArea: '乌鲁木齐市内',
    },
    professional: { 
      name: '专业安装调试（乌鲁木齐市内）', 
      price: 500, 
      priceRange: '500',
      description: '专业布光、音频调试、多平台配置、确保设备正常运行',
      duration: '4-6小时',
      includes: ['设备组装', '专业布光调试', '音频调试', '多平台配置', '画面调色', '全面培训', '确保正常运行'],
      serviceArea: '乌鲁木齐市内',
    },
    remote: { 
      name: '远程指导安装', 
      price: 0, 
      priceRange: '免费',
      description: '视频通话远程指导安装调试',
      duration: '1-2小时',
      includes: ['视频指导', '远程协助', '问题解答'],
      serviceArea: '全国',
    },
  },
  // 维护服务
  maintenance: {
    basic: { name: '基础维护', price: 299, description: '年度设备检查、清洁保养', period: '年' },
    standard: { name: '标准维护', price: 599, description: '季度检查、软件更新、远程支持', period: '年' },
    premium: { name: '尊享维护', price: 1299, description: '月度检查、优先维修、备用设备', period: '年' },
  },
  // 培训服务
  training: {
    online: { name: '在线培训', price: 0, description: '免费视频教程、直播课程' },
    onsite: { name: '上门培训', price: 499, description: '2小时一对一培训', duration: '2小时' },
    advanced: { name: '进阶培训', price: 999, description: '专业直播技巧、运营指导', duration: '4小时' },
    team: { name: '团队培训', price: 2999, description: '团队培训、流程优化', duration: '1天' },
  },
};

// ==================== 辅助函数 ====================

// 获取所有全新设备
export function getAllNewEquipment(): Equipment[] {
  return [...personalEquipment, ...businessEquipment, ...professionalEquipment, ...broadcastEquipment];
}

// 获取所有二手设备
export function getAllUsedEquipment(): Equipment[] {
  return [...usedPersonalEquipment, ...usedBusinessEquipment, ...usedProfessionalEquipment, ...usedBroadcastEquipment];
}

// 获取所有设备（包括新旧）
export function getAllEquipment(): Equipment[] {
  return [...getAllNewEquipment(), ...getAllUsedEquipment()];
}

// 按类型获取设备
export function getEquipmentByType(equipmentType: EquipmentType): Equipment[] {
  if (equipmentType === 'new') {
    return getAllNewEquipment();
  }
  return getAllUsedEquipment();
}

export function getEquipmentById(id: string): Equipment | undefined {
  return getAllEquipment().find(e => e.id === id);
}

// 获取所有全新套餐
export function getAllNewPackages(): EquipmentPackage[] {
  return equipmentPackages;
}

// 获取所有二手套餐
export function getAllUsedPackages(): EquipmentPackage[] {
  return usedEquipmentPackages;
}

// 获取所有套餐（包括新旧）
export function getAllPackages(): EquipmentPackage[] {
  return [...equipmentPackages, ...usedEquipmentPackages];
}

export function getPackagesByType(type: EquipmentPackage['type']): EquipmentPackage[] {
  return getAllPackages().filter(p => p.type === type);
}

// 按套餐类型（新/旧/混合）获取套餐
export function getPackagesByPackageType(packageType: PackageType): EquipmentPackage[] {
  return getAllPackages().filter(p => p.packageType === packageType || (!p.packageType && packageType === 'new'));
}

export function getPackageById(id: string): EquipmentPackage | undefined {
  return getAllPackages().find(p => p.id === id);
}

export function calculatePackageTotal(pkg: EquipmentPackage, includeDelivery = true, includeInstallation = true): number {
  let total = pkg.packagePrice;
  if (includeDelivery) total += pkg.deliveryFee;
  if (includeInstallation) total += pkg.installationFee;
  return total;
}

// 计算节省金额
export function calculateSavings(originalPrice: number, currentPrice: number): number {
  return originalPrice - currentPrice;
}

// 计算折扣比例
export function calculateDiscountRate(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round((1 - currentPrice / originalPrice) * 100);
}

// 验证二手设备数据完整性
export function validateUsedEquipment(equipment: Equipment): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (equipment.type === 'used') {
    if (!equipment.condition) {
      errors.push('二手设备必须填写成色等级');
    }
    if (!equipment.realImages || equipment.realImages.length === 0) {
      errors.push('二手设备必须上传实拍图片');
    }
    if (!equipment.source) {
      errors.push('二手设备必须填写来源');
    }
    if (equipment.price >= equipment.originalPrice) {
      errors.push('售价应低于原价');
    }
    if (equipment.defects) {
      for (const defect of equipment.defects) {
        if (!defect.location || !defect.description) {
          errors.push('瑕疵信息必须包含位置和描述');
        }
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}
