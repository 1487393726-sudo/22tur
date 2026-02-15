"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Calendar,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types/services";

interface ServiceDetailProps {
  service: Service;
  category: string;
  onConsult?: (service: Service) => void;
  onAppointment?: (service: Service) => void;
}

export function ServiceDetail({
  service,
  category,
  onConsult,
  onAppointment,
}: ServiceDetailProps) {
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: service.title,
          text: service.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (error) {
      console.error("分享失败:", error);
    }
  };

  const handleConsult = () => {
    if (onConsult) {
      onConsult(service);
    }
  };

  const handleAppointment = () => {
    if (onAppointment) {
      onAppointment(service);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {service.popular && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  热门服务
                </Badge>
              )}
              <Badge variant="outline">{category}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {service.title}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full"
            title="分享"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {isShared && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-green-600 dark:text-green-400"
          >
            ✓ 已复制到剪贴板
          </motion.p>
        )}
      </div>

      {/* Description */}
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        {service.description}
      </p>

      {/* Key Info Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 p-6 bg-muted/50 rounded-lg border border-border/50">
        {/* Price Range */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">价格范围</h3>
          </div>
          <p className="text-2xl font-bold text-primary">
            ¥{service.priceRange.min.toLocaleString()} - ¥
            {service.priceRange.max.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {service.priceRange.unit}
          </p>
        </div>

        {/* Delivery Time */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">交付周期</h3>
          </div>
          <p className="text-2xl font-bold text-primary">
            {service.deliveryTime}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            从项目启动到完成
          </p>
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">服务类别</h3>
          </div>
          <p className="text-2xl font-bold text-primary capitalize">
            {category}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            专业团队提供
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          服务包含内容
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {service.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 mb-8"
      >
        <h3 className="text-2xl font-bold text-foreground mb-4">
          对这项服务感兴趣？
        </h3>
        <p className="text-muted-foreground mb-6">
          我们的专业团队随时准备为您提供详细咨询和定制方案。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            onClick={handleConsult}
          >
            <MessageSquare className="w-5 h-5" />
            在线咨询
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={handleAppointment}
          >
            <Calendar className="w-5 h-5" />
            预约咨询
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="gap-2"
            asChild
          >
            <Link href={`/cases?category=${category}`}>
              查看案例
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Additional Info */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Process */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            服务流程
          </h3>
          <ol className="space-y-3">
            {[
              "需求沟通与评估",
              "方案设计与报价",
              "项目启动与执行",
              "定期进度汇报",
              "交付与验收",
              "后期支持与维护",
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Why Choose Us */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            为什么选择我们
          </h3>
          <ul className="space-y-3">
            {[
              "专业的团队，平均经验10年以上",
              "完整的项目管理体系",
              "透明的沟通和定期汇报",
              "质量保证和售后支持",
              "合理的价格和灵活的付款方式",
              "成功案例和客户推荐",
            ].map((reason, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default ServiceDetail;
