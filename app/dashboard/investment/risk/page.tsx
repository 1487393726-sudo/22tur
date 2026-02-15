"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface RiskAssessment {
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  riskScore: number;
  factors: {
    name: string;
    level: "LOW" | "MEDIUM" | "HIGH";
    description: string;
  }[];
  recommendations: string[];
}

export default function RiskAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // 模拟风险评估数据
    const mockAssessment: RiskAssessment = {
      overallRisk: "MEDIUM",
      riskScore: 65,
      factors: [
        {
          name: "投资分散度",
          level: "MEDIUM",
          description: "您的投资分布在多个项目中，但仍有优化空间",
        },
        {
          name: "项目风险等级",
          level: "MEDIUM",
          description: "部分投资项目属于中等风险等级",
        },
        {
          name: "投资期限",
          level: "LOW",
          description: "投资期限合理，流动性风险较低",
        },
        {
          name: "市场波动",
          level: "HIGH",
          description: "当前市场波动较大，需要密切关注",
        },
      ],
      recommendations: [
        "建议增加低风险投资项目的比例",
        "定期审查投资组合，及时调整配置",
        "关注市场动态，做好风险预警",
        "考虑增加投资分散度，降低单一项目风险",
      ],
    };

    setTimeout(() => {
      setAssessment(mockAssessment);
      setLoading(false);
    }, 1000);
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HIGH":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "LOW":
        return "低风险";
      case "MEDIUM":
        return "中等风险";
      case "HIGH":
        return "高风险";
      default:
        return "未知";
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
          <Shield className="h-8 w-8" />
          风险评估
        </h1>
        <p className="purple-gradient-text">
          评估您的投资组合风险水平，获取专业建议
        </p>
      </div>

      {assessment && (
        <>
          {/* 总体风险评估 */}
          <Card className="purple-gradient-card">
            <CardHeader>
              <CardTitle className="purple-gradient-title flex items-center gap-2">
                <Shield className="h-5 w-5" />
                总体风险评估
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="purple-gradient-text text-sm font-medium">风险评分</span>
                    <span className="purple-gradient-title text-lg font-bold">{assessment.riskScore}/100</span>
                  </div>
                  <Progress value={assessment.riskScore} className="h-2" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="purple-gradient-text text-sm">风险等级：</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                      assessment.overallRisk
                    )}`}
                  >
                    {getRiskLabel(assessment.overallRisk)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 风险因素分析 */}
          <Card className="purple-gradient-card">
            <CardHeader>
              <CardTitle className="purple-gradient-title flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                风险因素分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.factors.map((factor, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="purple-gradient-title font-semibold">{factor.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(
                          factor.level
                        )}`}
                      >
                        {getRiskLabel(factor.level)}
                      </span>
                    </div>
                    <p className="purple-gradient-text text-sm">{factor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 风险建议 */}
          <Card className="purple-gradient-card">
            <CardHeader>
              <CardTitle className="purple-gradient-title flex items-center gap-2">
                <Info className="h-5 w-5" />
                风险优化建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="purple-gradient-text text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
