'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchResult {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  // 高亮信息
  highlightedContent?: string;
}

interface MessageSearchProps {
  onSelectResult?: (result: SearchResult) => void;
  onClose?: () => void;
}

export function MessageSearch({ onSelectResult, onClose }: MessageSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 防抖搜索
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('搜索失败');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${weekdays[date.getDay()]} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-500/30 text-white">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setError(null);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="搜索消息内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                aria-label="清空搜索"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
              <span className="ml-2 text-white/60">搜索中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onSelectResult?.(result)}
                  className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={result.senderAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {getInitials(result.senderName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white text-sm">
                          {result.senderName}
                        </h4>
                        <span className="text-xs text-white/40 ml-2 flex-shrink-0">
                          {formatTime(result.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 line-clamp-2">
                        {highlightText(result.content, searchTerm)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">未找到匹配的消息</p>
              <p className="text-white/30 text-xs mt-1">尝试使用不同的关键词</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">输入关键词搜索消息</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
