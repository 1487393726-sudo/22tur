'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Store,
  Video,
  Radio,
  Package,
  Truck,
  Wrench,
  Shield,
  GraduationCap,
  ChevronRight,
  Check,
  Phone,
  MessageCircle,
  Calendar,
  Star,
  Zap,
} from 'lucide-react';

// 设备类型
type EquipmentType = 'personal' | 'business' | 'professional' | 'broadcast';

// 类型配置
const typeConfig = {
  personal: {
    icon: Smartphone,
    title: '个人入门套餐',
    subtitle: '手机直播必备',
    description: '适合个人主播、短视频创作者，手机直播入门设备',
    targetUser: '个人主播、短视频博主、带货新手',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  business: {
    icon: Store,
    title: '商家标准套餐',
    subtitle: '独立直播间标配',
    description: '适合店铺直播，笔记本电脑+专业灯光+背景',
    targetUser: '淘宝/抖音店铺、小型电商、品牌直播间',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  professional: {
    icon: Video,
    title: '网红专业套餐',
    subtitle: '电影级画质',
    description: '专业相机+镜头+采集卡，适合MCN机构',
    targetUser: '网红主播、MCN机构、游戏主播、头部主播',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  broadcast: {
    icon: Radio,
    title: '记者广播级套餐',
    subtitle: '专业媒体级别',
    description: '广播级摄像机+无线图传+专业灯光',
    targetUser: '新闻记者、电视台、大型活动直播、专业制作公司',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
};

// 套餐数据
const packagesData = {
  personal: [
    {
      id: 'pkg-personal-basic',
      name: '手机直播入门套餐',
      tag: '入门首选',
      items: [
        { name: '手机直播支架', model: 'ULANZI MT-50', qty: 1, price: 159 },
        { name: '环形补光灯 10寸', model: 'NEEWER RL-10', qty: 1, price: 149 },
        { name: '领夹式无线麦克风', model: 'BOYA BY-WM4 PRO', qty: 1, price: 399 },
        { name: '直播背景布', model: 'NEEWER 1.5x2m', qty: 1, price: 99 },
      ],
      originalTotal: 806,
      packagePrice: 688,
      savings: 118,
      deliveryFee: 0,
      installationFee: 0,
      totalPrice: 688,
      warranty: '1年质保',
      features: ['即买即用', '轻便携带', '适合新手', '免费远程指导'],
    },
    {
      id: 'pkg-personal-pro',
      name: '手机直播进阶套餐',
      tag: '推荐',
      items: [
        { name: '桌面手机支架', model: 'JOBY GripTight PRO', qty: 1, price: 239 },
        { name: '环形补光灯 14寸', model: 'NEEWER RL-14', qty: 1, price: 319 },
        { name: '手机直播麦克风', model: 'RODE VideoMic Me-L', qty: 1, price: 499 },
        { name: '手机稳定器', model: 'DJI OM 6', qty: 1, price: 899 },
        { name: '直播背景布', model: 'NEEWER 1.5x2m', qty: 2, price: 99 },
      ],
      originalTotal: 2154,
      packagePrice: 1888,
      savings: 266,
      deliveryFee: 0,
      installationFee: 400,
      totalPrice: 2288,
      warranty: '1年质保',
      features: ['专业音质', '稳定画面', '多场景背景', '乌鲁木齐市内上门安装'],
    },
  ],
  business: [
    {
      id: 'pkg-business-basic',
      name: '商家直播基础套餐',
      tag: '性价比',
      items: [
        { name: '直播专用笔记本', model: 'ThinkPad E14 Gen5', qty: 1, price: 4799 },
        { name: '高清USB摄像头', model: 'Logitech C920 PRO', qty: 1, price: 599 },
        { name: '美颜补光灯', model: 'NEEWER 18寸环形灯', qty: 1, price: 499 },
        { name: 'USB电容麦克风', model: 'Blue Yeti', qty: 1, price: 849 },
        { name: '直播背景墙', model: 'NEEWER 背景架套装', qty: 1, price: 399 },
      ],
      originalTotal: 7145,
      packagePrice: 6288,
      savings: 857,
      deliveryFee: 100,
      installationFee: 400,
      totalPrice: 6788,
      warranty: '2年质保',
      features: ['OBS推流', '1080P画质', '专业收音', '乌鲁木齐市内上门安装调试'],
    },
    {
      id: 'pkg-business-standard',
      name: '商家直播标准套餐',
      tag: '推荐',
      items: [
        { name: '直播一体机', model: 'HP ProOne 440 G9', qty: 1, price: 5899 },
        { name: '4K直播摄像头', model: 'Logitech BRIO 4K', qty: 1, price: 1299 },
        { name: 'LED平板补光灯', model: 'GODOX SL60W', qty: 2, price: 749 },
        { name: '柔光箱套装', model: 'GODOX 60x90cm', qty: 2, price: 329 },
        { name: 'USB电容麦克风', model: 'Blue Yeti', qty: 1, price: 849 },
        { name: '桌面麦克风支架', model: 'RODE PSA1', qty: 1, price: 699 },
        { name: '绿幕背景套装', model: 'Elgato Green Screen', qty: 1, price: 1099 },
        { name: '直播控制台', model: 'Elgato Stream Deck MK.2', qty: 1, price: 999 },
      ],
      originalTotal: 13000,
      packagePrice: 10888,
      savings: 2112,
      deliveryFee: 200,
      installationFee: 500,
      totalPrice: 11588,
      warranty: '2年质保',
      features: ['4K画质', '专业三点布光', '绿幕抠像', '一键切换场景', '乌鲁木齐市内上门安装调试'],
    },
  ],

  professional: [
    {
      id: 'pkg-professional-standard',
      name: '网红直播专业套餐',
      tag: '专业级',
      items: [
        { name: '全画幅微单相机', model: 'Sony A7C II', qty: 1, price: 13999 },
        { name: '定焦直播镜头', model: 'Sony FE 35mm F1.4 GM', qty: 1, price: 10999 },
        { name: 'USB采集卡', model: 'Elgato HD60 X', qty: 1, price: 1199 },
        { name: 'LED影视灯', model: 'GODOX SL150W', qty: 2, price: 1699 },
        { name: '柔光箱套装', model: 'Aputure Light Dome II', qty: 2, price: 1799 },
        { name: '专业电容麦克风', model: 'Shure SM7B', qty: 1, price: 2999 },
        { name: '音频接口', model: 'Focusrite Scarlett 2i2', qty: 1, price: 1099 },
        { name: '专业显示器', model: 'ASUS ProArt PA279CV', qty: 1, price: 3599 },
      ],
      originalTotal: 40889,
      packagePrice: 35888,
      savings: 5001,
      deliveryFee: 300,
      installationFee: 500,
      totalPrice: 36688,
      warranty: '2年质保 + 1年延保',
      features: ['电影级画质', '大光圈虚化', '专业收音', '色彩准确', '乌鲁木齐市内上门安装调试'],
    },
    {
      id: 'pkg-professional-ultimate',
      name: '网红直播旗舰套餐',
      tag: '旗舰',
      items: [
        { name: '全画幅微单相机', model: 'Sony A7C II', qty: 2, price: 13999 },
        { name: '直播专用镜头', model: 'Sony FE 24-70mm F2.8 GM II', qty: 1, price: 14999 },
        { name: '定焦直播镜头', model: 'Sony FE 35mm F1.4 GM', qty: 1, price: 10999 },
        { name: '4K采集卡', model: 'Elgato 4K60 Pro MK.2', qty: 2, price: 2199 },
        { name: '双色温LED灯', model: 'Aputure 300d II', qty: 2, price: 5499 },
        { name: '柔光箱套装', model: 'Aputure Light Dome II', qty: 2, price: 1799 },
        { name: '调音台', model: 'RODE RODECaster Pro II', qty: 1, price: 5499 },
        { name: '直播工作站', model: 'Apple Mac Studio M2 Max', qty: 1, price: 18999 },
        { name: '专业显示器', model: 'ASUS ProArt PA279CV', qty: 2, price: 3599 },
      ],
      originalTotal: 105582,
      packagePrice: 88888,
      savings: 16694,
      deliveryFee: 500,
      installationFee: 500,
      totalPrice: 89888,
      warranty: '3年质保 + 终身技术支持',
      features: ['双机位切换', '4K60采集', '专业调音', '多平台推流', '乌鲁木齐市内上门安装调试'],
    },
  ],
  broadcast: [
    {
      id: 'pkg-broadcast-standard',
      name: '记者采访套餐',
      tag: '专业媒体',
      items: [
        { name: '电影级摄像机', model: 'Sony FX6', qty: 1, price: 36999 },
        { name: '广播级镜头', model: 'Sony FE PZ 28-135mm F4 G OSS', qty: 1, price: 17499 },
        { name: '导演监视器', model: 'Atomos Ninja V+', qty: 1, price: 6299 },
        { name: '无线麦克风系统', model: 'Sennheiser EW 100 G4', qty: 1, price: 5499 },
        { name: '枪式采访麦克风', model: 'Sennheiser MKH 416', qty: 1, price: 7999 },
        { name: '直播编码器', model: 'Teradek VidiU Go', qty: 1, price: 7999 },
        { name: '专业摄像三脚架', model: 'Sachtler Ace XL', qty: 1, price: 6299 },
      ],
      originalTotal: 88593,
      packagePrice: 78888,
      savings: 9705,
      deliveryFee: 500,
      installationFee: 500,
      totalPrice: 79888,
      warranty: '3年质保 + 优先维修',
      features: ['电影级画质', '4K120p', '专业收音', '现场直播', '乌鲁木齐市内上门安装调试'],
    },
    {
      id: 'pkg-broadcast-ultimate',
      name: '广播级直播旗舰套餐',
      tag: '广播旗舰',
      items: [
        { name: '广播级摄像机', model: 'Sony PXW-Z280', qty: 2, price: 42999 },
        { name: '电影级摄像机', model: 'Sony FX6', qty: 1, price: 36999 },
        { name: '广播级镜头', model: 'Sony FE PZ 28-135mm F4 G OSS', qty: 2, price: 17499 },
        { name: '17寸导播监视器', model: 'Lilliput BM170-4KS', qty: 1, price: 7999 },
        { name: '影视级LED灯', model: 'ARRI Skypanel S60-C', qty: 2, price: 32999 },
        { name: '便携LED灯组', model: 'Aputure Nova P300c', qty: 2, price: 11999 },
        { name: '无线麦克风系统', model: 'Sennheiser EW 100 G4', qty: 2, price: 5499 },
        { name: '便携调音台', model: 'Sound Devices MixPre-6 II', qty: 1, price: 8999 },
        { name: '无线图传', model: 'Teradek Bolt 4K 750', qty: 1, price: 27999 },
        { name: '专业摄像三脚架', model: 'Sachtler Ace XL', qty: 3, price: 6299 },
      ],
      originalTotal: 339882,
      packagePrice: 288888,
      savings: 50994,
      deliveryFee: 1000,
      installationFee: 500,
      totalPrice: 290388,
      warranty: '3年质保 + 终身技术支持 + 优先维修',
      features: ['广播级画质', '多机位导播', '无线图传', '专业灯光', '乌鲁木齐市内上门安装调试'],
    },
  ],
};

// 服务价格
const services = [
  {
    icon: Truck,
    title: '配送服务',
    items: [
      { name: '标准配送', price: '免费', desc: '满500元，3-5个工作日' },
      { name: '加急配送', price: '¥50', desc: '1-2个工作日送达' },
      { name: '同城当日达', price: '¥100', desc: '乌鲁木齐市内当日送达' },
      { name: '大件物流', price: '¥200', desc: '大型设备专车配送' },
    ],
  },
  {
    icon: Wrench,
    title: '上门安装调试（乌鲁木齐市内）',
    items: [
      { name: '标准安装', price: '¥400', desc: '设备组装+调试+正常运行' },
      { name: '专业安装', price: '¥500', desc: '专业布光+音频调试+多平台配置' },
      { name: '远程指导', price: '免费', desc: '视频通话远程指导安装' },
    ],
  },
  {
    icon: Shield,
    title: '质保服务',
    items: [
      { name: '基础维护', price: '¥299/年', desc: '年度设备检查、清洁保养' },
      { name: '标准维护', price: '¥599/年', desc: '季度检查、软件更新、远程支持' },
      { name: '尊享维护', price: '¥1299/年', desc: '月度检查、优先维修、备用设备' },
    ],
  },
  {
    icon: GraduationCap,
    title: '培训服务',
    items: [
      { name: '在线培训', price: '免费', desc: '视频教程、直播课程' },
      { name: '上门培训', price: '¥499', desc: '2小时一对一培训' },
      { name: '进阶培训', price: '¥999', desc: '专业直播技巧、运营指导' },
      { name: '团队培训', price: '¥2999', desc: '团队培训、流程优化' },
    ],
  },
];

export default function LivestreamEquipmentPage() {
  const [activeType, setActiveType] = useState<EquipmentType>('personal');
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  const currentConfig = typeConfig[activeType];
  const currentPackages = packagesData[activeType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              📹 直播设备专区
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              从入门到专业，一站式直播解决方案
              <br />
              <span className="text-cyan-400">乌鲁木齐市内上门安装调试 ¥400-500</span>
            </p>
          </motion.div>

          {/* 类型选择 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {(Object.keys(typeConfig) as EquipmentType[]).map((type) => {
              const config = typeConfig[type];
              const Icon = config.icon;
              const isActive = activeType === type;

              return (
                <motion.button
                  key={type}
                  onClick={() => setActiveType(type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${config.color} border-transparent shadow-lg shadow-purple-500/20`
                      : `${config.bgColor} ${config.borderColor} hover:border-white/30`
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                  <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>
                    {config.title}
                  </div>
                  <div className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {config.subtitle}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 套餐列表 */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentConfig.bgColor} ${currentConfig.borderColor} border mb-4`}>
              <currentConfig.icon className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{currentConfig.title}</span>
            </div>
            <p className="text-gray-400">{currentConfig.description}</p>
            <p className="text-sm text-cyan-400 mt-1">适用人群：{currentConfig.targetUser}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {currentPackages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  layout
                  className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                >
                  {/* 套餐头部 */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${currentConfig.color} text-white`}>
                            {pkg.tag}
                          </span>
                          <span className="text-sm text-gray-400">{pkg.warranty}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 line-through">¥{pkg.originalTotal.toLocaleString()}</div>
                        <div className="text-2xl font-bold text-cyan-400">¥{pkg.packagePrice.toLocaleString()}</div>
                        <div className="text-xs text-green-400">省 ¥{pkg.savings.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* 特色标签 */}
                    <div className="flex flex-wrap gap-2">
                      {pkg.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 设备列表 */}
                  <div className="p-6">
                    <button
                      onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
                      className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors mb-4"
                    >
                      <span>包含 {pkg.items.length} 件设备</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${expandedPackage === pkg.id ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {expandedPackage === pkg.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 mb-4">
                            {pkg.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5">
                                <div>
                                  <div className="text-sm text-white">{item.name}</div>
                                  <div className="text-xs text-gray-500">{item.model}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-300">×{item.qty}</div>
                                  <div className="text-xs text-cyan-400">¥{item.price.toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 价格明细 */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">套餐价</span>
                        <span className="text-white">¥{pkg.packagePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">配送费</span>
                        <span className="text-white">{pkg.deliveryFee > 0 ? `¥${pkg.deliveryFee}` : '免费'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">上门安装调试</span>
                        <span className="text-white">{pkg.installationFee > 0 ? `¥${pkg.installationFee}` : '免费'}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                        <span className="text-white">总价</span>
                        <span className="text-orange-400">¥{pkg.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 mt-6">
                      <button className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                        立即购买
                      </button>
                      <button className="px-4 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 服务价格 */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">🔧 增值服务</h2>
          <p className="text-gray-400 text-center mb-12">专业服务，让您的直播更轻松</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{service.title}</h3>
                </div>
                <div className="space-y-3">
                  {service.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-white">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                      <div className="text-sm font-medium text-cyan-400">{item.price}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">📞 联系我们</h2>
          <p className="text-gray-400 mb-8">专业顾问为您提供一对一服务</p>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.a
              href="tel:+8618999999999"
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center gap-3 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all"
            >
              <Phone className="w-6 h-6 text-cyan-400" />
              <div className="text-left">
                <div className="text-sm text-gray-400">电话咨询</div>
                <div className="text-white font-medium">189-9999-9999</div>
              </div>
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center gap-3 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all"
            >
              <MessageCircle className="w-6 h-6 text-green-400" />
              <div className="text-left">
                <div className="text-sm text-gray-400">在线咨询</div>
                <div className="text-white font-medium">立即咨询</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center gap-3 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <Calendar className="w-6 h-6 text-purple-400" />
              <div className="text-left">
                <div className="text-sm text-gray-400">预约演示</div>
                <div className="text-white font-medium">上门演示</div>
              </div>
            </motion.button>
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
              <Zap className="w-5 h-5" />
              <span className="font-medium">乌鲁木齐市内服务</span>
            </div>
            <p className="text-gray-300">
              上门安装调试 <span className="text-white font-bold">¥400-500</span>，确保设备正常运行
            </p>
            <p className="text-sm text-gray-500 mt-2">
              包含：设备组装、线缆连接、软件配置、直播测试、使用培训
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
