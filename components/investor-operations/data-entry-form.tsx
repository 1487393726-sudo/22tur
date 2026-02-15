'use client';

/**
 * 数据录入表单组件
 * Data Entry Form Component
 * 
 * 带验证的运营数据录入表单，支持凭证上传和异常数据标记
 * 需求: 10.1, 10.3, 10.4, 10.5
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Upload,
  FileText,
  History,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import {
  ExpenseCategory,
  DataValidationResult,
  DataValidationWarning,
  DataModificationHistory
} from '@/types/investor-operations-monitoring';

/**
 * 组件属性
 */
interface DataEntryFormProps {
  projectId: string;
  projectName?: string;
  initialDate?: Date;
  onSaveSuccess?: () => void;
}

/**
 * 支出类别显示名称
 */
const EXPENSE_CATEGORY_NAMES: Record<ExpenseCategory, string> = {
  [ExpenseCategory.RAW_MATERIALS]: '原材料',
  [ExpenseCategory.LABOR]: '人工',
  [ExpenseCategory.RENT]: '租金',
  [ExpenseCategory.UTILITIES]: '水电',
  [ExpenseCategory.MARKETING]: '营销',
  [ExpenseCategory.EQUIPMENT]: '设备',
  [ExpenseCategory.MAINTENANCE]: '维护',
  [ExpenseCategory.OTHER]: '其他'
};

/**
 * 支出项接口
 */
interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receiptUrl?: string;
}

/**
 * 数据录入表单
 */
