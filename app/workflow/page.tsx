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
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarIcon,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  priority: "LOW" | "MEDIUM" | "HIGH";
  triggerType: "MANUAL" | "AUTOMATIC" | "SCHEDULED";
  config: any;
  nodes: WorkflowNode[];
  executions: WorkflowExecution[];
  createdAt: string;
  updatedAt: string;
  _count: {
    executions: number;
    nodes: number;
  };
}

interface WorkflowNode {
  id: string;
  name: string;
  type: "START" | "TASK" | "DECISION" | "END";
  config: any;
  position: { x: number; y: number };
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  currentNodeId?: string;
  variables: any;
  error?: string;
  _count: {
    logs: number;
  };
}

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null,
  );
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("workflows");

  // 工作流表单数据
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    triggerType: "MANUAL" as const,
    priority: "MEDIUM" as const,
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflow");
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error("?", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowExecutions = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/executions`);
      if (response.ok) {
        const data = await response.json();
        setExecutions(data);
      }
    } catch (error) {
      console.error(":", error);
    }
  };

  const createWorkflow = async () => {
    try {
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setFormData({
          name: "",
          description: "",
          category: "",
          triggerType: "MANUAL",
          priority: "MEDIUM",
        });
        fetchWorkflows();
      }
    } catch (error) {
      console.error("?", error);
    }
  };

  const executeWorkflow = async (workflowId: string, variables: any = {}) => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables }),
      });

      if (response.ok) {
        setShowExecuteDialog(false);
        if (selectedWorkflow) {
          fetchWorkflowExecutions(selectedWorkflow.id);
        }
      }
    } catch (error) {
      console.error("?", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        variant: "default" as const,
        icon: Play,
        label: "运行中",
        color: "bg-green-500",
      },
      INACTIVE: {
        variant: "secondary" as const,
        icon: Pause,
        label: "已暂停",
        color: "bg-gray-500",
      },
      DRAFT: {
        variant: "outline" as const,
        icon: Edit,
        label: "草稿",
        color: "bg-yellow-500",
      },
      PENDING: {
        variant: "secondary" as const,
        icon: Clock,
        label: "等待中",
        color: "bg-yellow-500",
      },
      RUNNING: {
        variant: "default" as const,
        icon: Play,
        label: "运行中",
        color: "bg-blue-500",
      },
      COMPLETED: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "已完成",
        color: "bg-green-500",
      },
      FAILED: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "失败",
        color: "bg-red-500",
      },
      CANCELLED: {
        variant: "outline" as const,
        icon: XCircle,
        label: "已取消",
        color: "bg-gray-500",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant}
        className="flex items-center gap-1"
        data-oid="ezfv-9e"
      >
        <Icon className="w-3 h-3" data-oid="3j805k1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { label: "低", color: "bg-blue-500" },
      MEDIUM: { label: "中", color: "bg-yellow-500" },
      HIGH: { label: "高", color: "bg-red-500" },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.MEDIUM;

    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1"
        data-oid="mp7tidb"
      >
        <div
          className={`w-2 h-2 rounded-full ${config.color}`}
          data-oid="lkvulu-"
        />
        {config.label}
      </Badge>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6"
      data-oid="q5:1fx6"
    >
      <div className="max-w-7xl mx-auto space-y-6" data-oid="ipvdi5-">
        {/*  */}
        <div className="flex items-center justify-between" data-oid="igq-.76">
          <div data-oid="ibl_3-o">
            <h1
              className="purple-gradient-title text-3xl font-bold text-slate-900"
              data-oid="ytdw:na"
            >
              
            </h1>
            <p className="text-slate-600 mt-2" data-oid="f.hd2xo">
              
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-oid="bz6bgxc"
          >
            <Plus className="w-4 h-4 mr-2" data-oid="jaxg6_w" />
            ?          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
          data-oid="3mq6wk."
        >
          <TabsList
            className="grid w-full grid-cols-3 lg:w-96"
            data-oid="d5bxddc"
          >
            <TabsTrigger value="workflows" data-oid="utlxq0j">
              ?            </TabsTrigger>
            <TabsTrigger value="executions" data-oid="xaq4o:s">
              
            </TabsTrigger>
            <TabsTrigger value="templates" data-oid="aehh7x6">
              
            </TabsTrigger>
          </TabsList>

          {/* ?*/}
          <TabsContent
            value="workflows"
            className="space-y-6"
            data-oid="b0zjc2b"
          >
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-oid="5y0j-v5"
            >
              {workflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className="purple-gradient-card hover:shadow-lg transition-shadow"
                  data-oid="_dejfeb"
                >
                  <CardHeader data-oid="b0uwvuf" className="purple-gradient-card">
                    <div
                      className="flex items-start justify-between"
                      data-oid="eg4cyie"
                    >
                      <div className="space-y-2" data-oid="p4:6x5v">
                        <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid="kzg.j.e">
                          {workflow.name}
                        </CardTitle>
                        <div
                          className="flex items-center gap-2"
                          data-oid="c81i39e"
                        >
                          {getStatusBadge(workflow.status)}
                          {getPriorityBadge(workflow.priority)}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        data-oid="6-86ubj"
                      >
                        {workflow.category}
                      </Badge>
                    </div>
                    <CardDescription
                      className="purple-gradient-card line-clamp-2"
                      data-oid="6lrjo:u"
                    >
                      {workflow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent data-oid="dl-x6-t" className="purple-gradient-card">
                    <div className="space-y-4" data-oid="ni4z6t6">
                      <div
                        className="flex items-center justify-between text-sm text-slate-600"
                        data-oid="breutt1"
                      >
                        <div
                          className="flex items-center gap-2"
                          data-oid="jfrbkhu"
                        >
                          <CalendarIcon
                            className="w-4 h-4"
                            data-oid="stey378"
                          />
                          {format(new Date(workflow.createdAt), "MM/dd", {
                            locale: zhCN,
                          })}
                        </div>
                        <div
                          className="flex items-center gap-4"
                          data-oid="af1a99a"
                        >
                          <span data-oid="h6y-v:.">
                            {workflow._count.nodes} 
                          </span>
                          <span data-oid="-v9okxn">
                            {workflow._count.executions} ?                          </span>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2"
                        data-oid="061rqiq"
                      >
                        <Badge
                          variant="outline"
                          className="text-xs"
                          data-oid=":4oebs9"
                        >
                          {workflow.triggerType === "MANUAL"
                            ? "手动触发"
                            : workflow.triggerType === "AUTOMATIC"
                              ? "自动触发"
                              : "定时触发"}
                        </Badge>
                      </div>

                      <div
                        className="flex items-center gap-2 pt-2"
                        data-oid="-x9k8sb"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            fetchWorkflowExecutions(workflow.id);
                            setActiveTab("executions");
                          }}
                          data-oid="0_h4xxw"
                        >
                          
                        </Button>
                        {workflow.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              setShowExecuteDialog(true);}}
                            data-oid="k6dtnad"
                          >
                            <Play className="w-3 h-3 mr-1" data-oid="j91kwv4" />
                            
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/*  */}
          <TabsContent
            value="executions"
            className="space-y-6"
            data-oid="8o-0jog"
          >
            {selectedWorkflow ? (
              <Card data-oid="_h_rkc0" className="purple-gradient-card">
                <CardHeader data-oid="czom69t" className="purple-gradient-card">
                  <div
                    className="flex items-center justify-between"
                    data-oid="-pnevce"
                  >
                    <div data-oid="ub:cl7l">
                      <CardTitle data-oid="w1s19-z" className="purple-gradient-title purple-gradient-card">
                        {selectedWorkflow.name} - 
                      </CardTitle>
                      <CardDescription data-oid="w_ap66o" className="purple-gradient-card">
                        ?                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowExecuteDialog(true)}
                      data-oid="653ndbt"
                    >
                      <Play className="w-4 h-4 mr-2" data-oid="ygtykq0" />
                      
                    </Button>
                  </div>
                </CardHeader>
                <CardContent data-oid="fd.my6b" className="purple-gradient-card">
                  <div className="space-y-4" data-oid="kmke6lz">
                    {executions.map((execution) => (
                      <div
                        key={execution.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-oid="tmy6x5h"
                      >
                        <div
                          className="flex items-center gap-4"
                          data-oid="wzi.h.w"
                        >
                          {getStatusBadge(execution.status)}
                          <div data-oid="u7zx1e.">
                            <div className="font-medium" data-oid="xdzvur2">
                               ID: {execution.id.slice(0, 8)}...
                            </div>
                            <div
                              className="text-sm text-slate-600"
                              data-oid="3bh_00l"
                            >
                              {execution.startedBy} {" "}
                              {format(
                                new Date(execution.startedAt),
                                "yyyy-MM-dd HH:mm:ss",
                              )}
                              {execution.completedAt &&
                                ` - ${format(new Date(execution.completedAt), "HH:mm:ss")}`}
                            </div>
                            {execution.error && (
                              <div
                                className="text-sm text-red-600 mt-1"
                                data-oid="ns13v.l"
                              >
                                <AlertCircle
                                  className="w-3 h-3 inline mr-1"
                                  data-oid="c.:8b4a"
                                />
                                {execution.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          data-oid="6:e83cy"
                        >
                          <Badge variant="outline" data-oid="4ztld4x">
                            {execution._count.logs} ?                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card data-oid="96r8h7b" className="purple-gradient-card">
                <CardContent className="purple-gradient-card p-8 text-center" data-oid="mdtih7n">
                  <p className="text-slate-600" data-oid="4_s9qzg">
                    
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/*  */}
          <TabsContent
            value="templates"
            className="space-y-6"
            data-oid="06hlcni"
          >
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-oid="i-wemz4"
            >
              {[
                {
                  title: "",
                  description: " ->  -> HR",
                  category: "",
                  nodes: 5,
                  icon: "",
                },
                {
                  title: "",
                  description: " ->  ->  -> ?,
                  category: "",
                  nodes: 6,
                  icon: "",
                },
                {
                  title: "",
                  description: " ->  ->  -> ",
                  category: "",
                  nodes: 5,
                  icon: "",
                },
                {
                  title: "",
                  description:
                    "Offer ->  ->  ->  -> ",
                  category: "",
                  nodes: 7,
                  icon: "",
                },
                {
                  title: "",
                  description:
                    " ->  ->  ->  -> ",
                  category: "",
                  nodes: 6,
                  icon: "",
                },
                {
                  title: "",
                  description:
                    " ->  ->  ->  -> ",
                  category: "",
                  nodes: 6,
                  icon: "",
                },
              ].map((template, index) => (
                <Card
                  key={index}
                  className="purple-gradient-card hover:shadow-lg transition-shadow cursor-pointer"
                  data-oid="_2utxeq"
                >
                  <CardHeader data-oid="jwy7_3l" className="purple-gradient-card">
                    <div className="flex items-center gap-3" data-oid="55d3nz-">
                      <div className="text-2xl" data-oid="4fse2hc">
                        {template.icon}
                      </div>
                      <div className="space-y-1" data-oid="4_l2rhs">
                        <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid="o0x987q">
                          {template.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          data-oid="wxdf878"
                        >
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription
                      className="purple-gradient-card line-clamp-2"
                      data-oid="i6wuz47"
                    >
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent data-oid="8go:zj." className="purple-gradient-card">
                    <div
                      className="flex items-center justify-between"
                      data-oid="jcx8h:y"
                    >
                      <span
                        className="text-sm text-slate-600"
                        data-oid="hk1p.ee"
                      >
                        {template.nodes} ?                      </span>
                      <Button size="sm" variant="outline" data-oid="3:v-ykw">
                        
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/*  */}
        <Dialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          data-oid="kwcoo3p"
        >
          <DialogContent className="sm:max-w-[600px]" data-oid="vtorlec">
            <DialogHeader data-oid="ng17ng7">
              <DialogTitle data-oid="d7_5170"></DialogTitle>
              <DialogDescription data-oid="0rj:w65">
                
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4" data-oid="o036zne">
              <div className="grid gap-2" data-oid="iq_obq8">
                <Label htmlFor="name" data-oid="xom1zn7">
                  ?                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder=""
                  data-oid="hmh6c_3"
                />
              </div>
              <div className="grid gap-2" data-oid="szrhk_f">
                <Label htmlFor="description" data-oid="oefr-1s">
                  
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder=""
                  data-oid="0tbfm9:"
                />
              </div>
              <div className="grid grid-cols-2 gap-4" data-oid="kmpg10t">
                <div className="grid gap-2" data-oid="t92m5mj">
                  <Label data-oid="hm._.wo"></Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    data-oid="n07qjw7"
                  >
                    <SelectTrigger data-oid="dsyuwj7">
                      <SelectValue placeholder="" data-oid="pf86iu8" />
                    </SelectTrigger>
                    <SelectContent data-oid="eq2fyxn">
                      <SelectItem value="" data-oid="6f-ej5e">
                        
                      </SelectItem>
                      <SelectItem value="" data-oid="6wg_ut2">
                        
                      </SelectItem>
                      <SelectItem value="" data-oid="rztf3sc">
                        
                      </SelectItem>
                      <SelectItem value="" data-oid="rypegel">
                        
                      </SelectItem>
                      <SelectItem value="" data-oid="eegf.fh">
                        
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2" data-oid="k55g.me">
                  <Label data-oid="bttnky_"></Label>
                  <Select
                    value={formData.triggerType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, triggerType: value })
                    }
                    data-oid="p2w0em-"
                  >
                    <SelectTrigger data-oid="kbih768">
                      <SelectValue
                        placeholder=""
                        data-oid="ubc5wcw"
                      />
                    </SelectTrigger>
                    <SelectContent data-oid="5zjd-cm">
                      <SelectItem value="MANUAL" data-oid="kqql.qq">
                        
                      </SelectItem>
                      <SelectItem value="AUTOMATIC" data-oid="4ruqgp9">
                        
                      </SelectItem>
                      <SelectItem value="SCHEDULED" data-oid="el4e-_d">
                        
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2" data-oid="pyx:o-d">
                <Label data-oid="::01z45">?/Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priority: value })
                  }
                  data-oid="5d3c-68"
                >
                  <SelectTrigger data-oid="rxp1iew">
                    <SelectValue placeholder="? data-oid="dapas4f" />
                  </SelectTrigger>
                  <SelectContent data-oid="ha_6_ip">
                    <SelectItem value="LOW" data-oid="1ft99_4">
                      ?                    </SelectItem>
                    <SelectItem value="MEDIUM" data-oid="62z7r_4">
                      ?                    </SelectItem>
                    <SelectItem value="HIGH" data-oid="lbd2u1b">
                      ?                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter data-oid="t9in72g">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                data-oid="7u2h5yh"
              >
                
              </Button>
              <Button onClick={createWorkflow} data-oid="yv:7_xd" className="purple-gradient-button">
                ?              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/*  */}
        <Dialog
          open={showExecuteDialog}
          onOpenChange={setShowExecuteDialog}
          data-oid="u56t22i"
        >
          <DialogContent className="sm:max-w-[400px]" data-oid="16m3e24">
            <DialogHeader data-oid="4mhfvyj">
              <DialogTitle data-oid="7epefli">?/DialogTitle>
              <DialogDescription data-oid="ffr25tj">
                
              </DialogDescription>
            </DialogHeader>
            {selectedWorkflow && (
              <div className="space-y-4" data-oid=":x2xor_">
                <div className="p-4 bg-slate-50 rounded-lg" data-oid="u-e3ftd">
                  <h4 className="font-medium" data-oid="vmgyzs1">
                    {selectedWorkflow.name}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1" data-oid="rew6:f5">
                    {selectedWorkflow.description}
                  </p>
                </div>
                <div className="text-sm text-slate-600" data-oid="v.h9dt3">
                  ?                </div>
              </div>
            )}
            <DialogFooter data-oid="3r.xcj4">
              <Button
                variant="outline"
                onClick={() => setShowExecuteDialog(false)}
                data-oid="-ipye_g"
              >
                
              </Button>
              <Button
                onClick={() => selectedWorkflow && executeWorkflow(selectedWorkflow.id)}
                data-oid="dn2e66r"
              >
                
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
