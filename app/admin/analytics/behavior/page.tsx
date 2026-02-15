'use client';

/**
 * Behavior Analytics Dashboard
 * 用户行为分析仪表板
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  MousePointer,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// 类型定义
interface EventStats {
  eventType: string;
  eventName?: string;
  count: number;
  uniqueUsers: number;
  avgPerUser: number;
}

interface PageStats {
  pagePath: string;
  pageTitle?: string;
  pageViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  bounceRate: number;
  exitRate: number;
}

interface FunnelResult {
  funnelId: string;
  funnelName: string;
  steps: Array<{
    stepIndex: number;
    stepName: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
  overallConversionRate: number;
  totalUsers: number;
}

interface RetentionCohort {
  cohortDate: string;
  cohortSize: number;
  retention: number[];
}

interface SegmentResult {
  segmentId: string;
  segmentName: string;
  userCount: number;
  percentage: number;
}

export default function BehaviorAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // 数据状态
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [funnelResults, setFunnelResults] = useState<FunnelResult[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionCohort[]>([]);
  const [segments, setSegments] = useState<SegmentResult[]>([]);

  // 获取日期范围
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    switch (dateRange) {
      case '1d':
        start.setDate(start.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
    }
    return { start, end };
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    const { start, end } = getDateRange();
    const params = `startDate=${start.toISOString()}&endDate=${end.toISOString()}`;

    try {
      // 并行加载所有数据
      const [eventRes, pageRes, funnelRes, retentionRes, segmentRes] = await Promise.all([
        fetch(`/api/analytics/behavior?action=eventStats&${params}`),
        fetch(`/api/analytics/behavior?action=pageStats&${params}`),
        fetch(`/api/analytics/funnel?action=list`),
        fetch(`/api/analytics/retention?action=analyze&type=daily&${params}`),
        fetch(`/api/analytics/segments?action=list`),
      ]);

      const [eventData, pageData, funnelData, retentionDataRes, segmentData] = await Promise.all([
        eventRes.json(),
        pageRes.json(),
        funnelRes.json(),
        retentionRes.json(),
        segmentRes.json(),
      ]);

      if (eventData.success) setEventStats(eventData.data.stats || []);
      if (pageData.success) setPageStats(pageData.data.stats || []);
      if (funnelData.success) setFunnelResults(funnelData.data.funnels || []);
      if (retentionDataRes.success) setRetentionData(retentionDataRes.data.result?.cohorts || []);
      if (segmentData.success) {
        // 评估每个分群
        const segmentResults: SegmentResult[] = [];
        for (const seg of segmentData.data.segments || []) {
          segmentResults.push({
            segmentId: seg.id,
            segmentName: seg.name,
            userCount: 0,
            percentage: 0,
          });
        }
        setSegments(segmentResults);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  // 计算总计
  const totalEvents = eventStats.reduce((sum, s) => sum + s.count, 0);
  const totalPageViews = pageStats.reduce((sum, s) => sum + s.pageViews, 0);
  const totalUniqueUsers = eventStats.reduce((sum, s) => sum + s.uniqueUsers, 0);

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // 格式化百分比
  const formatPercent = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  // 格式化时长
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
    return `${(seconds / 3600).toFixed(1)}小时`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用户行为分析</h1>
          <p className="text-muted-foreground">追踪和分析用户行为数据</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">过去 24 小时</SelectItem>
              <SelectItem value="7d">过去 7 天</SelectItem>
              <SelectItem value="30d">过去 30 天</SelectItem>
              <SelectItem value="90d">过去 90 天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总事件数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(totalEvents)}</div>
                <p className="text-xs text-muted-foreground">
                  {eventStats.length} 种事件类型
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">页面浏览</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(totalPageViews)}</div>
                <p className="text-xs text-muted-foreground">
                  {pageStats.length} 个页面
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">独立用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(totalUniqueUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  活跃用户
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户分群</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{segments.length}</div>
                <p className="text-xs text-muted-foreground">
                  已定义分群
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 详细分析标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="events">事件分析</TabsTrigger>
          <TabsTrigger value="pages">页面分析</TabsTrigger>
          <TabsTrigger value="funnel">漏斗分析</TabsTrigger>
          <TabsTrigger value="retention">留存分析</TabsTrigger>
          <TabsTrigger value="segments">用户分群</TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 热门事件 */}
            <Card>
              <CardHeader>
                <CardTitle>热门事件</CardTitle>
                <CardDescription>按触发次数排序</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventStats.slice(0, 5).map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{stat.eventType}</Badge>
                          {stat.eventName && (
                            <span className="text-sm text-muted-foreground">
                              {stat.eventName}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{formatNumber(stat.count)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 热门页面 */}
            <Card>
              <CardHeader>
                <CardTitle>热门页面</CardTitle>
                <CardDescription>按浏览量排序</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pageStats.slice(0, 5).map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="truncate max-w-[200px]">
                          <span className="text-sm">{stat.pagePath}</span>
                        </div>
                        <span className="font-medium">{formatNumber(stat.pageViews)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 事件分析 */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>事件统计</CardTitle>
              <CardDescription>所有追踪事件的详细统计</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>事件类型</TableHead>
                    <TableHead>事件名称</TableHead>
                    <TableHead className="text-right">触发次数</TableHead>
                    <TableHead className="text-right">独立用户</TableHead>
                    <TableHead className="text-right">人均次数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      </TableRow>
                    ))
                  ) : eventStats.length > 0 ? (
                    eventStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{stat.eventType}</Badge>
                        </TableCell>
                        <TableCell>{stat.eventName || '-'}</TableCell>
                        <TableCell className="text-right">{formatNumber(stat.count)}</TableCell>
                        <TableCell className="text-right">{formatNumber(stat.uniqueUsers)}</TableCell>
                        <TableCell className="text-right">{stat.avgPerUser.toFixed(1)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 页面分析 */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>页面统计</CardTitle>
              <CardDescription>所有页面的访问统计</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>页面路径</TableHead>
                    <TableHead className="text-right">浏览量</TableHead>
                    <TableHead className="text-right">访客数</TableHead>
                    <TableHead className="text-right">平均时长</TableHead>
                    <TableHead className="text-right">跳出率</TableHead>
                    <TableHead className="text-right">退出率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      </TableRow>
                    ))
                  ) : pageStats.length > 0 ? (
                    pageStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="max-w-[200px] truncate">
                          {stat.pagePath}
                        </TableCell>
                        <TableCell className="text-right">{formatNumber(stat.pageViews)}</TableCell>
                        <TableCell className="text-right">{formatNumber(stat.uniqueVisitors)}</TableCell>
                        <TableCell className="text-right">{formatDuration(stat.avgDuration)}</TableCell>
                        <TableCell className="text-right">{formatPercent(stat.bounceRate)}</TableCell>
                        <TableCell className="text-right">{formatPercent(stat.exitRate)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 漏斗分析 */}
        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>漏斗分析</CardTitle>
              <CardDescription>用户转化漏斗</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : funnelResults.length > 0 ? (
                <div className="space-y-6">
                  {funnelResults.map((funnel) => (
                    <div key={funnel.funnelId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{funnel.funnelName}</h3>
                        <Badge>
                          整体转化率: {formatPercent(funnel.overallConversionRate)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {funnel.steps?.map((step, index) => (
                          <React.Fragment key={index}>
                            <div className="flex-1 text-center p-2 bg-muted rounded">
                              <div className="text-sm font-medium">{step.stepName}</div>
                              <div className="text-lg font-bold">{step.users}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatPercent(step.conversionRate)}
                              </div>
                            </div>
                            {index < funnel.steps.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>暂无漏斗数据</p>
                  <p className="text-sm">请先创建漏斗定义</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 留存分析 */}
        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>留存分析</CardTitle>
              <CardDescription>用户留存队列分析</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : retentionData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>队列日期</TableHead>
                        <TableHead>用户数</TableHead>
                        {[...Array(7)].map((_, i) => (
                          <TableHead key={i} className="text-center">
                            第{i}天
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retentionData.slice(0, 10).map((cohort, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(cohort.cohortDate).toLocaleDateString('zh-CN')}
                          </TableCell>
                          <TableCell>{cohort.cohortSize}</TableCell>
                          {cohort.retention.slice(0, 7).map((rate, i) => (
                            <TableCell
                              key={i}
                              className="text-center"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${rate * 0.5})`,
                              }}
                            >
                              {formatPercent(rate)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>暂无留存数据</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户分群 */}
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>用户分群</CardTitle>
              <CardDescription>基于行为的用户分群</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : segments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {segments.map((segment) => (
                    <Card key={segment.segmentId}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{segment.segmentName}</h4>
                          <Badge variant="secondary">
                            {formatNumber(segment.userCount)} 用户
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${segment.percentage * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            占比 {formatPercent(segment.percentage)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>暂无分群数据</p>
                  <p className="text-sm">请先创建用户分群</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
