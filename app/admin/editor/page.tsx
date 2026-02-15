"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Store,
  Image,
  DollarSign,
  Briefcase,
  Loader2,
  GripVertical,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ServiceMarketItem,
  FeaturedWork,
  ServicePricing,
  ServiceProject,
} from "@/types/editor";
import { CONTENT_EDITOR_CATEGORIES, COMMON_ICONS } from "@/lib/editor/content-utils";


// ============================================
// 服务市场 Tab 组件
// ============================================
function ServiceMarketTab() {
  const [items, setItems] = useState<ServiceMarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceMarketItem | null>(null);
  const [formData, setFormData] = useState({
    name: "", nameEn: "", description: "", descriptionEn: "",
    price: 0, category: "web", iconType: "Code", order: 0, isActive: true,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/editor/service-market");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      toast.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    try {
      const url = editingItem
        ? `/api/admin/editor/service-market/${editingItem.id}`
        : "/api/admin/editor/service-market";
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("保存失败");
      toast.success(editingItem ? "更新成功" : "创建成功");
      setDialogOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      toast.error("保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除吗？")) return;
    try {
      await fetch(`/api/admin/editor/service-market/${id}`, { method: "DELETE" });
      toast.success("删除成功");
      fetchItems();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleToggleActive = async (item: ServiceMarketItem) => {
    try {
      await fetch(`/api/admin/editor/service-market/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchItems();
    } catch (error) {
      toast.error("更新失败");
    }
  };

  const openEditDialog = (item: ServiceMarketItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name, nameEn: item.nameEn, description: item.description,
      descriptionEn: item.descriptionEn, price: item.price, category: item.category,
      iconType: item.iconType, order: item.order, isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      name: "", nameEn: "", description: "", descriptionEn: "",
      price: 0, category: "web", iconType: "Code", order: 0, isActive: true,
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">服务市场项目</h3>
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" />添加项目</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>价格</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.nameEn}</div>
              </TableCell>
              <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
              <TableCell>¥{item.price.toLocaleString()}</TableCell>
              <TableCell>
                <Switch checked={item.isActive} onCheckedChange={() => handleToggleActive(item)} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "编辑项目" : "添加项目"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>中文名称</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>英文名称</Label><Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} /></div>
            </div>
            <div><Label>中文描述</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><Label>英文描述</Label><Textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>价格</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} /></div>
              <div>
                <Label>分类</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_EDITOR_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>图标</Label>
                <Select value={formData.iconType} onValueChange={(v) => setFormData({ ...formData, iconType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMON_ICONS.slice(0, 20).map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ============================================
// 精选作品 Tab 组件
// ============================================
function FeaturedWorksTab() {
  const [items, setItems] = useState<FeaturedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeaturedWork | null>(null);
  const [formData, setFormData] = useState({
    title: "", titleEn: "", slug: "", description: "", descriptionEn: "",
    image: "", images: "[]", author: "", teamName: "", category: "web",
    tags: "[]", viewCount: 0, likeCount: 0, featured: false, isActive: true, order: 0,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/editor/featured-works");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      toast.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    try {
      const url = editingItem
        ? `/api/admin/editor/featured-works/${editingItem.id}`
        : "/api/admin/editor/featured-works";
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "保存失败");
      }
      toast.success(editingItem ? "更新成功" : "创建成功");
      setDialogOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除吗？")) return;
    try {
      await fetch(`/api/admin/editor/featured-works/${id}`, { method: "DELETE" });
      toast.success("删除成功");
      fetchItems();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleToggleFeatured = async (item: FeaturedWork) => {
    try {
      await fetch(`/api/admin/editor/featured-works/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !item.featured }),
      });
      fetchItems();
    } catch (error) {
      toast.error("更新失败");
    }
  };

  const openEditDialog = (item: FeaturedWork) => {
    setEditingItem(item);
    setFormData({
      title: item.title, titleEn: item.titleEn, slug: item.slug,
      description: item.description, descriptionEn: item.descriptionEn,
      image: item.image, images: item.images, author: item.author,
      teamName: item.teamName, category: item.category, tags: item.tags,
      viewCount: item.viewCount, likeCount: item.likeCount,
      featured: item.featured, isActive: item.isActive, order: item.order,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      title: "", titleEn: "", slug: "", description: "", descriptionEn: "",
      image: "", images: "[]", author: "", teamName: "", category: "web",
      tags: "[]", viewCount: 0, likeCount: 0, featured: false, isActive: true, order: 0,
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">精选作品</h3>
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" />添加作品</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-40 bg-muted">
              {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
              {item.featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500"><Star className="h-3 w-3 mr-1" />精选</Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold truncate">{item.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{item.titleEn}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>👁 {item.viewCount}</span>
                <span>❤️ {item.likeCount}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => handleToggleFeatured(item)}>
                  {item.featured ? "取消精选" : "设为精选"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "编辑作品" : "添加作品"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>中文标题</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
              <div><Label>英文标题</Label><Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} /></div>
            </div>
            <div><Label>URL Slug</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="my-work-slug" /></div>
            <div><Label>中文描述</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><Label>英文描述</Label><Textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} /></div>
            <div><Label>封面图片URL</Label><Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>作者</Label><Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} /></div>
              <div><Label>团队名称</Label><Input value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} /></div>
            </div>
            <div>
              <Label>分类</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_EDITOR_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ============================================
// 服务定价 Tab 组件
// ============================================
function ServicePricingTab() {
  const [items, setItems] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServicePricing | null>(null);
  const [formData, setFormData] = useState({
    name: "", nameEn: "", description: "", descriptionEn: "",
    price: 0, originalPrice: 0, discountPercent: 0,
    features: "[]", featuresEn: "[]", category: "web",
    recommended: false, isActive: true, order: 0,
  });
  const [newFeature, setNewFeature] = useState("");
  const [newFeatureEn, setNewFeatureEn] = useState("");

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/editor/service-pricing");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      toast.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    try {
      const url = editingItem
        ? `/api/admin/editor/service-pricing/${editingItem.id}`
        : "/api/admin/editor/service-pricing";
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("保存失败");
      toast.success(editingItem ? "更新成功" : "创建成功");
      setDialogOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      toast.error("保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除吗？")) return;
    try {
      await fetch(`/api/admin/editor/service-pricing/${id}`, { method: "DELETE" });
      toast.success("删除成功");
      fetchItems();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleToggleRecommended = async (item: ServicePricing) => {
    try {
      await fetch(`/api/admin/editor/service-pricing/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommended: !item.recommended }),
      });
      fetchItems();
    } catch (error) {
      toast.error("更新失败");
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    const features = JSON.parse(formData.features || "[]");
    features.push(newFeature.trim());
    setFormData({ ...formData, features: JSON.stringify(features) });
    setNewFeature("");
  };

  const addFeatureEn = () => {
    if (!newFeatureEn.trim()) return;
    const featuresEn = JSON.parse(formData.featuresEn || "[]");
    featuresEn.push(newFeatureEn.trim());
    setFormData({ ...formData, featuresEn: JSON.stringify(featuresEn) });
    setNewFeatureEn("");
  };

  const removeFeature = (index: number) => {
    const features = JSON.parse(formData.features || "[]");
    features.splice(index, 1);
    setFormData({ ...formData, features: JSON.stringify(features) });
  };

  const openEditDialog = (item: ServicePricing) => {
    setEditingItem(item);
    setFormData({
      name: item.name, nameEn: item.nameEn, description: item.description,
      descriptionEn: item.descriptionEn, price: item.price, originalPrice: item.originalPrice,
      discountPercent: item.discountPercent, features: item.features, featuresEn: item.featuresEn,
      category: item.category, recommended: item.recommended, isActive: item.isActive, order: item.order,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      name: "", nameEn: "", description: "", descriptionEn: "",
      price: 0, originalPrice: 0, discountPercent: 0,
      features: "[]", featuresEn: "[]", category: "web",
      recommended: false, isActive: true, order: 0,
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">服务定价</h3>
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" />添加套餐</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>价格</TableHead>
            <TableHead>折扣</TableHead>
            <TableHead>推荐</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {item.recommended && <Badge className="bg-orange-500">热门</Badge>}
                  <div>
                    <div>{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.nameEn}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>¥{item.price.toLocaleString()}</div>
                {item.originalPrice > item.price && (
                  <div className="text-sm text-muted-foreground line-through">¥{item.originalPrice.toLocaleString()}</div>
                )}
              </TableCell>
              <TableCell>{item.discountPercent > 0 ? `${item.discountPercent}%` : "-"}</TableCell>
              <TableCell>
                <Switch checked={item.recommended} onCheckedChange={() => handleToggleRecommended(item)} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "编辑套餐" : "添加套餐"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>中文名称</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>英文名称</Label><Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} /></div>
            </div>
            <div><Label>中文描述</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><Label>英文描述</Label><Textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>现价</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} /></div>
              <div><Label>原价</Label><Input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })} /></div>
              <div><Label>折扣%</Label><Input type="number" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>功能列表（中文）</Label>
              <div className="flex gap-2 mt-1">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="输入功能" />
                <Button type="button" onClick={addFeature}>添加</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {JSON.parse(formData.features || "[]").map((f: string, i: number) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(i)}>{f} ×</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ============================================
// 服务项目 Tab 组件
// ============================================
function ServiceProjectsTab() {
  const [items, setItems] = useState<ServiceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceProject | null>(null);
  const [formData, setFormData] = useState({
    name: "", nameEn: "", description: "", descriptionEn: "",
    startingPrice: "", iconName: "Code", categoryTag: "", order: 0, isActive: true,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/editor/service-projects");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      toast.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    try {
      const url = editingItem
        ? `/api/admin/editor/service-projects/${editingItem.id}`
        : "/api/admin/editor/service-projects";
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("保存失败");
      toast.success(editingItem ? "更新成功" : "创建成功");
      setDialogOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      toast.error("保存失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除吗？")) return;
    try {
      await fetch(`/api/admin/editor/service-projects/${id}`, { method: "DELETE" });
      toast.success("删除成功");
      fetchItems();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleToggleActive = async (item: ServiceProject) => {
    try {
      await fetch(`/api/admin/editor/service-projects/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchItems();
    } catch (error) {
      toast.error("更新失败");
    }
  };

  const openEditDialog = (item: ServiceProject) => {
    setEditingItem(item);
    setFormData({
      name: item.name, nameEn: item.nameEn, description: item.description,
      descriptionEn: item.descriptionEn, startingPrice: item.startingPrice,
      iconName: item.iconName, categoryTag: item.categoryTag, order: item.order, isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      name: "", nameEn: "", description: "", descriptionEn: "",
      startingPrice: "", iconName: "Code", categoryTag: "", order: 0, isActive: true,
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">服务项目</h3>
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" />添加项目</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">排序</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>起始价格</TableHead>
            <TableHead>图标</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-move" /></TableCell>
              <TableCell>
                <div>{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.nameEn}</div>
              </TableCell>
              <TableCell>{item.startingPrice}</TableCell>
              <TableCell><Badge variant="outline">{item.iconName}</Badge></TableCell>
              <TableCell>
                <Switch checked={item.isActive} onCheckedChange={() => handleToggleActive(item)} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "编辑项目" : "添加项目"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>中文名称</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>英文名称</Label><Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} /></div>
            </div>
            <div><Label>中文描述</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><Label>英文描述</Label><Textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>起始价格</Label><Input value={formData.startingPrice} onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })} placeholder="Starting from $5,000" /></div>
              <div>
                <Label>图标</Label>
                <Select value={formData.iconName} onValueChange={(v) => setFormData({ ...formData, iconName: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMON_ICONS.slice(0, 30).map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>分类标签</Label><Input value={formData.categoryTag} onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ============================================
// 主页面组件
// ============================================
export default function ContentEditorPage() {
  const t = useTranslations("admin.editor");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-gray-400 mt-1">{t("description")}</p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <Tabs defaultValue="service-market" className="w-full">
            <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-4 mb-6 bg-white/10 border-white/20 backdrop-blur-sm">
              <TabsTrigger value="service-market" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                {t("tabs.serviceMarket")}
              </TabsTrigger>
              <TabsTrigger value="featured-works" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                {t("tabs.featuredWorks")}
              </TabsTrigger>
              <TabsTrigger value="service-pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t("tabs.servicePricing")}
              </TabsTrigger>
              <TabsTrigger value="service-projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {t("tabs.serviceProjects")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="service-market">
              <ServiceMarketTab />
            </TabsContent>

            <TabsContent value="featured-works">
              <FeaturedWorksTab />
            </TabsContent>

            <TabsContent value="service-pricing">
              <ServicePricingTab />
            </TabsContent>

            <TabsContent value="service-projects">
              <ServiceProjectsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
