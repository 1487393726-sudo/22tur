'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

export type StatusType =
  | 'pending'
  | 'active'
  | 'inactive'
  | 'completed'
  | 'failed'
  | 'processing'
  | 'suspended'
  | 'archived';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description?: string;
}

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onClick?: () => void;
  onTransition?: (newStatus: StatusType) => Promise<void>;
  allowedTransitions?: StatusType[];
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900',
    icon: <Clock size={16} />,
    description: 'Waiting for action',
  },
  active: {
    label: 'Active',
    color: 'text-green-400',
    bgColor: 'bg-green-900',
    icon: <CheckCircle size={16} />,
    description: 'Currently active',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-gray-400',
    bgColor: 'bg-gray-700',
    icon: <AlertCircle size={16} />,
    description: 'Not active',
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900',
    icon: <CheckCircle size={16} />,
    description: 'Task completed',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-400',
    bgColor: 'bg-red-900',
    icon: <XCircle size={16} />,
    description: 'Operation failed',
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900',
    icon: <Loader size={16} className="animate-spin" />,
    description: 'Currently processing',
  },
  suspended: {
    label: 'Suspended',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900',
    icon: <AlertCircle size={16} />,
    description: 'Temporarily suspended',
  },
  archived: {
    label: 'Archived',
    color: 'text-gray-500',
    bgColor: 'bg-gray-800',
    icon: <AlertCircle size={16} />,
    description: 'Archived item',
  },
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  onClick,
  onTransition,
  allowedTransitions = [],
  className = '',
}: StatusBadgeProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const config = STATUS_CONFIG[status];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const handleTransition = async (newStatus: StatusType) => {
    if (!onTransition) return;

    setIsTransitioning(true);
    try {
      await onTransition(newStatus);
      setShowMenu(false);
    } catch (error) {
      console.error('Status transition failed:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const hasTransitions = allowedTransitions.length > 0 && onTransition;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => {
          onClick?.();
          if (hasTransitions) {
            setShowMenu(!showMenu);
          }
        }}
        disabled={isTransitioning}
        className={`
          inline-flex items-center gap-2 rounded-full font-medium
          transition-all duration-200
          ${sizeClasses[size]}
          ${config.bgColor} ${config.color}
          ${hasTransitions ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
          ${isTransitioning ? 'opacity-50' : ''}
          border border-current border-opacity-30
        `}
      >
        {showIcon && config.icon}
        {label || config.label}
      </button>

      {/* Transition Menu */}
      {hasTransitions && showMenu && (
        <div className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded shadow-lg z-10 min-w-max">
          {allowedTransitions.map(transitionStatus => {
            const transitionConfig = STATUS_CONFIG[transitionStatus];
            return (
              <button
                key={transitionStatus}
                onClick={() => handleTransition(transitionStatus)}
                disabled={isTransitioning}
                className={`
                  w-full text-left px-4 py-2 flex items-center gap-2
                  hover:bg-gray-700 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  first:rounded-t last:rounded-b
                  ${transitionConfig.color}
                `}
              >
                {transitionConfig.icon}
                <div>
                  <div className="font-medium">{transitionConfig.label}</div>
                  {transitionConfig.description && (
                    <div className="text-xs opacity-70">{transitionConfig.description}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {config.description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-gray-300 text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          {config.description}
        </div>
      )}
    </div>
  );
}

// Status History Component
export interface StatusHistoryEntry {
  status: StatusType;
  timestamp: Date;
  changedBy?: string;
  reason?: string;
}

export interface StatusHistoryProps {
  history: StatusHistoryEntry[];
  className?: string;
}

export function StatusHistory({ history, className = '' }: StatusHistoryProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-300">Status History</h3>
      <div className="space-y-2">
        {history.map((entry, idx) => {
          const config = STATUS_CONFIG[entry.status];
          return (
            <div key={idx} className="flex items-start gap-3 p-2 bg-gray-800 rounded">
              <div className={`mt-1 ${config.color}`}>{config.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleString()}
                  </span>
                </div>
                {entry.changedBy && (
                  <div className="text-xs text-gray-400">by {entry.changedBy}</div>
                )}
                {entry.reason && (
                  <div className="text-xs text-gray-400 mt-1">{entry.reason}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
