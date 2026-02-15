'use client';

/**
 * SMS Settings Page
 * 短信配置管理页面
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Save,
  TestTube,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from 'lucide-react';

// 阿里云短信配置类型
interface AliyunSMSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  region: string;
  enabled: boolean;
}

// 腾讯云短信配置类型
interface TencentSMSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  sdkAppId: string;
  signName: string;
  region: string;
  enabled: boolean;
}

// 短信模板类型
interface SMSTemplate {
  id: string;
  name: string;
  code: string;
  content: string;
  type: 'verification' | 'notification' | 'marketing';
  variables: string[];
}

export default function SMSSettingsPage() {
  // 阿里云配置状态
  const [aliyunConfig, setAliyunConfig] = useState<AliyunSMSConfig>({
    accessKeyId: '',
    accessKeySecret: '',
    signName: '',
    region: 'cn-hangzhou',
    enabled: false,
  });

  // 腾讯云配置状态
  const [tencentConfig, setTencentConfig] = useState<TencentSMSConfig>({
    accessKeyId: '',
    accessKeySecret: '',
    sdkAppId: '',
    signName: '',
    region: 'ap-guangzhou',
    enabled: false,
  });

  // 短信模板
  const [templates, setTemplates] = useState<SMSTemplate[]>([
    {
      id: '1',
      name: '验证码',
      code: 'SMS_VERIFICATION',
      content: '您的验证码是${code}，5分钟内有效。',
      type: 'verification',
      variables: ['code'],
    },
  ]);

  // UI 状态
  const [showAliyunKey, setShowAliyunKey] = useState(false);
  const [showTencentKey, setShowTencentKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [testPhone, setTestPhone] = useState('');

  // 保存阿里云配置
  const saveAliyunConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'aliyun', config: aliyunConfig }),
      });
      
      if (response.ok) {
        setTestResult({ provider: 'aliyun', success: true, message: '阿里云短信配置保存成功' });
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      setTestResult({ provider: 'aliyun', success: false, message: '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  // 保存腾讯云配置
  const saveTencentConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'tencent', config: tencentConfig }),
      });
      
      if (response.ok) {
        setTestResult({ provider: 'tencent', success: true, message: '腾讯云短信配置保存成功' });
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      setTestResult({ provider: 'tencent', success: false, message: '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  // 测试阿里云短信
  const testAliyunSMS = async () => {
    if (!testPhone) {
      setTestResult({ provider: 'aliyun', success: false, message: '请输入测试手机号' });
      return;
    }
    
    setTesting('aliyun');
    setTestResult(null);
    try {
      const response = await fetch('/api/admin/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'aliyun', phoneNumber: testPhone }),
      });
      
      const data = await response.json();
      if (data.success) {
        setTestResult({ provider: 'aliyun', success: true, message: '测试短信发送成功' });
      } else {
        setTestResult({ provider: 'aliyun', success: false, message: data.message || '发送失败' });
      }
    } catch (error) {
      setTestResult({ provider: 'aliyun', success: false, message: '测试失败' });
    } finally {
      setTesting(null);
    }
  };

  // 测试腾讯云短信
  const testTencentSMS = async () => {
    if (!testPhone) {
      setTestResult({ provider: 'tencent', success: false, message: '请输入测试手机号' });
      return;
    }
    
    setTesting('tencent');
    setTestResult(null);
    try {
      const response = await fetch('/api/admin/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'tencent', phoneNumber: testPhone }),
      });
      
      const data = await response.json();
      if (data.success) {
        setTestResult({ provider: 'tencent', success: true, message: '测试短信发送成功' });
      } else {
        setTestResult({ provider: 'tencent', success: false, message: data.message || '发送失败' });
      }
    } catch (error) {
      setTestResult({ provider: 'tencent', success: false, message: '测试失败' });
    } finally {
      setTesting(null);
    }
  };

  // 添加模板
  const addTemplate = () => {
    const newTemplate: SMSTemplate = {
      id: Date.now().toString(),
      name: '新模板',
      code: '',
      content: '',
      type: 'notification',
      variables: [],
    };
    setTemplates([...templates, newTemplate]);
  };

  // 删除模板
  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  // 更新模板
  const updateTemplate = (id: string, updates: Partial<SMSTemplate>) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            短信配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置阿里云和腾讯云短信服务参数
          </p>
        </div>
      </div>

      {/* 测试结果提示 */}
      {testResult && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          testResult.success 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {testResult.success ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {testResult.message}
        </div>
      )}

      {/* 配置标签页 */}
      <Tabs defaultValue="aliyun" className="space-y-4">
        <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] bg-white/10 border-white/20 backdrop-blur-sm">
          <TabsTrigger value="aliyun" className="flex items-center gap-2">
            阿里云短信
            {aliyunConfig.enabled && <Badge variant="secondary" className="ml-1">已启用</Badge>}
          </TabsTrigger>
          <TabsTrigger value="tencent" className="flex items-center gap-2">
            腾讯云短信
            {tencentConfig.enabled && <Badge variant="secondary" className="ml-1">已启用</Badge>}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            短信模板
            <Badge variant="outline" className="ml-1">{templates.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* 阿里云短信配置 */}
        <TabsContent value="aliyun">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                阿里云短信配置
              </CardTitle>
              <CardDescription>
                配置阿里云短信服务 (Dysms) 参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基本配置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aliyun-accesskey">Access Key ID</Label>
                  <Input
                    id="aliyun-accesskey"
                    placeholder="请输入 Access Key ID"
                    value={aliyunConfig.accessKeyId}
                    onChange={(e) => setAliyunConfig({ ...aliyunConfig, accessKeyId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="aliyun-secret">Access Key Secret</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAliyunKey(!showAliyunKey)}
                    >
                      {showAliyunKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input
                    id="aliyun-secret"
                    type={showAliyunKey ? 'text' : 'password'}
                    placeholder="请输入 Access Key Secret"
                    value={aliyunConfig.accessKeySecret}
                    onChange={(e) => setAliyunConfig({ ...aliyunConfig, accessKeySecret: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aliyun-sign">短信签名</Label>
                  <Input
                    id="aliyun-sign"
                    placeholder="请输入短信签名"
                    value={aliyunConfig.signName}
                    onChange={(e) => setAliyunConfig({ ...aliyunConfig, signName: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    短信签名需要在阿里云控制台申请审核通过
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aliyun-region">地域</Label>
                  <Input
                    id="aliyun-region"
                    placeholder="cn-hangzhou"
                    value={aliyunConfig.region}
                    onChange={(e) => setAliyunConfig({ ...aliyunConfig, region: e.target.value })}
                  />
                </div>
              </div>

              {/* 启用开关 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>启用阿里云短信</Label>
                  <p className="text-sm text-muted-foreground">
                    启用后系统将使用阿里云发送短信
                  </p>
                </div>
                <Switch
                  checked={aliyunConfig.enabled}
                  onCheckedChange={(checked) => setAliyunConfig({ ...aliyunConfig, enabled: checked })}
                />
              </div>

              {/* 测试发送 */}
              <div className="p-4 border rounded-lg space-y-4">
                <Label>测试发送</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="请输入测试手机号"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    variant="outline"
                    onClick={testAliyunSMS}
                    disabled={testing === 'aliyun'}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testing === 'aliyun' ? '发送中...' : '发送测试'}
                  </Button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end">
                <Button onClick={saveAliyunConfig} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存配置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 腾讯云短信配置 */}
        <TabsContent value="tencent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                腾讯云短信配置
              </CardTitle>
              <CardDescription>
                配置腾讯云短信服务参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基本配置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tencent-accesskey">Secret ID</Label>
                  <Input
                    id="tencent-accesskey"
                    placeholder="请输入 Secret ID"
                    value={tencentConfig.accessKeyId}
                    onChange={(e) => setTencentConfig({ ...tencentConfig, accessKeyId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tencent-secret">Secret Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTencentKey(!showTencentKey)}
                    >
                      {showTencentKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input
                    id="tencent-secret"
                    type={showTencentKey ? 'text' : 'password'}
                    placeholder="请输入 Secret Key"
                    value={tencentConfig.accessKeySecret}
                    onChange={(e) => setTencentConfig({ ...tencentConfig, accessKeySecret: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tencent-appid">SDK App ID</Label>
                  <Input
                    id="tencent-appid"
                    placeholder="请输入 SDK App ID"
                    value={tencentConfig.sdkAppId}
                    onChange={(e) => setTencentConfig({ ...tencentConfig, sdkAppId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tencent-sign">短信签名</Label>
                  <Input
                    id="tencent-sign"
                    placeholder="请输入短信签名"
                    value={tencentConfig.signName}
                    onChange={(e) => setTencentConfig({ ...tencentConfig, signName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tencent-region">地域</Label>
                <Input
                  id="tencent-region"
                  placeholder="ap-guangzhou"
                  value={tencentConfig.region}
                  onChange={(e) => setTencentConfig({ ...tencentConfig, region: e.target.value })}
                  className="max-w-xs"
                />
              </div>

              {/* 启用开关 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>启用腾讯云短信</Label>
                  <p className="text-sm text-muted-foreground">
                    启用后系统将使用腾讯云发送短信
                  </p>
                </div>
                <Switch
                  checked={tencentConfig.enabled}
                  onCheckedChange={(checked) => setTencentConfig({ ...tencentConfig, enabled: checked })}
                />
              </div>

              {/* 测试发送 */}
              <div className="p-4 border rounded-lg space-y-4">
                <Label>测试发送</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="请输入测试手机号"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    variant="outline"
                    onClick={testTencentSMS}
                    disabled={testing === 'tencent'}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testing === 'tencent' ? '发送中...' : '发送测试'}
                  </Button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end">
                <Button onClick={saveTencentConfig} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存配置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 短信模板管理 */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    短信模板管理
                  </CardTitle>
                  <CardDescription>
                    管理短信模板，模板需要在云服务商控制台申请审核
                  </CardDescription>
                </div>
                <Button onClick={addTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加模板
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        value={template.name}
                        onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                        className="w-40 font-medium"
                      />
                      <Badge variant={
                        template.type === 'verification' ? 'default' :
                        template.type === 'notification' ? 'secondary' : 'outline'
                      }>
                        {template.type === 'verification' ? '验证码' :
                         template.type === 'notification' ? '通知' : '营销'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>模板代码</Label>
                      <Input
                        placeholder="SMS_TEMPLATE_CODE"
                        value={template.code}
                        onChange={(e) => updateTemplate(template.id, { code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>模板类型</Label>
                      <select
                        className="w-full h-10 px-3 border rounded-md"
                        value={template.type}
                        onChange={(e) => updateTemplate(template.id, { type: e.target.value as SMSTemplate['type'] })}
                      >
                        <option value="verification">验证码</option>
                        <option value="notification">通知</option>
                        <option value="marketing">营销</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>模板内容</Label>
                    <Input
                      placeholder="您的验证码是${code}，5分钟内有效。"
                      value={template.content}
                      onChange={(e) => updateTemplate(template.id, { content: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      使用 ${'{变量名}'} 格式定义变量，如 ${'{code}'}, ${'{name}'}
                    </p>
                  </div>
                </div>
              ))}

              {templates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无短信模板，点击上方按钮添加
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 安全提示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Shield className="h-5 w-5" />
            安全提示
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>请妥善保管 Access Key，不要泄露给他人</li>
            <li>建议使用子账号并授予最小权限</li>
            <li>短信签名和模板需要在云服务商控制台申请审核</li>
            <li>系统默认限制每个手机号每小时最多发送 5 条短信</li>
            <li>国际短信费用较高，请谨慎使用</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
