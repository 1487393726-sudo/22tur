/**
 * 响应式表格组件
 * 
 * 功能：
 * - 桌面端：标准表格
 * - 移动端：卡片布局
 * - 自动适配屏幕尺寸
 */

'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  title: string
  render?: (value: any, item: T) => ReactNode
  className?: string
  mobileLabel?: string // 移动端显示的标签
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  onRowClick?: (item: T) => void
  actions?: (item: T) => ReactNode
  emptyMessage?: string
  className?: string
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  actions,
  emptyMessage = '暂无数据',
  className,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* 桌面端：表格视图 */}
      <div className={cn('hidden md:block overflow-x-auto', className)}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-gray-700',
                    column.className
                  )}
                >
                  {column.title}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column, index) => {
                  const value = column.key.toString().includes('.')
                    ? column.key.toString().split('.').reduce((obj, key) => obj?.[key], item)
                    : item[column.key]

                  return (
                    <td
                      key={index}
                      className={cn('px-4 py-3 text-sm text-gray-900', column.className)}
                    >
                      {column.render ? column.render(value, item) : String(value ?? '')}
                    </td>
                  )
                })}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {actions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 移动端：卡片视图 */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <Card
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              'p-4 space-y-3',
              onRowClick && 'cursor-pointer active:scale-[0.98] transition-transform'
            )}
          >
            {columns.map((column, index) => {
              const value = column.key.toString().includes('.')
                ? column.key.toString().split('.').reduce((obj, key) => obj?.[key], item)
                : item[column.key]

              // 跳过空值
              if (value === null || value === undefined || value === '') {
                return null
              }

              return (
                <div key={index} className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-gray-500 flex-shrink-0">
                    {column.mobileLabel || column.title}:
                  </span>
                  <span className="text-sm text-gray-900 text-right flex-1">
                    {column.render ? column.render(value, item) : String(value ?? '')}
                  </span>
                </div>
              )
            })}

            {actions && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {actions(item)}
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  )
}

/**
 * 使用示例
 */
export function ResponsiveTableExample() {
  interface User {
    id: string
    name: string
    email: string
    role: string
    status: 'active' | 'inactive'
    createdAt: string
  }

  const users: User[] = [
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      role: '管理员',
      status: 'active',
      createdAt: '2024-01-01',
    },
    // ... more users
  ]

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: '姓名',
      mobileLabel: '姓名',
    },
    {
      key: 'email',
      title: '邮箱',
      mobileLabel: '邮箱',
    },
    {
      key: 'role',
      title: '角色',
      mobileLabel: '角色',
    },
    {
      key: 'status',
      title: '状态',
      mobileLabel: '状态',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value === 'active' ? '活跃' : '停用'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: '创建时间',
      mobileLabel: '创建时间',
    },
  ]

  return (
    <ResponsiveTable
      data={users}
      columns={columns}
      keyExtractor={(user) => user.id}
      onRowClick={(user) => console.log('Clicked:', user)}
      actions={(user) => (
        <>
          <Button size="sm" variant="outline">
            编辑
          </Button>
          <Button size="sm" variant="outline">
            删除
          </Button>
        </>
      )}
      emptyMessage="暂无用户数据"
    />
  )
}
