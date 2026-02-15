'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  Search,
  Loader2,
  ArrowRight,
  Users,
  Eye,
} from 'lucide-react';

interface InvestmentProject {
  id: string;
  title: string;
  shortDesc: string | null;
  description: string;
  category: string | null;
  status: string;
  investmentAmount: number;
  targetAmount: number | null;
  totalRaised: number;
  minInvestment: number | null;
  expectedReturn: number;
  duration: number;
  riskLevel: string | null;
  coverImage: string | null;
  viewCount: number;
  investorCount: number;
  startDate: string | null;
  endDate: string | null;
}

const categories = [
  { value: 'all', label: '全部分类' },
  { value: 'REAL_ESTATE', label: '房地产' },
  { value: 'TECHNOLOGY', label: '科技' },
  { value: 'HEALTHCARE', label: '医疗健康' },
  { value: 'LOGISTICS', label: '物流' },
  { value: 'CULTURE', label: '文化创意' },
  { value: 'FINANCE', label: '金融' },
  { value: 'ENERGY', label: '能源' },
];

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  CLOSED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  ACTIVE: '募集中',
  DRAFT: '即将开始',
  CLOSED: '已结束',
  COMPLETED: '已完成',
};

const riskColors: Record<string, string> = {
  LOW: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-red-600',
};

const riskLabels: Record<string, string> = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
};

export function InvestmentProjectsMenu() {
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  useEffect(() => {
    fetchProjects();
  }, [category, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('sort', 'newest');

      const response = await fetch(`/api/investment-projects?${params}`);
      const data = await response.json();

      if (data.data) {
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}亿`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万`;
    }
    return amount.toLocaleString();
  };

  const getProgress = (raised: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold mb-2">投资项目</h2>
        <p className="text-gray-600">
          发现优质投资机会，选择适合您的项目进行投资
        </p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索项目名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 分类筛选 */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">募集中</SelectItem>
                <SelectItem value="DRAFT">即将开始</SelectItem>
                <SelectItem value="CLOSED">已结束</SelectItem>
                <SelectItem value="all">全部状态</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 项目列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-lg">暂无符合条件的项目</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/client/investment-projects/${project.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                {/* 封面 */}
                <div className="relative h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <TrendingUp className="h-12 w-12 text-white/50" />
                  )}
                  <Badge
                    className={`absolute top-3 right-3 ${statusColors[project.status] || 'bg-gray-100'}`}
                  >
                    {statusLabels[project.status] || project.status}
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">
                    {project.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {project.shortDesc || project.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 关键指标 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">预期回报</p>
                      <p className="text-lg font-bold text-green-600">
                        {project.expectedReturn}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">投资期限</p>
                      <p className="text-lg font-bold">
                        {project.duration}个月
                      </p>
                    </div>
                  </div>

                  {/* 募集进度 */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">募集进度</span>
                      <span className="font-medium">
                        {getProgress(project.totalRaised, project.targetAmount).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={getProgress(project.totalRaised, project.targetAmount)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>已募集 ¥{formatAmount(project.totalRaised)}</span>
                      <span>目标 ¥{formatAmount(project.targetAmount || 0)}</span>
                    </div>
                  </div>

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.investorCount}人
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {project.viewCount}
                      </span>
                    </div>
                    {project.riskLevel && (
                      <span className={`text-sm ${riskColors[project.riskLevel]}`}>
                        {riskLabels[project.riskLevel]}
                      </span>
                    )}
                  </div>

                  {/* 最低投资 */}
                  {project.minInvestment && (
                    <div className="text-sm text-gray-500">
                      起投金额：¥{formatAmount(project.minInvestment)}
                    </div>
                  )}

                  {/* 查看详情按钮 */}
                  <Button className="w-full" variant="outline">
                    查看详情
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
