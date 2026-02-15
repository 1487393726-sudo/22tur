"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DynamicBarChart as BarChart,
  DynamicBar as Bar,
  DynamicXAxis as XAxis,
  DynamicYAxis as YAxis,
  DynamicCartesianGrid as CartesianGrid,
  DynamicTooltip as Tooltip,
  DynamicResponsiveContainer as ResponsiveContainer,
  DynamicLineChart as LineChart,
  DynamicLine as Line,
  DynamicPieChart as PieChart,
  DynamicPie as Pie,
  DynamicCell as Cell,
  DynamicAreaChart as AreaChart,
  DynamicArea as Area,
  DynamicRadarChart as RadarChart,
  DynamicPolarGrid as PolarGrid,
  DynamicPolarAngleAxis as PolarAngleAxis,
  DynamicPolarRadiusAxis as PolarRadiusAxis,
  DynamicRadar as Radar,
} from "@/components/charts/dynamic-charts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Activity,
  Download,
  Plus,
  Eye,
  Settings,
  Calendar,
  Filter,
  Search,
} from "lucide-react";

// 模拟数据
const monthlyRevenueData = [
  { name: "1月", revenue: 125000, profit: 45000, orders: 320 },
  { name: "2月", revenue: 145000, profit: 52000, orders: 380 },
  { name: "3月", revenue: 168000, profit: 61000, orders: 420 },
  { name: "4月", revenue: 142000, profit: 48000, orders: 350 },
  { name: "5月", revenue: 185000, profit: 72000, orders: 480 },
  { name: "6月", revenue: 195000, profit: 78000, orders: 510 },
];

const departmentPerformanceData = [
  { name: "技术部", efficiency: 85, projects: 12, satisfaction: 88 },
  { name: "设计部", efficiency: 92, projects: 8, satisfaction: 95 },
  { name: "销售部", efficiency: 78, projects: 15, satisfaction: 82 },
  { name: "市场部", efficiency: 88, projects: 6, satisfaction: 90 },
];

const projectTypeDistribution = [
  { name: "网站开发", value: 35, color: "#3B82F6" },
  { name: "移动应用", value: 25, color: "#10B981" },
  { name: "品牌设计", value: 20, color: "#F59E0B" },
  { name: "咨询服务", value: 15, color: "#8B5CF6" },
  { name: "其他", value: 5, color: "#6B7280" },
];

