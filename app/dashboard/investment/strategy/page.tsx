"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Target,
  Lightbulb,
  TrendingUp,
  Shield,
  DollarSign,
} from "lucide-react";

interface Strategy {
  id: string;
  title: string;
  description: string;
  type: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
  expectedReturn: string;
  riskLevel: string;
  minInvestment: string;
  features: string[];
}

const strategies: Strategy[] = [
  {
    id: "1",
    title: "稳健型投资策略",
    description: "适合风险承受能力较低的投资者，追求稳定收益",
    type: "CONSERVATIVE",
    expectedReturn: "6-8%",
    riskLevel: "低风险",
    minInvestment: "¥50,000",
    features: [
      "投资低风险项目为主",
      "收益稳定可预期",
      "适合长期持有",
      "风险控制严格",
    ],
  },
  {
    id: "2",
    title: "平衡型投资策略",
    description: "平衡收益与风险，适合大多数投资者",
    type: "MODERATE",
    expectedReturn: "10-15%",
    riskLevel: "中等风险",
    minInvestment: "¥100,000",
    features: [
      "多元化投资组合",
      "收益与风险平衡",
      "定期调整配置",
      "适合中期持有",
    ],
  },
  {
    id: "3",
    title: "进取型投资策略",
    description: "追求高收益，适合风险承受能力强的投资者",
    type: "AGGRESSIVE",
    expectedReturn: "15-25%",
    riskLevel: "高风险",
    minInvestment: "¥200,000",
    features: [
      "投资高成长性项目",
      "追求高收益回报",
      "需要密切关注市场",
      "适合有经验的投资者",
    ],
  },
];

export default function InvestmentStrategyPage() {
  const router = useRouter();
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const getStrategyColor = (type: string) => {
    switch (type) {
      case "CONSERVATIVE":
        return "border-green-500 bg-green-50";
      case "MODERATE":
        return "border-yellow-500 bg-yellow-50";
      case "AGGRESSIVE":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="purple-gradient-title text-3xl font-bold mb-2 flex items-center gap-2">
          <Target className="h-8 w-8" />
          投资策略
        </h1>
        <p className="purple-gradient-text">
          选择适合您的投资策略，优化投资组合配置
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card
            key={strategy.id}
            className={`purple-gradient-card cursor-pointer transition-all hover:shadow-lg ${
              selectedStrategy === strategy.id ? getStrategyColor(strategy.type) : ""
            }`}
            onClick={() => setSelectedStrategy(strategy.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="purple-gradient-title text-xl">{strategy.title}</CardTitle>
                {strategy.type === "CONSERVATIVE" && (
                  <Shield className="h-5 w-5 text-green-500" />
                )}
                {strategy.type === "MODERATE" && (
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                )}
                {strategy.type === "AGGRESSIVE" && (
                  <Lightbulb className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="purple-gradient-text text-sm">{strategy.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="purple-gradient-text">预期收益</p>
                    <p className="purple-gradient-title font-semibold text-green-500">{strategy.expectedReturn}</p>
                  </div>
                  <div>
                    <p className="purple-gradient-text">风险等级</p>
                    <p className="purple-gradient-title font-semibold">{strategy.riskLevel}</p>
                  </div>
                </div>
                <div>
                  <p className="purple-gradient-text text-sm mb-2">最低投资额</p>
                  <p className="purple-gradient-title font-semibold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {strategy.minInvestment}
                  </p>
                </div>
                <div>
                  <p className="purple-gradient-text text-sm font-medium mb-2">策略特点：</p>
                  <ul className="space-y-1">
                    {strategy.features.map((feature, index) => (
                      <li key={index} className="purple-gradient-text text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  className="w-full"
                  variant={selectedStrategy === strategy.id ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    // 这里可以添加应用策略的逻辑
                  }}
                >
                  {selectedStrategy === strategy.id ? "已选择" : "选择此策略"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStrategy && (
        <Card className="purple-gradient-card">
          <CardHeader>
            <CardTitle className="purple-gradient-title">策略应用建议</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="purple-gradient-text">
              您已选择投资策略。建议您根据自身风险承受能力和投资目标，合理配置投资组合。
              如需专业咨询，请联系我们的投资顾问。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
