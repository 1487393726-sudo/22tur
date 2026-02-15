'use client';

import React, { useState } from 'react';

interface InteractiveButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  size?: 'default' | 'small';
}

export function InteractiveButton({ 
  href, 
  children, 
  variant = 'primary',
  size = 'default',
  className = '' 
}: InteractiveButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStyles = () => {
    const sizeClass = size === 'small' ? 'px-6 py-3' : 'px-8 py-4';
    const baseStyles = `inline-flex items-center gap-2 ${sizeClass} rounded-lg font-semibold transition-colors`;
    
    switch (variant) {
      case 'primary':
        return {
          className: `${baseStyles} text-white ${className}`,
          style: {
            backgroundColor: isHovered ? 'var(--color-primary-600)' : 'var(--color-primary-500)',
          }
        };
      case 'secondary':
        return {
          className: `${baseStyles} text-white ${className}`,
          style: {
            backgroundColor: isHovered ? 'var(--color-secondary-600)' : 'var(--color-secondary-500)',
          }
        };
      case 'outline':
        return {
          className: `${baseStyles} bg-transparent ${className}`,
          style: {
            border: '2px solid var(--color-primary-500)',
            color: 'var(--color-primary-500)',
            backgroundColor: isHovered ? 'var(--color-primary-50)' : 'transparent',
          }
        };
      default:
        return { className: baseStyles, style: {} };
    }
  };

  const { className: finalClassName, style } = getStyles();

  return (
    <a
      href={href}
      className={finalClassName}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  );
}
