/**
 * 编辑器组件导出
 * Editor Components Export
 */

// 产品编辑
export { ProductForm } from './ProductForm';
export { SpecificationsEditor, addSpecification, removeSpecification, updateSpecification } from './SpecificationsEditor';
export { CategorySelector, updateCategoryId, isValidCategory } from './CategorySelector';

// 媒体管理
export { MediaManager } from './MediaManager';
export { MediaSwitcher, MediaSlot, switchMediaMode } from './MediaSwitcher';
export { AssetUploader } from './AssetUploader';
export { ImageEditor, ImageEditorControls, validateCropRatio, verifyRotationRoundTrip } from './ImageEditor';

// 字体编辑
export { FontEditor, applyStyleProperty, toggleFormatting, createDefaultStyle } from './FontEditor';

// 模板编辑
export { TemplateEditor, TemplatePreview, substituteTemplatePlaceholders, undoOperation, redoOperation } from './TemplateEditor';

// 套餐编辑
export { BundleForm, addBundleItem, removeBundleItem, calculateBundleOriginalPrice, calculateSavings, validateBundlePrice } from './BundleForm';

// 产品预览
export { ProductPreview, ProductPreviewContainer, verifyPreviewContainsProductData, getViewportWidth, verifyViewportSize } from './ProductPreview';

// 导航保护
export { NavigationGuard, UnsavedChangesDialog, DraftRestoreDialog, useNavigationGuard, shouldTriggerDialog, isDraftRestorable } from './NavigationGuard';
