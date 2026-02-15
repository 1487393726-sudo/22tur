"use client";

import {
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatus, InvoiceItem } from "@/types";

interface InvoiceWithRelations extends InvoiceItem {
  invoiceNumber?: string;
  issueDate?: Date | string;
  notes?: string;
  client: {
    name: string;
  };
  project?: {
    name: string;
  };
}

interface ViewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithRelations | null;
}

export function ViewInvoiceModal({
  open,
  onOpenChange,
  invoice,
}: ViewInvoiceModalProps) {
  if (!invoice) return null;

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig: Record<
      InvoiceStatus,
      {
        label: string;
        className: string;
        icon: React.ReactNode;
      }
    > = {
      DRAFT: {
        label: "草稿",
        className: "bg-gray-100 text-gray-800",
        icon: <FileText className="w-4 h-4" data-oid="n_7nz.w" />,
      },
      SENT: {
        label: "已发送",
        className: "bg-blue-100 text-blue-800",
        icon: <Receipt className="w-4 h-4" data-oid="35.4wjw" />,
      },
      PAID: {
        label: "已支付",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" data-oid="si42sjt" />,
      },
      OVERDUE: {
        label: "逾期",
        className: "bg-red-100 text-red-800",
        icon: <AlertCircle className="w-4 h-4" data-oid="ayw:wf_" />,
      },
      CANCELLED: {
        label: "已取消",
        className: "bg-gray-100 text-gray-800",
        icon: <XCircle className="w-4 h-4" data-oid="aw8q4ao" />,
      },
    };

    const config = statusConfig[status];
    return (
      <BadgeComponent className={config.className} data-oid="acbmyh1">
        {config.icon}
        <span className="ml-1" data-oid="kl.hei-">
          {config.label}
        </span>
      </BadgeComponent>
    );
  };

  const isOverdue =
    new Date() > new Date(invoice.dueDate) &&
    invoice.status !== "PAID" &&
    invoice.status !== "CANCELLED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="nwdcyj4">
      <DialogContent
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        data-oid="vjihbee"
      >
        <DialogHeader data-oid="ly.a3k1">
          <DialogTitle className="flex items-center gap-2" data-oid="bgryibl">
            <Receipt className="w-5 h-5" data-oid="0nal8eb" />
            发票详情
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" data-oid="qcihrnc">
          {/* 发票头部 */}
          <Card data-oid="t3r8w-q">
            <CardHeader data-oid="m933td6">
              <div
                className="flex items-center justify-between"
                data-oid="5ltlixo"
              >
                <CardTitle
                  className="text-lg text-xl font-bold"
                  data-oid="7fbub3c"
                >
                  {invoice.invoiceNumber}
                </CardTitle>
                {getStatusBadge(invoice.status)}
              </div>
            </CardHeader>
            <CardContent data-oid="x620m:_">
              <div className="text-center mb-6" data-oid="4:ki:x4">
                <div
                  className="text-3xl font-bold text-blue-600 mb-2"
                  data-oid="eh33bj8"
                >
                  ¥{invoice.amount.toLocaleString()}
                </div>
                {isOverdue && (
                  <div
                    className="flex items-center justify-center gap-2 text-red-600"
                    data-oid="o4-th3i"
                  >
                    <AlertCircle className="w-4 h-4" data-oid="e9bu08n" />
                    <span className="text-sm" data-oid=".pvqk0n">
                      此发票已逾期
                    </span>
                  </div>
                )}
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="0jsxlht"
              >
                <div className="flex items-center gap-2" data-oid="lhv6uj4">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="mier.w6"
                  />
                  <span className="text-sm text-gray-600" data-oid="q3e6524">
                    开票日期:
                  </span>
                  <span className="text-sm font-medium" data-oid="6_q4ri7">
                    {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("zh-CN") : '-'}
                  </span>
                </div>

                <div className="flex items-center gap-2" data-oid="cz1870j">
                  <Clock className="w-4 h-4 text-gray-500" data-oid="oy9bq2:" />
                  <span className="text-sm text-gray-600" data-oid="ydxwa8_">
                    到期日期:
                  </span>
                  <span
                    className={`text-sm font-medium ${isOverdue ? "text-red-600" : ""}`}
                    data-oid="6iiijia"
                  >
                    {new Date(invoice.dueDate).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 客户信息 */}
          <Card data-oid="l3olivh">
            <CardHeader data-oid="19jcv.7">
              <CardTitle
                className="text-lg flex items-center gap-2"
                data-oid="woeju:7"
              >
                <Building2 className="w-5 h-5" data-oid="pv5y0p6" />
                客户信息
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="_kuq_6b">
              <div className="space-y-3" data-oid="vm.7__b">
                <div data-oid="wv3uh-8">
                  <p className="text-sm text-gray-600 mb-1" data-oid="j4xss9a">
                    客户名称:
                  </p>
                  <p className="font-medium" data-oid="3jwq1dp">
                    {invoice.client.name}
                  </p>
                </div>

                {invoice.project && (
                  <div data-oid="ye_ib8o">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="gjk4fqs"
                    >
                      关联项目:
                    </p>
                    <div className="flex items-center gap-2" data-oid="sjedje0">
                      <FileText
                        className="w-4 h-4 text-gray-500"
                        data-oid="y09m_gk"
                      />
                      <span className="font-medium" data-oid="kjpwk.o">
                        {invoice.project.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 发票内容 */}
          {invoice.description && (
            <Card data-oid="vausa3u">
              <CardHeader data-oid="ps0_tl.">
                <CardTitle className="text-lg" data-oid=".d3i2b3">
                  发票内容
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="r_qynom">
                <p
                  className="text-sm bg-gray-50 p-3 rounded"
                  data-oid="4iwleu."
                >
                  {invoice.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 备注 */}
          {invoice.notes && (
            <Card data-oid="2b04gru">
              <CardHeader data-oid="cmyg:g2">
                <CardTitle className="text-lg" data-oid="71-a4q.">
                  备注
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="hddsmt6">
                <p
                  className="text-sm bg-gray-50 p-3 rounded"
                  data-oid="hlm.ouf"
                >
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 时间信息 */}
          <Card data-oid="is9u:fp">
            <CardHeader data-oid="o8s01jj">
              <CardTitle className="text-lg" data-oid="bfo:fk7">
                记录信息
              </CardTitle>
            </CardHeader>
            <CardContent data-oid=":uh3t8k">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="y9bxsvb"
              >
                <div className="flex items-center gap-2" data-oid="rmfqs-z">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="ejeel4e"
                  />
                  <span className="text-sm text-gray-600" data-oid="73etdpj">
                    创建时间:
                  </span>
                  <span className="text-sm" data-oid=".bxeg3l">
                    {new Date(invoice.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>

                <div className="flex items-center gap-2" data-oid="4pdy2r6">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="wp..5_w"
                  />
                  <span className="text-sm text-gray-600" data-oid="kh1epc-">
                    更新时间:
                  </span>
                  <span className="text-sm" data-oid="0:fsvlb">
                    {new Date(invoice.updatedAt).toLocaleString("zh-CN")}
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
