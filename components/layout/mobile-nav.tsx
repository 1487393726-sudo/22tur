/**
 * 移动端导航组件
 * 
 * 功能：
 * - 汉堡菜单
 * - 侧边栏导航
 * - 触摸友好的交互
 * - 响应式设计
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Users, FolderKanban, FileText, BarChart3, Settings, Bell, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  {
    title: '首页',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: '项目',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    title: '任务',
    href: '/tasks',
    icon: FileText,
  },
  {
    title: '报表',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: '用户',
    href: '/users',
    icon: Users,
  },
  {
    title: '消息',
    href: '/messages',
    icon: MessageSquare,
    badge: 3,
  },
  {
    title: '通知',
    href: '/notifications',
    icon: Bell,
    badge: 5,
  },
  {
    title: '设置',
    href: '/settings',
    icon: Settings,
  },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* 移动端菜单按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="打开菜单"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 shadow-xl transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">企业管理系统</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMenu}
            className="text-white hover:bg-white/10"
            aria-label="关闭菜单"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* 导航链接 */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  'text-white/80 hover:text-white hover:bg-white/10',
                  'min-h-[48px]', // 触摸友好的最小高度
                  isActive && 'bg-white/20 text-white font-semibold'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.title}</span>
                {item.badge && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-red-500 rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

/**
 * 底部导航栏（可选）
 * 适用于移动端快速访问常用功能
 */
export function BottomNav() {
  const pathname = usePathname()

  const bottomNavItems = navItems.slice(0, 5) // 只显示前 5 个

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] transition-colors',
                'text-gray-600 hover:text-gray-900',
                isActive && 'text-white600 font-semibold'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
