'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPICard as KPICardType } from './types';

interface KPICardProps {
  card: KPICardType;
  onClick?: () => void;
  className?: string;
}

export function KPICard({ card, onClick, className = '' }: KPICardProps) {
  const getTrendIcon = () => {
    switch (card.trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-400" />;
      case 'stable':
        return <Minus size={16} className="text-gray-400" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (card.trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      case 'stable':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const cardColor = card.color || 'bg-gradient-to-br from-blue-900 to-blue-800';

  return (
    <div
      onClick={onClick}
      className={`${cardColor} rounded-lg p-6 text-white cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-300 text-sm font-medium">{card.title}</p>
        </div>
        {card.icon && (
          <div className="text-2xl opacity-20">{card.icon}</div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold">{card.value.toLocaleString()}</span>
        {card.unit && <span className="text-gray-300 text-sm">{card.unit}</span>}
      </div>

      {card.trend && card.trendPercentage !== undefined && (
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {card.trendPercentage > 0 ? '+' : ''}{card.trendPercentage}%
          </span>
          <span className="text-gray-400 text-xs">vs last period</span>
        </div>
      )}
    </div>
  );
}