const userActivityData = [
  { date: "周一", 新用户: 45, 活跃用户: 320, 留存率: 85 },
  { date: "周二", 新用户: 52, 活跃用户: 340, 留存率: 88 },
  { date: "周三", 新用户: 48, 活跃用户: 355, 留存率: 86 },
  { date: "周四", 新用户: 58, 活跃用户: 378, 留存率: 90 },
  { date: "周五", 新用户: 65, 活跃用户: 410, 留存率: 92 },
  { date: "周六", 新用户: 38, 活跃用户: 280, 留存率: 78 },
  { date: "周日", 新用户: 35, 活跃用户: 260, 留存率: 75 },
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("overview");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 新建报表表单
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    type: "ANALYTICS",
    category: "MONTHLY",
    format: "PDF",
    schedule: false,
    config: "",
  });

  const metrics = [
    {
      title: "总营收",
      value: "¥1,060,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "活跃用户",
      value: "2,480",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "完成项目",
      value: "1,342",
      change: "+15.3%",
      trend: "up",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "系统使用率",
      value: "89.2%",
      change: "+2.1%",
      trend: "up",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  const reports = [
    {
      id: "1",
      title: "月度营收报表",
      type: "FINANCIAL",
      lastUpdated: "2024-01-15",
      downloads: 234,
    },
    {
      id: "2",
      title: "用户活跃度分析",
      type: "ANALYTICS",
      lastUpdated: "2024-01-14",
      downloads: 156,
    },
    {
      id: "3",
      title: "项目完成统计",
      type: "PERFORMANCE",
      lastUpdated: "2024-01-13",
      downloads: 189,
    },
    {
      id: "4",
      title: "部门绩效报告",
      type: "PERFORMANCE",
      lastUpdated: "2024-01-12",
      downloads: 98,
    },
  ];

  const dashboards = [
    {
      id: "1",
      title: "运营仪表板",
      widgets: 8,
      isDefault: true,
      isPublic: false,
    },
    {
      id: "2",
      title: "销售仪表板",
      widgets: 6,
      isDefault: false,
      isPublic: true,
    },
    {
      id: "3",
      title: "财务仪表板",
      widgets: 10,
      isDefault: false,
      isPublic: false,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" data-oid="v:cbgy2">
        <div className="text-center" data-oid="v0qs5cv">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"
            data-oid="3th39fp"
          ></div>
          <p className="text-white" data-oid="sv1iv85">
            加载数据分析中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen" data-oid="ty_trif">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="46-sav9"
      >
        <div data-oid="avk.qv5">
          <h1 className="text-3xl font-bold text-white" data-oid="95pwr3j">
            数据分析中心
          </h1>
          <p className="text-gray-300 mt-1" data-oid="me7in0h">
            全面的业务数据分析和报表管理
          </p>
        </div>
        <div className="flex gap-3" data-oid="-785_fj">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            data-oid="avjctbb"
          >
            <DialogTrigger asChild data-oid="1av9.vu">
              <Button
                className="bg-white/20 hover:bg-white/30 text-white border border-white/20"
                data-oid="3vk1ytu"
              >
                <Plus className="w-4 h-4 mr-2" data-oid="r_d.91a" />
                创建报表
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md bg-gradient-to-br from-slate-800 via-blue-800 to-slate-800 border border-white/20"
              data-oid="spw95hf"
            >
              <DialogHeader data-oid="oekd3d2">
                <DialogTitle data-oid="t12qxce">创建自定义报表</DialogTitle>
              </DialogHeader>
              <div className="space-y-4" data-oid="dnw:t5y">
                <div data-oid="jv6didx">
                  <Label htmlFor="title" data-oid="9c0ii:j">
                    报表标题
                  </Label>
                  <Input
                    id="title"
                    value={newReport.title}
                    onChange={(e) =>
                      setNewReport({ ...newReport, title: e.target.value })
                    }
                    placeholder="输入报表标题"
                    data-oid="hc18wr6"
                  />
                </div>
                <div data-oid="qbn5q-t">
                  <Label htmlFor="description" data-oid="gvu77ee">
                    描述
                  </Label>
                  <Textarea
                    id="description"
                    value={newReport.description}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        description: e.target.value,
                      })
                    }
                    placeholder="输入报表描述"
                    data-oid="vjv.3e_"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4" data-oid="yn2euwm">
                  <div data-oid="owfh1sw">
                    <Label htmlFor="type" data-oid="p4dogd9">
                      报表类型
                    </Label>
                    <Select
                      value={newReport.type}
                      onValueChange={(value) =>
                        setNewReport({ ...newReport, type: value })
                      }
                      data-oid="8qr2kc9"
                    >
                      <SelectTrigger data-oid="msx5gut">
                        <SelectValue data-oid=".mgv1x_" />
                      </SelectTrigger>
                      <SelectContent data-oid="2u7h419">
                        <SelectItem value="ANALYTICS" data-oid="x5dvecc">
                          分析报表
                        </SelectItem>
                        <SelectItem value="FINANCIAL" data-oid="o.y121h">
                          财务报表
                        </SelectItem>
                        <SelectItem value="PERFORMANCE" data-oid="czg5i9m">
                          绩效报表
                        </SelectItem>
                        <SelectItem value="SUMMARY" data-oid="3b8akor">
                          汇总报表
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div data-oid="d:3h4ka">
                    <Label htmlFor="category" data-oid="l.-be7:">
                      报表周期
                    </Label>
                    <Select
                      value={newReport.category}
                      onValueChange={(value) =>
                        setNewReport({ ...newReport, category: value })
                      }
                      data-oid="eu_oinq"
                    >
                      <SelectTrigger data-oid="rfwy1mn">
                        <SelectValue data-oid="y2gq8e6" />
                      </SelectTrigger>
                      <SelectContent data-oid="alke3_:">
                        <SelectItem value="DAILY" data-oid="hfnhdu0">
                          日报
                        </SelectItem>
                        <SelectItem value="WEEKLY" data-oid="vis_263">
                          周报
                        </SelectItem>
                        <SelectItem value="MONTHLY" data-oid="e7pgj:i">
                          月报
                        </SelectItem>
                        <SelectItem value="QUARTERLY" data-oid="fzrawl_">
                          季报
                        </SelectItem>
                        <SelectItem value="YEARLY" data-oid="0g6ottq">
                          年报
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4" data-oid="cy.e_mo">
                  <div data-oid="4n7nhfi">
                    <Label htmlFor="format" data-oid="12b2z26">
                      导出格式
                    </Label>
                    <Select
                      value={newReport.format}
                      onValueChange={(value) =>
                        setNewReport({ ...newReport, format: value })
                      }
                      data-oid="2dagcvo"
                    >
                      <SelectTrigger data-oid="azuoukr">
                        <SelectValue data-oid="lybv:wf" />
                      </SelectTrigger>
                      <SelectContent data-oid="8cn1tg_">
                        <SelectItem value="PDF" data-oid=".-1dzuc">
                          PDF
                        </SelectItem>
                        <SelectItem value="EXCEL" data-oid="f70aiqu">
                          Excel
                        </SelectItem>
                        <SelectItem value="CSV" data-oid="kf2e_jg">
                          CSV
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div data-oid="jiqr07t">
                    <Label htmlFor="schedule" data-oid="q4h16p4">
                      定时生成
                    </Label>
                    <Select
                      value={newReport.schedule ? "true" : "false"}
                      onValueChange={(value) =>
                        setNewReport({
                          ...newReport,
                          schedule: value === "true",
                        })
                      }
                      data-oid="x5w70wc"
                    >
                      <SelectTrigger data-oid="a48nn1n">
                        <SelectValue data-oid="f.7bp45" />
                      </SelectTrigger>
                      <SelectContent data-oid="fr3kb9b">
                        <SelectItem value="false" data-oid="nefr-yg">
                          手动
                        </SelectItem>
                        <SelectItem value="true" data-oid="w-w1y9z">
                          定时
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20"
                  data-oid="._h1ldw"
                >
                  创建报表
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
            data-oid="x9x4yg0"
          >
            <Settings className="w-4 h-4 mr-2" data-oid="adti:95" />
            配置
          </Button>
        </div>
      </div>

      {/* 指标卡片 */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        data-oid="ku:jt6k"
      >
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="bg-white/10 backdrop-blur-sm border border-white/20"
            data-oid="flkmus4"
          >
            <CardContent className="p-6" data-oid="par_jzj">
              <div
                className="flex items-center justify-between"
                data-oid="238x4:a"
              >
                <div data-oid="rqjt7n8">
                  <p
                    className="text-sm font-medium text-gray-300"
                    data-oid="_xyqfx3"
                  >
                    {metric.title}
                  </p>
                  <p
                    className="text-2xl font-bold text-white mt-1"
                    data-oid="kiz1pqz"
                  >
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2" data-oid="lefwnb9">
                    {metric.trend === "up" ? (
                      <TrendingUp
                        className="w-4 h-4 text-green-400 mr-1"
                        data-oid="f7wrxr6"
                      />
                    ) : (
                      <TrendingDown
                        className="w-4 h-4 text-red-400 mr-1"
                        data-oid="5b-:.vk"
                      />
                    )}
                    <span
                      className={`text-sm font-medium ${metric.color.replace("600", "400")}`}
                      data-oid="u910431"
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div
                  className="p-3 bg-white/10 rounded-lg backdrop-blur-sm"
                  data-oid="jyxsu0a"
                >
                  <metric.icon
                    className="w-6 h-6 text-white"
                    data-oid="m1i2vhm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="charts" className="space-y-6" data-oid="87dz4wg">
        <TabsList
          className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20"
          data-oid="uymcj8n"
        >
          <TabsTrigger
            value="charts"
            className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            data-oid="-md3_j9"
          >
            图表分析
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            data-oid="poalkya"
          >
            报表管理
          </TabsTrigger>
          <TabsTrigger
            value="dashboards"
            className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            data-oid="fyai8or"
          >
            仪表板
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            data-oid=".txv2hp"
          >
            自定义分析
          </TabsTrigger>
        </TabsList>

        {/* 图表分析 */}
        <TabsContent value="charts" className="space-y-6" data-oid="uxa4nsv">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            data-oid="_-zv3yr"
          >
            {/* 营收趋势图 */}
            <Card
              className="bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="_h9aztt"
            >
              <CardHeader data-oid="jtzgvp_">
                <CardTitle
                  className="flex items-center justify-between text-white"
                  data-oid="6ek62jl"
                >
                  <span data-oid="j6hyw_s">营收趋势</span>
                  <Select
                    value={timeRange}
                    onValueChange={setTimeRange}
                    data-oid=":v1jsir"
                  >
                    <SelectTrigger
                      className="w-32 bg-white/10 border-white/20 text-white"
                      data-oid="c.xqu:4"
                    >
                      <SelectValue data-oid="794_1k6" />
                    </SelectTrigger>
                    <SelectContent data-oid="7dpx2ch">
                      <SelectItem value="week" data-oid="-1-h.2n">
                        本周
                      </SelectItem>
                      <SelectItem value="month" data-oid="y_87h9k">
                        本月
                      </SelectItem>
                      <SelectItem value="quarter" data-oid="gw7e1.e">
                        本季度
                      </SelectItem>
                      <SelectItem value="year" data-oid="k_tw.iv">
                        本年
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="iwbgy36">
                <ResponsiveContainer
                  width="100%"
                  height={300}
                  data-oid="e49sqcn"
                >
                  <AreaChart data={monthlyRevenueData} data-oid="psux9fc">
                    <CartesianGrid strokeDasharray="3 3" data-oid="iiip9tv" />
                    <XAxis dataKey="name" data-oid="apl1hy9" />
                    <YAxis data-oid="i0r355y" />
                    <Tooltip data-oid="lk1yk.u" />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      data-oid="_jt10f3"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      data-oid=".cz-ij9"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 项目类型分布 */}
            <Card
              className="bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="c7:bolw"
            >
              <CardHeader data-oid="zos1a_5">
                <CardTitle className="text-white" data-oid="o8.u:y6">
                  项目类型分布
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="2pl72wm">
                <ResponsiveContainer
                  width="100%"
                  height={300}
                  data-oid="j55mebs"
                >
                  <PieChart data-oid="pa0qw91">
                    <Pie
                      data={projectTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      data-oid="rxx8n5q"
                    >
                      {projectTypeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          data-oid="618w0np"
                        />
                      ))}
                    </Pie>
                    <Tooltip data-oid="37m-z5q" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 部门绩效对比 */}
            <Card
              className="bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="4g4y53d"
            >
              <CardHeader data-oid=".whb1b_">
                <CardTitle className="text-white" data-oid="01wxyho">
                  部门绩效对比
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="_19b3zf">
                <ResponsiveContainer
                  width="100%"
                  height={300}
                  data-oid="8cu730e"
                >
                  <RadarChart
                    data={departmentPerformanceData}
                    data-oid="dbhram8"
                  >
                    <PolarGrid data-oid="7xdrh_h" />
                    <PolarAngleAxis dataKey="name" data-oid="finjrbt" />
                    <PolarRadiusAxis data-oid="55rt6ec" />
                    <Radar
                      name="效率"
                      dataKey="efficiency"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      data-oid="3b_x0:r"
                    />
                    <Radar
                      name="满意度"
                      dataKey="satisfaction"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      data-oid="741a-kn"
                    />
                    <Tooltip data-oid="hjvseuh" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 用户活跃度 */}
            <Card
              className="bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="gye8ali"
            >
              <CardHeader data-oid="f4ct.4l">
                <CardTitle className="text-white" data-oid="ij78ffq">
                  用户活跃度
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="-iivsoz">
                <ResponsiveContainer
                  width="100%"
                  height={300}
                  data-oid="gf3a409"
                >
                  <LineChart data={userActivityData} data-oid="48yo8zp">
                    <CartesianGrid strokeDasharray="3 3" data-oid="64uen24" />
                    <XAxis dataKey="date" data-oid="jkphs98" />
                    <YAxis data-oid="a9maet0" />
                    <Tooltip data-oid="2mjrf6e" />
                    <Line
                      type="monotone"
                      dataKey="新用户"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      data-oid="fwap94o"
                    />
                    <Line
                      type="monotone"
                      dataKey="活跃用户"
                      stroke="#10B981"
                      strokeWidth={2}
                      data-oid="jse:x0e"
                    />
                    <Line
                      type="monotone"
                      dataKey="留存率"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      data-oid="nq0l0i2"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 报表管理 */}
        <TabsContent value="reports" className="space-y-6" data-oid=":jis3xz">
          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="rne9me8"
          >
            <CardHeader data-oid="-8:4ja3">
              <CardTitle
                className="flex items-center justify-between text-white"
                data-oid="zm88ils"
              >
                <span data-oid="3yn.f9.">报表列表</span>
                <div className="flex items-center gap-2" data-oid="y_au4bi">
                  <div className="relative" data-oid="ermop6n">
                    <Search
                      className="w-4 h-4 absolute left-3 top-3 text-gray-300"
                      data-oid="mnjyx5s"
                    />
                    <Input
                      placeholder="搜索报表..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                      data-oid="q-i.oni"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10"
                    data-oid="_e6zpx1"
                  >
                    <Filter className="w-4 h-4 mr-2" data-oid="3coayip" />
                    筛选
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent data-oid=":9y4d:a">
              <div className="space-y-4" data-oid="x5e.dlm">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/5 bg-white/5"
                    data-oid="hf03.5b"
                  >
                    <div data-oid="dd6s0af">
                      <h3 className="font-medium text-white" data-oid="bf_ps5m">
                        {report.title}
                      </h3>
                      <div
                        className="flex items-center gap-4 mt-1"
                        data-oid="083tp3g"
                      >
                        <Badge
                          variant="outline"
                          className="text-gray-300 border-gray-300"
                          data-oid="qnon41y"
                        >
                          {report.type}
                        </Badge>
                        <span
                          className="text-sm text-gray-300"
                          data-oid="u1md7si"
                        >
                          更新于 {report.lastUpdated}
                        </span>
                        <span
                          className="text-sm text-gray-300"
                          data-oid="kxp_sg3"
                        >
                          {report.downloads} 次下载
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" data-oid="zanno_d">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white border-white/20 hover:bg-white/10"
                        data-oid="k-a1ox6"
                      >
                        <Eye className="w-4 h-4 mr-1" data-oid="kfpki._" />
                        查看
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white border-white/20 hover:bg-white/10"
                        data-oid="ec0:y1n"
                      >
                        <Download className="w-4 h-4 mr-1" data-oid="90zhgml" />
                        下载
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 仪表板 */}
        <TabsContent
          value="dashboards"
          className="space-y-6"
          data-oid="1:smjf."
        >
          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="vkfk83h"
          >
            <CardHeader data-oid="sn5g9t9">
              <CardTitle className="text-white" data-oid="g48dijh">
                仪表板管理
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="hrhpf1o">
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                data-oid="92a.a.y"
              >
                {dashboards.map((dashboard) => (
                  <div
                    key={dashboard.id}
                    className="border border-white/20 rounded-lg p-6 hover:bg-white/5 transition-shadow bg-white/5"
                    data-oid="v6ii46x"
                  >
                    <div
                      className="flex items-start justify-between"
                      data-oid="m20gwe1"
                    >
                      <div data-oid="3y6n042">
                        <h3
                          className="font-medium text-white"
                          data-oid="1xkfrrg"
                        >
                          {dashboard.title}
                        </h3>
                        <p
                          className="text-sm text-gray-300 mt-1"
                          data-oid="o0ggo4v"
                        >
                          {dashboard.widgets} 个小部件
                        </p>
                      </div>
                      <div className="flex gap-2" data-oid="yjos7cd">
                        {dashboard.isDefault && (
                          <Badge
                            className="bg-blue-600 text-white"
                            data-oid="aqgzvbb"
                          >
                            默认
                          </Badge>
                        )}
                        {dashboard.isPublic && (
                          <Badge
                            variant="outline"
                            className="text-gray-300 border-gray-300"
                            data-oid="9el5fcc"
                          >
                            公开
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2" data-oid="oi4ueeb">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-white border-white/20 hover:bg-white/10"
                        data-oid="kx20taf"
                      >
                        <Settings className="w-4 h-4 mr-1" data-oid="k2-4:-a" />
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        data-oid="1q58lmf"
                      >
                        查看
                      </Button>
                    </div>
                  </div>
                ))}
                <div
                  className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] bg-white/5"
                  data-oid="._ak2du"
                >
                  <Plus
                    className="w-8 h-8 text-gray-400 mb-2"
                    data-oid="s_0:n96"
                  />
                  <p className="text-gray-300" data-oid="2uw0emf">
                    创建新仪表板
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 自定义分析 */}
        <TabsContent value="custom" className="space-y-6" data-oid="8_4si6z">
          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="tk:ie87"
          >
            <CardHeader data-oid="s1x7ect">
              <CardTitle className="text-white" data-oid="lokibfd">
                自定义数据分析
              </CardTitle>
            </CardHeader>
            <CardContent data-oid=".98zzp1">
              <div className="text-center py-12" data-oid="e.rp.hm">
                <Activity
                  className="w-12 h-12 text-gray-300 mx-auto mb-4"
                  data-oid="vlhr4jp"
                />
                <h3
                  className="text-lg font-medium text-white mb-2"
                  data-oid="vt:jemc"
                >
                  自定义报表构建器
                </h3>
                <p
                  className="text-gray-300 mb-6 max-w-md mx-auto"
                  data-oid="gkp-_j7"
                >
                  使用我们的拖拽式报表构建器，创建符合您需求的自定义报表
                </p>
                <Button
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  data-oid="o:fe3qq"
                >
                  <Plus className="w-4 h-4 mr-2" data-oid="h7m4ctd" />
                  开始构建
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
