'use client';

/**
 * A/B Tests Management Page
 * A/B 测试管理页面
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Play,
  Pause,
  Square,
  Trash2,
  BarChart3,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { ABTest, ABTestResults, ABTestStatus } from '@/lib/ab-test/types';

export default function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testResults, setTestResults] = useState<ABTestResults | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ABTestStatus | 'ALL'>('ALL');

  // 创建测试表单
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    variants: [
      { name: '对照组', allocation: 50, isControl: true },
      { name: '实验组', allocation: 50, isControl: false },
    ],
  });

  // 加载测试列表
  const fetchTests = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/ab-tests?${params}`);
      const data = await response.json();

      if (data.success) {
        setTests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [statusFilter]);

  // 加载测试结果
  const fetchTestResults = async (testId: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/results`);
      const data = await response.json();

      if (data.success) {
        setTestResults(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    }
  };

  // 创建测试
  const handleCreateTest = async () => {
    try {
      const response = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTest,
          createdBy: 'admin', // TODO: 从会话获取
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateDialog(false);
        setNewTest({
          name: '',
          description: '',
          variants: [
            { name: '对照组', allocation: 50, isControl: true },
            { name: '实验组', allocation: 50, isControl: false },
          ],
        });
        fetchTests();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

  // 执行测试操作
  const handleTestAction = async (testId: string, action: 'start' | 'pause' | 'end') => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        fetchTests();
        if (selectedTest?.id === testId) {
          setSelectedTest(data.data);
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  // 删除测试
  const handleDeleteTest = async (testId: string) => {
    if (!confirm('确定要删除此测试吗？')) return;

    try {
      const response = await fetch(`/api/ab-tests/${testId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchTests();
        if (selectedTest?.id === testId) {
          setSelectedTest(null);
          setTestResults(null);
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  // 状态徽章
  const getStatusBadge = (status: ABTestStatus) => {
    const config: Record<ABTestStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      DRAFT: { variant: 'secondary', label: '草稿' },
      RUNNING: { variant: 'default', label: '运行中' },
      PAUSED: { variant: 'outline', label: '已暂停' },
      COMPLETED: { variant: 'secondary', label: '已完成' },
      ARCHIVED: { variant: 'outline', label: '已归档' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  // 更新变体分配
  const updateVariantAllocation = (index: number, allocation: number) => {
    const newVariants = [...newTest.variants];
    newVariants[index].allocation = allocation;
    setNewTest({ ...newTest, variants: newVariants });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold theme-gradient-text">A/B 测试管理</h1>
          <p className="text-muted-foreground">创建和管理 A/B 测试实验</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="theme-gradient-bg text-white hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4 mr-2" />
              创建测试
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建 A/B 测试</DialogTitle>
              <DialogDescription>设置测试名称、描述和变体分配</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>测试名称</Label>
                <Input
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  placeholder="例如：首页按钮颜色测试"
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  placeholder="测试目的和假设..."
                />
              </div>
              <div className="space-y-2">
                <Label>变体设置</Label>
                <div className="space-y-3">
                  {newTest.variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Input
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...newTest.variants];
                          newVariants[index].name = e.target.value;
                          setNewTest({ ...newTest, variants: newVariants });
                        }}
                        placeholder="变体名称"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={variant.allocation}
                          onChange={(e) => updateVariantAllocation(index, Number(e.target.value))}
                          className="w-20"
                          min={0}
                          max={100}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                      {variant.isControl && (
                        <Badge variant="outline">对照组</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  总分配: {newTest.variants.reduce((sum, v) => sum + v.allocation, 0)}%
                  {newTest.variants.reduce((sum, v) => sum + v.allocation, 0) !== 100 && (
                    <span className="text-destructive ml-2">（必须为 100%）</span>
                  )}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button
                onClick={handleCreateTest}
                disabled={
                  !newTest.name ||
                  newTest.variants.reduce((sum, v) => sum + v.allocation, 0) !== 100
                }
              >
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部状态</SelectItem>
            <SelectItem value="DRAFT">草稿</SelectItem>
            <SelectItem value="RUNNING">运行中</SelectItem>
            <SelectItem value="PAUSED">已暂停</SelectItem>
            <SelectItem value="COMPLETED">已完成</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchTests}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 测试列表 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>测试列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无测试，点击"创建测试"开始
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>变体</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow
                      key={test.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTest(test);
                        fetchTestResults(test.id);
                      }}
                    >
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>{test.variants.length} 个</TableCell>
                      <TableCell>
                        {new Date(test.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {test.status === 'DRAFT' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTestAction(test.id, 'start');
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {test.status === 'RUNNING' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTestAction(test.id, 'pause');
                                }}
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTestAction(test.id, 'end');
                                }}
                              >
                                <Square className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {test.status === 'PAUSED' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTestAction(test.id, 'start');
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {test.status !== 'RUNNING' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTest(test.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 测试详情 */}
        <Card>
          <CardHeader>
            <CardTitle>测试详情</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTest ? (
              <Tabs defaultValue="info">
                <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-2 bg-white/10 border-white/20 backdrop-blur-sm">
                  <TabsTrigger value="info">基本信息</TabsTrigger>
                  <TabsTrigger value="results">结果</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">名称</p>
                    <p className="font-medium">{selectedTest.name}</p>
                  </div>
                  {selectedTest.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">描述</p>
                      <p>{selectedTest.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">变体分配</p>
                    {selectedTest.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center gap-2 mb-2">
                        <span className="text-sm flex-1">{variant.name}</span>
                        <Progress value={variant.allocation} className="w-24" />
                        <span className="text-sm text-muted-foreground w-12">
                          {variant.allocation}%
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="results" className="space-y-4">
                  {testResults ? (
                    <>
                      <div className="flex items-center gap-2">
                        {testResults.isSignificant ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="text-sm">
                          {testResults.isSignificant
                            ? '结果具有统计显著性'
                            : '结果尚不具有统计显著性'}
                        </span>
                      </div>
                      {testResults.variants.map((variant) => (
                        <div key={variant.variantId} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{variant.variantName}</span>
                            {variant.isControl && (
                              <Badge variant="outline">对照组</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">参与人数</p>
                              <p className="font-medium">{variant.participants}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">转化数</p>
                              <p className="font-medium">{variant.conversions}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">转化率</p>
                              <p className="font-medium">
                                {(variant.conversionRate * 100).toFixed(2)}%
                              </p>
                            </div>
                            {variant.improvement !== undefined && !variant.isControl && (
                              <div>
                                <p className="text-muted-foreground">提升</p>
                                <p
                                  className={`font-medium ${
                                    variant.improvement > 0
                                      ? 'text-green-600'
                                      : variant.improvement < 0
                                      ? 'text-red-600'
                                      : ''
                                  }`}
                                >
                                  {variant.improvement > 0 ? '+' : ''}
                                  {variant.improvement.toFixed(2)}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      加载结果中...
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                选择一个测试查看详情
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
