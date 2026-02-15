"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  FileText,
  Settings,
  ShoppingCart,
  CreditCard,
  Users,
  MessageCircle,
  Zap,
  Shield,
  TrendingUp,
  Package,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const docSections = [
    {
      title: "快速开始",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      docs: [
        { title: "新用户指南", desc: "了解如何开始使用我们的平台", href: "#getting-started" },
        { title: "账户设置", desc: "配置您的个人资料和偏好设置", href: "#account-setup" },
        { title: "首次下单", desc: "完成您的第一个订单", href: "#first-order" },
      ]
    },
    {
      title: "账户管理",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      docs: [
        { title: "个人资料", desc: "管理您的个人信息", href: "#profile" },
        { title: "安全设置", desc: "密码、双因素认证等安全功能", href: "#security" },
        { title: "通知偏好", desc: "自定义通知方式和频率", href: "#notifications" },
        { title: "隐私设置", desc: "控制您的数据和隐私", href: "#privacy" },
      ]
    },
    {
      title: "订单与支付",
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500",
      docs: [
        { title: "下单流程", desc: "如何创建和提交订单", href: "#ordering" },
        { title: "支付方式", desc: "支持的支付方式和流程", href: "#payment" },
        { title: "订单管理", desc: "查看、修改和取消订单", href: "#order-management" },
        { title: "发票开具", desc: "申请和下载发票", href: "#invoices" },
        { title: "退款政策", desc: "了解退款流程和政策", href: "#refunds" },
      ]
    },
    {
      title: "服务使用",
      icon: Package,
      color: "from-purple-500 to-pink-500",
      docs: [
        { title: "服务目录", desc: "浏览所有可用服务", href: "#services" },
        { title: "项目管理", desc: "跟踪和管理您的项目", href: "#projects" },
        { title: "文件上传", desc: "如何上传和管理文件", href: "#file-upload" },
        { title: "协作功能", desc: "与团队成员协作", href: "#collaboration" },
      ]
    },
    {
      title: "客户支持",
      icon: MessageCircle,
      color: "from-red-500 to-rose-500",
      docs: [
        { title: "联系客服", desc: "获取实时帮助和支持", href: "/dashboard/support" },
        { title: "常见问题", desc: "查看常见问题解答", href: "/faq" },
        { title: "提交工单", desc: "创建支持工单", href: "/dashboard/support" },
        { title: "反馈建议", desc: "帮助我们改进服务", href: "#feedback" },
      ]
    },
    {
      title: "高级功能",
      icon: TrendingUp,
      color: "from-indigo-500 to-purple-500",
      docs: [
        { title: "API 文档", desc: "开发者 API 接口文档", href: "#api" },
        { title: "自动化工作流", desc: "设置自动化流程", href: "#automation" },
        { title: "数据分析", desc: "查看和分析数据报表", href: "#analytics" },
        { title: "集成服务", desc: "与第三方服务集成", href: "#integrations" },
      ]
    },
  ];

  const popularDocs = [
    { title: "如何注册账户", icon: Users, href: "#register" },
    { title: "支付方式说明", icon: CreditCard, href: "#payment" },
    { title: "订单状态查询", icon: Package, href: "#order-status" },
    { title: "联系客服", icon: MessageCircle, href: "/dashboard/support" },
  ];

  const filteredSections = docSections.map(section => ({
    ...section,
    docs: section.docs.filter(
      doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.docs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            帮助文档
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            详细的使用指南和教程
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Popular Docs */}
        {!searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              热门文档
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularDocs.map((doc, idx) => (
                <Link key={idx} href={doc.href}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 h-full">
                    <CardContent className="pt-6">
                      <doc.icon className="h-8 w-8 mb-3 text-purple-600" />
                      <h3 className="font-semibold">{doc.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Documentation Sections */}
        {filteredSections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">没有找到相关文档，请尝试其他关键词</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Card key={idx} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span>{section.title}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {section.docs.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.docs.map((doc, docIdx) => (
                        <Link key={docIdx} href={doc.href}>
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                            <div className="flex-1">
                              <h4 className="font-medium group-hover:text-purple-600 transition-colors">
                                {doc.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {doc.desc}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">找不到您需要的信息？</h2>
                <p className="text-white/90">
                  我们的客服团队随时准备为您提供帮助
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard/support">
                  <Button size="lg" variant="secondary" className="gap-2 whitespace-nowrap">
                    <MessageCircle className="h-5 w-5" />
                    联系客服
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button size="lg" variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 border-white/30 text-white whitespace-nowrap">
                    <FileText className="h-5 w-5" />
                    常见问题
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">安全保障</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                了解我们如何保护您的数据和隐私
              </p>
              <Button variant="link" className="gap-1">
                了解更多 <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Settings className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">系统状态</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                查看系统运行状态和维护公告
              </p>
              <Button variant="link" className="gap-1">
                查看状态 <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">服务条款</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                阅读我们的服务条款和隐私政策
              </p>
              <Button variant="link" className="gap-1">
                阅读条款 <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
