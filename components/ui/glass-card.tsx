/**
 * GlassCard Component
 * 玻璃态卡片组件
 * 
 * A reusable card component with glassmorphism effects.
 * Supports different intensity levels and interactive states.
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import React from 'react';
import { GlassIntensity } from '@/types/glass-effect';

export interface GlassCardProps {
  /** Card content - 卡片内容 */
  children: React.ReactNode;
  
  /** Glass effect intensity - 玻璃效果强度 */
  intensity?: GlassIntensity;
  
  /** Enable interactive hover effects - 启用交互悬停效果 */
  interactive?: boolean;
  
  /** Additional CSS classes - 额外的CSS类 */
  className?: string;
  
  /** Click handler for interactive cards - 交互式卡片的点击处理器 */
  onClick?: () => void;
}

/**
 * GlassCard component with glassmorphism effects
 * 
 * Features:
 * - Semi-transparent background with backdrop blur (Req 2.1, 2.2)
 * - Gradient border effect (Req 2.3)
 * - Layered shadows with inner and outer effects (Req 2.4)
 * - Interactive hover state with increased blur (Req 2.5)
 */
export function GlassCard({ 
  children, 
  intensity = 'medium',
  interactive = false,
  className = '',
  onClick
}: GlassCardProps) {
  // Base structural classes
  const baseClasses = 'rounded-xl overflow-hidden relative';
  
  // Glass effect classes based on intensity
  const glassClasses = `glass-${intensity}`;
  
  // Interactive classes for hover effects and mobile touch targets (Req 2.5, 6.4)
  const interactiveClasses = interactive 
    ? 'glass-interactive cursor-pointer min-h-[44px] md:min-h-0' 
    : '';
  
  // Combine all classes
  const combinedClasses = `${baseClasses} ${glassClasses} ${interactiveClasses} ${className}`.trim();
  
  return (
    <div 
      className={combinedClasses}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}
