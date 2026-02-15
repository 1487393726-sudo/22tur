"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Shield,
  Database,
  Bell,
  Globe,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("admin.settings");

  const [settings, setSettings] = useState({
    company: {
      name: "创意代理公司",
      email: "info@creative-agency.com",
      phone: "+86 123-456-7890",
      address: "北京市朝阳区创意大厦88号",
      website: "https://creative-agency.com",
      description: "专注于创意设计和数字化解决方案",
    },
    system: {
      timezone: "Asia/Shanghai",
      language: "zh-CN",
      dateFormat: "YYYY-MM-DD",
      currency: "CNY",
      backupEnabled: true,
      autoBackup: true,
      backupFrequency: "daily",
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      projectUpdates: true,
      taskAssignments: true,
      financialReports: true,
      clientUpdates: false,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      loginAlerts: true,
      ipWhitelist: "",
    },
  });

  const [backupStatus, setBackupStatus] = useState({
    lastBackup: "2024-01-15 02:30:00",
    nextBackup: "2024-01-16 02:30:00",
    size: "245.8 MB",
    status: "success",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = async (sectionKey: string) => {
    setIsSaving(true);
    setSaveMessage("");

    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage(t("messages.settingsSaved", { section: sectionKey }));
      setTimeout(() => setSaveMessage(""), 3000);
    }, 1000);
  };

  const handleBackup = async (type: string) => {
    if (type === "manual") {
      setSaveMessage(t("messages.creatingBackup"));
      setTimeout(() => {
        setSaveMessage(t("messages.backupCreated"));
        setBackupStatus((prev) => ({
          ...prev,
          lastBackup: new Date().toLocaleString("zh-CN"),
          status: "success",
        }));
        setTimeout(() => setSaveMessage(""), 3000);
      }, 2000);
    } else if (type === "restore") {
      setSaveMessage(t("messages.restoringBackup"));
      setTimeout(() => {
        setSaveMessage(t("messages.backupRestored"));
        setTimeout(() => setSaveMessage(""), 3000);
      }, 3000);
    }
  };

  const getBackupStatusIcon = () => {
    switch (backupStatus.status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
            <p className="text-gray-300">{t("description")}</p>
          </div>
          {saveMessage && (
            <Alert className="w-auto bg-white/10 backdrop-blur-sm border border-white/20">
              <Info className="h-4 w-4 text-white" />
              <AlertDescription className="text-white">
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger
              value="company"
              className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("tabs.company")}
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("tabs.system")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("tabs.notifications")}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("tabs.security")}
            </TabsTrigger>
            <TabsTrigger
              value="backup"
              className="text-gray-300 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {t("tabs.backup")}
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              {/* Company Info Settings */}
              <TabsContent value="company" className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Globe className="h-5 w-5" />
                      {t("company.title")}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {t("company.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName" className="text-white">
                          {t("company.name")}
                        </Label>
                        <Input
                          id="companyName"
                          value={settings.company.name}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              company: { ...prev.company, name: e.target.value },
                            }))
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyEmail" className="text-white">
                          {t("company.email")}
                        </Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={settings.company.email}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              company: { ...prev.company, email: e.target.value },
                            }))
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyPhone" className="text-white">
                          {t("company.phone")}
                        </Label>
                        <Input
                          id="companyPhone"
                          value={settings.company.phone}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              company: { ...prev.company, phone: e.target.value },
                            }))
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyWebsite" className="text-white">
                          {t("company.website")}
                        </Label>
                        <Input
                          id="companyWebsite"
                          value={settings.company.website}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              company: { ...prev.company, website: e.target.value },
                            }))
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="companyAddress" className="text-white">
                        {t("company.address")}
                      </Label>
                      <Input
                        id="companyAddress"
                        value={settings.company.address}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            company: { ...prev.company, address: e.target.value },
                          }))
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyDescription" className="text-white">
                        {t("company.companyDescription")}
                      </Label>
                      <Textarea
                        id="companyDescription"
                        rows={3}
                        value={settings.company.description}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            company: { ...prev.company, description: e.target.value },
                          }))
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave(t("tabs.company"))}
                        disabled={isSaving}
                      >
                        {isSaving ? t("actions.saving") : t("actions.save")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system" className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Settings className="h-5 w-5" />
                      {t("system.title")}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {t("system.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timezone" className="text-white">
                          {t("system.timezone")}
                        </Label>
                        <Select
                          value={settings.system.timezone}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              system: { ...prev.system, timezone: value },
                            }))
                          }
                        >
                          <SelectTrigger
                            className="bg-white/10 border-white/20 text-white"
                            aria-label={t("system.timezone")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language" className="text-white">
                          {t("system.language")}
                        </Label>
                        <Select
                          value={settings.system.language}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              system: { ...prev.system, language: value },
                            }))
                          }
                        >
                          <SelectTrigger
                            className="bg-white/10 border-white/20 text-white"
                            aria-label={t("system.language")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zh-CN">{t("system.languages.zhCN")}</SelectItem>
                            <SelectItem value="en-US">{t("system.languages.enUS")}</SelectItem>
                            <SelectItem value="ja-JP">{t("system.languages.jaJP")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dateFormat" className="text-white">
                          {t("system.dateFormat")}
                        </Label>
                        <Select
                          value={settings.system.dateFormat}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              system: { ...prev.system, dateFormat: value },
                            }))
                          }
                        >
                          <SelectTrigger
                            className="bg-white/10 border-white/20 text-white"
                            aria-label={t("system.dateFormat")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-white">
                          {t("system.currency")}
                        </Label>
                        <Select
                          value={settings.system.currency}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              system: { ...prev.system, currency: value },
                            }))
                          }
                        >
                          <SelectTrigger
                            className="bg-white/10 border-white/20 text-white"
                            aria-label={t("system.currency")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CNY">{t("system.currencies.cny")}</SelectItem>
                            <SelectItem value="USD">{t("system.currencies.usd")}</SelectItem>
                            <SelectItem value="EUR">{t("system.currencies.eur")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave(t("tabs.system"))}
                        disabled={isSaving}
                      >
                        {isSaving ? t("actions.saving") : t("actions.save")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Bell className="h-5 w-5" />
                      {t("notifications.title")}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {t("notifications.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">{t("notifications.emailNotification")}</Label>
                          <p className="text-sm text-gray-400">
                            {t("notifications.emailNotificationDesc")}
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.emailEnabled}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, emailEnabled: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">{t("notifications.smsNotification")}</Label>
                          <p className="text-sm text-gray-400">
                            {t("notifications.smsNotificationDesc")}
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications.smsEnabled}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, smsEnabled: checked },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-white">
                        {t("notifications.notificationTypes")}
                      </h4>
                      <div className="flex items-center justify-between">
                        <Label className="text-white">{t("notifications.projectUpdates")}</Label>
                        <Switch
                          checked={settings.notifications.projectUpdates}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, projectUpdates: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-white">{t("notifications.taskAssignments")}</Label>
                        <Switch
                          checked={settings.notifications.taskAssignments}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, taskAssignments: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-white">{t("notifications.financialReports")}</Label>
                        <Switch
                          checked={settings.notifications.financialReports}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, financialReports: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-white">{t("notifications.clientUpdates")}</Label>
                        <Switch
                          checked={settings.notifications.clientUpdates}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, clientUpdates: checked },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave(t("tabs.notifications"))}
                        disabled={isSaving}
                      >
                        {isSaving ? t("actions.saving") : t("actions.save")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="h-5 w-5" />
                      {t("security.title")}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {t("security.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">{t("security.twoFactor")}</Label>
                          <p className="text-sm text-gray-400">
                            {t("security.twoFactorDesc")}
                          </p>
                        </div>
                        <Switch
                          checked={settings.security.twoFactorEnabled}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              security: { ...prev.security, twoFactorEnabled: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">{t("security.loginAlerts")}</Label>
                          <p className="text-sm text-gray-400">
                            {t("security.loginAlertsDesc")}
                          </p>
                        </div>
                        <Switch
                          checked={settings.security.loginAlerts}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              security: { ...prev.security, loginAlerts: checked },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-white">
                        {t("security.passwordPolicy")}
                      </h4>
                      <div>
                        <Label htmlFor="passwordMinLength" className="text-white">
                          {t("security.minPasswordLength")}
                        </Label>
                        <Input
                          id="passwordMinLength"
                          type="number"
                          min="6"
                          max="20"
                          value={settings.security.passwordMinLength}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              security: {
                                ...prev.security,
                                passwordMinLength: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-white">{t("security.requireSpecialChar")}</Label>
                        <Switch
                          checked={settings.security.passwordRequireSpecial}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              security: { ...prev.security, passwordRequireSpecial: checked },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="sessionTimeout" className="text-white">
                          {t("security.sessionTimeout")}
                        </Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          min="5"
                          max="480"
                          value={settings.security.sessionTimeout}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              security: {
                                ...prev.security,
                                sessionTimeout: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSave(t("tabs.security"))}
                        disabled={isSaving}
                      >
                        {isSaving ? t("actions.saving") : t("actions.save")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Backup & Restore */}
              <TabsContent value="backup" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Database className="h-5 w-5" />
                        {t("backup.title")}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {t("backup.description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {t("backup.lastBackup")}
                          </span>
                          <div className="flex items-center gap-2">
                            {getBackupStatusIcon()}
                            <span className="text-sm text-gray-300">
                              {backupStatus.lastBackup}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {t("backup.nextBackup")}
                          </span>
                          <span className="text-sm text-gray-300">
                            {backupStatus.nextBackup}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {t("backup.backupSize")}
                          </span>
                          <span className="text-sm text-gray-300">
                            {backupStatus.size}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {t("backup.autoBackup")}
                          </span>
                          <Badge
                            variant={settings.system.autoBackup ? "default" : "secondary"}
                          >
                            {settings.system.autoBackup
                              ? t("backup.enabled")
                              : t("backup.disabled")}
                          </Badge>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/20">
                        <h4 className="text-sm font-medium mb-3 text-white">
                          {t("backup.operations")}
                        </h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => handleBackup("manual")}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t("backup.createBackup")}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => handleBackup("restore")}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {t("backup.restoreBackup")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">{t("backup.settingsTitle")}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {t("backup.settingsDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">{t("backup.enableAutoBackup")}</Label>
                          <p className="text-sm text-gray-400">
                            {t("backup.enableAutoBackupDesc")}
                          </p>
                        </div>
                        <Switch
                          checked={settings.system.backupEnabled}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              system: { ...prev.system, backupEnabled: checked },
                            }))
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="backupFrequency" className="text-white">
                          {t("backup.frequency")}
                        </Label>
                        <Select
                          value={settings.system.backupFrequency}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              system: { ...prev.system, backupFrequency: value },
                            }))
                          }
                        >
                          <SelectTrigger
                            className="bg-white/10 border-white/20 text-white"
                            aria-label={t("backup.frequency")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">{t("backup.daily")}</SelectItem>
                            <SelectItem value="weekly">{t("backup.weekly")}</SelectItem>
                            <SelectItem value="monthly">{t("backup.monthly")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2 text-white">
                          {t("backup.history")}
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          <div className="text-sm p-2 bg-white/5 rounded">
                            <div className="flex justify-between">
                              <span className="text-gray-300">2024-01-15 02:30</span>
                              <Badge variant="outline" className="text-gray-300 border-gray-500">
                                245.8 MB
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm p-2 bg-white/5 rounded">
                            <div className="flex justify-between">
                              <span className="text-gray-300">2024-01-14 02:30</span>
                              <Badge variant="outline" className="text-gray-300 border-gray-500">
                                242.1 MB
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm p-2 bg-white/5 rounded">
                            <div className="flex justify-between">
                              <span className="text-gray-300">2024-01-13 02:30</span>
                              <Badge variant="outline" className="text-gray-300 border-gray-500">
                                238.5 MB
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
