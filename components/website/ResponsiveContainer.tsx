/**
 * ResponsiveContainer Component
 * A container that adapts to different viewport sizes
 */

import React from 'react';
import { getResponsivePadding, getResponsiveMaxWidth, type ViewportSize } from '@/lib/website/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  viewport?: ViewportSize;
  maxWidth?: boolean;
  centered?: boolean;
}

/**
 * ResponsiveContainer component
 * Provides responsive padding and max-width based on viewport
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  viewport = 'desktop',
  maxWidth = true,
  centered = true,
}) => {
  const paddingClass = getResponsivePadding(viewport);
  const maxWidthClass = maxWidth ? getResponsiveMaxWidth(viewport) : '';
  const centerClass = centered ? 'mx-auto' : '';

  return (
    <div
      className={`w-full ${paddingClass} ${maxWidthClass} ${centerClass} ${className}`}
      data-testid="responsive-container"
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
