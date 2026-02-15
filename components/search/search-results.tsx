'use client';

/**
 * Search Results Component
 * 搜索结果展示组件
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  FileText,
  User,
  Briefcase,
  Package,
  BookOpen,
  Layout,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
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

// 文档类型配置
const documentTypes = [
  { value: 'project', label: '项目', icon: Briefcase },
  { value: 'document', label: '文档', icon: FileText },
  { value: 'user', label: '用户', icon: User },
  { value: 'investment', label: '投资', icon: Package },
  { value: 'product', label: '产品', icon: Package },
  { value: 'article', label: '文章', icon: BookOpen },
  { value: 'page', label: '页面', icon: Layout },
];

// 排序选项
const sortOptions = [
  { value: 'relevance', label: '相关性' },
  { value: 'createdAt:desc', label: '最新创建' },
  { value: 'createdAt:asc', label: '最早创建' },
  { value: 'title:asc', label: '标题 A-Z' },
  { value: 'title:desc', label: '标题 Z-A' },
];

interface SearchResultsProps {
  initialQuery?: string;
  className?: string;
}

export function SearchResults({ initialQuery = '', className }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [took, setTook] = useState(0);
  
  // 过滤器状态
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');

  // 执行搜索
  const performSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        pageSize: pageSize.toString(),
        highlight: 'true',
      });

      if (selectedTypes.length > 0) {
        params.set('type', selectedTypes.join(','));
      }

      if (sortBy !== 'relevance') {
        const [field, order] = sortBy.split(':');
        params.set('sort', field);
        params.set('order', order);
      }

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.hits);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
        setTook(data.data.took);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 监听搜索参数变化
  useEffect(() => {
    performSearch();
  }, [query, page, selectedTypes, sortBy]);

  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    performSearch();
  };

  // 切换类型过滤
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  // 渲染高亮文本
  const renderHighlight = (text: string) => {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: text.replace(
            /<mark>/g,
            '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">'
          ),
        }}
      />
    );
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    const config = documentTypes.find((t) => t.value === type);
    if (config) {
      const Icon = config.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const config = documentTypes.find((t) => t.value === type);
    return config?.label || type;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索..."
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '搜索'}
        </Button>
      </form>

      {/* 过滤器和排序 */}
      <div className="flex flex-wrap items-center gap-4">
        {/* 类型过滤 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              类型
              {selectedTypes.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTypes.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {documentTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type.value}
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => toggleType(type.value)}
              >
                <type.icon className="mr-2 h-4 w-4" />
                {type.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 排序 */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 结果统计 */}
        {total > 0 && (
          <span className="text-sm text-muted-foreground">
            找到 {total} 个结果 ({took}ms)
          </span>
        )}
      </div>

      {/* 搜索结果 */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((hit) => (
            <Card
              key={hit.document.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => {
                // 导航到详情页
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
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-muted-foreground">
                    {getTypeIcon(hit.document.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {hit.highlights?.title
                          ? renderHighlight(hit.highlights.title[0])
                          : hit.document.title}
                      </h3>
                      <Badge variant="outline" className="shrink-0">
                        {getTypeLabel(hit.document.type)}
                      </Badge>
                    </div>
                    {(hit.highlights?.content ||
                      hit.highlights?.description ||
                      hit.document.description) && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {hit.highlights?.content
                          ? renderHighlight(hit.highlights.content[0])
                          : hit.highlights?.description
                          ? renderHighlight(hit.highlights.description[0])
                          : hit.document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {hit.document.author && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {hit.document.author}
                        </span>
                      )}
                      {hit.document.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(hit.document.createdAt)}
                        </span>
                      )}
                      <span className="text-muted-foreground/50">
                        相关度: {(hit.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">没有找到结果</h3>
            <p className="text-sm text-muted-foreground">
              没有找到与 "{query}" 相关的内容，请尝试其他关键词
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">开始搜索</h3>
            <p className="text-sm text-muted-foreground">
              输入关键词搜索项目、文档、用户等内容
            </p>
          </CardContent>
        </Card>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
