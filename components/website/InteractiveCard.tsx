'use client';

import React, { useState } from 'react';

interface InteractiveCardProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function InteractiveCard({ href, children, className = '' }: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      className={`group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 ${className}`}
      style={{ 
        border: `1px solid ${isHovered ? 'var(--color-primary-200)' : 'var(--color-border-light)'}` 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  );
}
