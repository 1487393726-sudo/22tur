"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import CompanySettings from "./components/company-settings";
import SystemSettings from "./components/system-settings";
import NotificationSettings from "./components/notification-settings";
import SecuritySettings from "./components/security-settings";
import BackupSettings from "./components/backup-settings";
import EmailSettings from "./components/email-settings";
import StorageSettings from "./components/storage-settings";
import ApiSettings from "./components/api-settings";
import LogSettings from "./components/log-settings";
import UserDefaultSettings from "./components/user-default-settings";
import MaintenanceSettings from "./components/maintenance-settings";
import AuditSettings from "./components/audit-settings";
import IntegrationSettings from "./components/integration-settings";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-slate-300">加载设置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold theme-gradient-text">系统设置</h1>
            <p className="text-gray-300">管理系统配置和偏好设置</p>
          </div>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-7 bg-white/10 border-white/20 backdrop-blur-sm overflow-x-auto">
            <TabsTrigger
              value="company"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              公司信息
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              系统设置
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              通知设置
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              安全设置
            </TabsTrigger>
            <TabsTrigger
              value="backup"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              备份恢复
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              邮件配置
            </TabsTrigger>
            <TabsTrigger
              value="storage"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              存储设置
            </TabsTrigger>
          </TabsList>

          <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-7 bg-white/10 border-white/20 backdrop-blur-sm overflow-x-auto">
            <TabsTrigger
              value="api"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              API 密钥
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              日志设置
            </TabsTrigger>
            <TabsTrigger
              value="user-defaults"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              用户默认
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              系统维护
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              审计日志
            </TabsTrigger>
            <TabsTrigger
              value="integration"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white text-xs sm:text-sm"
            >
              集成设置
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <TabsContent value="company">
              <CompanySettings />
            </TabsContent>
            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="backup">
              <BackupSettings />
            </TabsContent>
            <TabsContent value="email">
              <EmailSettings />
            </TabsContent>
            <TabsContent value="storage">
              <StorageSettings />
            </TabsContent>
            <TabsContent value="api">
              <ApiSettings />
            </TabsContent>
            <TabsContent value="logs">
              <LogSettings />
            </TabsContent>
            <TabsContent value="user-defaults">
              <UserDefaultSettings />
            </TabsContent>
            <TabsContent value="maintenance">
              <MaintenanceSettings />
            </TabsContent>
            <TabsContent value="audit">
              <AuditSettings />
            </TabsContent>
            <TabsContent value="integration">
              <IntegrationSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
