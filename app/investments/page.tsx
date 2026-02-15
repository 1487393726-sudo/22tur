"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  TrendingUp,
  Users,
  Eye,
  ArrowRight,
  Loader2,
} from "lucide-react";

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

// 分类选项
const categories = [
  { value: "all", label: "全部分类" },
  { value: "REAL_ESTATE", label: "房地产" },
  { value: "TECHNOLOGY", label: "科技" },
  { value: "HEALTHCARE", label: "医疗健康" },
  { value: "LOGISTICS", label: "物流" },
  { value: "CULTURE", label: "文化创意" },
  { value: "FINANCE", label: "金融" },
  { value: "ENERGY", label: "能源" },
];

// 状态颜色映射
const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-gray-100 text-gray-800",
  CLOSED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

// 状态文字映射
const statusLabels: Record<string, string> = {
  ACTIVE: "募集中",
  DRAFT: "即将开始",
  CLOSED: "已结束",
  COMPLETED: "已完成",
};

// 风险等级颜色
const riskColors: Record<string, string> = {
  LOW: "text-green-600",
  MEDIUM: "text-yellow-600",
  HIGH: "text-red-600",
};

const riskLabels: Record<string, string> = {
  LOW: "低风险",
  MEDIUM: "中风险",
  HIGH: "高风险",
};

