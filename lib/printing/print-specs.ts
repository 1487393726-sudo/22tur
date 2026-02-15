/**
 * 印刷规格配置
 * Requirements: 5.1, 5.3, 5.4, 5.5
 */

import { ProductType, PrintSides } from './types';

// 尺寸选项
export interface SizeOption {
  value: string;
  label: string;
  width?: number;  // mm
  height?: number; // mm
}

// 材质选项
export interface MaterialOption {
  value: string;
  label: string;
  description?: string;
}

// 工艺选项
export interface FinishingOption {
  value: string;
  label: string;
  description?: string;
}

// 色彩模式选项
export interface ColorModeOption {
  value: string;
  label: string;
}

// 产品规格配置
export interface ProductSpec {
  sizes: SizeOption[];
  materials: MaterialOption[];
  finishings: FinishingOption[];
  colorModes: ColorModeOption[];
  sides: PrintSides[];
  allowCustomSize: boolean;
}

// 名片规格
const BUSINESS_CARD_SPEC: ProductSpec = {
  sizes: [
    { value: '90x54mm', label: '90×54mm (标准)', width: 90, height: 54 },
    { value: '90x50mm', label: '90×50mm', width: 90, height: 50 },
    { value: '85x55mm', label: '85×55mm (欧美)', width: 85, height: 55 },
    { value: 'custom', label: '自定义尺寸' },
  ],
  materials: [
    { value: '铜版纸300g', label: '铜版纸300g', description: '常用，光滑亮丽' },
    { value: '铜版纸350g', label: '铜版纸350g', description: '加厚，更有质感' },
    { value: '特种纸', label: '特种纸', description: '纹理丰富，高档感' },
    { value: '艺术纸', label: '艺术纸', description: '独特质感，艺术效果' },
    { value: 'PVC', label: 'PVC卡', description: '防水耐用，塑料质感' },
  ],
  finishings: [
    { value: '覆亮膜', label: '覆亮膜', description: '光亮效果，防水防污' },
    { value: '覆哑膜', label: '覆哑膜', description: '哑光效果，手感细腻' },
    { value: '烫金', label: '烫金', description: '金色烫印，高档大气' },
    { value: '烫银', label: '烫银', description: '银色烫印，时尚简约' },
    { value: '凹凸', label: '凹凸', description: '立体效果，触感明显' },
    { value: '圆角', label: '圆角', description: '圆角处理，安全美观' },
  ],
  colorModes: [
    { value: '单色', label: '单色' },
    { value: '双色', label: '双色' },
    { value: '四色', label: '四色(全彩)' },
  ],
  sides: ['single', 'double'],
  allowCustomSize: true,
};


// 海报规格
const POSTER_SPEC: ProductSpec = {
  sizes: [
    { value: 'A4', label: 'A4 (210×297mm)', width: 210, height: 297 },
    { value: 'A3', label: 'A3 (297×420mm)', width: 297, height: 420 },
    { value: 'A2', label: 'A2 (420×594mm)', width: 420, height: 594 },
    { value: 'A1', label: 'A1 (594×841mm)', width: 594, height: 841 },
    { value: 'A0', label: 'A0 (841×1189mm)', width: 841, height: 1189 },
    { value: 'custom', label: '自定义尺寸' },
  ],
  materials: [
    { value: '铜版纸157g', label: '铜版纸157g', description: '经济实惠' },
    { value: '铜版纸200g', label: '铜版纸200g', description: '厚实耐用' },
    { value: '相纸', label: '相纸', description: '高清晰度，色彩鲜艳' },
    { value: '背胶', label: '背胶', description: '可粘贴，方便张贴' },
  ],
  finishings: [
    { value: '覆亮膜', label: '覆亮膜', description: '光亮效果，防水防污' },
    { value: '覆哑膜', label: '覆哑膜', description: '哑光效果，减少反光' },
    { value: '裱板', label: '裱板', description: '硬质支撑，可立放' },
  ],
  colorModes: [
    { value: '四色', label: '四色(全彩)' },
  ],
  sides: ['single'],
  allowCustomSize: true,
};

// 画册/折页规格
const BROCHURE_SPEC: ProductSpec = {
  sizes: [
    { value: 'A4', label: 'A4 (210×297mm)', width: 210, height: 297 },
    { value: 'A5', label: 'A5 (148×210mm)', width: 148, height: 210 },
    { value: 'B5', label: 'B5 (176×250mm)', width: 176, height: 250 },
    { value: 'custom', label: '自定义尺寸' },
  ],
  materials: [
    { value: '铜版纸157g', label: '铜版纸157g', description: '内页常用' },
    { value: '铜版纸200g', label: '铜版纸200g', description: '封面常用' },
    { value: '哑粉纸', label: '哑粉纸', description: '哑光效果，阅读舒适' },
  ],
  finishings: [
    { value: '骑马钉', label: '骑马钉', description: '简单装订，适合薄册' },
    { value: '胶装', label: '胶装', description: '胶水粘合，适合厚册' },
    { value: '精装', label: '精装', description: '硬壳封面，高档大气' },
    { value: '覆膜', label: '覆膜', description: '封面覆膜，保护耐用' },
  ],
  colorModes: [
    { value: '四色', label: '四色(全彩)' },
  ],
  sides: ['double'],
  allowCustomSize: true,
};

