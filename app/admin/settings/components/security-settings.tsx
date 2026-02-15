"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Loader2 } from "lucide-react";

export default function SecuritySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    loginAlerts: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Security settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5" />
          安全设置
        </CardTitle>
        <CardDescription>
          管理安全策略
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">双因素认证</Label>
              <p className="text-sm text-muted-foreground">启用双因素认证</p>
            </div>
            <Switch checked={settings.twoFactorEnabled} onCheckedChange={(checked) => setSettings({ ...settings, twoFactorEnabled: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">登录告警</Label>
              <p className="text-sm text-muted-foreground">异常登录时发送告警</p>
            </div>
            <Switch checked={settings.loginAlerts} onCheckedChange={(checked) => setSettings({ ...settings, loginAlerts: checked })} />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">密码策略</h4>
          <div>
            <Label className="text-foreground">最小密码长度</Label>
            <Input type="number" min="6" max="20" value={settings.passwordMinLength} onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })} className="bg-background border-border text-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-foreground">需要特殊字符</Label>
            <Switch checked={settings.passwordRequireSpecial} onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireSpecial: checked })} />
          </div>
          <div>
            <Label className="text-foreground">会话超时（分钟）</Label>
            <Input type="number" min="5" max="480" value={settings.sessionTimeout} onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })} className="bg-background border-border text-foreground" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
  );
}
