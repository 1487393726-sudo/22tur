"use client";

import Link from "next/link";
import {
  ShoppingCart,
  FileText,
  FolderKanban,
  ClipboardList,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    href: "/client/orders",
    label: "我的订单",
    description: "查看和管理您的服务订单",
    icon: ClipboardList,
    color: "text-blue-500",
  },
  {
    href: "/client/projects",
    label: "项目进度",
    description: "跟踪项目里程碑和进度",
    icon: FolderKanban,
    color: "text-purple-500",
  },
  {
    href: "/client/contracts",
    label: "我的合同",
    description: "查看和签署服务合同",
    icon: FileText,
    color: "text-green-500",
  },
  {
    href: "/client/cart",
    label: "购物车",
    description: "查看待结算的服务项目",
    icon: ShoppingCart,
    color: "text-orange-500",
  },
  {
    href: "/appointments",
    label: "预约咨询",
    description: "预约专业咨询服务",
    icon: Calendar,
    color: "text-cyan-500",
  },
];

export default function ClientPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">欢迎来到客户中心</h1>
        <p className="text-muted-foreground mt-2">
          在这里您可以管理订单、查看项目进度、签署合同等
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted ${link.color}`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {link.label}
                  </CardTitle>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
        <h2 className="text-xl font-semibold mb-2">需要帮助？</h2>
        <p className="text-muted-foreground mb-4">
          如果您有任何问题，可以预约咨询或联系我们的客服团队
        </p>
        <div className="flex gap-4">
          <Link
            href="/appointments"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            预约咨询
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            联系客服
          </Link>
        </div>
      </div>
    </div>
  );
}