// 包装规格
const PACKAGING_SPEC: ProductSpec = {
  sizes: [
    { value: 'custom', label: '自定义尺寸' },
  ],
  materials: [
    { value: '白卡纸', label: '白卡纸', description: '洁白挺括，印刷效果好' },
    { value: '牛皮纸', label: '牛皮纸', description: '环保自然，复古风格' },
    { value: '瓦楞纸', label: '瓦楞纸', description: '缓冲保护，适合运输' },
    { value: '灰板', label: '灰板', description: '硬质支撑，礼盒常用' },
  ],
  finishings: [
    { value: '覆膜', label: '覆膜', description: '防水防污' },
    { value: '烫金', label: '烫金', description: '金色烫印，高档大气' },
    { value: '压纹', label: '压纹', description: '纹理效果，触感丰富' },
    { value: '模切', label: '模切', description: '异形裁切，造型独特' },
  ],
  colorModes: [
    { value: '四色', label: '四色(全彩)' },
    { value: '专色', label: '专色' },
  ],
  sides: ['double'],
  allowCustomSize: true,
};

// 横幅/展架规格
const BANNER_SPEC: ProductSpec = {
  sizes: [
    { value: '80x180cm', label: '80×180cm (易拉宝)', width: 800, height: 1800 },
    { value: '80x200cm', label: '80×200cm (易拉宝)', width: 800, height: 2000 },
    { value: '120x200cm', label: '120×200cm (X展架)', width: 1200, height: 2000 },
    { value: 'custom', label: '自定义尺寸' },
  ],
  materials: [
    { value: 'PP背胶', label: 'PP背胶', description: '可粘贴，室内常用' },
    { value: '写真布', label: '写真布', description: '布质材料，可折叠' },
    { value: '喷绘布', label: '喷绘布', description: '户外耐用，防水防晒' },
    { value: 'KT板', label: 'KT板', description: '轻便硬质，可立放' },
  ],
  finishings: [
    { value: '覆膜', label: '覆膜', description: '保护画面，延长寿命' },
    { value: '打扣眼', label: '打扣眼', description: '方便悬挂' },
    { value: '配支架', label: '配支架', description: '配套展示支架' },
  ],
  colorModes: [
    { value: '四色', label: '四色(全彩)' },
  ],
  sides: ['single'],
  allowCustomSize: true,
};

// 贴纸/标签规格
const STICKER_SPEC: ProductSpec = {
  sizes: [
    { value: 'custom', label: '自定义尺寸' },
  ],
  materials: [
    { value: '铜版纸', label: '铜版纸', description: '经济实惠，室内使用' },
    { value: '透明PET', label: '透明PET', description: '透明效果，防水耐用' },
    { value: '白色PVC', label: '白色PVC', description: '防水防油，户外可用' },
    { value: '牛皮纸', label: '牛皮纸', description: '复古风格，环保自然' },
  ],
  finishings: [
    { value: '覆亮膜', label: '覆亮膜', description: '光亮效果' },
    { value: '覆哑膜', label: '覆哑膜', description: '哑光效果' },
    { value: '模切', label: '模切', description: '异形裁切' },
  ],
  colorModes: [
    { value: '四色', label: '四色(全彩)' },
  ],
  sides: ['single'],
  allowCustomSize: true,
};

// 其他产品规格（通用）
const OTHER_SPEC: ProductSpec = {
  sizes: [
    { value: 'custom', label: '自定义尺寸' },
  ],
  materials: [
    { value: '铜版纸', label: '铜版纸' },
    { value: '特种纸', label: '特种纸' },
    { value: '其他', label: '其他（请在备注说明）' },
  ],
  finishings: [
    { value: '覆膜', label: '覆膜' },
    { value: '烫金', label: '烫金' },
    { value: '其他', label: '其他（请在备注说明）' },
  ],
  colorModes: [
    { value: '四色', label: '四色(全彩)' },
    { value: '专色', label: '专色' },
  ],
  sides: ['single', 'double'],
  allowCustomSize: true,
};

// 产品规格映射
export const PRINT_SPECS: Record<ProductType, ProductSpec> = {
  business_card: BUSINESS_CARD_SPEC,
  poster: POSTER_SPEC,
  brochure: BROCHURE_SPEC,
  packaging: PACKAGING_SPEC,
  banner: BANNER_SPEC,
  sticker: STICKER_SPEC,
  other: OTHER_SPEC,
};

/**
 * 获取产品规格配置
 */
export function getProductSpec(productType: ProductType): ProductSpec {
  return PRINT_SPECS[productType] || OTHER_SPEC;
}

/**
 * 获取产品可用材质
 */
export function getAvailableMaterials(productType: ProductType): MaterialOption[] {
  return getProductSpec(productType).materials;
}

/**
 * 获取产品可用工艺
 */
export function getAvailableFinishings(productType: ProductType): FinishingOption[] {
  return getProductSpec(productType).finishings;
}

/**
 * 获取产品可用尺寸
 */
export function getAvailableSizes(productType: ProductType): SizeOption[] {
  return getProductSpec(productType).sizes;
}

/**
 * 获取产品可用色彩模式
 */
export function getAvailableColorModes(productType: ProductType): ColorModeOption[] {
  return getProductSpec(productType).colorModes;
}

/**
 * 检查材质是否对产品类型有效
 */
export function isValidMaterial(productType: ProductType, material: string): boolean {
  const spec = getProductSpec(productType);
  return spec.materials.some(m => m.value === material);
}

/**
 * 检查工艺是否对产品类型有效
 */
export function isValidFinishing(productType: ProductType, finishing: string): boolean {
  const spec = getProductSpec(productType);
  return spec.finishings.some(f => f.value === finishing);
}

/**
 * 检查多个工艺是否对产品类型有效
 */
export function areValidFinishings(productType: ProductType, finishings: string[]): boolean {
  return finishings.every(f => isValidFinishing(productType, f));
}
