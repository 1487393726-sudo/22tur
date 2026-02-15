"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  Star,
  Home,
  Info,
  Video,
  MessageSquare,
  MousePointer,
  Phone,
  Navigation,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { SOCIAL_PLATFORMS, BUTTON_VARIANTS, COMMON_ICONS } from "@/lib/homepage/utils";

// Hero Tab Component
function HeroTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage/hero")
      .then(res => res.json())
      .then(result => { setData(result.data || {}); setLoading(false); })
      .catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("保存成功");
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文标题</Label><Input value={data?.title || ""} onChange={e => setData({...data, title: e.target.value})} /></div>
        <div><Label>英文标题</Label><Input value={data?.titleEn || ""} onChange={e => setData({...data, titleEn: e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文副标题</Label><Textarea value={data?.subtitle || ""} onChange={e => setData({...data, subtitle: e.target.value})} /></div>
        <div><Label>英文副标题</Label><Textarea value={data?.subtitleEn || ""} onChange={e => setData({...data, subtitleEn: e.target.value})} /></div>
      </div>
      <div><Label>背景图片URL</Label><Input value={data?.backgroundImage || ""} onChange={e => setData({...data, backgroundImage: e.target.value})} /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>主按钮文字（中文）</Label><Input value={data?.ctaText || ""} onChange={e => setData({...data, ctaText: e.target.value})} /></div>
        <div><Label>主按钮文字（英文）</Label><Input value={data?.ctaTextEn || ""} onChange={e => setData({...data, ctaTextEn: e.target.value})} /></div>
        <div><Label>主按钮链接</Label><Input value={data?.ctaLink || ""} onChange={e => setData({...data, ctaLink: e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>次按钮文字（中文）</Label><Input value={data?.ctaSecondaryText || ""} onChange={e => setData({...data, ctaSecondaryText: e.target.value})} /></div>
        <div><Label>次按钮文字（英文）</Label><Input value={data?.ctaSecondaryTextEn || ""} onChange={e => setData({...data, ctaSecondaryTextEn: e.target.value})} /></div>
        <div><Label>次按钮链接</Label><Input value={data?.ctaSecondaryLink || ""} onChange={e => setData({...data, ctaSecondaryLink: e.target.value})} /></div>
      </div>
      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}保存</Button>
    </div>
  );
}


// About Tab Component
function AboutTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage/about")
      .then(res => res.json())
      .then(result => { setData(result.data || { stats: [], features: [] }); setLoading(false); })
      .catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("保存成功");
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  };

  const addStat = () => setData({...data, stats: [...(data.stats || []), { label: "", labelEn: "", value: "", icon: "" }]});
  const removeStat = (i: number) => setData({...data, stats: data.stats.filter((_: any, idx: number) => idx !== i)});
  const updateStat = (i: number, field: string, value: string) => {
    const stats = [...data.stats];
    stats[i] = {...stats[i], [field]: value};
    setData({...data, stats});
  };

  const addFeature = () => setData({...data, features: [...(data.features || []), { title: "", titleEn: "", description: "", descriptionEn: "", icon: "" }]});
  const removeFeature = (i: number) => setData({...data, features: data.features.filter((_: any, idx: number) => idx !== i)});
  const updateFeature = (i: number, field: string, value: string) => {
    const features = [...data.features];
    features[i] = {...features[i], [field]: value};
    setData({...data, features});
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文标题</Label><Input value={data?.title || ""} onChange={e => setData({...data, title: e.target.value})} /></div>
        <div><Label>英文标题</Label><Input value={data?.titleEn || ""} onChange={e => setData({...data, titleEn: e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文描述</Label><Textarea value={data?.description || ""} onChange={e => setData({...data, description: e.target.value})} /></div>
        <div><Label>英文描述</Label><Textarea value={data?.descriptionEn || ""} onChange={e => setData({...data, descriptionEn: e.target.value})} /></div>
      </div>
      <div><Label>图片URL</Label><Input value={data?.image || ""} onChange={e => setData({...data, image: e.target.value})} /></div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">统计数据</CardTitle>
          <Button size="sm" onClick={addStat}><Plus className="h-4 w-4 mr-1" />添加</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.stats || []).map((stat: any, i: number) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-end">
              <div><Label>标签</Label><Input value={stat.label} onChange={e => updateStat(i, "label", e.target.value)} /></div>
              <div><Label>英文标签</Label><Input value={stat.labelEn} onChange={e => updateStat(i, "labelEn", e.target.value)} /></div>
              <div><Label>数值</Label><Input value={stat.value} onChange={e => updateStat(i, "value", e.target.value)} /></div>
              <div><Label>图标</Label><Input value={stat.icon || ""} onChange={e => updateStat(i, "icon", e.target.value)} /></div>
              <Button variant="ghost" size="sm" onClick={() => removeStat(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">特色列表</CardTitle>
          <Button size="sm" onClick={addFeature}><Plus className="h-4 w-4 mr-1" />添加</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.features || []).map((feature: any, i: number) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-end">
              <div><Label>标题</Label><Input value={feature.title} onChange={e => updateFeature(i, "title", e.target.value)} /></div>
              <div><Label>英文标题</Label><Input value={feature.titleEn} onChange={e => updateFeature(i, "titleEn", e.target.value)} /></div>
              <div><Label>描述</Label><Input value={feature.description || ""} onChange={e => updateFeature(i, "description", e.target.value)} /></div>
              <div><Label>图标</Label><Input value={feature.icon || ""} onChange={e => updateFeature(i, "icon", e.target.value)} /></div>
              <Button variant="ghost" size="sm" onClick={() => removeFeature(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}保存</Button>
    </div>
  );
}

// Video Tab Component
function VideoTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage/video")
      .then(res => res.json())
      .then(result => { setData(result.data || {}); setLoading(false); })
      .catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage/video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("保存成功");
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><Label>视频URL（支持YouTube、Vimeo、Bilibili）</Label><Input value={data?.videoUrl || ""} onChange={e => setData({...data, videoUrl: e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文标题</Label><Input value={data?.title || ""} onChange={e => setData({...data, title: e.target.value})} /></div>
        <div><Label>英文标题</Label><Input value={data?.titleEn || ""} onChange={e => setData({...data, titleEn: e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文描述</Label><Textarea value={data?.description || ""} onChange={e => setData({...data, description: e.target.value})} /></div>
        <div><Label>英文描述</Label><Textarea value={data?.descriptionEn || ""} onChange={e => setData({...data, descriptionEn: e.target.value})} /></div>
      </div>
      <div><Label>缩略图URL</Label><Input value={data?.thumbnail || ""} onChange={e => setData({...data, thumbnail: e.target.value})} /></div>
      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}保存</Button>
    </div>
  );
}


// Testimonials Tab Component
function TestimonialsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", nameEn: "", avatar: "", company: "", companyEn: "", position: "", positionEn: "", content: "", contentEn: "", rating: 5 });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/homepage/testimonials");
      const data = await res.json();
      setItems(data.data || []);
    } catch { toast.error("加载失败"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    try {
      const url = editingItem ? `/api/admin/homepage/testimonials/${editingItem.id}` : "/api/admin/homepage/testimonials";
      const res = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) { toast.success(editingItem ? "更新成功" : "创建成功"); setDialogOpen(false); fetchItems(); }
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除？")) return;
    try {
      await fetch(`/api/admin/homepage/testimonials/${id}`, { method: "DELETE" });
      toast.success("删除成功");
      fetchItems();
    } catch { toast.error("删除失败"); }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ name: "", nameEn: "", avatar: "", company: "", companyEn: "", position: "", positionEn: "", content: "", contentEn: "", rating: 5 });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, nameEn: item.nameEn || "", avatar: item.avatar || "", company: item.company || "", companyEn: item.companyEn || "", position: item.position || "", positionEn: item.positionEn || "", content: item.content, contentEn: item.contentEn, rating: item.rating });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">客户评价</h3>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />添加评价</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {item.avatar && <img src={item.avatar} alt="" className="w-12 h-12 rounded-full" />}
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.company} · {item.position}</div>
                </div>
              </div>
              <p className="text-sm line-clamp-3">{item.content}</p>
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map(n => <Star key={n} className={`h-4 w-4 ${n <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingItem ? "编辑评价" : "添加评价"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>姓名</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><Label>英文姓名</Label><Input value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} /></div>
            </div>
            <div><Label>头像URL</Label><Input value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>公司</Label><Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
              <div><Label>英文公司</Label><Input value={formData.companyEn} onChange={e => setFormData({...formData, companyEn: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>职位</Label><Input value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} /></div>
              <div><Label>英文职位</Label><Input value={formData.positionEn} onChange={e => setFormData({...formData, positionEn: e.target.value})} /></div>
            </div>
            <div><Label>评价内容（中文）</Label><Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} /></div>
            <div><Label>评价内容（英文）</Label><Textarea value={formData.contentEn} onChange={e => setFormData({...formData, contentEn: e.target.value})} /></div>
            <div><Label>评分</Label>
              <Select value={String(formData.rating)} onValueChange={v => setFormData({...formData, rating: Number(v)})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} 星</SelectItem>)}</SelectContent>
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

// CTA Tab Component
function CTATab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage/cta")
      .then(res => res.json())
      .then(result => { setData(result.data || {}); setLoading(false); })
      .catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage/cta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("保存成功");
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文标题</Label><Input value={data?.title || ""} onChange={e => setData({...data, title: e.target.value})} /></div>
        <div><Label>英文标题</Label><Input value={data?.titleEn || ""} onChange={e => setData({...data, titleEn: e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文描述</Label><Textarea value={data?.description || ""} onChange={e => setData({...data, description: e.target.value})} /></div>
        <div><Label>英文描述</Label><Textarea value={data?.descriptionEn || ""} onChange={e => setData({...data, descriptionEn: e.target.value})} /></div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">主按钮</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <div><Label>文字（中文）</Label><Input value={data?.primaryBtnText || ""} onChange={e => setData({...data, primaryBtnText: e.target.value})} /></div>
          <div><Label>文字（英文）</Label><Input value={data?.primaryBtnTextEn || ""} onChange={e => setData({...data, primaryBtnTextEn: e.target.value})} /></div>
          <div><Label>链接</Label><Input value={data?.primaryBtnLink || ""} onChange={e => setData({...data, primaryBtnLink: e.target.value})} /></div>
          <div><Label>样式</Label>
            <Select value={data?.primaryBtnVariant || "primary"} onValueChange={v => setData({...data, primaryBtnVariant: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BUTTON_VARIANTS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">次按钮（可选）</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <div><Label>文字（中文）</Label><Input value={data?.secondaryBtnText || ""} onChange={e => setData({...data, secondaryBtnText: e.target.value})} /></div>
          <div><Label>文字（英文）</Label><Input value={data?.secondaryBtnTextEn || ""} onChange={e => setData({...data, secondaryBtnTextEn: e.target.value})} /></div>
          <div><Label>链接</Label><Input value={data?.secondaryBtnLink || ""} onChange={e => setData({...data, secondaryBtnLink: e.target.value})} /></div>
          <div><Label>样式</Label>
            <Select value={data?.secondaryBtnVariant || "secondary"} onValueChange={v => setData({...data, secondaryBtnVariant: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BUTTON_VARIANTS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}保存</Button>
    </div>
  );
}

// Contact Tab Component
function ContactTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage/contact")
      .then(res => res.json())
      .then(result => { setData(result.data || { socialLinks: [] }); setLoading(false); })
      .catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("保存成功");
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  };

  const addSocialLink = () => setData({...data, socialLinks: [...(data.socialLinks || []), { platform: "", url: "", icon: "" }]});
  const removeSocialLink = (i: number) => setData({...data, socialLinks: data.socialLinks.filter((_: any, idx: number) => idx !== i)});
  const updateSocialLink = (i: number, field: string, value: string) => {
    const socialLinks = [...data.socialLinks];
    socialLinks[i] = {...socialLinks[i], [field]: value};
    setData({...data, socialLinks});
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>中文地址</Label><Textarea value={data?.address || ""} onChange={e => setData({...data, address: e.target.value})} /></div>
        <div><Label>英文地址</Label><Textarea value={data?.addressEn || ""} onChange={e => setData({...data, addressEn: e.target.value})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>电话</Label><Input value={data?.phone || ""} onChange={e => setData({...data, phone: e.target.value})} /></div>
        <div><Label>邮箱</Label><Input value={data?.email || ""} onChange={e => setData({...data, email: e.target.value})} /></div>
      </div>
      <div><Label>地图嵌入URL</Label><Input value={data?.mapEmbedUrl || ""} onChange={e => setData({...data, mapEmbedUrl: e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>工作时间（中文）</Label><Input value={data?.workingHours || ""} onChange={e => setData({...data, workingHours: e.target.value})} /></div>
        <div><Label>工作时间（英文）</Label><Input value={data?.workingHoursEn || ""} onChange={e => setData({...data, workingHoursEn: e.target.value})} /></div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">社交媒体链接</CardTitle>
          <Button size="sm" onClick={addSocialLink}><Plus className="h-4 w-4 mr-1" />添加</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.socialLinks || []).map((link: any, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-2 items-end">
              <div><Label>平台</Label>
                <Select value={link.platform} onValueChange={v => updateSocialLink(i, "platform", v)}>
                  <SelectTrigger><SelectValue placeholder="选择平台" /></SelectTrigger>
                  <SelectContent>{SOCIAL_PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>链接</Label><Input value={link.url} onChange={e => updateSocialLink(i, "url", e.target.value)} /></div>
              <div><Label>图标</Label><Input value={link.icon || ""} onChange={e => updateSocialLink(i, "icon", e.target.value)} /></div>
              <Button variant="ghost" size="sm" onClick={() => removeSocialLink(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}保存</Button>
    </div>
  );
}

// Navbar Tab Component
function NavbarTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage/navbar")
      .then(res => res.json())
      .then(result => { setData(result.data || { menuItems: [], socialLinks: [] }); setLoading(false); })
      .catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage/navbar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("保存成功");
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  };

  const addMenuItem = () => setData({...data, menuItems: [...(data.menuItems || []), { label: "", labelEn: "", link: "", isActive: true }]});
  const removeMenuItem = (i: number) => setData({...data, menuItems: data.menuItems.filter((_: any, idx: number) => idx !== i)});
  const updateMenuItem = (i: number, field: string, value: any) => {
    const menuItems = [...data.menuItems];
    menuItems[i] = {...menuItems[i], [field]: value};
    setData({...data, menuItems});
  };

  // 社交媒体链接操作
  const addSocialLink = () => setData({...data, socialLinks: [...(data.socialLinks || []), { platform: "", url: "" }]});
  const removeSocialLink = (i: number) => setData({...data, socialLinks: data.socialLinks.filter((_: any, idx: number) => idx !== i)});
  const updateSocialLink = (i: number, field: string, value: any) => {
    const socialLinks = [...(data.socialLinks || [])];
    socialLinks[i] = {...socialLinks[i], [field]: value};
    setData({...data, socialLinks});
  };

  // 支持的社交媒体平台
  const socialPlatforms = [
    { value: "github", label: "GitHub" },
    { value: "twitter", label: "Twitter/X" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "bilibili", label: "哔哩哔哩" },
    { value: "weibo", label: "微博" },
    { value: "wechat", label: "微信" },
    { value: "douyin", label: "抖音" },
    { value: "xiaohongshu", label: "小红书" },
  ];

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Logo配置</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Logo URL</Label><Input value={data?.logoUrl || ""} onChange={e => setData({...data, logoUrl: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Logo Alt（中文）</Label><Input value={data?.logoAlt || ""} onChange={e => setData({...data, logoAlt: e.target.value})} /></div>
            <div><Label>Logo Alt（英文）</Label><Input value={data?.logoAltEn || ""} onChange={e => setData({...data, logoAltEn: e.target.value})} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">登录/注册按钮</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><Label>登录文字（中文）</Label><Input value={data?.loginText || ""} onChange={e => setData({...data, loginText: e.target.value})} /></div>
            <div><Label>登录文字（英文）</Label><Input value={data?.loginTextEn || ""} onChange={e => setData({...data, loginTextEn: e.target.value})} /></div>
            <div><Label>登录链接</Label><Input value={data?.loginLink || ""} onChange={e => setData({...data, loginLink: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>注册文字（中文）</Label><Input value={data?.registerText || ""} onChange={e => setData({...data, registerText: e.target.value})} /></div>
            <div><Label>注册文字（英文）</Label><Input value={data?.registerTextEn || ""} onChange={e => setData({...data, registerTextEn: e.target.value})} /></div>
            <div><Label>注册链接</Label><Input value={data?.registerLink || ""} onChange={e => setData({...data, registerLink: e.target.value})} /></div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">菜单项</CardTitle>
          <Button size="sm" onClick={addMenuItem}><Plus className="h-4 w-4 mr-1" />添加</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.menuItems || []).map((item: any, i: number) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-end">
              <div><Label>文字（中文）</Label><Input value={item.label} onChange={e => updateMenuItem(i, "label", e.target.value)} /></div>
              <div><Label>文字（英文）</Label><Input value={item.labelEn} onChange={e => updateMenuItem(i, "labelEn", e.target.value)} /></div>
              <div><Label>链接</Label><Input value={item.link} onChange={e => updateMenuItem(i, "link", e.target.value)} /></div>
              <div className="flex items-center gap-2"><Label>显示</Label><Switch checked={item.isActive !== false} onCheckedChange={v => updateMenuItem(i, "isActive", v)} /></div>
              <Button variant="ghost" size="sm" onClick={() => removeMenuItem(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">社交媒体链接</CardTitle>
          <Button size="sm" onClick={addSocialLink}><Plus className="h-4 w-4 mr-1" />添加</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">添加社交媒体链接，将显示在导航栏右侧</p>
          {(data?.socialLinks || []).map((link: any, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-2 items-end">
              <div>
                <Label htmlFor={`social-platform-${i}`}>平台</Label>
                <select 
                  id={`social-platform-${i}`}
                  title="选择社交媒体平台"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={link.platform} 
                  onChange={e => updateSocialLink(i, "platform", e.target.value)}
                >
                  <option value="">选择平台</option>
                  {socialPlatforms.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2"><Label>链接URL</Label><Input value={link.url} onChange={e => updateSocialLink(i, "url", e.target.value)} placeholder="https://" /></div>
              <Button variant="ghost" size="sm" onClick={() => removeSocialLink(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {(data?.socialLinks || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">暂无社交媒体链接，点击上方按钮添加</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}保存</Button>
    </div>
  );
}

// Footer Tab Component
function FooterTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage/footer")
      .then(res => res.json())
      .then(result => { setData(result.data || { sections: [], socialLinks: [] }); setLoading(false); })
      .catch(() => { toast.error("加载失败"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("保存成功");
      else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  };

  const addSection = () => setData({...data, sections: [...(data.sections || []), { title: "", titleEn: "", links: [] }]});
  const removeSection = (i: number) => setData({...data, sections: data.sections.filter((_: any, idx: number) => idx !== i)});
  const updateSection = (i: number, field: string, value: any) => {
    const sections = [...data.sections];
    sections[i] = {...sections[i], [field]: value};
    setData({...data, sections});
  };

  const addLink = (sectionIndex: number) => {
    const sections = [...data.sections];
    sections[sectionIndex].links = [...(sections[sectionIndex].links || []), { label: "", labelEn: "", url: "" }];
    setData({...data, sections});
  };
  const removeLink = (sectionIndex: number, linkIndex: number) => {
    const sections = [...data.sections];
    sections[sectionIndex].links = sections[sectionIndex].links.filter((_: any, idx: number) => idx !== linkIndex);
    setData({...data, sections});
  };
  const updateLink = (sectionIndex: number, linkIndex: number, field: string, value: string) => {
    const sections = [...data.sections];
    sections[sectionIndex].links[linkIndex] = {...sections[sectionIndex].links[linkIndex], [field]: value};
    setData({...data, sections});
  };

  const addSocialLink = () => setData({...data, socialLinks: [...(data.socialLinks || []), { platform: "", url: "", icon: "" }]});
  const removeSocialLink = (i: number) => setData({...data, socialLinks: data.socialLinks.filter((_: any, idx: number) => idx !== i)});
  const updateSocialLink = (i: number, field: string, value: string) => {
    const socialLinks = [...data.socialLinks];
    socialLinks[i] = {...socialLinks[i], [field]: value};
    setData({...data, socialLinks});
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>版权信息（中文）</Label><Input value={data?.copyrightText || ""} onChange={e => setData({...data, copyrightText: e.target.value})} placeholder="© 2024 公司名称" /></div>
        <div><Label>版权信息（英文）</Label><Input value={data?.copyrightTextEn || ""} onChange={e => setData({...data, copyrightTextEn: e.target.value})} placeholder="© 2024 Company Name" /></div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">链接分组</CardTitle>
          <Button size="sm" onClick={addSection}><Plus className="h-4 w-4 mr-1" />添加分组</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(data?.sections || []).map((section: any, si: number) => (
            <Card key={si}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="grid grid-cols-2 gap-2 flex-1 mr-4">
                  <Input placeholder="分组标题（中文）" value={section.title} onChange={e => updateSection(si, "title", e.target.value)} />
                  <Input placeholder="分组标题（英文）" value={section.titleEn} onChange={e => updateSection(si, "titleEn", e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => addLink(si)}><Plus className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeSection(si)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {(section.links || []).map((link: any, li: number) => (
                  <div key={li} className="grid grid-cols-4 gap-2 items-end">
                    <Input placeholder="链接文字（中文）" value={link.label} onChange={e => updateLink(si, li, "label", e.target.value)} />
                    <Input placeholder="链接文字（英文）" value={link.labelEn} onChange={e => updateLink(si, li, "labelEn", e.target.value)} />
                    <Input placeholder="URL" value={link.url} onChange={e => updateLink(si, li, "url", e.target.value)} />
                    <Button variant="ghost" size="sm" onClick={() => removeLink(si, li)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">社交媒体链接</CardTitle>
          <Button size="sm" onClick={addSocialLink}><Plus className="h-4 w-4 mr-1" />添加</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.socialLinks || []).map((link: any, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-2 items-end">
              <div><Label>平台</Label>
                <Select value={link.platform} onValueChange={v => updateSocialLink(i, "platform", v)}>
                  <SelectTrigger><SelectValue placeholder="选择平台" /></SelectTrigger>
                  <SelectContent>{SOCIAL_PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>链接</Label><Input value={link.url} onChange={e => updateSocialLink(i, "url", e.target.value)} /></div>
              <div><Label>图标</Label><Input value={link.icon || ""} onChange={e => updateSocialLink(i, "icon", e.target.value)} /></div>
              <Button variant="ghost" size="sm" onClick={() => removeSocialLink(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}保存</Button>
    </div>
  );
}

// Main Page Component
export default function HomepageEditorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">首页内容编辑</h1>
      </div>
      
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-8 bg-white/10 border-white/20 backdrop-blur-sm">
          <TabsTrigger value="hero" className="flex items-center gap-2"><Home className="h-4 w-4" />Hero</TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2"><Info className="h-4 w-4" />关于</TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2"><Video className="h-4 w-4" />视频</TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />评价</TabsTrigger>
          <TabsTrigger value="cta" className="flex items-center gap-2"><MousePointer className="h-4 w-4" />CTA</TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2"><Phone className="h-4 w-4" />联系</TabsTrigger>
          <TabsTrigger value="navbar" className="flex items-center gap-2"><Navigation className="h-4 w-4" />导航</TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2"><FileText className="h-4 w-4" />页脚</TabsTrigger>
        </TabsList>
        
        <Card className="mt-6 bg-white/5 border-white/10">
          <CardContent className="p-6">
            <TabsContent value="hero"><HeroTab /></TabsContent>
            <TabsContent value="about"><AboutTab /></TabsContent>
            <TabsContent value="video"><VideoTab /></TabsContent>
            <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
            <TabsContent value="cta"><CTATab /></TabsContent>
            <TabsContent value="contact"><ContactTab /></TabsContent>
            <TabsContent value="navbar"><NavbarTab /></TabsContent>
            <TabsContent value="footer"><FooterTab /></TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
