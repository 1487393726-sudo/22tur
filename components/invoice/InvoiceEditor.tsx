'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxCode: string;
  taxRate: number;
}

interface TaxAdjustment {
  id: string;
  description: string;
  amount: number;
  type: 'increase' | 'decrease';
}

interface InvoiceEditorProps {
  invoiceNumber?: string;
  items?: InvoiceItem[];
  taxAdjustments?: TaxAdjustment[];
  customers?: Array<{ id: string; email: string; customUserId?: string; firstName: string; lastName: string }>;
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function InvoiceEditor({
  invoiceNumber = '',
  items = [],
  taxAdjustments = [],
  customers = [],
  onSave,
  onCancel,
}: InvoiceEditorProps) {
  const [formData, setFormData] = useState({
    invoiceNumber,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerCustomId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(items);
  const [adjustments, setAdjustments] = useState<TaxAdjustment[]>(taxAdjustments);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 税编码选项
  const TAX_CODES = [
    { code: '1001', name: '增值税-标准税率', rate: 0.13 },
    { code: '1002', name: '增值税-低税率', rate: 0.09 },
    { code: '1003', name: '增值税-零税率', rate: 0 },
    { code: '2001', name: '消费税', rate: 0.05 },
    { code: '3001', name: '关税', rate: 0.1 },
  ];

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // If selecting a customer, auto-fill customer info
    if (name === 'customerId') {
      const selectedCustomer = customers.find(c => c.id === value);
      if (selectedCustomer) {
        setFormData((prev) => ({
          ...prev,
          customerId: value,
          customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          customerEmail: selectedCustomer.email,
          customerCustomId: selectedCustomer.customUserId || '',
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 添加发票项目
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxCode: '1001',
      taxRate: 0.13,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  // 更新发票项目
  const handleUpdateItem = (id: string, field: string, value: any) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // 如果更新税编码，自动更新税率
          if (field === 'taxCode') {
            const taxOption = TAX_CODES.find((t) => t.code === value);
            if (taxOption) {
              updated.taxRate = taxOption.rate;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  // 删除发票项目
  const handleDeleteItem = (id: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 添加纳税调整
  const handleAddAdjustment = () => {
    const newAdjustment: TaxAdjustment = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      type: 'increase',
    };
    setAdjustments([...adjustments, newAdjustment]);
  };

  // 更新纳税调整
  const handleUpdateAdjustment = (id: string, field: string, value: any) => {
    setAdjustments((prev) =>
      prev.map((adj) =>
        adj.id === id ? { ...adj, [field]: value } : adj
      )
    );
  };

  // 删除纳税调整
  const handleDeleteAdjustment = (id: string) => {
    setAdjustments((prev) => prev.filter((adj) => adj.id !== id));
  };

  // 计算小计
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  // 计算税金
  const calculateTax = () => {
    return invoiceItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + itemTotal * item.taxRate;
    }, 0);
  };

  // 计算调整后的税金
  const calculateAdjustedTax = () => {
    let tax = calculateTax();
    adjustments.forEach((adj) => {
      if (adj.type === 'increase') {
        tax += adj.amount;
      } else {
        tax -= adj.amount;
      }
    });
    return Math.max(0, tax);
  };

  // 计算总计
  const calculateTotal = () => {
    return calculateSubtotal() + calculateAdjustedTax();
  };

  const handleSave = async () => {
    if (!formData.customerName || invoiceItems.length === 0) {
      setError('请填写必填项');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (onSave) {
        await onSave({
          ...formData,
          items: invoiceItems,
          adjustments,
          subtotal: calculateSubtotal(),
          tax: calculateAdjustedTax(),
          total: calculateTotal(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-black/40 backdrop-blur rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">基本信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              选择客户
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleFormChange}
              className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2"
              aria-label="选择客户"
            >
              <option value="" className="bg-slate-900">
                -- 选择客户 --
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id} className="bg-slate-900">
                  {customer.firstName} {customer.lastName} ({customer.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              发票号 <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleFormChange}
              placeholder="输入发票号"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              客户名称 <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleFormChange}
              placeholder="输入客户名称"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              客户邮箱
            </label>
            <Input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleFormChange}
              placeholder="输入客户邮箱"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              客户ID账号
            </label>
            <Input
              type="text"
              name="customerCustomId"
              value={formData.customerCustomId}
              onChange={handleFormChange}
              placeholder="客户独立ID号"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              开票日期
            </label>
            <Input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleFormChange}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              到期日期
            </label>
            <Input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleFormChange}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-white mb-2">
            备注
          </label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleFormChange}
            placeholder="输入备注信息"
            rows={3}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* 发票项目 */}
      <div className="bg-black/40 backdrop-blur rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">发票项目</h3>
          <Button
            onClick={handleAddItem}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加项目
          </Button>
        </div>

        <div className="space-y-4">
          {invoiceItems.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    项目描述 <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'description', e.target.value)
                    }
                    placeholder="输入项目描述"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    数量
                  </label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value))
                    }
                    placeholder="0"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    单价 (¥)
                  </label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`tax-code-${item.id}`} className="block text-xs text-gray-400 mb-1">
                    税编码
                  </label>
                  <select
                    id={`tax-code-${item.id}`}
                    value={item.taxCode}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'taxCode', e.target.value)
                    }
                    className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2 text-sm"
                    aria-label="税编码"
                  >
                    {TAX_CODES.map((tax) => (
                      <option key={tax.code} value={tax.code} className="bg-slate-900">
                        {tax.name} ({(tax.rate * 100).toFixed(0)}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  小计: ¥{(item.quantity * item.unitPrice).toFixed(2)} | 税率: {(item.taxRate * 100).toFixed(0)}% | 税金: ¥{(item.quantity * item.unitPrice * item.taxRate).toFixed(2)}
                </div>
                <Button
                  onClick={() => handleDeleteItem(item.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 纳税调整 */}
      <div className="bg-black/40 backdrop-blur rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">纳税调整</h3>
          <Button
            onClick={handleAddAdjustment}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加调整
          </Button>
        </div>

        <div className="space-y-4">
          {adjustments.map((adj) => (
            <div key={adj.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    调整描述
                  </label>
                  <Input
                    type="text"
                    value={adj.description}
                    onChange={(e) =>
                      handleUpdateAdjustment(adj.id, 'description', e.target.value)
                    }
                    placeholder="输入调整描述"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    调整金额 (¥)
                  </label>
                  <Input
                    type="number"
                    value={adj.amount}
                    onChange={(e) =>
                      handleUpdateAdjustment(adj.id, 'amount', parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`adj-type-${adj.id}`} className="block text-xs text-gray-400 mb-1">
                    调整类型
                  </label>
                  <select
                    id={`adj-type-${adj.id}`}
                    value={adj.type}
                    onChange={(e) =>
                      handleUpdateAdjustment(adj.id, 'type', e.target.value as 'increase' | 'decrease')
                    }
                    className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2 text-sm"
                    aria-label="调整类型"
                  >
                    <option value="increase" className="bg-slate-900">
                      增加
                    </option>
                    <option value="decrease" className="bg-slate-900">
                      减少
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {adj.type === 'increase' ? '+' : '-'}¥{adj.amount.toFixed(2)}
                </div>
                <Button
                  onClick={() => handleDeleteAdjustment(adj.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 金额汇总 */}
      <div className="bg-black/40 backdrop-blur rounded-lg border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">金额汇总</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>小计:</span>
            <span>¥{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>税金:</span>
            <span>¥{calculateTax().toFixed(2)}</span>
          </div>
          {adjustments.length > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>调整:</span>
              <span>
                {adjustments.map((adj) => (
                  <span key={adj.id}>
                    {adj.type === 'increase' ? '+' : '-'}¥{adj.amount.toFixed(2)}{' '}
                  </span>
                ))}
              </span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 flex justify-between text-white font-semibold">
            <span>调整后税金:</span>
            <span>¥{calculateAdjustedTax().toFixed(2)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg">
            <span>总计:</span>
            <span>¥{calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* 按钮 */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存发票
            </>
          )}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          <X className="h-4 w-4 mr-2" />
          取消
        </Button>
      </div>
    </div>
  );
}
