"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Loader2 } from "lucide-react";

export default function CompanySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: "创意代理公司",
    email: "info@creative-agency.com",
    phone: "+86 123-456-7890",
    address: "北京市朝阳区创意大厦88号",
    website: "https://creative-agency.com",
    description: "专注于创意设计和数字化解决方案",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Company settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Globe className="h-5 w-5" />
          公司信息
        </CardTitle>
        <CardDescription>
          管理公司基本信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground">公司名称</Label>
            <Input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">邮箱</Label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">电话</Label>
            <Input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">网站</Label>
            <Input
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>
        <div>
          <Label className="text-foreground">地址</Label>
          <Input
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">公司描述</Label>
          <Textarea
            rows={3}
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
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
