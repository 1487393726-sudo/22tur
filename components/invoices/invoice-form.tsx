"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  calculateLineSubtotal,
  calculateInvoiceAmount,
  formatCurrency,
} from "@/lib/invoice-calculations"

// 发票行项目接口
export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

// 发票表单数据接口
export interface InvoiceFormData {
  number: string
  clientId: string
  projectId?: string
  dueDate: Date
  description?: string
  items: InvoiceLineItem[]
  taxRate: number
  notes?: string
}

// 表单验证 schema
const invoiceFormSchema = z.object({
  number: z.string().min(1, "发票号不能为空"),
  clientId: z.string().min(1, "请选择客户"),
  projectId: z.string().optional(),
  dueDate: z.date({
    required_error: "请选择到期日期",
  }),
  description: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, "请输入项目描述"),
      quantity: z.number().min(0.01, "数量必须大于0"),
      unitPrice: z.number().min(0.01, "单价必须大于0"),
      subtotal: z.number(),
    })
  ).min(1, "至少需要一个明细项"),
  taxRate: z.number().min(0).max(100, "税率必须在0-100之间"),
  notes: z.string().optional(),
})

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>
  clients: Array<{ id: string; name: string; company?: string }>
  projects?: Array<{ id: string; name: string; clientId: string }>
  onSubmit: (data: InvoiceFormData) => Promise<void>
  onCancel: () => void
}

export function InvoiceForm({
  initialData,
  clients,
  projects = [],
  onSubmit,
  onCancel,
}: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialData?.clientId || ""
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      number: initialData?.number || `INV-${Date.now()}`,
      clientId: initialData?.clientId || "",
      projectId: initialData?.projectId || "",
      dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: initialData?.description || "",
      items: initialData?.items || [
        {
          id: crypto.randomUUID(),
          description: "",
          quantity: 1,
          unitPrice: 0,
          subtotal: 0,
        },
      ],
      taxRate: initialData?.taxRate || 13,
      notes: initialData?.notes || "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchItems = watch("items")
  const watchTaxRate = watch("taxRate")
  const watchDueDate = watch("dueDate")

  // 计算小计（使用计算工具库）
  useEffect(() => {
    watchItems.forEach((item, index) => {
      const subtotal = calculateLineSubtotal(item.quantity, item.unitPrice)
      if (item.subtotal !== subtotal) {
        setValue(`items.${index}.subtotal`, subtotal)
      }
    })
  }, [watchItems, setValue])

  // 计算总计（使用计算工具库）
  const { subtotal: subtotalAmount, taxAmount, totalAmount } = calculateInvoiceAmount(
    watchItems,
    watchTaxRate
  )

  // 过滤项目列表（根据选中的客户）
  const filteredProjects = projects.filter(
    (project) => project.clientId === selectedClientId
  )

  const handleFormSubmit = async (data: InvoiceFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      toast.success("发票保存成功")
    } catch (error) {
      console.error("Failed to save invoice:", error)
      toast.error("发票保存失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addLineItem = () => {
    append({
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">发票号 *</Label>
          <Input
            id="number"
            {...register("number")}
            placeholder="INV-20231201-001"
          />
          {errors.number && (
            <p className="text-sm text-red-500">{errors.number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">到期日期 *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchDueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchDueDate ? format(watchDueDate, "PPP") : "选择日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchDueDate}
                onSelect={(date) => date && setValue("dueDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.dueDate && (
            <p className="text-sm text-red-500">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      {/* 客户和项目 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">客户 *</Label>
          <Select
            value={selectedClientId}
            onValueChange={(value) => {
              setValue("clientId", value)
              setSelectedClientId(value)
              setValue("projectId", "") // 重置项目选择
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择客户" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.company || client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clientId && (
            <p className="text-sm text-red-500">{errors.clientId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectId">关联项目（可选）</Label>
          <Select
            value={watch("projectId")}
            onValueChange={(value) => setValue("projectId", value)}
            disabled={!selectedClientId || filteredProjects.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择项目" />
            </SelectTrigger>
            <SelectContent>
              {filteredProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 描述 */}
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="发票描述"
          rows={2}
        />
      </div>

      {/* 明细行 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">明细项 *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加行
          </Button>
        </div>

        {errors.items && typeof errors.items.message === "string" && (
          <p className="text-sm text-red-500">{errors.items.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg bg-white/5 backdrop-blur-sm"
            >
              <div className="col-span-12 md:col-span-5">
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="项目描述"
                />
                {errors.items?.[index]?.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>

              <div className="col-span-4 md:col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  placeholder="数量"
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>

              <div className="col-span-4 md:col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  placeholder="单价"
                />
                {errors.items?.[index]?.unitPrice && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.items[index]?.unitPrice?.message}
                  </p>
                )}
              </div>

              <div className="col-span-3 md:col-span-2 flex items-center">
                <span className="text-sm font-medium">
                  ¥{watchItems[index]?.subtotal.toFixed(2) || "0.00"}
                </span>
              </div>

              <div className="col-span-1 flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  aria-label="删除行"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 税率和总计 */}
      <div className="space-y-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Label htmlFor="taxRate">税率 (%)</Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            {...register("taxRate", { valueAsNumber: true })}
            className="w-32"
          />
        </div>
        {errors.taxRate && (
          <p className="text-sm text-red-500">{errors.taxRate.message}</p>
        )}

        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex justify-between text-sm">
            <span>小计：</span>
            <span className="font-medium">¥{subtotalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>税额 ({watchTaxRate}%)：</span>
            <span className="font-medium">¥{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
            <span>总计：</span>
            <span className="text-white400">¥{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 备注 */}
      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="付款条款、备注等"
          rows={3}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存发票"}
        </Button>
      </div>
    </form>
  )
}