export function DataEntryForm({
  projectId,
  projectName,
  initialDate,
  onSaveSuccess
}: DataEntryFormProps) {
  const [date, setDate] = useState<string>(
    initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [revenue, setRevenue] = useState<string>('');
  const [customerCount, setCustomerCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [modificationReason, setModificationReason] = useState<string>('');
  
  const [validationResult, setValidationResult] = useState<DataValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<DataModificationHistory[]>([]);

  // 计算总支出和利润
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = (parseFloat(revenue) || 0) - totalExpenses;

  // 添加支出项
  const addExpense = () => {
    setExpenses([
      ...expenses,
      {
        id: `expense-${Date.now()}`,
        category: ExpenseCategory.OTHER,
        amount: 0,
        description: ''
      }
    ]);
  };

  // 删除支出项
  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // 更新支出项
  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(expenses.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  // 验证数据
  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/operations/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          revenue: parseFloat(revenue) || 0,
          expenses: expenses.map(e => ({
            category: e.category,
            amount: e.amount,
            description: e.description,
            receiptUrl: e.receiptUrl
          })),
          customerCount: customerCount ? parseInt(customerCount) : undefined,
          notes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setValidationResult(data.data);
      }
    } catch (error) {
      console.error('验证失败:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // 保存数据
  const handleSave = async () => {
    // 先验证
    await handleValidate();
    
    if (validationResult && !validationResult.isValid) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/operations/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          revenue: parseFloat(revenue) || 0,
          expenses: expenses.map(e => ({
            category: e.category,
            amount: e.amount,
            description: e.description,
            receiptUrl: e.receiptUrl
          })),
          customerCount: customerCount ? parseInt(customerCount) : undefined,
          notes,
          modificationReason
        })
      });

      if (res.ok) {
        onSaveSuccess?.();
        // 重置表单
        setRevenue('');
        setCustomerCount('');
        setNotes('');
        setExpenses([]);
        setModificationReason('');
        setValidationResult(null);
      }
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 加载修改历史
  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/data-history?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('加载历史失败:', error);
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory, projectId]);

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">运营数据录入</h2>
          {projectName && (
            <p className="text-white/60 mt-1">{projectName}</p>
          )}
        </div>
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <History className="w-4 h-4 mr-2" />
              修改历史
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">数据修改历史</DialogTitle>
            </DialogHeader>
            <ModificationHistoryList history={history} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 基本信息 */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white/80">日期</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/80">收入 (¥)</Label>
              <Input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="0.00"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/80">客户数量</Label>
              <Input
                type="number"
                value={customerCount}
                onChange={(e) => setCustomerCount(e.target.value)}
                placeholder="可选"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white/80">备注</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="可选备注信息..."
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* 支出明细 */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">支出明细</CardTitle>
          <Button
            size="sm"
            onClick={addExpense}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加支出
          </Button>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无支出记录，点击"添加支出"开始录入</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <ExpenseItemRow
                  key={expense.id}
                  expense={expense}
                  onUpdate={(field, value) => updateExpense(expense.id, field, value)}
                  onRemove={() => removeExpense(expense.id)}
                />
              ))}
            </div>
          )}

          {/* 汇总 */}
          {expenses.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/60">总支出</span>
                <span className="text-xl font-bold text-white">
                  ¥{totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/60">利润</span>
                <span className={`text-xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ¥{profit.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 验证结果 */}
      {validationResult && (
        <ValidationResultCard result={validationResult} />
      )}

      {/* 修改原因（如果是更新） */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="pt-6">
          <Label className="text-white/80">修改原因（如果是更新现有数据）</Label>
          <Input
            value={modificationReason}
            onChange={(e) => setModificationReason(e.target.value)}
            placeholder="可选：说明修改原因..."
            className="bg-white/10 border-white/20 text-white mt-2"
          />
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleValidate}
          disabled={isValidating}
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          {isValidating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          验证数据
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || (validationResult && !validationResult.isValid)}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          保存数据
        </Button>
      </div>
    </div>
  );
}

/**
 * 支出项行组件
 */
function ExpenseItemRow({
  expense,
  onUpdate,
  onRemove
}: {
  expense: ExpenseItem;
  onUpdate: (field: keyof ExpenseItem, value: any) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label className="text-white/60 text-sm">类别</Label>
          <Select
            value={expense.category}
            onValueChange={(v) => onUpdate('category', v)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EXPENSE_CATEGORY_NAMES).map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white/60 text-sm">金额 (¥)</Label>
          <Input
            type="number"
            value={expense.amount || ''}
            onChange={(e) => onUpdate('amount', parseFloat(e.target.value) || 0)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label className="text-white/60 text-sm">描述</Label>
          <Input
            value={expense.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="可选"
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * 验证结果卡片
 */
function ValidationResultCard({ result }: { result: DataValidationResult }) {
  return (
    <Card className={`border ${result.isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          {result.isValid ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-300 font-medium">数据验证通过</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-red-400" />
              <span className="text-red-300 font-medium">数据验证失败</span>
            </>
          )}
        </div>

        {result.errors.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-red-300 text-sm font-medium">错误:</p>
            {result.errors.map((error, i) => (
              <div key={i} className="bg-red-500/10 rounded p-2 text-red-200 text-sm">
                {error.field}: {error.message}
              </div>
            ))}
          </div>
        )}

        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <p className="text-yellow-300 text-sm font-medium">警告:</p>
            {result.warnings.map((warning, i) => (
              <div key={i} className="bg-yellow-500/10 rounded p-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-200 text-sm">{warning.message}</p>
                    {warning.suggestion && (
                      <p className="text-yellow-300/60 text-xs mt-1">{warning.suggestion}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 修改历史列表
 */
function ModificationHistoryList({ history }: { history: DataModificationHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>暂无修改历史</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {history.map((item) => (
        <div key={item.id} className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-purple-500/20 text-white">
              {item.fieldName}
            </Badge>
            <span className="text-white/50 text-xs">
              {new Date(item.modifiedAt).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/50">原值:</span>
              <span className="text-red-300 ml-2">{item.oldValue || '-'}</span>
            </div>
            <div>
              <span className="text-white/50">新值:</span>
              <span className="text-green-300 ml-2">{item.newValue || '-'}</span>
            </div>
          </div>
          {item.modificationReason && (
            <p className="text-white/50 text-xs mt-2">
              原因: {item.modificationReason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default DataEntryForm;
