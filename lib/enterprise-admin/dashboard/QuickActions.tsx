'use client';

import React, { useState } from 'react';
import { QuickAction } from './types';
import { Loader } from 'lucide-react';

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className = '' }: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: QuickAction) => {
    if (action.disabled) return;

    try {
      setLoading(action.id);
      setError(null);
      await action.action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-white font-semibold mb-4">Quick Actions</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {actions.map(action => {
          const isLoading = loading === action.id;
          const bgColor = action.color || 'bg-blue-900 hover:bg-blue-800';

          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={action.disabled || isLoading}
              className={`
                py-3 px-4 rounded-lg font-medium text-sm transition-all
                flex items-center justify-center gap-2
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isLoading ? 'opacity-75' : ''}
                ${bgColor}
                text-white
              `}
            >
              {isLoading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <span>{action.icon}</span>
              )}
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
