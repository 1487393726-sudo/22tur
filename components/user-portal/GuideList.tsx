'use client';

import React from 'react';
import { Guide } from '@/lib/user-portal/help-types';

interface GuideListProps {
  guides: Guide[];
  onSelectGuide?: (guide: Guide) => void;
}

export function GuideList({ guides, onSelectGuide }: GuideListProps) {
  if (guides.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无使用指南</p>
      </div>
    );
  }

  const difficultyColor = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {guides.map((guide) => (
        <button
          key={guide.id}
          onClick={() => onSelectGuide?.(guide)}
          className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition text-left"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white flex-1">{guide.title}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${difficultyColor[guide.difficulty]}`}>
              {guide.difficulty === 'easy' ? '简单' : guide.difficulty === 'medium' ? '中等' : '困难'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{guide.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>⏱ {guide.estimatedTime} 分钟</span>
            <span>{guide.steps?.length || 0} 步骤</span>
          </div>
        </button>
      ))}
    </div>
  );
}
