"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  User,
  CalendarIcon,
  Clock,
  Activity,
  FileText,
  Settings,
  Download,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface SecurityEvent {
  id: string;
  type:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "PERMISSION_DENIED"
    | "DATA_ACCESS"
    | "SYSTEM_CHANGE"
    | "SECURITY_ALERT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "ACTIVE" | "RESOLVED" | "IGNORED";
  description: string;
  ipAddress: string;
  userAgent: string;
  userId?: string;
  user?: {
    name: string;
    email: string;
  };
  details: any;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

interface SecurityLog {
  id: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
}

interface SecuritySettings {
  id: string;
  settingKey: string;
  settingValue: any;
  description: string;
  category: string;
  isPublic: boolean;
}

export default function SecurityPage() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(
    null,
  );
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // 筛选器状态
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    status: "",
    dateRange: "",
  });

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const [eventsRes, logsRes, settingsRes] = await Promise.all([
        fetch("/api/security/events"),
        fetch("/api/security/logs"),
        fetch("/api/security/settings"),
      ]);

      if (eventsRes.ok) setSecurityEvents(await eventsRes.json());
      if (logsRes.ok) setSecurityLogs(await logsRes.json());
      if (settingsRes.ok) setSecuritySettings(await settingsRes.json());
    } catch (error) {
      console.error(":", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveSecurityEvent = async (eventId: string, action: 'resolve' | 'ignore' = 'resolve') => {
    try {
      setIsResolving(true);
      const response = await fetch(`/api/security/events/${eventId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes: resolutionNotes,
        }),
      });

      if (response.ok) {
        setShowEventDialog(false);
        setResolutionNotes("");
        fetchSecurityData();
      }
    } catch (error) {
      console.error(":", error);
    } finally {
      setIsResolving(false);
    }
  };

  const exportSecurityLogs = async () => {
    try {
      const response = await fetch("/api/security/logs/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `security-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(":", error);
    }
  };

  const getEventSeverityBadge = (severity: string) => {
    const severityConfig = {
      LOW: { variant: "secondary" as const, label: "低", color: "bg-blue-500" },
      MEDIUM: {
        variant: "default" as const,
        label: "中",
        color: "bg-yellow-500",
      },
      HIGH: {
        variant: "default" as const,
        label: "高",
        color: "bg-orange-500",
      },
      CRITICAL: {
        variant: "destructive" as const,
        label: "严重",
        color: "bg-red-500",
      },
    };

    const config =
      severityConfig[severity as keyof typeof severityConfig] ||
      severityConfig.LOW;

    return (
      <Badge
        variant={config.variant}
        className="flex items-center gap-1"
        data-oid="qj-ev9j"
      >
        <div
          className={`w-2 h-2 rounded-full ${config.color}`}
          data-oid=":uk_kgc"
        />
        {config.label}
      </Badge>
    );
  };

  const getEventStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        variant: "destructive" as const,
        label: "",
        icon: AlertTriangle,
      },
      RESOLVED: {
        variant: "default" as const,
        label: "已解决",
        icon: CheckCircle,
      },
      IGNORED: { variant: "secondary" as const, label: "已忽略", icon: EyeOff },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant}
        className="flex items-center gap-1"
        data-oid="chcb4i9"
      >
        <Icon className="w-3 h-3" data-oid="s8os84r" />
        {config.label}
      </Badge>
    );
  };

  const getEventIcon = (type: string) => {
    const iconMap = {
      LOGIN_SUCCESS: CheckCircle,
      LOGIN_FAILED: XCircle,
      PERMISSION_DENIED: Lock,
      DATA_ACCESS: Eye,
      SYSTEM_CHANGE: Settings,
      SECURITY_ALERT: AlertTriangle,
    };
    return iconMap[type as keyof typeof iconMap] || Shield;
  };

  const getEventTypeName = (type: string) => {
    const nameMap = {
      LOGIN_SUCCESS: "",
      LOGIN_FAILED: "",
      PERMISSION_DENIED: "",
      DATA_ACCESS: "",
      SYSTEM_CHANGE: "",
      SECURITY_ALERT: "",
    };
    return nameMap[type as keyof typeof nameMap] || type;
  };

  const filteredEvents = securityEvents.filter((event) => {
    if (filters.type && event.type !== filters.type) return false;
    if (filters.severity && event.severity !== filters.severity) return false;
    if (filters.status && event.status !== filters.status) return false;
    return true;
  });

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center"
        data-oid="44rtvxo"
      >
        <div className="text-center" data-oid="d16233_">
          <RefreshCw
            className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600"
            data-oid="pv2oiwu"
          />
          <p className="text-slate-600" data-oid="jbr6.np">
            ?..
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6"
      data-oid="ij1wp1d"
    >
      <div className="max-w-7xl mx-auto space-y-6" data-oid="mihloar">
        {/*  */}
        <div className="flex items-center justify-between" data-oid="vni8_v.">
          <div data-oid="mmg8u_:">
            <h1
              className="purple-gradient-title text-3xl font-bold text-slate-900"
              data-oid="q_8pcsq"
            >
              
            </h1>
            <p className="text-slate-600 mt-2" data-oid="2a7cbar">
              
            </p>
          </div>
          <div className="flex items-center gap-2" data-oid="jgin5::">
            <Button
              variant="outline"
              onClick={() => fetchSecurityData()}
              data-oid="r.t_joc"
            >
              <RefreshCw className="w-4 h-4 mr-2" data-oid="ftwmfh6" />
              
            </Button>
            <Button
              variant="outline"
              onClick={exportSecurityLogs}
              data-oid="npo5.1y"
            >
              <Download className="w-4 h-4 mr-2" data-oid="11ned:o" />
              
            </Button>
          </div>
        </div>

        {/*  */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          data-oid="v8aw48i"
        >
          <Card
            className="purple-gradient-card hover:shadow-lg transition-shadow"
            data-oid="8v9ca10"
          >
            <CardContent className="purple-gradient-card p-6" data-oid="9iasv62">
              <div
                className="flex items-center justify-between"
                data-oid="t2kqg9e"
              >
                <div data-oid="oh25gm9">
                  <p
                    className="text-sm font-medium text-slate-600"
                    data-oid="tv.-55s"
                  >
                    
                  </p>
                  <p
                    className="text-2xl font-bold text-red-600"
                    data-oid=":f6_o:w"
                  >
                    {securityEvents.filter((e) => e.status === "ACTIVE").length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg" data-oid="wlku_2z">
                  <AlertTriangle
                    className="w-6 h-6 text-red-600"
                    data-oid="wdra.-u"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="purple-gradient-card hover:shadow-lg transition-shadow"
            data-oid="r_:3o-3"
          >
            <CardContent className="purple-gradient-card p-6" data-oid="z9.cfj.">
              <div
                className="flex items-center justify-between"
                data-oid="kngqdgo"
              >
                <div data-oid="mfiq8uy">
                  <p
                    className="text-sm font-medium text-slate-600"
                    data-oid=".iniphf"
                  >
                    
                  </p>
                  <p
                    className="text-2xl font-bold text-green-600"
                    data-oid="7ahfoa3"
                  >
                    {
                      securityEvents.filter(
                        (e) =>
                          e.type === "LOGIN_SUCCESS" &&
                          format(new Date(e.createdAt), "yyyy-MM-dd") ===
                            format(new Date(), "yyyy-MM-dd"),
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg" data-oid="ohz4jfe">
                  <CheckCircle
                    className="w-6 h-6 text-green-600"
                    data-oid="lou2yft"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="purple-gradient-card hover:shadow-lg transition-shadow"
            data-oid="b3qijon"
          >
            <CardContent className="purple-gradient-card p-6" data-oid="g:08_13">
              <div
                className="flex items-center justify-between"
                data-oid="cudi1nm"
              >
                <div data-oid="rvh79q5">
                  <p
                    className="text-sm font-medium text-slate-600"
                    data-oid="gdujv.1"
                  >
                    
                  </p>
                  <p
                    className="text-2xl font-bold text-orange-600"
                    data-oid="09zthyb"
                  >
                    {
                      securityEvents.filter((e) => e.type === "LOGIN_FAILED")
                        .length
                    }
                  </p>
                </div>
                <div
                  className="p-3 bg-orange-100 rounded-lg"
                  data-oid="xwiekh5"
                >
                  <XCircle
                    className="w-6 h-6 text-orange-600"
                    data-oid="yh74djr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="purple-gradient-card hover:shadow-lg transition-shadow"
            data-oid="uxvx.ov"
          >
            <CardContent className="purple-gradient-card p-6" data-oid="9w3:ymp">
              <div
                className="flex items-center justify-between"
                data-oid="cogdcva"
              >
                <div data-oid="ugtzfli">
                  <p
                    className="text-sm font-medium text-slate-600"
                    data-oid="mwq4azl"
                  >
                    
                  </p>
                  <p
                    className="text-2xl font-bold text-blue-600"
                    data-oid="eu.ylb6"
                  >
                    {
                      securityEvents.filter((e) => e.type === "SYSTEM_CHANGE")
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg" data-oid="dl2vik8">
                  <Settings
                    className="w-6 h-6 text-blue-600"
                    data-oid=":uh6tu:"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
          data-oid="j1oj9wl"
        >
          <TabsList
            className="grid w-full grid-cols-3 lg:w-96"
            data-oid="10ihi45"
          >
            <TabsTrigger value="events" data-oid="ougaq4-">
              
            </TabsTrigger>
            <TabsTrigger value="logs" data-oid="u7tn394">
              
            </TabsTrigger>
            <TabsTrigger value="settings" data-oid="ktu0a-j">
              
            </TabsTrigger>
          </TabsList>

          {/*  */}
          <TabsContent value="events" className="space-y-6" data-oid="e2a.3f6">
            {/*  */}
            <Card data-oid="9tom94l" className="purple-gradient-card">
              <CardContent className="purple-gradient-card p-4" data-oid="xw:hozn">
                <div
                  className="flex items-center gap-4 flex-wrap"
                  data-oid="nj.j8zs"
                >
                  <div className="flex items-center gap-2" data-oid="ey58:_4">
                    <Filter
                      className="w-4 h-4 text-slate-600"
                      data-oid=".m7bia_"
                    />
                    <span className="text-sm font-medium" data-oid="ezxoabh">
                      ?
                    </span>
                  </div>
                  <Select
                    value={filters.type}
                    onValueChange={(value) =>
                      setFilters({ ...filters, type: value })
                    }
                    data-oid="z38.k_0"
                  >
                    <SelectTrigger className="w-40" data-oid="mr:meno">
                      <SelectValue placeholder="" data-oid="1vhnx84" />
                    </SelectTrigger>
                    <SelectContent data-oid=":2l.-o-">
                      <SelectItem value="" data-oid="6vphzp8">
                        
                      </SelectItem>
                      <SelectItem value="LOGIN_SUCCESS" data-oid="m2d9g89">
                        
                      </SelectItem>
                      <SelectItem value="LOGIN_FAILED" data-oid="f7cygom">
                        
                      </SelectItem>
                      <SelectItem value="PERMISSION_DENIED" data-oid="fze43kb">
                        
                      </SelectItem>
                      <SelectItem value="DATA_ACCESS" data-oid="q0:pxy:">
                        
                      </SelectItem>
                      <SelectItem value="SYSTEM_CHANGE" data-oid="_6b7s:b">
                        
                      </SelectItem>
                      <SelectItem value="SECURITY_ALERT" data-oid="6g5qe.8">
                        
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.severity}
                    onValueChange={(value) =>
                      setFilters({ ...filters, severity: value })
                    }
                    data-oid="g6rbytx"
                  >
                    <SelectTrigger className="w-32" data-oid="39etjqb">
                      <SelectValue placeholder="" data-oid="yvse7sb" />
                    </SelectTrigger>
                    <SelectContent data-oid="or__4.7">
                      <SelectItem value="" data-oid="ntlecdr">
                        
                      </SelectItem>
                      <SelectItem value="LOW" data-oid="h:oxa-:">
                        ?                      </SelectItem>
                      <SelectItem value="MEDIUM" data-oid="exmuxsx">
                        ?                      </SelectItem>
                      <SelectItem value="HIGH" data-oid="63knmvz">
                        ?                      </SelectItem>
                      <SelectItem value="CRITICAL" data-oid="fyd2cv0">
                        
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                    data-oid="zb840ng"
                  >
                    <SelectTrigger className="w-32" data-oid=":4iqd3p">
                      <SelectValue placeholder="状态" data-oid="9sch-3c" />
                    </SelectTrigger>
                    <SelectContent data-oid="12qibod">
                      <SelectItem value="" data-oid="840gykm">
                        
                      </SelectItem>
                      <SelectItem value="ACTIVE" data-oid="c2:ycth">
                        
                      </SelectItem>
                      <SelectItem value="RESOLVED" data-oid=":ic303k">
                        ?                      </SelectItem>
                      <SelectItem value="IGNORED" data-oid="cr5typf">
                        ?                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/*  */}
            <div className="space-y-4" data-oid="1e5:1qx">
              {filteredEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <Card
                    key={event.id}
                    className="purple-gradient-card hover:shadow-lg transition-shadow"
                    data-oid="sgb1hy7"
                  >
                    <CardContent className="purple-gradient-card p-6" data-oid="8:wuv3q">
                      <div
                        className="flex items-start justify-between"
                        data-oid="3jz7ir5"
                      >
                        <div
                          className="flex items-start gap-4"
                          data-oid="xq6emgs"
                        >
                          <div
                            className="p-2 bg-slate-100 rounded-lg"
                            data-oid="rmfx_x0"
                          >
                            <Icon
                              className="w-5 h-5 text-slate-600"
                              data-oid="yn:x5k7"
                            />
                          </div>
                          <div className="space-y-2" data-oid="tmo1adn">
                            <div
                              className="flex items-center gap-2"
                              data-oid="-230h8c"
                            >
                              <h3 className="font-medium" data-oid="8qvfsda">
                                {getEventTypeName(event.type)}
                              </h3>
                              {getEventSeverityBadge(event.severity)}
                              {getEventStatusBadge(event.status)}
                            </div>
                            <p className="text-slate-600" data-oid="-pi.91x">
                              {event.description}
                            </p>
                            <div
                              className="flex items-center gap-4 text-sm text-slate-500"
                              data-oid="gpgfv3v"
                            >
                              <div
                                className="flex items-center gap-1"
                                data-oid="ua9n-ay"
                              >
                                <CalendarIcon
                                  className="w-4 h-4"
                                  data-oid=".xpuc-1"
                                />
                                {format(
                                  new Date(event.createdAt),
                                  "yyyy-MM-dd HH:mm:ss",
                                  { locale: zhCN },
                                )}
                              </div>
                              <div
                                className="flex items-center gap-1"
                                data-oid="upryqxa"
                              >
                                <User className="w-4 h-4" data-oid=":gy287l" />
                                {event.user?.name || ""}
                              </div>
                              <div
                                className="flex items-center gap-1"
                                data-oid="iz-0g8c"
                              >
                                {event.ipAddress}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventDialog(true);
                          }}
                          data-oid="n5yehx9"
                        >
                          
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/*  */}
          <TabsContent value="logs" className="space-y-6" data-oid="sj5mrql">
            <Card data-oid="1fd0gjb" className="purple-gradient-card">
              <CardHeader data-oid="37fqb5j" className="purple-gradient-card">
                <CardTitle data-oid="s1.k2ox" className="purple-gradient-title purple-gradient-card"></CardTitle>
                <CardDescription data-oid="yzu-67_" className="purple-gradient-card">
                  
                </CardDescription>
              </CardHeader>
              <CardContent data-oid="87p0xbt" className="purple-gradient-card">
                <ScrollArea className="h-96" data-oid="4d-b3f-">
                  <div className="space-y-4" data-oid="l7myqiq">
                    {securityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                        data-oid="uto2rwh"
                      >
                        <div
                          className="p-2 bg-slate-100 rounded-lg"
                          data-oid="owvka7v"
                        >
                          <FileText
                            className="w-4 h-4 text-slate-600"
                            data-oid="wc4jpdf"
                          />
                        </div>
                        <div className="flex-1 space-y-1" data-oid="anmz:kb">
                          <div
                            className="flex items-center gap-2"
                            data-oid="5:3biq3"
                          >
                            <h4 className="font-medium" data-oid="q1uxu7j">
                              {log.action}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              data-oid="qg9ff-p"
                            >
                              {log.level}
                            </Badge>
                          </div>
                          <p
                            className="text-sm text-slate-600"
                            data-oid="gtol132"
                          >
                            {log.user.name} ({log.user.email}) {" "}
                            {log.resource}
                          </p>
                          <div
                            className="text-xs text-slate-500"
                            data-oid="tyf7ita"
                          >
                            {format(
                              new Date(log.timestamp),
                              "yyyy-MM-dd HH:mm:ss",
                              { locale: zhCN },
                            )}{" "}
                            ?{log.ipAddress}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/*  */}
          <TabsContent
            value="settings"
            className="space-y-6"
            data-oid="hwgi_va"
          >
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              data-oid="b9lpeqt"
            >
              {securitySettings.map((setting) => (
                <Card key={setting.id} data-oid=".7o210w" className="purple-gradient-card">
                  <CardHeader data-oid="-.psw8-" className="purple-gradient-card">
                    <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid=".wtf0gd">
                      {setting.settingKey}
                    </CardTitle>
                    <CardDescription data-oid="yu0on6t" className="purple-gradient-card">
                      {setting.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent data-oid="jvyvenn" className="purple-gradient-card">
                    <div className="space-y-4" data-oid="0dasbxk">
                      <div
                        className="flex items-center justify-between"
                        data-oid="lgzq4ht"
                      >
                        <Label data-oid="ed:44g3"></Label>
                        <Badge
                          variant={setting.isPublic ? "default" : "secondary"}
                          data-oid="5_:093w"
                        >
                          {setting.isPublic ? "" : ""}
                        </Badge>
                      </div>
                      <div
                        className="p-3 bg-slate-50 rounded-lg"
                        data-oid="y0gxgok"
                      >
                        <code className="text-sm" data-oid=":x:.cf.">
                          {JSON.stringify(setting.settingValue, null, 2)}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        data-oid="a748ofi"
                      >
                        
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ?*/}
        <Dialog
          open={showEventDialog}
          onOpenChange={setShowEventDialog}
          data-oid="si6r.:3"
        >
          <DialogContent className="sm:max-w-[600px]" data-oid="r7g6njq">
            <DialogHeader data-oid="xs_1avx">
              <DialogTitle data-oid="ggyhjn3"></DialogTitle>
              <DialogDescription data-oid="rynzypz">
                ?              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4" data-oid="nm0ys.6">
                <div className="grid grid-cols-2 gap-4" data-oid="nmm3ol4">
                  <div data-oid="72k3xio">
                    <Label data-oid="rb.:aej"></Label>
                    <p className="font-medium" data-oid="7ve1da4">
                      {getEventTypeName(selectedEvent.type)}
                    </p>
                  </div>
                  <div data-oid="u8lc2js">
                    <Label data-oid="9.e9qr3"></Label>
                    <div className="mt-1" data-oid="txm7fl_">
                      {getEventSeverityBadge(selectedEvent.severity)}
                    </div>
                  </div>
                  <div data-oid="kko_4cj">
                    <Label data-oid="35.4xj5">状态</Label>
                    <div className="mt-1" data-oid="6k29h26">
                      {getEventStatusBadge(selectedEvent.status)}
                    </div>
                  </div>
                  <div data-oid="fxmso.s">
                    <Label data-oid="e4_2c4d">IP</Label>
                    <p className="font-medium" data-oid="e0.v42g">
                      {selectedEvent.ipAddress}
                    </p>
                  </div>
                </div>

                <div data-oid="23uujfa">
                  <Label data-oid="zbd37bn"></Label>
                  <p className="text-slate-600" data-oid="rbkbeio">
                    {selectedEvent.description}
                  </p>
                </div>

                <div data-oid="qfrz:ab">
                  <Label data-oid="5ylfbq-"></Label>
                  <p
                    className="text-sm text-slate-600 break-all"
                    data-oid="yi5_3y_"
                  >
                    {selectedEvent.userAgent}
                  </p>
                </div>

                {selectedEvent.user && (
                  <div data-oid="s:vaiuj">
                    <Label data-oid="qx:-bc-"></Label>
                    <p className="font-medium" data-oid="7zbtwm1">
                      {selectedEvent.user.name} ({selectedEvent.user.email})
                    </p>
                  </div>
                )}

                <div data-oid="-cjvow4">
                  <Label data-oid="2fhkduw"></Label>
                  <p className="text-slate-600" data-oid="t6.z35h">
                    {format(
                      new Date(selectedEvent.createdAt),
                      "yyyy-MM-dd HH:mm:ss",
                      { locale: zhCN },
                    )}
                  </p>
                </div>

                {selectedEvent.details && (
                  <div data-oid="details-section">
                    <Label data-oid="details-label"></Label>
                    <pre className="mt-1 p-3 bg-slate-50 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedEvent.resolvedBy && selectedEvent.resolvedAt && (
                  <div data-oid="resolution-info">
                    <Label data-oid="resolution-label"></Label>
                    <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                         {selectedEvent.resolvedBy} {" "}
                        {format(
                          new Date(selectedEvent.resolvedAt),
                          "yyyy-MM-dd HH:mm:ss",
                          { locale: zhCN }
                        )}{" "}
                        
                      </p>
                      {selectedEvent.details?.resolutionNotes && (
                        <p className="text-sm text-green-700 mt-2">
                          {selectedEvent.details.resolutionNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.status === "ACTIVE" && (
                  <>
                    <Alert data-oid="6q71h71">
                      <AlertTriangle className="h-4 w-4" data-oid="zkodh2m" />
                      <AlertDescription data-oid="v2cml85">
                        ?                      </AlertDescription>
                    </Alert>

                    <div data-oid="resolution-notes">
                      <Label htmlFor="notes"></Label>
                      <Textarea
                        id="notes"
                        placeholder="..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter data-oid="vnl7y:0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEventDialog(false);
                  setResolutionNotes("");
                }}
                data-oid="vd94_1g"
              >
                
              </Button>
              {selectedEvent?.status === "ACTIVE" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      selectedEvent && resolveSecurityEvent(selectedEvent.id, 'ignore')
                    }
                    disabled={isResolving}
                    data-oid="ignore-button"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    
                  </Button>
                  <Button
                    onClick={() => selectedEvent && resolveSecurityEvent(selectedEvent.id, 'resolve')}
                    disabled={isResolving}
                    data-oid="-fetoq1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isResolving ? "?.." : ""}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
