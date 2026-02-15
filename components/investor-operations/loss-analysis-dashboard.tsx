'use client';

/**
 * 亏损分析仪表板组件
 * Loss Analysis Dashboard Component
 * 
 * 显示亏损因素分析、市场对比、决策历史和改进计划
 * 需求: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  TrendingDown,
  AlertTriangle,
  BarChart3,
  FileText,
  Target,
  Clock,
  User,
  Plus,
  RefreshCw,
  ChevronRight,
  Building2,
  DollarSign,
  Percent,
  Award
} from 'lucide-react';
import {
  LossAnalysisReport,
  LossFactor,
  LossFactorType,
  MarketComparison,
  ImprovementPlan,
  DecisionRecord
} from '@/types/investor-operations-monitoring';

/**
 * 组件属性
 */
interface LossAnalysisDashboardProps {
  projectId: string;
  projectName?: string;
}

/**
 * 亏损因素类型显示名称
 */
const LOSS_FACTOR_NAMES: Record<LossFactorType, string> = {
  [LossFactorType.MARKET]: '市场因素',
  [LossFactorType.OPERATIONS]: '运营因素',
  [LossFactorType.COST]: '成本因素',
  [LossFactorType.COMPETITION]: '竞争因素',
  [LossFactorType.OTHER]: '其他因素'
};

/**
 * 亏损因素颜色
 */
const LOSS_FACTOR_COLORS: Record<LossFactorType, string> = {
  [LossFactorType.MARKET]: 'bg-blue-500',
  [LossFactorType.OPERATIONS]: 'bg-orange-500',
  [LossFactorType.COST]: 'bg-red-500',
  [LossFactorType.COMPETITION]: 'bg-purple-500',
  [LossFactorType.OTHER]: 'bg-gray-500'
};

/**
 * 改进计划状态显示
 */
const PLAN_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PLANNED: { label: '计划中', color: 'bg-blue-500' },
  IN_PROGRESS: { label: '进行中', color: 'bg-yellow-500' },
  COMPLETED: { label: '已完成', color: 'bg-green-500' },
  CANCELLED: { label: '已取消', color: 'bg-gray-500' }
};

/**
 * 亏损分析仪表板
 */
