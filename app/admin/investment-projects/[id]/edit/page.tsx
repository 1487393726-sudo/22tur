"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/investment/image-upload";
import { FileUpload } from "@/components/investment/file-upload";
import { FileList } from "@/components/investment/file-list";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDesc: "",
    investmentAmount: "",
    expectedReturn: "",
    duration: "",
    minInvestment: "",
    maxInvestment: "",
    targetAmount: "",
    category: "",
    riskLevel: "MEDIUM",
    status: "DRAFT",
  });

  // 加载项目数据
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/investment-projects/${projectId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "加载项目失败");
        }

        const project = data.project;
        setFormData({
          title: project.title || "",
          description: project.description || "",
          shortDesc: project.shortDesc || "",
          investmentAmount: project.investmentAmount?.toString() || "",
          expectedReturn: project.expectedReturn?.toString() || "",
          duration: project.duration?.toString() || "",
          minInvestment: project.minInvestment?.toString() || "",
          maxInvestment: project.maxInvestment?.toString() || "",
          targetAmount: project.targetAmount?.toString() || "",
          category: project.category || "",
          riskLevel: project.riskLevel || "MEDIUM",
          status: project.status || "DRAFT",
        });
      } catch (error: any) {
        setError(error.message || "加载项目失败");
      } finally {
        setLoadingData(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/investment-projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          investmentAmount: parseFloat(formData.investmentAmount),
          expectedReturn: parseFloat(formData.expectedReturn),
          duration: parseInt(formData.duration),
          minInvestment: formData.minInvestment
            ? parseFloat(formData.minInvestment)
            : undefined,
          maxInvestment: formData.maxInvestment
            ? parseFloat(formData.maxInvestment)
            : undefined,
          targetAmount: formData.targetAmount
            ? parseFloat(formData.targetAmount)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "更新项目失败");
      }

      router.push("/admin/investment-projects");
    } catch (error: any) {
      setError(error.message || "更新项目失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <h1 className="text-3xl font-bold">编辑投资项目</h1>
        <p className="text-gray-600 mt-1">修改项目信息</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  项目名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="例如：科技创新基金 A 轮"
                  required
                />
              </div>

              <div>
                <Label htmlFor="shortDesc">简短描述</Label>
                <Input
                  id="shortDesc"
                  value={formData.shortDesc}
                  onChange={(e) => handleChange("shortDesc", e.target.value)}
                  placeholder="一句话描述项目"
                  maxLength={500}
                />
              </div>

              <div>
                <Label htmlFor="description">
                  详细描述 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="详细描述项目内容、投资亮点、风险提示等"
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">项目分类</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    placeholder="例如：科技创新"
                  />
                </div>

                <div>
                  <Label htmlFor="riskLevel">风险等级</Label>
                  <Select
                    value={formData.riskLevel}
                    onValueChange={(value) => handleChange("riskLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">低风险</SelectItem>
                      <SelectItem value="MEDIUM">中风险</SelectItem>
                      <SelectItem value="HIGH">高风险</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 投资信息 */}
          <Card>
            <CardHeader>
              <CardTitle>投资信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investmentAmount">
                    投资金额 (元) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) =>
                      handleChange("investmentAmount", e.target.value)
                    }
                    placeholder="100000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expectedReturn">
                    预期回报率 (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expectedReturn"
                    type="number"
                    step="0.1"
                    value={formData.expectedReturn}
                    onChange={(e) =>
                      handleChange("expectedReturn", e.target.value)
                    }
                    placeholder="15.0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">
                    投资期限 (月) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    placeholder="12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minInvestment">最小投资额 (元)</Label>
                  <Input
                    id="minInvestment"
                    type="number"
                    value={formData.minInvestment}
                    onChange={(e) =>
                      handleChange("minInvestment", e.target.value)
                    }
                    placeholder="10000"
                  />
                </div>

                <div>
                  <Label htmlFor="maxInvestment">最大投资额 (元)</Label>
                  <Input
                    id="maxInvestment"
                    type="number"
                    value={formData.maxInvestment}
                    onChange={(e) =>
                      handleChange("maxInvestment", e.target.value)
                    }
                    placeholder="500000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="targetAmount">目标筹集金额 (元)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => handleChange("targetAmount", e.target.value)}
                  placeholder="5000000"
                />
              </div>
            </CardContent>
          </Card>

          {/* 状态 */}
          <Card>
            <CardHeader>
              <CardTitle>项目状态</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="status">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                  <SelectItem value="ACTIVE">活跃</SelectItem>
                  <SelectItem value="CLOSED">关闭</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-2">
                草稿状态的项目不会在前台显示
              </p>
            </CardContent>
          </Card>

          {/* 项目图片 */}
          <Card>
            <CardHeader>
              <CardTitle>项目图片</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                projectId={projectId}
                onUploadSuccess={(url) => {
                  console.log("图片上传成功:", url);
                }}
              />
            </CardContent>
          </Card>

          {/* 项目文件 */}
          <Card>
            <CardHeader>
              <CardTitle>上传文件</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                projectId={projectId}
                onUploadSuccess={(file) => {
                  console.log("文件上传成功:", file);
                }}
              />
            </CardContent>
          </Card>

          {/* 文件列表 */}
          <Card>
            <CardHeader>
              <CardTitle>已上传文件</CardTitle>
            </CardHeader>
            <CardContent>
              <FileList projectId={projectId} editable={true} />
            </CardContent>
          </Card>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "保存中..." : "保存更改"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
