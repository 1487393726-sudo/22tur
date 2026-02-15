/**
 * User Portal Navigation Configuration
 * Defines the main navigation structure for the user portal system
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export const userPortalNavigation: NavItem[] = [
  {
    id: 'dashboard',
    label: '仪表板',
    href: '/user/dashboard',
    icon: 'home',
  },
  {
    id: 'orders',
    label: '订单',
    href: '/user/orders',
    icon: 'shopping-bag',
  },
  {
    id: 'services',
    label: '服务',
    href: '/user/services',
    icon: 'briefcase',
  },
  {
    id: 'profile',
    label: '资料',
    href: '/user/profile',
    icon: 'user',
  },
  {
    id: 'messages',
    label: '消息',
    href: '/user/messages',
    icon: 'bell',
    badge: 0,
  },
  {
    id: 'help',
    label: '帮助',
    href: '/user/help',
    icon: 'help-circle',
  },
];

export const userPortalSecondaryNav: NavItem[] = [
  {
    id: 'favorites',
    label: '收藏',
    href: '/user/favorites',
    icon: 'heart',
  },
  {
    id: 'history',
    label: '浏览历史',
    href: '/user/history',
    icon: 'history',
  },
  {
    id: 'points',
    label: '积分',
    href: '/user/points',
    icon: 'gift',
  },
  {
    id: 'after-sales',
    label: '售后',
    href: '/user/after-sales',
    icon: 'undo',
  },
];

export const userPortalAccountNav: NavItem[] = [
  {
    id: 'settings',
    label: '设置',
    href: '/user/settings',
    icon: 'settings',
  },
  {
    id: 'logout',
    label: '退出登录',
    href: '/logout',
    icon: 'log-out',
  },
];
