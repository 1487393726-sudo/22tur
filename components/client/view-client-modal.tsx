"use client";

import {
  Calendar,
  Phone,
  Mail,
  Building2,
  Globe,
  MapPin,
  FileText,
  DollarSign,
  Users,
  Badge,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  industry?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  website?: string | null;
  description?: string | null;
  contactPerson?: string | null;
  position?: string | null;
}

interface ClientWithProjects extends Client {
  _count: {
    projects: number;
  };
  projects?: Array<{
    id: string;
    name: string;
    status: string;
    budget?: number;
    startDate: Date;
    endDate?: Date;
  }>;
  totalProjectValue?: number;
}

interface ViewClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientWithProjects | null;
}

export function ViewClientModal({
  open,
  onOpenChange,
  client,
}: ViewClientModalProps) {
  if (!client) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: "活跃", className: "bg-green-100 text-green-800" },
      INACTIVE: { label: "未活跃", className: "bg-gray-100 text-gray-800" },
      PROSPECT: {
        label: "潜在客户",
        className: "bg-yellow-100 text-yellow-800",
      },
      CHURNED: { label: "已流失", className: "bg-red-100 text-red-800" },
      PLANNING: { label: "规划中", className: "bg-blue-100 text-blue-800" },
      IN_PROGRESS: {
        label: "进行中",
        className: "bg-purple-100 text-white800",
      },
      COMPLETED: { label: "已完成", className: "bg-green-100 text-green-800" },
      ON_HOLD: { label: "暂停", className: "bg-orange-100 text-orange-800" },
      CANCELLED: { label: "已取消", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status];
    return (
      <BadgeComponent className={config.className} data-oid="vrhh83:">
        {config.label}
      </BadgeComponent>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="std2gv:">
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        data-oid="y_zmo1_"
      >
        <DialogHeader data-oid="y5by316">
          <DialogTitle className="flex items-center gap-2" data-oid="b4df4:u">
            <Building2 className="w-5 h-5" data-oid="iyzbuns" />
            {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" data-oid="6bqv53c">
          {/* 基本信息 */}
          <Card data-oid=":gim4xv">
            <CardHeader data-oid="28hny:f">
              <CardTitle className="text-lg" data-oid="m2.pcz2">
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="w.j:l_w">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="mrgbzg2"
              >
                <div className="flex items-center gap-2" data-oid="-9muqec">
                  <Building2
                    className="w-4 h-4 text-gray-500"
                    data-oid="txzp5pg"
                  />
                  <span className="text-sm text-gray-600" data-oid="v9a-10g">
                    行业:
                  </span>
                  <BadgeComponent variant="outline" data-oid="x3ul55-">
                    {client.industry || "其他"}
                  </BadgeComponent>
                </div>

                <div className="flex items-center gap-2" data-oid="4n_pf8u">
                  <Badge className="w-4 h-4 text-gray-500" data-oid="v.vaq6r" />
                  <span className="text-sm text-gray-600" data-oid="9c9s2e6">
                    状态:
                  </span>
                  {getStatusBadge(client.status)}
                </div>

                {client.website && (
                  <div className="flex items-center gap-2" data-oid="4n:h:mn">
                    <Globe
                      className="w-4 h-4 text-gray-500"
                      data-oid="2l_t5qg"
                    />
                    <span className="text-sm text-gray-600" data-oid="n0zqgve">
                      网站:
                    </span>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                      data-oid="j-ju_y_"
                    >
                      {client.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2" data-oid="m53x40:">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="t02h:dt"
                  />
                  <span className="text-sm text-gray-600" data-oid="7t-xklw">
                    创建时间:
                  </span>
                  <span className="text-sm" data-oid="s1zix7h">
                    {new Date(client.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>

              {client.description && (
                <div data-oid="2fit0g-">
                  <p className="text-sm text-gray-600 mb-2" data-oid="i:q09q9">
                    备注:
                  </p>
                  <p
                    className="text-sm bg-gray-50 p-3 rounded"
                    data-oid="i-upkce"
                  >
                    {client.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 联系信息 */}
          <Card data-oid="3qzadbo">
            <CardHeader data-oid="q_3:yon">
              <CardTitle className="text-lg" data-oid="65a5olx">
                联系信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="99:5cl8">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="0loi::v"
              >
                {client.contactPerson && (
                  <div data-oid="8dh5tml">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="0.i:mne"
                    >
                      联系人:
                    </p>
                    <p className="font-medium" data-oid=":anjxi3">
                      {client.contactPerson}
                    </p>
                    {client.position && (
                      <p className="text-sm text-gray-500" data-oid="k0m6bmv">
                        {client.position}
                      </p>
                    )}
                  </div>
                )}

                {client.phone && (
                  <div data-oid="qtlqwvq">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="nnuq0t3"
                    >
                      联系电话:
                    </p>
                    <div className="flex items-center gap-2" data-oid="ni:3ubb">
                      <Phone
                        className="w-4 h-4 text-gray-500"
                        data-oid="wu6ah7u"
                      />
                      <span className="font-medium" data-oid="k:7m4yq">
                        {client.phone}
                      </span>
                    </div>
                  </div>
                )}

                {client.email && (
                  <div data-oid="1x2mzu7">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="yrap1x-"
                    >
                      邮箱:
                    </p>
                    <div className="flex items-center gap-2" data-oid="ievkskv">
                      <Mail
                        className="w-4 h-4 text-gray-500"
                        data-oid="33fu01-"
                      />
                      <a
                        href={`mailto:${client.email}`}
                        className="text-blue-600 hover:underline"
                        data-oid="vth2vcx"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}

                {client.address && (
                  <div className="md:col-span-2" data-oid="4mnmn7q">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="cqt9fq1"
                    >
                      地址:
                    </p>
                    <div className="flex items-start gap-2" data-oid="h-a86yi">
                      <MapPin
                        className="w-4 h-4 text-gray-500 mt-0.5"
                        data-oid="k2p3iao"
                      />
                      <span className="text-sm" data-oid="rgwf0n6">
                        {client.address}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 项目统计 */}
          <Card data-oid="v5ufter">
            <CardHeader data-oid="pa-80kc">
              <CardTitle
                className="text-lg flex items-center gap-2"
                data-oid="qkf3lah"
              >
                <FileText className="w-5 h-5" data-oid="-a_g0wp" />
                项目信息
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="1ms90nv">
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                data-oid="nx7:lbc"
              >
                <div className="flex items-center gap-2" data-oid="oz9-.z_">
                  <Users className="w-4 h-4 text-gray-500" data-oid="_wg_y4n" />
                  <span className="text-sm text-gray-600" data-oid="a-bb8qb">
                    项目总数:
                  </span>
                  <span className="font-medium" data-oid="-tvnd:5">
                    {client._count.projects}
                  </span>
                </div>

                {client.totalProjectValue && (
                  <div className="flex items-center gap-2" data-oid="i76:2ml">
                    <DollarSign
                      className="w-4 h-4 text-gray-500"
                      data-oid="u_r:rpi"
                    />
                    <span className="text-sm text-gray-600" data-oid="xjcme0q">
                      总价值:
                    </span>
                    <span className="font-medium" data-oid="yufgto:">
                      ¥{client.totalProjectValue.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2" data-oid="gayji6o">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="vz9lktl"
                  />
                  <span className="text-sm text-gray-600" data-oid="y7qzv1n">
                    最后更新:
                  </span>
                  <span className="text-sm" data-oid="oq5q7dx">
                    {new Date(client.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>

              {/* 项目列表 */}
              {client.projects && client.projects.length > 0 && (
                <div data-oid="eup.olj">
                  <p className="text-sm text-gray-600 mb-3" data-oid="p6ufoar">
                    最近项目:
                  </p>
                  <div className="space-y-2" data-oid="4qtf.qb">
                    {client.projects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        data-oid="u_swpgu"
                      >
                        <div data-oid="087br8a">
                          <p className="font-medium" data-oid="fnql3g4">
                            {project.name}
                          </p>
                          <p
                            className="text-sm text-gray-500"
                            data-oid="8qqirsv"
                          >
                            {new Date(project.startDate).toLocaleDateString(
                              "zh-CN",
                            )}{" "}
                            -
                            {project.endDate
                              ? new Date(project.endDate).toLocaleDateString(
                                  "zh-CN",
                                )
                              : "进行中"}
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          data-oid="0l:_r4y"
                        >
                          {getStatusBadge(project.status)}
                          {project.budget && (
                            <span
                              className="text-sm font-medium"
                              data-oid="bpcqgjn"
                            >
                              ¥{project.budget.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