export default function InvestmentsPage() {
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  // 获取项目列表
  useEffect(() => {
    fetchProjects();
  }, [category, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.append("category", category);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("sort", "newest");

      const response = await fetch(`/api/investment-projects?${params}`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setProjects(data.data || []);
      } else {
        // 如果没有数据，使用默认数据
        setProjects(getDefaultProjects());
      }
    } catch (error) {
      console.error("获取项目列表失败:", error);
      // 失败时使用默认数据
      setProjects(getDefaultProjects());
    } finally {
      setLoading(false);
    }
  };

  // 默认投资项目数据
  const getDefaultProjects = (): InvestmentProject[] => {
    return [
      {
        id: "inv001",
        title: "智能物流配送中心建设项目",
        shortDesc: "华东地区智能物流配送中心建设",
        description: "建设一个集自动化分拣、智能配送、数据分析于一体的现代化物流配送中心。项目位于华东地区，占地面积50000平方米，预计年处理订单量5000万件。",
        category: "LOGISTICS",
        status: "ACTIVE",
        investmentAmount: 50000000,
        targetAmount: 100000000,
        totalRaised: 35000000,
        minInvestment: 100000,
        expectedReturn: 15,
        duration: 36,
        riskLevel: "MEDIUM",
        coverImage: null,
        viewCount: 2300,
        investorCount: 45,
        startDate: new Date("2024-01-15").toISOString(),
        endDate: new Date("2027-01-15").toISOString(),
      },
      {
        id: "inv002",
        title: "新能源电池生产基地项目",
        shortDesc: "高端新能源电池生产基地",
        description: "投资建设高端新能源电池生产基地，采用国际先进的生产工艺和管理体系。项目年产能50GWh，主要供应新能源汽车制造商。",
        category: "ENERGY",
        status: "ACTIVE",
        investmentAmount: 80000000,
        targetAmount: 150000000,
        totalRaised: 95000000,
        minInvestment: 500000,
        expectedReturn: 18,
        duration: 48,
        riskLevel: "MEDIUM",
        coverImage: null,
        viewCount: 3100,
        investorCount: 67,
        startDate: new Date("2024-03-01").toISOString(),
        endDate: new Date("2028-03-01").toISOString(),
      },
      {
        id: "inv003",
        title: "医疗健康产业园区开发项目",
        shortDesc: "医疗健康产业园区开发",
        description: "开发集医疗研发、生产、服务于一体的综合性医疗健康产业园区。园区规划面积100000平方米，将引入50家以上医疗健康企业。",
        category: "HEALTHCARE",
        status: "ACTIVE",
        investmentAmount: 60000000,
        targetAmount: 120000000,
        totalRaised: 72000000,
        minInvestment: 200000,
        expectedReturn: 16,
        duration: 42,
        riskLevel: "LOW",
        coverImage: null,
        viewCount: 2800,
        investorCount: 52,
        startDate: new Date("2024-02-01").toISOString(),
        endDate: new Date("2027-08-01").toISOString(),
      },
      {
        id: "inv004",
        title: "科技创新孵化基地建设项目",
        shortDesc: "科技创新孵化基地建设",
        description: "建设专业的科技创新孵化基地，为初创企业提供办公场地、技术支持、融资服务等全方位支持。预计孵化100家科技企业。",
        category: "TECHNOLOGY",
        status: "DRAFT",
        investmentAmount: 30000000,
        targetAmount: 60000000,
        totalRaised: 15000000,
        minInvestment: 50000,
        expectedReturn: 20,
        duration: 36,
        riskLevel: "HIGH",
        coverImage: null,
        viewCount: 1200,
        investorCount: 28,
        startDate: new Date("2024-06-01").toISOString(),
        endDate: new Date("2027-06-01").toISOString(),
      },
      {
        id: "inv005",
        title: "文化创意产业园项目",
        shortDesc: "文化创意产业园建设",
        description: "打造集文化创意、艺术展示、文创产品销售于一体的文化产业园。园区将汇聚设计、动画、影视、音乐等多个文创领域的企业和创意人才。",
        category: "CULTURE",
        status: "ACTIVE",
        investmentAmount: 40000000,
        targetAmount: 80000000,
        totalRaised: 48000000,
        minInvestment: 100000,
        expectedReturn: 14,
        duration: 40,
        riskLevel: "MEDIUM",
        coverImage: null,
        viewCount: 1950,
        investorCount: 38,
        startDate: new Date("2024-04-01").toISOString(),
        endDate: new Date("2027-08-01").toISOString(),
      },
      {
        id: "inv006",
        title: "商业地产综合体开发项目",
        shortDesc: "城市中心商业综合体开发",
        description: "开发集购物、餐饮、娱乐、办公于一体的大型商业综合体。项目位于城市中心，总建筑面积500000平方米，预计年客流量3000万人次。",
        category: "REAL_ESTATE",
        status: "ACTIVE",
        investmentAmount: 120000000,
        targetAmount: 250000000,
        totalRaised: 180000000,
        minInvestment: 1000000,
        expectedReturn: 12,
        duration: 60,
        riskLevel: "LOW",
        coverImage: null,
        viewCount: 4500,
        investorCount: 89,
        startDate: new Date("2023-12-01").toISOString(),
        endDate: new Date("2028-12-01").toISOString(),
      },
      {
        id: "inv007",
        title: "金融科技平台建设项目",
        shortDesc: "新一代金融科技平台",
        description: "开发新一代金融科技平台，提供数字支付、资产管理、融资服务等综合金融服务。预计服务用户1000万，日均交易额100亿元。",
        category: "FINANCE",
        status: "DRAFT",
        investmentAmount: 25000000,
        targetAmount: 50000000,
        totalRaised: 8000000,
        minInvestment: 100000,
        expectedReturn: 25,
        duration: 24,
        riskLevel: "HIGH",
        coverImage: null,
        viewCount: 890,
        investorCount: 15,
        startDate: new Date("2024-07-01").toISOString(),
        endDate: new Date("2026-07-01").toISOString(),
      },
      {
        id: "inv008",
        title: "智慧农业示范基地项目",
        shortDesc: "智慧农业示范基地建设",
        description: "建设集精准农业、生态养殖、农产品深加工于一体的智慧农业示范基地。采用物联网、大数据等先进技术，提高农业生产效率。",
        category: "TECHNOLOGY",
        status: "ACTIVE",
        investmentAmount: 35000000,
        targetAmount: 70000000,
        totalRaised: 42000000,
        minInvestment: 50000,
        expectedReturn: 13,
        duration: 36,
        riskLevel: "MEDIUM",
        coverImage: null,
        viewCount: 1650,
        investorCount: 33,
        startDate: new Date("2024-05-01").toISOString(),
        endDate: new Date("2027-05-01").toISOString(),
      },
    ];
  };

  // 过滤搜索结果
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.description.toLowerCase().includes(search.toLowerCase())
  );

  // 格式化金额
  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}亿`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万`;
    }
    return amount.toLocaleString();
  };

  // 计算募集进度
  const getProgress = (raised: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">投资项目</h1>
          <p className="text-blue-100">
            浏览我们的优质投资项目，选择适合您的投资机会
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 标题和描述 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">投资项目</h2>
          <p className="text-muted-foreground">
            发现优质投资机会，选择适合您的项目进行投资
          </p>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-8">
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
          <div className="flex justify-center items-center py-20">
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
              <Link key={project.id} href={`/investments/${project.id}`}>
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
                      className={`absolute top-3 right-3 ${statusColors[project.status] || "bg-gray-100"}`}
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
    </div>
  );
}
