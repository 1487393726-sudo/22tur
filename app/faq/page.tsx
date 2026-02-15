"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      category: "账户相关",
      icon: "👤",
      questions: [
        {
          q: "如何注册账户？",
          a: "点击页面右上角的「注册」按钮，填写您的邮箱、用户名和密码即可完成注册。注册后请查收验证邮件以激活账户。"
        },
        {
          q: "忘记密码怎么办？",
          a: "在登录页面点击「忘记密码」链接，输入您的注册邮箱，系统会发送密码重置链接到您的邮箱。"
        },
        {
          q: "如何修改个人信息？",
          a: "登录后进入「设置」页面，在「个人资料」选项卡中可以修改您的姓名、头像、联系方式等信息。"
        },
        {
          q: "如何注销账户？",
          a: "请联系客服团队申请账户注销。注销后您的所有数据将被永久删除且无法恢复。"
        }
      ]
    },
    {
      category: "订单与支付",
      icon: "💳",
      questions: [
        {
          q: "支持哪些支付方式？",
          a: "我们支持支付宝、微信支付、银行卡支付等多种支付方式。具体可用的支付方式会在结账页面显示。"
        },
        {
          q: "如何查看订单状态？",
          a: "登录后进入「我的订单」页面，可以查看所有订单的详细状态和物流信息。"
        },
        {
          q: "订单可以取消吗？",
          a: "未发货的订单可以在「我的订单」页面中取消。已发货的订单需要联系客服处理退货退款。"
        },
        {
          q: "发票如何开具？",
          a: "在订单详情页面可以申请开具发票，支持电子发票和纸质发票。电子发票会发送到您的邮箱。"
        }
      ]
    },
    {
      category: "服务相关",
      icon: "🛠️",
      questions: [
        {
          q: "服务交付需要多长时间？",
          a: "不同服务的交付时间不同，具体时间会在服务详情页面标注。一般设计服务需要3-7个工作日，开发服务需要1-4周。"
        },
        {
          q: "可以申请退款吗？",
          a: "服务开始前可以申请全额退款。服务进行中根据完成进度按比例退款。具体退款政策请查看服务协议。"
        },
        {
          q: "如何与服务团队沟通？",
          a: "下单后可以在项目详情页面与服务团队实时沟通，也可以通过客服系统提交工单。"
        },
        {
          q: "服务质量有保障吗？",
          a: "所有服务都有质量保证期，如果对服务不满意可以申请修改或退款。我们承诺100%客户满意。"
        }
      ]
    },
    {
      category: "技术支持",
      icon: "💻",
      questions: [
        {
          q: "网站打不开怎么办？",
          a: "请检查您的网络连接，清除浏览器缓存后重试。如果问题持续存在，请联系技术支持。"
        },
        {
          q: "上传文件失败怎么办？",
          a: "请确保文件大小不超过限制（一般为10MB），文件格式符合要求。建议使用Chrome或Firefox浏览器。"
        },
        {
          q: "支持哪些浏览器？",
          a: "我们支持Chrome、Firefox、Safari、Edge等主流浏览器的最新版本。建议使用Chrome浏览器以获得最佳体验。"
        },
        {
          q: "移动端可以使用吗？",
          a: "是的，我们的网站完全支持移动端访问，您可以在手机或平板上使用所有功能。"
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            常见问题
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            快速找到您需要的答案
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="搜索问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <CardContent className="pt-6 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-1">联系客服</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">实时在线支持</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/docs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-500">
              <CardContent className="pt-6 text-center">
                <HelpCircle className="h-8 w-8 mx-auto mb-3 text-pink-600" />
                <h3 className="font-semibold mb-1">帮助文档</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">详细使用指南</p>
              </CardContent>
            </Card>
          </Link>
          <a href="tel:4001234567">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <CardContent className="pt-6 text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-1">电话支持</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">400-123-4567</p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* FAQ Categories */}
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">没有找到相关问题，请尝试其他关键词或联系客服</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredFAQs.map((category, idx) => (
              <Card key={idx} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span>{category.category}</span>
                    <Badge variant="secondary">{category.questions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium">{item.q}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {item.a}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">还有其他问题？</h2>
            <p className="mb-6 text-white/90">
              我们的客服团队随时为您提供帮助
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/support">
                <Button size="lg" variant="secondary" className="gap-2">
                  <MessageCircle className="h-5 w-5" />
                  在线客服
                </Button>
              </Link>
              <a href="mailto:support@example.com">
                <Button size="lg" variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 border-white/30 text-white">
                  <Mail className="h-5 w-5" />
                  发送邮件
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
