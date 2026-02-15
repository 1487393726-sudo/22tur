"use client";

import {
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus, TaskPriority, TaskItem } from "@/types";

interface TaskWithRelations extends TaskItem {
  assignee?: {
    name: string;
    email: string;
  };
  creator?: {
    name: string;
  };
  project?: {
    name: string;
  };
}

interface ViewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithRelations | null;
}

export function ViewTaskModal({
  open,
  onOpenChange,
  task,
}: ViewTaskModalProps) {
  if (!task) return null;

  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig: Record<
      TaskStatus,
      {
        label: string;
        className: string;
        icon: React.ReactNode;
      }
    > = {
      TODO: {
        label: "待办",
        className: "bg-gray-100 text-gray-800",
        icon: <Clock className="w-4 h-4" data-oid="1mb8:4p" />,
      },
      IN_PROGRESS: {
        label: "进行中",
        className: "bg-blue-100 text-blue-800",
        icon: <RotateCcw className="w-4 h-4" data-oid="fo49w73" />,
      },
      IN_REVIEW: {
        label: "待审核",
        className: "bg-yellow-100 text-yellow-800",
        icon: <AlertCircle className="w-4 h-4" data-oid="3opfimc" />,
      },
      DONE: {
        label: "已完成",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" data-oid="4e2qs1q" />,
      },
    };

    const config = statusConfig[status];
    return (
      <BadgeComponent className={config.className} data-oid="d86k.6e">
        {config.icon}
        <span className="ml-1" data-oid="-bs9cgi">
          {config.label}
        </span>
      </BadgeComponent>
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const priorityConfig: Record<
      TaskPriority,
      { label: string; className: string }
    > = {
      LOW: { label: "低", className: "bg-green-100 text-green-800" },
      MEDIUM: { label: "中", className: "bg-yellow-100 text-yellow-800" },
      HIGH: { label: "高", className: "bg-orange-100 text-orange-800" },
      URGENT: { label: "紧急", className: "bg-red-100 text-red-800" },
    };

    const config = priorityConfig[priority];
    return (
      <BadgeComponent className={config.className} data-oid="4fk5k8z">
        {config.label}
      </BadgeComponent>
    );
  };

  const isOverdue = task.dueDate
    ? new Date(task.dueDate) < new Date() && task.status !== "DONE"
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="amjckmy">
      <DialogContent
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        data-oid="nw7ah0z"
      >
        <DialogHeader data-oid="va1od_t">
          <DialogTitle className="flex items-center gap-2" data-oid="0nin9ub">
            <FileText className="w-5 h-5" data-oid="nmu-j-o" />
            任务详情
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" data-oid="k105jv.">
          {/* 任务基本信息 */}
          <Card data-oid=".qrwql-">
            <CardHeader data-oid="qr8cjh6">
              <div
                className="flex items-center justify-between"
                data-oid="c6xc:27"
              >
                <CardTitle className="text-lg" data-oid="x1d9q0u">
                  {task.title}
                </CardTitle>
                <div className="flex gap-2" data-oid="yb:dsyt">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="g09po7a">
              <div data-oid="8v0gv02">
                <p className="text-sm text-gray-600 mb-2" data-oid="1s6n.5w">
                  任务描述:
                </p>
                <p
                  className="text-sm bg-gray-50 p-3 rounded leading-relaxed"
                  data-oid="bvayka0"
                >
                  {task.description}
                </p>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="9fu53:-"
              >
                <div className="flex items-center gap-2" data-oid="5pjlljn">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid=":48q:pe"
                  />
                  <span className="text-sm text-gray-600" data-oid="m93.25-">
                    截止日期:
                  </span>
                  <span
                    className={`text-sm font-medium ${isOverdue ? "text-red-600" : ""}`}
                    data-oid=":0gp.73"
                  >
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("zh-CN")
                      : "未设置"}
                  </span>
                </div>

                {isOverdue && (
                  <div
                    className="flex items-center gap-2 text-red-600"
                    data-oid="3og-p66"
                  >
                    <AlertCircle className="w-4 h-4" data-oid="-v8-f4s" />
                    <span className="text-sm" data-oid="qs5g-:8">
                      任务已逾期
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 分配信息 */}
          <Card data-oid="yo2gun_">
            <CardHeader data-oid="zkmif9t">
              <CardTitle className="text-lg" data-oid="7pf1ncc">
                分配信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="1kqi2o5">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="-bantuw"
              >
                {task.assignee && (
                  <div data-oid="t:r8wzj">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="vp1p44w"
                    >
                      负责人:
                    </p>
                    <div className="flex items-center gap-2" data-oid="_orh3il">
                      <User
                        className="w-4 h-4 text-gray-500"
                        data-oid="vhnh5p9"
                      />
                      <div data-oid="ol5rvrh">
                        <p className="font-medium" data-oid="8.4wdyr">
                          {task.assignee.name}
                        </p>
                        <p className="text-sm text-gray-500" data-oid="fanp-x2">
                          {task.assignee.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {task.creator && (
                  <div data-oid="w4pnujd">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="y7vf-q1"
                    >
                      创建人:
                    </p>
                    <div className="flex items-center gap-2" data-oid="r3p1oe_">
                      <User
                        className="w-4 h-4 text-gray-500"
                        data-oid="8nnjte1"
                      />
                      <span className="font-medium" data-oid="bw4n_74">
                        {task.creator.name}
                      </span>
                    </div>
                  </div>
                )}

                {task.project && (
                  <div data-oid="aa0:o-o">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="55r4en9"
                    >
                      关联项目:
                    </p>
                    <div className="flex items-center gap-2" data-oid="u63gg3d">
                      <Building2
                        className="w-4 h-4 text-gray-500"
                        data-oid="mnr2:3u"
                      />
                      <span className="font-medium" data-oid="upj:exj">
                        {task.project.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!task.assignee && !task.creator && !task.project && (
                <p className="text-sm text-gray-500 italic" data-oid="muvp08m">
                  暂无分配信息
                </p>
              )}
            </CardContent>
          </Card>

          {/* 时间信息 */}
          <Card data-oid="yv9393i">
            <CardHeader data-oid="1.u-gk:">
              <CardTitle className="text-lg" data-oid="mtka2hq">
                时间信息
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="_01e_zq">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid=":hq:khu"
              >
                <div className="flex items-center gap-2" data-oid="sb:wusq">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="iaz0wnj"
                  />
                  <span className="text-sm text-gray-600" data-oid="2a7n_9z">
                    创建时间:
                  </span>
                  <span className="text-sm" data-oid="3l6nhp:">
                    {new Date(task.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>

                <div className="flex items-center gap-2" data-oid="rl:3v3g">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="0mmk.0a"
                  />
                  <span className="text-sm text-gray-600" data-oid="78pkk98">
                    更新时间:
                  </span>
                  <span className="text-sm" data-oid="nscwl1-">
                    {new Date(task.updatedAt).toLocaleString("zh-CN")}
                  </span>
                </div>

                <div className="flex items-center gap-2" data-oid="ia_1bjy">
                  <Clock className="w-4 h-4 text-gray-500" data-oid="p0vml9x" />
                  <span className="text-sm text-gray-600" data-oid="9zzm85l">
                    剩余时间:
                  </span>
                  <span
                    className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-blue-600"}`}
                    data-oid="cspi75-"
                  >
                    {task.dueDate
                      ? calculateTimeRemaining(task.dueDate)
                      : "未设置截止日期"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 计算剩余时间
function calculateTimeRemaining(dueDate: Date | string): string {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();

  if (diff < 0) {
    const days = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));
    return `逾期 ${days} 天`;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `还剩 ${days} 天 ${hours} 小时`;
  } else if (hours > 0) {
    return `还剩 ${hours} 小时`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `还剩 ${minutes} 分钟`;
  }
}
