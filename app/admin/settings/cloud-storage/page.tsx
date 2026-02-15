'use client';

/**
 * Cloud Storage Settings Page
 * 云存储配置管理页面
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, TestTube, Cloud, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CloudStorageConfig {
  id: string;
  name: string;
  provider: string;
  region: string;
  bucket: string;
  cdnDomain?: string;
  status: string;
  createdAt: string;
}

const PROVIDERS = [
  { value: 'aliyun-oss', label: '阿里云 OSS' },
  { value: 'tencent-cos', label: '腾讯云 COS' },
];

const REGIONS = {
  'aliyun-oss': [
    { value: 'oss-cn-hangzhou', label: '华东1（杭州）' },
    { value: 'oss-cn-shanghai', label: '华东2（上海）' },
    { value: 'oss-cn-beijing', label: '华北2（北京）' },
    { value: 'oss-cn-shenzhen', label: '华南1（深圳）' },
    { value: 'oss-cn-guangzhou', label: '华南2（广州）' },
    { value: 'oss-cn-chengdu', label: '西南1（成都）' },
    { value: 'oss-cn-hongkong', label: '中国香港' },
  ],
  'tencent-cos': [
    { value: 'ap-beijing', label: '北京' },
    { value: 'ap-shanghai', label: '上海' },
    { value: 'ap-guangzhou', label: '广州' },
    { value: 'ap-chengdu', label: '成都' },
    { value: 'ap-chongqing', label: '重庆' },
    { value: 'ap-hongkong', label: '中国香港' },
    { value: 'ap-singapore', label: '新加坡' },
  ],
};

export default function CloudStorageSettingsPage() {
  const [configs, setConfigs] = useState<CloudStorageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    provider: 'aliyun-oss',
    region: '',
    bucket: '',
    accessKeyId: '',
    accessKeySecret: '',
    cdnDomain: '',
    endpoint: '',
    internal: false,
  });

  // 加载配置列表
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/cloud-storage');
      const data = await response.json();
      if (data.configs) {
        setConfigs(data.configs);
      }
    } catch (error) {
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const handleTest = async (configId?: string) => {
    setTesting(configId || 'new');
    try {
      const response = await fetch('/api/admin/cloud-storage/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('连接测试成功');
      } else {
        toast.error(data.error || '连接测试失败');
      }
    } catch (error) {
      toast.error('连接测试失败');
    } finally {
      setTesting(null);
    }
  };

  // 保存配置
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/cloud-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('配置保存成功');
        setShowForm(false);
        resetForm();
        fetchConfigs();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 删除配置
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此配置吗？')) return;
    try {
      const response = await fetch(`/api/admin/cloud-storage?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('配置已删除');
        fetchConfigs();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'aliyun-oss',
      region: '',
      bucket: '',
      accessKeyId: '',
      accessKeySecret: '',
      cdnDomain: '',
      endpoint: '',
      internal: false,
    });
  };

  const currentRegions = REGIONS[formData.provider as keyof typeof REGIONS] || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">云存储配置</h1>
          <p className="text-muted-foreground">管理云存储服务配置，支持阿里云 OSS 和腾讯云 COS</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" />
          添加配置
        </Button>
      </div>

      {/* 配置表单 */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>新建云存储配置</CardTitle>
            <CardDescription>配置云存储服务的访问凭证和参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>配置名称</Label>
                <Input
                  placeholder="例如：主存储"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>云服务商</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value, region: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>区域</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择区域" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentRegions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>存储桶名称</Label>
                <Input
                  placeholder="bucket-name"
                  value={formData.bucket}
                  onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Access Key ID</Label>
                <Input
                  type="password"
                  placeholder="访问密钥 ID"
                  value={formData.accessKeyId}
                  onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Access Key Secret</Label>
                <Input
                  type="password"
                  placeholder="访问密钥"
                  value={formData.accessKeySecret}
                  onChange={(e) => setFormData({ ...formData, accessKeySecret: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CDN 域名（可选）</Label>
                <Input
                  placeholder="cdn.example.com"
                  value={formData.cdnDomain}
                  onChange={(e) => setFormData({ ...formData, cdnDomain: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>自定义端点（可选）</Label>
                <Input
                  placeholder="https://custom-endpoint.com"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.internal}
                onCheckedChange={(checked) => setFormData({ ...formData, internal: checked })}
              />
              <Label>使用内网访问</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                取消
              </Button>
              <Button variant="outline" onClick={() => handleTest()} disabled={testing === 'new'}>
                {testing === 'new' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                测试连接
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                保存配置
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 配置列表 */}
      <Card>
        <CardHeader>
          <CardTitle>已配置的云存储</CardTitle>
          <CardDescription>管理现有的云存储配置</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无云存储配置</p>
              <p className="text-sm">点击上方按钮添加新配置</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Cloud className="w-8 h-8 text-primary" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{config.name}</span>
                        <Badge variant={config.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {config.status === 'ACTIVE' ? '已启用' : '未启用'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {PROVIDERS.find((p) => p.value === config.provider)?.label || config.provider}
                        {' · '}
                        {config.region}
                        {' · '}
                        {config.bucket}
                        {config.cdnDomain && ` · CDN: ${config.cdnDomain}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
