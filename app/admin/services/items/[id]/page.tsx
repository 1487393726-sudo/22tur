"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
}

export default function EditServiceItemPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    basePrice: "",
    unit: "",
    deliveryDays: "",
    features: "",
    isActive: true,
    sortOrder: "0",
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [serviceRes, categoriesRes] = await Promise.all([
        fetch(`/api/services/items/${params.id}`),
        fetch("/api/services/categories"),
      ]);

      if (serviceRes.ok) {
        const service = await serviceRes.json();
        setFormData({
          name: service.name || "",
          nameEn: service.nameEn || "",
          description: service.description || "",
          descriptionEn: service.descriptionEn || "",
          categoryId: service.categoryId || "",
          minPrice: service.minPrice?.toString() || "",
          maxPrice: service.maxPrice?.toString() || "",
          basePrice: service.basePrice?.toString() || "",
          unit: service.unit || "",
          deliveryDays: service.deliveryDays?.toString() || "",
          features: service.features || "",
          isActive: service.isActive ?? true,
          sortOrder: service.sortOrder?.toString() || "0",
        });
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId) {
      alert("请填写必填字段");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        nameEn: formData.nameEn || null,
        description: formData.description || null,
        descriptionEn: formData.descriptionEn || null,
        categoryId: formData.categoryId,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        unit: formData.unit || null,
        deliveryDays: formData.deliveryDays ? parseInt(formData.deliveryDays) : null,
        features: formData.features || null,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder) || 0,
      };

      const res = await fetch(`/api/services/items/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/services/items");
      } else {
        const error = await res.json();
        alert(error.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RequireAuth adminOnly>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">编辑服务项目</h1>
            <p className="text-gray-400">修改服务项目信息</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">服务名称 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">英文名称</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">服务类目 *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="选择类目" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">服务描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">英文描述</Label>
                <Textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white">价格设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">最低价格</Label>
                  <Input
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">最高价格</Label>
                  <Input
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">基础价格</Label>
                  <Input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">计价单位</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">交付周期（天）</Label>
                  <Input
                    type="number"
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white">其他设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">服务特性（JSON格式）</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="bg-white/5 border-white/20 text-white font-mono text-sm"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">排序权重</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <Label className="text-white">上架状态</Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}
