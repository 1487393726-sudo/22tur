'use client';

/**
 * 每日运营数据录入表单
 * Daily Operations Form Component
 * 
 * 管理员用于录入每日运营数据
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar,
  DollarSign,
  Users,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ExpenseCategory, ExpenseItemInput } from '@/types/investor-operations-monitoring';

// 支出类别配置
const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: ExpenseCategory.RAW_MATERIALS, label: '原材料' },
  { value: ExpenseCategory.LABOR, label: '人工' },
  { value: ExpenseCategory.RENT, label: '租金' },
  { value: ExpenseCategory.UTILITIES, label: '水电' },
  { value: ExpenseCategory.MARKETING, label: '营销' },
  { value: ExpenseCategory.EQUIPMENT, label: '设备' },
  { value: ExpenseCategory.MAINTENANCE, label: '维护' },
  { value: ExpenseCategory.OTHER, label: '其他' }
];

interface DailyOperationsFormProps {
  projectId: string;
  initialDate?: Date;
  onSubmit: (data: DailyOperationsFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface DailyOperationsFormData {
  date: Date;
  revenue: number;
  expenses: ExpenseItemInput[];
  customerCount?: number;
  notes?: string;
}

export function DailyOperationsForm({
  projectId,
  initialDate = new Date(),
  onSubmit,
  onCancel,
  isLoading = false
}: DailyOperationsFormProps) {
  const [date, setDate] = useState(initialDate.toISOString().split('T')[0]);
  const [revenue, setRevenue] = useState('');
  const [customerCount, setCustomerCount] = useState('');
  const [notes, setNotes] = useState('');
  const [expenses, setExpenses] = useState<ExpenseItemInput[]>([
    { category: ExpenseCategory.RAW_MATERIALS, amount: 0 }
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 添加支出项
  const addExpense = useCallback(() => {
    setExpenses(prev => [
      ...prev,
      { category: ExpenseCategory.OTHER, amount: 0 }
    ]);
  }, []);

  // 删除支出项
  const removeExpense = useCallback((index: number) => {
    setExpenses(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 更新支出项
  const updateExpense = useCallback((
    index: number,
    field: keyof ExpenseItemInput,
    value: string | number
  ) => {
    setExpenses(prev => prev.map((expense, i) => {
      if (i !== index) return expense;
      return {
        ...expense,
        [field]: field === 'amount' ? parseFloat(String(value)) || 0 : value
      };
    }));
  }, []);

  // 计算总支出
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const revenueNum = parseFloat(revenue) || 0;
  const profit = revenueNum - totalExpenses;

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!date) {
      newErrors.push('请选择日期');
    }

    if (!revenue || parseFloat(revenue) < 0) {
      newErrors.push('请输入有效的收入金额');
    }

    if (expenses.length === 0) {
      newErrors.push('请至少添加一项支出');
    }

    expenses.forEach((expense, index) => {
      if (expense.amount < 0) {
        newErrors.push(`支出项 ${index + 1} 金额不能为负数`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitStatus('idle');
      await onSubmit({
        date: new Date(date),
        revenue: parseFloat(revenue),
        expenses,
        customerCount: customerCount ? parseInt(customerCount) : undefined,
        notes: notes || undefined
      });
      setSubmitStatus('success');
      
      // 重置表单
      setRevenue('');
      setCustomerCount('');
      setNotes('');
      setExpenses([{ category: ExpenseCategory.RAW_MATERIALS, amount: 0 }]);
    } catch (error) {
      setSubmitStatus('error');
      setErrors([error instanceof Error ? error.message : '提交失败']);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-white400" />
          录入每日运营数据
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* 错误提示 */}
          {errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">请修正以下错误:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 成功提示 */}
          {submitStatus === 'success' && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>数据录入成功!</span>
            </div>
          )}

          {/* 日期和收入 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white400" />
                日期
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                收入 (元)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="请输入当日收入"
                className="bg-gray-800/50 border-purple-500/30"
                required
              />
            </div>
          </div>

          {/* 客户数量 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              客户数量 (可选)
            </Label>
            <Input
              type="number"
              min="0"
              value={customerCount}
              onChange={(e) => setCustomerCount(e.target.value)}
              placeholder="请输入当日客户数量"
              className="bg-gray-800/50 border-purple-500/30"
            />
          </div>

          {/* 支出明细 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">支出明细</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExpense}
                className="border-purple-500/50 hover:bg-purple-900/30"
              >
                <Plus className="h-4 w-4 mr-1" />
                添加支出
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex-1">
                    <Select
                      value={expense.category}
                      onValueChange={(value) => updateExpense(index, 'category', value)}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-purple-500/30">
                        <SelectValue placeholder="选择类别" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={expense.amount || ''}
                      onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                      placeholder="金额"
                      className="bg-gray-800/50 border-purple-500/30"
                    />
                  </div>

                  <div className="flex-1">
                    <Input
                      value={expense.description || ''}
                      onChange={(e) => updateExpense(index, 'description', e.target.value)}
                      placeholder="备注 (可选)"
                      className="bg-gray-800/50 border-purple-500/30"
                    />
                  </div>

                  {expenses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExpense(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 汇总信息 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-400">总收入</div>
              <div className="text-lg font-semibold text-green-400">
                ¥{revenueNum.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">总支出</div>
              <div className="text-lg font-semibold text-red-400">
                ¥{totalExpenses.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">利润</div>
              <div className={`text-lg font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ¥{profit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label>备注 (可选)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="添加当日运营备注..."
              className="bg-gray-800/50 border-purple-500/30 min-h-[80px]"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-gray-600"
            >
              取消
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '保存中...' : '保存数据'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default DailyOperationsForm;
