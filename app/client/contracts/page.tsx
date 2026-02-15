"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  PenLine,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles, contractStatusConfig } from "@/lib/dashboard-styles";
import { formatAmount, formatDate } from "@/lib/dashboard-utils";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  clientSignedAt: string | null;
  companySignedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    client: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function ContractsPage() {
  const router = useRouter();
  const { t, isRTL } = useDashboardTranslations();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(t('client.contracts.filters.all'));
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === t('client.contracts.filters.pending')) {
        params.set("status", "PENDING_CLIENT");
      } else if (filter === t('client.contracts.filters.signed')) {
        params.set("status", "SIGNED");
      } else if (filter === t('client.contracts.filters.cancelled')) {
        params.set("status", "CANCELLED");
      }
      const res = await fetch(`/api/contracts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContracts(data.data || []);
      }
    } catch (error) {
      console.error(t('common.error'), error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SIGNED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING_CLIENT":
      case "PENDING_COMPANY":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t('client.contracts.title')}
        description={t('client.contracts.description')}
        icon="📄"
      />

      <Card className="purple-gradient-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('client.contracts.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs defaultValue={t('client.contracts.filters.all')} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
              <TabsTrigger value={t('client.contracts.filters.all')}>{t('client.contracts.filters.all')}</TabsTrigger>
              <TabsTrigger value={t('client.contracts.filters.pending')}>{t('client.contracts.filters.pending')}</TabsTrigger>
              <TabsTrigger value={t('client.contracts.filters.signed')}>{t('client.contracts.filters.signed')}</TabsTrigger>
              <TabsTrigger value={t('client.contracts.filters.cancelled')}>{t('client.contracts.filters.cancelled')}</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('client.contracts.noContracts')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredContracts.map((contract) => {
                    const statusConfig = contractStatusConfig[contract.status];
                    // Get translated status labels - convert SCREAMING_SNAKE_CASE to camelCase
                    const statusKey = contract.status.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    const statusLabel = t(`client.contracts.status.${statusKey}`, statusConfig?.label || contract.status);
                    
                    return (
                      <Card key={contract.id} className="bg-card/40 hover:bg-card/60 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(contract.status)}
                              <CardTitle className="text-lg">{contract.title}</CardTitle>
                            </div>
                            <Badge variant={statusConfig?.variant || "secondary"}>
                              {statusLabel}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-muted-foreground">{t('client.contracts.contractNumber')}</span>
                              <p className="font-medium font-mono">{contract.contractNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t('client.contracts.orderNumber')}</span>
                              <p className="font-medium font-mono">{contract.order.orderNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t('client.contracts.contractAmount')}</span>
                              <p className="font-medium text-primary">{formatAmount(contract.order.total)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t('client.contracts.createTime')}</span>
                              <p className="font-medium">{formatDate(contract.createdAt)}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/client/contracts/${contract.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('client.contracts.viewDetails')}
                            </Button>
                            {contract.status === "PENDING_CLIENT" && (
                              <Button
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => router.push(`/client/contracts/${contract.id}?sign=true`)}
                              >
                                <PenLine className="h-4 w-4 mr-1" />
                                {t('client.contracts.signNow')}
                              </Button>
                            )}
                            {contract.status === "SIGNED" && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                {t('client.contracts.downloadPDF')}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
