"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plug, Loader2 } from "lucide-react";

export default function IntegrationSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    wechatEnabled: false,
    wechatAppId: "",
    wechatAppSecret: "",
    alipayEnabled: false,
    alipayAppId: "",
    alipayPrivateKey: "",
    smsEnabled: false,
    smsProvider: "aliyun",
    smsAccessKey: "",
    smsAccessSecret: "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Integration settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Plug className="h-5 w-5" />
            第三方集成
          </CardTitle>
          <CardDescription className="text-gray-300">
            配置第三方服务集成
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 微信支付 */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">微信支付</h4>
              <Switch checked={settings.wechatEnabled} onCheckedChange={(checked) => setSettings({ ...settings, wechatEnabled: checked })} />
            </div>
            {settings.wechatEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">App ID</Label>
                  <Input value={settings.wechatAppId} onChange={(e) => setSettings({ ...settings, wechatAppId: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div>
                  <Label className="text-white">App Secret</Label>
                  <Input type="password" value={settings.wechatAppSecret} onChange={(e) => setSettings({ ...settings, wechatAppSecret: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* 支付宝 */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">支付宝</h4>
              <Switch checked={settings.alipayEnabled} onCheckedChange={(checked) => setSettings({ ...settings, alipayEnabled: checked })} />
            </div>
            {settings.alipayEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">App ID</Label>
                  <Input value={settings.alipayAppId} onChange={(e) => setSettings({ ...settings, alipayAppId: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div>
                  <Label className="text-white">私钥</Label>
                  <Input type="password" value={settings.alipayPrivateKey} onChange={(e) => setSettings({ ...settings, alipayPrivateKey: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* 短信服务 */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">短信服务</h4>
              <Switch checked={settings.smsEnabled} onCheckedChange={(checked) => setSettings({ ...settings, smsEnabled: checked })} />
            </div>
            {settings.smsEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Access Key</Label>
                  <Input value={settings.smsAccessKey} onChange={(e) => setSettings({ ...settings, smsAccessKey: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div>
                  <Label className="text-white">Access Secret</Label>
                  <Input type="password" value={settings.smsAccessSecret} onChange={(e) => setSettings({ ...settings, smsAccessSecret: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