export function LossAnalysisDashboard({
  projectId,
  projectName
}: LossAnalysisDashboardProps) {
  const [report, setReport] = useState<LossAnalysisReport | null>(null);
  const [marketComparison, setMarketComparison] = useState<MarketComparison | null>(null);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [plans, setPlans] = useState<ImprovementPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('factors');

  // 加载数据
  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportRes, comparisonRes, decisionsRes, plansRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/loss-analysis`),
        fetch(`/api/projects/${projectId}/market-comparison`),
        fetch(`/api/projects/${projectId}/decisions`),
        fetch(`/api/projects/${projectId}/improvement-plan`)
      ]);

      if (reportRes.ok) {
        const data = await reportRes.json();
        setReport(data.data);
      }
      if (comparisonRes.ok) {
        const data = await comparisonRes.json();
        setMarketComparison(data.data);
      }
      if (decisionsRes.ok) {
        const data = await decisionsRes.json();
        setDecisions(data.data || []);
      }
      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.data || []);
      }
    } catch (error) {
      console.error('加载亏损分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/loss-analysis`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.data);
      }
    } catch (error) {
      console.error('刷新报告失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">亏损分析报告</h2>
          {projectName && (
            <p className="text-white/60 mt-1">{projectName}</p>
          )}
        </div>
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleRefresh}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          重新分析
        </Button>
      </div>

      {/* 总览卡片 */}
      {report && (
        <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">累计亏损</p>
                  <p className="text-3xl font-bold text-red-400">
                    ¥{report.totalLoss.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm">报告日期</p>
                <p className="text-white">
                  {new Date(report.reportDate).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="factors" className="data-[state=active]:bg-purple-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            亏损因素
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            市场对比
          </TabsTrigger>
          <TabsTrigger value="decisions" className="data-[state=active]:bg-purple-600">
            <FileText className="w-4 h-4 mr-2" />
            决策历史
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-purple-600">
            <Target className="w-4 h-4 mr-2" />
            改进计划
          </TabsTrigger>
        </TabsList>

        {/* 亏损因素 */}
        <TabsContent value="factors" className="mt-6">
          <LossFactorsCard factors={report?.lossFactors || []} />
        </TabsContent>

        {/* 市场对比 */}
        <TabsContent value="market" className="mt-6">
          <MarketComparisonCard comparison={marketComparison} />
        </TabsContent>

        {/* 决策历史 */}
        <TabsContent value="decisions" className="mt-6">
          <DecisionHistoryCard 
            decisions={decisions} 
            projectId={projectId}
            onDecisionAdded={loadData}
          />
        </TabsContent>

        {/* 改进计划 */}
        <TabsContent value="plans" className="mt-6">
          <ImprovementPlansCard 
            plans={plans} 
            projectId={projectId}
            onPlanUpdated={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * 亏损因素卡片
 */
function LossFactorsCard({ factors }: { factors: LossFactor[] }) {
  if (factors.length === 0) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">暂无亏损因素分析数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {factors.map((factor, index) => (
        <Card key={index} className="bg-white/10 border-white/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${LOSS_FACTOR_COLORS[factor.factor]} flex items-center justify-center flex-shrink-0`}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">
                    {LOSS_FACTOR_NAMES[factor.factor]}
                  </h4>
                  <Badge className="bg-red-500/20 text-red-300">
                    影响度: {factor.impact}%
                  </Badge>
                </div>
                <p className="text-white/70 text-sm mb-3">{factor.description}</p>
                {factor.evidence.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs mb-2">证据/数据:</p>
                    <ul className="space-y-1">
                      {factor.evidence.map((e, i) => (
                        <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                          <ChevronRight className="w-3 h-3" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* 影响度进度条 */}
            <div className="mt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${LOSS_FACTOR_COLORS[factor.factor]} transition-all`}
                  style={{ width: `${factor.impact}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * 市场对比卡片
 */
function MarketComparisonCard({ comparison }: { comparison: MarketComparison | null }) {
  if (!comparison) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">暂无市场对比数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-white/10 border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white" />
            行业平均数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/60">平均收入</span>
            <span className="text-white font-medium">
              ¥{comparison.averageRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">平均利润</span>
            <span className={`font-medium ${comparison.averageProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ¥{comparison.averageProfit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">平均利润率</span>
            <span className="text-white font-medium">
              {comparison.averageProfitMargin.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            项目排名
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-white">
              {comparison.projectRanking}
              <span className="text-2xl text-white/60">
                /{comparison.totalProjectsInIndustry}
              </span>
            </p>
            <p className="text-white/60 mt-2">
              在 {comparison.totalProjectsInIndustry} 个同行业项目中
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-sm text-center">
              对比日期: {new Date(comparison.comparisonDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 决策历史卡片
 */
function DecisionHistoryCard({ 
  decisions, 
  projectId,
  onDecisionAdded 
}: { 
  decisions: DecisionRecord[];
  projectId: string;
  onDecisionAdded: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    decisionType: '',
    title: '',
    description: '',
    rationale: '',
    impact: ''
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({ decisionType: '', title: '', description: '', rationale: '', impact: '' });
        onDecisionAdded();
      }
    } catch (error) {
      console.error('添加决策记录失败:', error);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          决策历史记录
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-1" />
              添加记录
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">添加决策记录</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80">决策类型</Label>
                <Select 
                  value={formData.decisionType} 
                  onValueChange={(v) => setFormData({...formData, decisionType: v})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRATEGIC">战略决策</SelectItem>
                    <SelectItem value="OPERATIONAL">运营决策</SelectItem>
                    <SelectItem value="FINANCIAL">财务决策</SelectItem>
                    <SelectItem value="HR">人事决策</SelectItem>
                    <SelectItem value="OTHER">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80">决策标题</Label>
                <Input 
                  className="bg-white/10 border-white/20 text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-white/80">决策描述</Label>
                <Textarea 
                  className="bg-white/10 border-white/20 text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-white/80">决策依据</Label>
                <Textarea 
                  className="bg-white/10 border-white/20 text-white"
                  value={formData.rationale}
                  onChange={(e) => setFormData({...formData, rationale: e.target.value})}
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSubmit}>
                保存记录
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {decisions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">暂无决策记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {decisions.map((decision) => (
              <div 
                key={decision.id} 
                className="bg-white/5 rounded-lg p-4 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge className="bg-blue-500/20 text-blue-300 mb-2">
                      {decision.decisionType}
                    </Badge>
                    <h4 className="text-white font-medium">{decision.title}</h4>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-white/60">
                      {new Date(decision.decisionDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <p className="text-white/70 text-sm">{decision.description}</p>
                {decision.rationale && (
                  <p className="text-white/50 text-sm mt-2">
                    依据: {decision.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 改进计划卡片
 */
function ImprovementPlansCard({ 
  plans, 
  projectId,
  onPlanUpdated 
}: { 
  plans: ImprovementPlan[];
  projectId: string;
  onPlanUpdated: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedOutcome: '',
    timeline: '',
    responsiblePerson: ''
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/improvement-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({ title: '', description: '', expectedOutcome: '', timeline: '', responsiblePerson: '' });
        onPlanUpdated();
      }
    } catch (error) {
      console.error('创建改进计划失败:', error);
    }
  };

  const handleStatusUpdate = async (planId: string, status: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/improvement-plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, status })
      });
      if (res.ok) {
        onPlanUpdated();
      }
    } catch (error) {
      console.error('更新计划状态失败:', error);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          改进计划
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-1" />
              新建计划
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">创建改进计划</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80">计划标题</Label>
                <Input 
                  className="bg-white/10 border-white/20 text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-white/80">计划描述</Label>
                <Textarea 
                  className="bg-white/10 border-white/20 text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-white/80">预期成果</Label>
                <Input 
                  className="bg-white/10 border-white/20 text-white"
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData({...formData, expectedOutcome: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-white/80">时间线</Label>
                <Input 
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="例如: 2026年Q1"
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                />
              </div>
              <div>
                <Label className="text-white/80">负责人</Label>
                <Input 
                  className="bg-white/10 border-white/20 text-white"
                  value={formData.responsiblePerson}
                  onChange={(e) => setFormData({...formData, responsiblePerson: e.target.value})}
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSubmit}>
                创建计划
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">暂无改进计划</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className="bg-white/5 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{plan.title}</h4>
                    <Badge className={`${PLAN_STATUS_CONFIG[plan.status]?.color || 'bg-gray-500'} text-white mt-1`}>
                      {PLAN_STATUS_CONFIG[plan.status]?.label || plan.status}
                    </Badge>
                  </div>
                  <Select 
                    value={plan.status} 
                    onValueChange={(v) => handleStatusUpdate(plan.id, v)}
                  >
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">计划中</SelectItem>
                      <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                      <SelectItem value="COMPLETED">已完成</SelectItem>
                      <SelectItem value="CANCELLED">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-white/70 text-sm mb-3">{plan.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Target className="w-4 h-4" />
                    <span>{plan.expectedOutcome}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>{plan.timeline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <User className="w-4 h-4" />
                    <span>{plan.responsiblePerson}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LossAnalysisDashboard;
