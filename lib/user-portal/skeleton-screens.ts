/**
 * Skeleton Screen Utilities for User Portal
 * Provides skeleton screen components and utilities for loading states
 */

export type SkeletonType = 'text' | 'circle' | 'rectangle' | 'card' | 'list' | 'table';

export interface SkeletonConfig {
  type: SkeletonType;
  width?: string | number;
  height?: string | number;
  count?: number;
  animated?: boolean;
  className?: string;
}

export interface SkeletonCardConfig {
  hasImage?: boolean;
  hasTitle?: boolean;
  hasDescription?: boolean;
  hasFooter?: boolean;
  animated?: boolean;
}

export interface SkeletonListConfig {
  itemCount?: number;
  hasAvatar?: boolean;
  hasDescription?: boolean;
  animated?: boolean;
}

export interface SkeletonTableConfig {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  animated?: boolean;
}

/**
 * Generate skeleton HTML for text
 */
export function generateTextSkeleton(
  width: string | number = '100%',
  height: string | number = '16px',
  animated: boolean = true
): string {
  const w = typeof width === 'number' ? `${width}px` : width;
  const h = typeof height === 'number' ? `${height}px` : height;
  const animationClass = animated ? 'animate-pulse' : '';

  return `
    <div class="skeleton-text ${animationClass}" style="width: ${w}; height: ${h}; background-color: #e5e7eb; border-radius: 4px;"></div>
  `;
}

/**
 * Generate skeleton HTML for circle
 */
export function generateCircleSkeleton(
  size: string | number = '40px',
  animated: boolean = true
): string {
  const s = typeof size === 'number' ? `${size}px` : size;
  const animationClass = animated ? 'animate-pulse' : '';

  return `
    <div class="skeleton-circle ${animationClass}" style="width: ${s}; height: ${s}; background-color: #e5e7eb; border-radius: 50%;"></div>
  `;
}

/**
 * Generate skeleton HTML for rectangle
 */
export function generateRectangleSkeleton(
  width: string | number = '100%',
  height: string | number = '200px',
  animated: boolean = true
): string {
  const w = typeof width === 'number' ? `${width}px` : width;
  const h = typeof height === 'number' ? `${height}px` : height;
  const animationClass = animated ? 'animate-pulse' : '';

  return `
    <div class="skeleton-rectangle ${animationClass}" style="width: ${w}; height: ${h}; background-color: #e5e7eb; border-radius: 8px;"></div>
  `;
}

/**
 * Generate skeleton HTML for card
 */
