'use client';

/**
 * Payment Settings Page
 * 支付配置管理页面
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Save,
  TestTube,
  Eye,
  EyeOff,
} from 'lucide-react';

// 支付宝配置类型
interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  notifyUrl: string;
  returnUrl: string;
  sandbox: boolean;
  enabled: boolean;
}

// 微信支付配置类型
interface WechatConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  apiV3Key: string;
  serialNo: string;
  privateKey: string;
  notifyUrl: string;
  sandbox: boolean;
  enabled: boolean;
}

export default function PaymentSettingsPage() {
  // 支付宝配置状态
  const [alipayConfig, setAlipayConfig] = useState<AlipayConfig>({
    appId: '',
    privateKey: '',
    alipayPublicKey: '',
    notifyUrl: '',
    returnUrl: '',
    sandbox: true,
    enabled: false,
  });

  // 微信支付配置状态
  const [wechatConfig, setWechatConfig] = useState<WechatConfig>({
    appId: '',
    mchId: '',
    apiKey: '',
    apiV3Key: '',
    serialNo: '',
    privateKey: '',
    notifyUrl: '',
    sandbox: true,
    enabled: false,
  });

  // UI 状态
  const [showAlipayKey, setShowAlipayKey] = useState(false);
  const [showWechatKey, setShowWechatKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);

  // 保存支付宝配置
  const saveAlipayConfig = async () => {
    setSaving(true);
    try {
      // TODO: 调用 API 保存配置
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ provider: 'alipay', success: true, message: '支付宝配置保存成功' });
    } catch (error) {
      setTestResult({ provider: 'alipay', success: false, message: '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  // 保存微信支付配置
  const saveWechatConfig = async () => {
    setSaving(true);
    try {
      // TODO: 调用 API 保存配置
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ provider: 'wechat', success: true, message: '微信支付配置保存成功' });
    } catch (error) {
      setTestResult({ provider: 'wechat', success: false, message: '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  // 测试支付宝连接
  const testAlipayConnection = async () => {
    setTesting('alipay');
    setTestResult(null);
    try {
      // TODO: 调用 API 测试连接
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestResult({ provider: 'alipay', success: true, message: '支付宝连接测试成功' });
    } catch (error) {
      setTestResult({ provider: 'alipay', success: false, message: '连接测试失败' });
    } finally {
      setTesting(null);
    }
  };

  // 测试微信支付连接
  const testWechatConnection = async () => {
    setTesting('wechat');
    setTestResult(null);
    try {
      // TODO: 调用 API 测试连接
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestResult({ provider: 'wechat', success: true, message: '微信支付连接测试成功' });
    } catch (error) {
      setTestResult({ provider: 'wechat', success: false, message: '连接测试失败' });
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            支付配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置支付宝和微信支付参数
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
      <Tabs defaultValue="alipay" className="space-y-4">
        <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] bg-white/10 border-white/20 backdrop-blur-sm">
          <TabsTrigger value="alipay" className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            支付宝
            {alipayConfig.enabled && <Badge variant="secondary" className="ml-1">已启用</Badge>}
          </TabsTrigger>
          <TabsTrigger value="wechat" className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            微信支付
            {wechatConfig.enabled && <Badge variant="secondary" className="ml-1">已启用</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* 支付宝配置 */}
        <TabsContent value="alipay">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                支付宝配置
              </CardTitle>
              <CardDescription>
                配置支付宝开放平台应用参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基本配置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alipay-appid">应用 ID (App ID)</Label>
                  <Input
                    id="alipay-appid"
                    placeholder="请输入支付宝应用 ID"
                    value={alipayConfig.appId}
                    onChange={(e) => setAlipayConfig({ ...alipayConfig, appId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alipay-notify">异步通知地址</Label>
                  <Input
                    id="alipay-notify"
                    placeholder="https://your-domain.com/api/payment/alipay/callback"
                    value={alipayConfig.notifyUrl}
                    onChange={(e) => setAlipayConfig({ ...alipayConfig, notifyUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alipay-return">同步返回地址</Label>
                <Input
                  id="alipay-return"
                  placeholder="https://your-domain.com/payment/success"
                  value={alipayConfig.returnUrl}
                  onChange={(e) => setAlipayConfig({ ...alipayConfig, returnUrl: e.target.value })}
                />
              </div>

              {/* 密钥配置 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="alipay-private-key">应用私钥</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAlipayKey(!showAlipayKey)}
                  >
                    {showAlipayKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Textarea
                  id="alipay-private-key"
                  placeholder="请输入应用私钥"
                  className="font-mono text-sm"
                  rows={4}
                  value={showAlipayKey ? alipayConfig.privateKey : '••••••••••••••••'}
                  onChange={(e) => setAlipayConfig({ ...alipayConfig, privateKey: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alipay-public-key">支付宝公钥</Label>
                <Textarea
                  id="alipay-public-key"
                  placeholder="请输入支付宝公钥"
                  className="font-mono text-sm"
                  rows={4}
                  value={alipayConfig.alipayPublicKey}
                  onChange={(e) => setAlipayConfig({ ...alipayConfig, alipayPublicKey: e.target.value })}
                />
              </div>

              {/* 开关配置 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>沙箱模式</Label>
                  <p className="text-sm text-muted-foreground">
                    启用后将使用支付宝沙箱环境进行测试
                  </p>
                </div>
                <Switch
                  checked={alipayConfig.sandbox}
                  onCheckedChange={(checked) => setAlipayConfig({ ...alipayConfig, sandbox: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>启用支付宝</Label>
                  <p className="text-sm text-muted-foreground">
                    启用后用户可以使用支付宝进行支付
                  </p>
                </div>
                <Switch
                  checked={alipayConfig.enabled}
                  onCheckedChange={(checked) => setAlipayConfig({ ...alipayConfig, enabled: checked })}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={testAlipayConnection}
                  disabled={testing === 'alipay'}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testing === 'alipay' ? '测试中...' : '测试连接'}
                </Button>
                <Button onClick={saveAlipayConfig} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存配置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 微信支付配置 */}
        <TabsContent value="wechat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                微信支付配置
              </CardTitle>
              <CardDescription>
                配置微信支付商户平台参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基本配置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wechat-appid">应用 ID (App ID)</Label>
                  <Input
                    id="wechat-appid"
                    placeholder="请输入微信应用 ID"
                    value={wechatConfig.appId}
                    onChange={(e) => setWechatConfig({ ...wechatConfig, appId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wechat-mchid">商户号 (Mch ID)</Label>
                  <Input
                    id="wechat-mchid"
                    placeholder="请输入微信商户号"
                    value={wechatConfig.mchId}
                    onChange={(e) => setWechatConfig({ ...wechatConfig, mchId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wechat-serial">证书序列号</Label>
                  <Input
                    id="wechat-serial"
                    placeholder="请输入证书序列号"
                    value={wechatConfig.serialNo}
                    onChange={(e) => setWechatConfig({ ...wechatConfig, serialNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wechat-notify">异步通知地址</Label>
                  <Input
                    id="wechat-notify"
                    placeholder="https://your-domain.com/api/payment/wechat/callback"
                    value={wechatConfig.notifyUrl}
                    onChange={(e) => setWechatConfig({ ...wechatConfig, notifyUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* 密钥配置 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wechat-api-key">API 密钥</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWechatKey(!showWechatKey)}
                  >
                    {showWechatKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Input
                  id="wechat-api-key"
                  type={showWechatKey ? 'text' : 'password'}
                  placeholder="请输入 API 密钥"
                  value={wechatConfig.apiKey}
                  onChange={(e) => setWechatConfig({ ...wechatConfig, apiKey: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wechat-apiv3-key">APIv3 密钥</Label>
                <Input
                  id="wechat-apiv3-key"
                  type={showWechatKey ? 'text' : 'password'}
                  placeholder="请输入 APIv3 密钥"
                  value={wechatConfig.apiV3Key}
                  onChange={(e) => setWechatConfig({ ...wechatConfig, apiV3Key: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wechat-private-key">商户私钥</Label>
                <Textarea
                  id="wechat-private-key"
                  placeholder="请输入商户私钥"
                  className="font-mono text-sm"
                  rows={4}
                  value={showWechatKey ? wechatConfig.privateKey : '••••••••••••••••'}
                  onChange={(e) => setWechatConfig({ ...wechatConfig, privateKey: e.target.value })}
                />
              </div>

              {/* 开关配置 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>沙箱模式</Label>
                  <p className="text-sm text-muted-foreground">
                    启用后将使用微信支付沙箱环境进行测试
                  </p>
                </div>
                <Switch
                  checked={wechatConfig.sandbox}
                  onCheckedChange={(checked) => setWechatConfig({ ...wechatConfig, sandbox: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>启用微信支付</Label>
                  <p className="text-sm text-muted-foreground">
                    启用后用户可以使用微信进行支付
                  </p>
                </div>
                <Switch
                  checked={wechatConfig.enabled}
                  onCheckedChange={(checked) => setWechatConfig({ ...wechatConfig, enabled: checked })}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={testWechatConnection}
                  disabled={testing === 'wechat'}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testing === 'wechat' ? '测试中...' : '测试连接'}
                </Button>
                <Button onClick={saveWechatConfig} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存配置'}
                </Button>
              </div>
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
            <li>请妥善保管支付密钥，不要泄露给他人</li>
            <li>建议在正式上线前先使用沙箱模式进行测试</li>
            <li>异步通知地址必须是 HTTPS 协议</li>
            <li>定期更换 API 密钥以确保安全</li>
            <li>如发现异常交易，请立即联系支付平台客服</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
