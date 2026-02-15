"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, CreditCard, Mail, MessageSquare, Cloud } from "lucide-react";
import type { ApiTemplate, ConnectionType } from "@/types/api-management";

interface TemplateBrowserProps {
  templates: ApiTemplate[];
  onSelectTemplate: (template: ApiTemplate) => void;
}

const typeIcons: Record<ConnectionType, React.ReactNode> = {
  PAYMENT: <CreditCard className="h-5 w-5" />,
  EMAIL: <Mail className="h-5 w-5" />,
  SMS: <MessageSquare className="h-5 w-5" />,
  STORAGE: <Cloud className="h-5 w-5" />,
  CUSTOM: <Cloud className="h-5 w-5" />,
};

const typeLabels: Record<ConnectionType, string> = {
  PAYMENT: "支付",
  EMAIL: "邮件",
  SMS: "短信",
  STORAGE: "存储",
  CUSTOM: "自定义",
};

export function TemplateBrowser({ templates, onSelectTemplate }: TemplateBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.provider.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeTab === "all" || t.type === activeTab;
    return matchesSearch && matchesType;
  });

  const categories = ["all", "PAYMENT", "EMAIL", "SMS", "STORAGE"] as const;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索模板..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="PAYMENT">支付</TabsTrigger>
          <TabsTrigger value="EMAIL">邮件</TabsTrigger>
          <TabsTrigger value="SMS">短信</TabsTrigger>
          <TabsTrigger value="STORAGE">存储</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              没有找到匹配的模板
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {typeIcons[template.type]}
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{typeLabels[template.type]}</Badge>
                    </div>
                    <CardDescription className="text-xs">{template.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      {template.docsUrl && (
                        <a
                          href={template.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          文档 <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <Button size="sm" onClick={() => onSelectTemplate(template)}>
                        使用模板
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
