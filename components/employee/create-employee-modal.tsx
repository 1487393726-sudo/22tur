"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { CreateUserData } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";
import { translations } from "@/lib/i18n/translations";

interface CreateEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateEmployeeModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateEmployeeModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);

  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "EMPLOYEE",
    departmentId: "",
    position: "",
    hireDate: new Date(),
  });

  useEffect(() => {
    if (open) {
      loadDepartments();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const result = await response.json();

      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("加载部门列表失败:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        setError(result.error || "创建员工失败");
      }
    } catch (error) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "EMPLOYEE",
      departmentId: "",
      position: "",
      hireDate: new Date(),
    });
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="bvsivej">
      <DialogContent
        className="bg-black/90 border-white/20 backdrop-blur-sm text-white"
        data-oid="nbjt1dn"
      >
        <DialogHeader data-oid="j5hqi:r">
          <DialogTitle className="text-white" data-oid="l2e8x7:">
            {t.modal.createEmployee}
          </DialogTitle>
          <DialogDescription className="text-gray-300" data-oid="m.7w.dt">
            {t.modal.create} {t.modal.createEmployee.toLowerCase()} {t.modal.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" data-oid="t8op8lc">
          <div className="grid grid-cols-2 gap-4" data-oid="yvstwp.">
            <div data-oid="f7n7btj">
              <Label
                htmlFor="firstName"
                className="text-white"
                data-oid="-24etri"
              >
                {t.form.firstName}
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
                data-oid="-6w04ga"
              />
            </div>
            <div data-oid="t3_p7j.">
              <Label
                htmlFor="lastName"
                className="text-white"
                data-oid="7bwg2yp"
              >
                {t.form.lastName}
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
                data-oid="3j1ae1d"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4" data-oid="q44zq:e">
            <div data-oid="qapyzxa">
              <Label htmlFor="email" className="text-white" data-oid="n4k_:zk">
                {t.form.email}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
                data-oid="rloab-9"
              />
            </div>
            <div data-oid="_tzp0wz">
              <Label
                htmlFor="username"
                className="text-white"
                data-oid="-x6asrp"
              >
                用户名
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
                data-oid="56afpyw"
              />
            </div>
          </div>

          <div data-oid="87bzpyo">
            <Label htmlFor="password" className="text-white" data-oid="jhgrniz">
              密码
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              required
              data-oid="h4tkw_s"
            />
          </div>

          <div className="grid grid-cols-2 gap-4" data-oid="ujxuqwh">
            <div data-oid="ocu25a.">
              <Label htmlFor="role" className="text-white" data-oid="i2p4mvu">
                角色
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value as any }))
                }
                data-oid="-dnm59x"
              >
                <SelectTrigger
                  className="bg-white/10 border-white/20 text-white"
                  data-oid="177zww5"
                >
                  <SelectValue placeholder="选择角色" data-oid="b8g40ls" />
                </SelectTrigger>
                <SelectContent data-oid="fi2ei1t">
                  <SelectItem value="EMPLOYEE" data-oid="7y.x5up">
                    员工
                  </SelectItem>
                  <SelectItem value="MANAGER" data-oid="n1eiitd">
                    经理
                  </SelectItem>
                  <SelectItem value="ADMIN" data-oid="9jxvqqv">
                    管理员
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div data-oid="dfyc7-i">
              <Label
                htmlFor="department"
                className="text-white"
                data-oid="tgzocbu"
              >
                部门
              </Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, departmentId: value }))
                }
                data-oid="k49k0br"
              >
                <SelectTrigger
                  className="bg-white/10 border-white/20 text-white"
                  data-oid="qz2xrvc"
                >
                  <SelectValue placeholder="选择部门" data-oid="bij5doy" />
                </SelectTrigger>
                <SelectContent data-oid="uzsq04i">
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept.id}
                      value={dept.id}
                      data-oid="bs5itiw"
                    >
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div data-oid="_qrtqnk">
            <Label htmlFor="position" className="text-white" data-oid="8pfbv7_">
              职位
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, position: e.target.value }))
              }
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              data-oid="oy.z3l1"
            />
          </div>

          <div data-oid="5pyj1::">
            <Label htmlFor="phone" className="text-white" data-oid="sm4do58">
              电话
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              data-oid="_ynk60a"
            />
          </div>

          {error && (
            <Alert
              className="bg-red-500/20 border-red-500/50"
              data-oid="rtyy1bs"
            >
              <AlertDescription className="text-red-200" data-oid="hffm:iw">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter data-oid="8y7ukmj">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              data-oid="r:lvo_f"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-oid="_97qx-j"
            >
              {loading && (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  data-oid="fvb_cdi"
                />
              )}
              {loading ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
