'use client';

import React, { useState } from 'react';
import { SearchResult, HelpSearchFilter } from '@/lib/user-portal/help-types';

interface HelpSearchProps {
  results: SearchResult[];
  onSearch?: (query: string, filters: HelpSearchFilter) => void;
  onSelectResult?: (result: SearchResult) => void;
  isLoading?: boolean;
}

export function HelpSearch({ results, onSearch, onSelectResult, isLoading }: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<HelpSearchFilter>({});

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  const typeLabel = {
    faq: '常见问题',
    guide: '使用指南',
    contact: '联系方式',
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索帮助内容..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-gray-300"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition"
        >
          {isLoading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: (e.target.value as any) || undefined })}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-gray-300 text-sm"
        >
          <option value="">全部类型</option>
          <option value="faq">常见问题</option>
          <option value="guide">使用指南</option>
          <option value="contact">联系方式</option>
        </select>

        <select
          value={filters.difficulty || ''}
          onChange={(e) => setFilters({ ...filters, difficulty: (e.target.value as any) || undefined })}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-gray-300 text-sm"
        >
          <option value="">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>

        <select
          value={filters.sortBy || 'relevance'}
          onChange={(e) => setFilters({ ...filters, sortBy: (e.target.value as any) })}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-gray-300 text-sm"
        >
          <option value="relevance">相关性</option>
          <option value="views">浏览量</option>
          <option value="newest">最新</option>
        </select>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {query ? '未找到相关内容' : '输入关键词开始搜索'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onSelectResult?.(result)}
              className="w-full bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-lg transition text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white flex-1">{result.title}</h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 whitespace-nowrap ml-2">
                  {typeLabel[result.type]}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{result.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-teal-600 h-1.5 rounded-full"
                    style={{ width: `${result.relevance * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {Math.round(result.relevance * 100)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
