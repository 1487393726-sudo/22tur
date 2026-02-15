/**
 * 薪资透明化仪表板组件
 * Salary Transparency Dashboard Component
 * 
 * 展示人力成本汇总、薪资构成、岗位薪资范围和五险一金明细
 * 需求: 6.1, 6.2, 6.3, 6.4
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LaborCostSummary,
  SalaryComposition,
  PositionSalaryRange,
  SocialInsurance
} from '@/types/investor-operations-monitoring';
import {
  DollarSign,
  Users,
  TrendingUp,
  PieChart,
  Shield,
  AlertCircle,
  Building2
} from 'lucide-react';

interface SalaryTransparencyDashboardProps {
  projectId: string;
  projectName?: string;
}

interface SocialInsuranceDetail {
  projectId: string;
  employeeCount: number;
  totalAmount: number;
  detail: SocialInsurance;
  perEmployeeAverage: SocialInsurance;
  breakdown: { category: string; amount: number; percentage: number }[];
}

export function SalaryTransparencyDashboard({
  projectId,
  projectName
}: SalaryTransparencyDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [laborCostSummary, setLaborCostSummary] = useState<LaborCostSummary | null>(null);
  const [salaryRanges, setSalaryRanges] = useState<PositionSalaryRange[]>([]);
  const [socialInsurance, setSocialInsurance] = useState<SocialInsuranceDetail | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSalaryData();
  }, [projectId]);

  const fetchSalaryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, rangesRes, insuranceRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/salary/summary`),
        fetch(`/api/projects/${projectId}/salary/ranges`),
        fetch(`/api/projects/${projectId}/salary/social-insurance`)
      ]);

      if (!summaryRes.ok || !rangesRes.ok || !insuranceRes.ok) {
        throw new Error('获取薪资数据失败');
      }

      const [summaryData, rangesData, insuranceData] = await Promise.all([
        summaryRes.json(),
        rangesRes.json(),
        insuranceRes.json()
      ]);

      setLaborCostSummary(summaryData.data);
      setSalaryRanges(rangesData.data);
      setSocialInsurance(insuranceData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return <SalaryDashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">薪资透明化</h2>
          {projectName && (
            <p className="text-white200 mt-1">{projectName}</p>
          )}
        </div>
        <Badge variant="outline" className="text-white200 border-purple-400">
          <Users className="w-4 h-4 mr-1" />
          {laborCostSummary?.employeeCount || 0} 名员工
        </Badge>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总人力成本"
          value={formatCurrency(laborCostSummary?.totalLaborCost || 0)}
          icon={<DollarSign className="h-5 w-5" />}
          description="月度人力成本总额"
        />
        <StatCard
          title="人均薪资"
          value={formatCurrency(laborCostSummary?.averageSalary || 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          description="员工平均薪资"
        />
        <StatCard
          title="五险一金总额"
          value={formatCurrency(laborCostSummary?.socialInsuranceTotal || 0)}
          icon={<Shield className="h-5 w-5" />}
          description="企业缴纳部分"
        />
        <StatCard
          title="岗位数量"
          value={`${salaryRanges.length} 个`}
          icon={<Building2 className="h-5 w-5" />}
          description="不同岗位类型"
        />
      </div>

      {/* 详细信息标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-purple-900/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            薪资构成
          </TabsTrigger>
          <TabsTrigger value="positions" className="data-[state=active]:bg-purple-600">
            岗位薪资
          </TabsTrigger>
          <TabsTrigger value="insurance" className="data-[state=active]:bg-purple-600">
            五险一金
          </TabsTrigger>
        </TabsList>

        {/* 薪资构成 */}
        <TabsContent value="overview">
          <SalaryCompositionCard composition={laborCostSummary?.salaryComposition} />
        </TabsContent>

        {/* 岗位薪资范围 */}
        <TabsContent value="positions">
          <PositionSalaryTable ranges={salaryRanges} />
        </TabsContent>

        {/* 五险一金明细 */}
        <TabsContent value="insurance">
          <SocialInsuranceCard detail={socialInsurance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 统计卡片组件
function StatCard({
  title,
  value,
  icon,
  description
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-white200">
          {title}
        </CardTitle>
        <div className="text-white400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-white300 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// 薪资构成卡片
function SalaryCompositionCard({ composition }: { composition?: SalaryComposition }) {
  if (!composition || composition.total === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
        <CardContent className="pt-6">
          <p className="text-center text-white300">暂无薪资数据</p>
        </CardContent>
      </Card>
    );
  }

  const items = [
    { label: '基本工资', amount: composition.baseSalary, percentage: composition.baseSalaryPercentage, color: 'bg-blue-500' },
    { label: '奖金', amount: composition.bonus, percentage: composition.bonusPercentage, color: 'bg-green-500' },
    { label: '补贴', amount: composition.allowance, percentage: composition.allowancePercentage, color: 'bg-yellow-500' },
    { label: '加班费', amount: composition.overtime, percentage: composition.overtimePercentage, color: 'bg-orange-500' },
    { label: '五险一金', amount: composition.socialInsurance, percentage: composition.socialInsurancePercentage, color: 'bg-purple-500' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PieChart className="h-5 w-5 text-white400" />
          薪资构成分析
        </CardTitle>
        <CardDescription className="text-white300">
          总人力成本: {formatCurrency(composition.total)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white200">{item.label}</span>
              <span className="text-white font-medium">
                {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// 岗位薪资表格
function PositionSalaryTable({ ranges }: { ranges: PositionSalaryRange[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (ranges.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
        <CardContent className="pt-6">
          <p className="text-center text-white300">暂无岗位薪资数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-white400" />
          岗位薪资范围
        </CardTitle>
        <CardDescription className="text-white300">
          各岗位薪资分布情况
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-purple-700/50 hover:bg-purple-900/30">
              <TableHead className="text-white200">岗位</TableHead>
              <TableHead className="text-white200 text-right">最低薪资</TableHead>
              <TableHead className="text-white200 text-right">最高薪资</TableHead>
              <TableHead className="text-white200 text-right">平均薪资</TableHead>
              <TableHead className="text-white200 text-right">人数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranges.map((range) => (
              <TableRow 
                key={range.position} 
                className="border-purple-700/50 hover:bg-purple-900/30"
              >
                <TableCell className="text-white font-medium">
                  {range.position}
                </TableCell>
                <TableCell className="text-white200 text-right">
                  {formatCurrency(range.minSalary)}
                </TableCell>
                <TableCell className="text-white200 text-right">
                  {formatCurrency(range.maxSalary)}
                </TableCell>
                <TableCell className="text-white text-right font-medium">
                  {formatCurrency(range.averageSalary)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="bg-purple-600/50 text-white100">
                    {range.employeeCount} 人
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// 五险一金明细卡片
function SocialInsuranceCard({ detail }: { detail: SocialInsuranceDetail | null }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (!detail || detail.totalAmount === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
        <CardContent className="pt-6">
          <p className="text-center text-white300">暂无五险一金数据</p>
        </CardContent>
      </Card>
    );
  }

  const insuranceColors: Record<string, string> = {
    '养老保险': 'bg-blue-500',
    '医疗保险': 'bg-green-500',
    '失业保险': 'bg-yellow-500',
    '工伤保险': 'bg-orange-500',
    '生育保险': 'bg-pink-500',
    '住房公积金': 'bg-purple-500'
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-white400" />
          五险一金明细
        </CardTitle>
        <CardDescription className="text-white300">
          企业缴纳总额: {formatCurrency(detail.totalAmount)} | 
          人均: {formatCurrency(detail.totalAmount / detail.employeeCount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 明细列表 */}
          <div className="space-y-3">
            {detail.breakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white200">{item.category}</span>
                  <span className="text-white">
                    {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${insuranceColors[item.category] || 'bg-gray-500'} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 人均明细 */}
          <div className="bg-purple-900/30 rounded-lg p-4">
            <h4 className="text-white200 font-medium mb-3">人均缴纳明细</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white300">养老保险</span>
                <span className="text-white">{formatCurrency(detail.perEmployeeAverage.pension)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white300">医疗保险</span>
                <span className="text-white">{formatCurrency(detail.perEmployeeAverage.medical)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white300">失业保险</span>
                <span className="text-white">{formatCurrency(detail.perEmployeeAverage.unemployment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white300">工伤保险</span>
                <span className="text-white">{formatCurrency(detail.perEmployeeAverage.workInjury)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white300">生育保险</span>
                <span className="text-white">{formatCurrency(detail.perEmployeeAverage.maternity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white300">住房公积金</span>
                <span className="text-white">{formatCurrency(detail.perEmployeeAverage.housingFund)}</span>
              </div>
              <div className="border-t border-purple-700/50 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-white200">合计</span>
                  <span className="text-white">
                    {formatCurrency(
                      detail.perEmployeeAverage.pension +
                      detail.perEmployeeAverage.medical +
                      detail.perEmployeeAverage.unemployment +
                      detail.perEmployeeAverage.workInjury +
                      detail.perEmployeeAverage.maternity +
                      detail.perEmployeeAverage.housingFund
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 加载骨架屏
function SalaryDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-purple-800/50" />
        <Skeleton className="h-6 w-24 bg-purple-800/50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-purple-900/40 border-purple-700/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20 bg-purple-800/50" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 bg-purple-800/50" />
              <Skeleton className="h-3 w-24 mt-2 bg-purple-800/50" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-purple-900/40 border-purple-700/50">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-purple-800/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full bg-purple-800/50" />
                <Skeleton className="h-2 w-full bg-purple-800/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SalaryTransparencyDashboard;