export function generateCardSkeleton(config: SkeletonCardConfig = {}): string {
  const {
    hasImage = true,
    hasTitle = true,
    hasDescription = true,
    hasFooter = true,
    animated = true,
  } = config;

  const animationClass = animated ? 'animate-pulse' : '';

  let html = `<div class="skeleton-card ${animationClass}" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">`;

  if (hasImage) {
    html += `
      <div style="width: 100%; height: 200px; background-color: #e5e7eb; border-radius: 8px; margin-bottom: 16px;"></div>
    `;
  }

  if (hasTitle) {
    html += `
      <div style="width: 80%; height: 20px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 12px;"></div>
    `;
  }

  if (hasDescription) {
    html += `
      <div style="width: 100%; height: 16px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 8px;"></div>
      <div style="width: 90%; height: 16px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 12px;"></div>
    `;
  }

  if (hasFooter) {
    html += `
      <div style="display: flex; gap: 8px;">
        <div style="flex: 1; height: 36px; background-color: #e5e7eb; border-radius: 4px;"></div>
        <div style="flex: 1; height: 36px; background-color: #e5e7eb; border-radius: 4px;"></div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

/**
 * Generate skeleton HTML for list
 */
export function generateListSkeleton(config: SkeletonListConfig = {}): string {
  const { itemCount = 3, hasAvatar = true, hasDescription = true, animated = true } = config;

  const animationClass = animated ? 'animate-pulse' : '';
  let html = `<div class="skeleton-list ${animationClass}">`;

  for (let i = 0; i < itemCount; i++) {
    html += `
      <div style="display: flex; gap: 12px; margin-bottom: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
    `;

    if (hasAvatar) {
      html += `
        <div style="width: 40px; height: 40px; background-color: #e5e7eb; border-radius: 50%; flex-shrink: 0;"></div>
      `;
    }

    html += `
      <div style="flex: 1;">
        <div style="width: 60%; height: 16px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 8px;"></div>
    `;

    if (hasDescription) {
      html += `
        <div style="width: 100%; height: 14px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 4px;"></div>
        <div style="width: 80%; height: 14px; background-color: #e5e7eb; border-radius: 4px;"></div>
      `;
    }

    html += `
      </div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

/**
 * Generate skeleton HTML for table
 */
export function generateTableSkeleton(config: SkeletonTableConfig = {}): string {
  const { rows = 5, columns = 4, hasHeader = true, animated = true } = config;

  const animationClass = animated ? 'animate-pulse' : '';
  let html = `<div class="skeleton-table ${animationClass}" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">`;

  if (hasHeader) {
    html += `<div style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 0; border-bottom: 1px solid #e5e7eb;">`;
    for (let i = 0; i < columns; i++) {
      html += `
        <div style="padding: 12px; height: 40px; background-color: #f3f4f6; display: flex; align-items: center;">
          <div style="width: 60%; height: 16px; background-color: #e5e7eb; border-radius: 4px;"></div>
        </div>
      `;
    }
    html += '</div>';
  }

  for (let i = 0; i < rows; i++) {
    html += `<div style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 0; border-bottom: 1px solid #e5e7eb;">`;
    for (let j = 0; j < columns; j++) {
      html += `
        <div style="padding: 12px; height: 40px; display: flex; align-items: center;">
          <div style="width: 70%; height: 16px; background-color: #e5e7eb; border-radius: 4px;"></div>
        </div>
      `;
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Generate skeleton HTML based on type
 */
export function generateSkeleton(config: SkeletonConfig): string {
  const { type, width = '100%', height = '16px', count = 1, animated = true } = config;

  let html = '';

  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'text':
        html += generateTextSkeleton(width, height, animated);
        break;
      case 'circle':
        html += generateCircleSkeleton(width, animated);
        break;
      case 'rectangle':
        html += generateRectangleSkeleton(width, height, animated);
        break;
      case 'card':
        html += generateCardSkeleton({ animated });
        break;
      case 'list':
        html += generateListSkeleton({ itemCount: count, animated });
        break;
      case 'table':
        html += generateTableSkeleton({ animated });
        break;
      default:
        html += generateTextSkeleton(width, height, animated);
    }
  }

  return html;
}

/**
 * Create skeleton element
 */
export function createSkeletonElement(config: SkeletonConfig): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = generateSkeleton(config);
  return container.firstElementChild as HTMLElement;
}

/**
 * Show skeleton loading state
 */
export function showSkeletonLoading(
  targetSelector: string,
  config: SkeletonConfig
): void {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const skeleton = createSkeletonElement(config);
  target.innerHTML = '';
  target.appendChild(skeleton);
}

/**
 * Hide skeleton loading state
 */
export function hideSkeletonLoading(targetSelector: string): void {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const skeleton = target.querySelector('[class*="skeleton"]');
  if (skeleton) {
    skeleton.remove();
  }
}

/**
 * Replace skeleton with content
 */
export function replaceSkeletonWithContent(
  targetSelector: string,
  content: HTMLElement | string
): void {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const skeleton = target.querySelector('[class*="skeleton"]');
  if (skeleton) {
    skeleton.remove();
  }

  if (typeof content === 'string') {
    target.innerHTML = content;
  } else {
    target.appendChild(content);
  }
}

/**
 * Skeleton screen CSS animations
 */
export const SKELETON_STYLES = `
  @keyframes skeleton-loading {
    0% {
      background-color: #e5e7eb;
    }
    50% {
      background-color: #f3f4f6;
    }
    100% {
      background-color: #e5e7eb;
    }
  }

  .animate-pulse {
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }

  .skeleton-text,
  .skeleton-circle,
  .skeleton-rectangle {
    display: inline-block;
  }

  .skeleton-card {
    display: block;
  }

  .skeleton-list {
    display: block;
  }

  .skeleton-table {
    display: block;
  }
`;

/**
 * Skeleton screen configuration presets
 */
export const SKELETON_PRESETS = {
  DASHBOARD_CARD: {
    type: 'card' as const,
    hasImage: false,
    hasTitle: true,
    hasDescription: true,
    hasFooter: false,
    animated: true,
  },
  ORDER_LIST: {
    type: 'list' as const,
    itemCount: 3,
    hasAvatar: true,
    hasDescription: true,
    animated: true,
  },
  PRODUCT_CARD: {
    type: 'card' as const,
    hasImage: true,
    hasTitle: true,
    hasDescription: false,
    hasFooter: true,
    animated: true,
  },
  PROFILE_FORM: {
    type: 'list' as const,
    itemCount: 4,
    hasAvatar: false,
    hasDescription: false,
    animated: true,
  },
  DATA_TABLE: {
    type: 'table' as const,
    rows: 5,
    columns: 4,
    hasHeader: true,
    animated: true,
  },
};
