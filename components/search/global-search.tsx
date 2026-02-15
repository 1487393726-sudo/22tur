'use client';

/**
 * Global Search Component
 * 全局搜索组件
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, FileText, User, Briefcase, Package, BookOpen, Layout } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// 搜索结果类型
interface SearchHit {
  document: {
    id: string;
    type: string;
    title: string;
    content: string;
    description?: string;
    author?: string;
    category?: string;
    status?: string;
    createdAt: string;
  };
  score: number;
  highlights?: Record<string, string[]>;
}

// 搜索建议类型
interface SearchSuggestion {
  text: string;
  score: number;
  highlighted?: string;
}

// 搜索结果响应
interface SearchResponse {
  success: boolean;
  data: {
    hits: SearchHit[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    took: number;
    suggestions?: string[];
  };
}

// 文档类型图标映射
const typeIcons: Record<string, React.ReactNode> = {
  project: <Briefcase className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  investment: <Package className="h-4 w-4" />,
  product: <Package className="h-4 w-4" />,
  article: <BookOpen className="h-4 w-4" />,
  page: <Layout className="h-4 w-4" />,
};

// 文档类型标签映射
const typeLabels: Record<string, string> = {
  project: '项目',
  document: '文档',
  user: '用户',
  investment: '投资',
  product: '产品',
  article: '文章',
  page: '页面',
};

// 文档类型颜色映射
const typeColors: Record<string, string> = {
  project: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  document: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  user: 'bg-purple-100 text-white800 dark:bg-purple-900 dark:text-white300',
  investment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  product: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  article: 'bg-pink-100 text-white dark:bg-pink-900 dark:text-white',
  page: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onResultClick?: (hit: SearchHit) => void;
}

export function GlobalSearch({
  placeholder = '搜索...',
  className,
  onResultClick,
}: GlobalSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [took, setTook] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 搜索函数
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&pageSize=10&highlight=true`
      );
      const data: SearchResponse = await response.json();

      if (data.success) {
        setResults(data.data.hits);
        setTotal(data.data.total);
        setTook(data.data.took);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取搜索建议
  const fetchSuggestions = useCallback(async (prefix: string) => {
    if (!prefix.trim() || prefix.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/search/suggest?q=${encodeURIComponent(prefix)}&size=5`
      );
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data.suggestions);
      }
    } catch (error) {
      console.error('获取建议失败:', error);
    }
  }, []);

  // 防抖搜索
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch, fetchSuggestions]);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // 点击结果
  const handleResultClick = (hit: SearchHit) => {
    if (onResultClick) {
      onResultClick(hit);
    } else {
      // 默认导航逻辑
      const { type, id } = hit.document;
      let path = '/';
      switch (type) {
        case 'project':
          path = `/admin/projects/${id}`;
          break;
        case 'document':
          path = `/admin/documents/${id}`;
          break;
        case 'user':
          path = `/admin/users/${id}`;
          break;
        case 'investment':
          path = `/admin/investments/${id}`;
          break;
        case 'product':
          path = `/admin/products/${id}`;
          break;
        case 'article':
          path = `/articles/${id}`;
          break;
        case 'page':
          path = `/${id}`;
          break;
      }
      router.push(path);
    }
    setOpen(false);
    setQuery('');
  };

  // 渲染高亮文本
  const renderHighlight = (text: string) => {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: text.replace(/<mark>/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">'),
        }}
      />
    );
  };

  // 快捷键打开搜索
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <>
      {/* 搜索触发按钮 */}
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64',
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">{placeholder}</span>
        <span className="inline-flex lg:hidden">搜索</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* 搜索对话框 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>全局搜索</DialogTitle>
          </DialogHeader>
          
          {/* 搜索输入 */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索项目、文档、用户..."
              className="flex h-12 w-full rounded-none border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {query && !loading && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 搜索结果 */}
          <ScrollArea className="max-h-[400px]">
            {/* 搜索建议 */}
            {suggestions.length > 0 && !results.length && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  搜索建议
                </p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => setQuery(suggestion.text)}
                  >
                    <Search className="mr-2 h-4 w-4 opacity-50" />
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {/* 搜索结果列表 */}
            {results.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  找到 {total} 个结果 ({took}ms)
                </p>
                {results.map((hit, index) => (
                  <button
                    key={hit.document.id}
                    className={cn(
                      'flex w-full flex-col items-start gap-1 rounded-sm px-2 py-2 text-left hover:bg-accent',
                      selectedIndex === index && 'bg-accent'
                    )}
                    onClick={() => handleResultClick(hit)}
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="text-muted-foreground">
                        {typeIcons[hit.document.type] || <FileText className="h-4 w-4" />}
                      </span>
                      <span className="flex-1 truncate font-medium">
                        {hit.highlights?.title
                          ? renderHighlight(hit.highlights.title[0])
                          : hit.document.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', typeColors[hit.document.type])}
                      >
                        {typeLabels[hit.document.type] || hit.document.type}
                      </Badge>
                    </div>
                    {(hit.highlights?.content || hit.highlights?.description || hit.document.description) && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {hit.highlights?.content
                          ? renderHighlight(hit.highlights.content[0])
                          : hit.highlights?.description
                          ? renderHighlight(hit.highlights.description[0])
                          : hit.document.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 无结果 */}
            {query && !loading && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  没有找到与 "{query}" 相关的结果
                </p>
              </div>
            )}

            {/* 空状态 */}
            {!query && (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  输入关键词开始搜索
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  支持搜索项目、文档、用户、投资、产品等
                </p>
              </div>
            )}
          </ScrollArea>

          {/* 底部提示 */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="rounded border bg-muted px-1.5 py-0.5">↑↓</kbd>
              <span>导航</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">Enter</kbd>
              <span>选择</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">Esc</kbd>
              <span>关闭</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalSearch;
