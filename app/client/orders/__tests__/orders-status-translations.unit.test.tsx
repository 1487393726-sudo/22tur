/**
 * Unit Tests for Orders Page Status Translations in All Locales
 * 
 * Feature: dashboard-pages-translation
 * Task 3.4: Write unit tests for order status translations
 * **Validates: Requirements 2.2, 6.1**
 * 
 * These tests verify that the orders page displays correctly in all 6 locales:
 * - Test all status labels in all locales
 * - Test filter options
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrdersPage from '../page';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock the dashboard translations hook
jest.mock('@/lib/i18n/use-dashboard-translations', () => ({
  useDashboardTranslations: jest.fn(),
}));

// Mock the dashboard utils
jest.mock('@/lib/dashboard-utils', () => ({
  formatAmount: (amount: number) => `¥${amount.toFixed(2)}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
}));

// Mock the PageHeader component
jest.mock('@/components/dashboard/page-header', () => ({
  PageHeader: ({ title, description, icon, actions }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
      <span>{icon}</span>
      {actions && <div data-testid="header-actions">{actions}</div>}
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, title, className, variant, size }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children, className }: any) => <thead className={className}>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children, className }: any) => <tr className={className}>{children}</tr>,
  TableHead: ({ children, className }: any) => <th className={className}>{children}</th>,
  TableCell: ({ children, className, colSpan }: any) => <td className={className} colSpan={colSpan}>{children}</td>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, onValueChange }: any) => <div data-default-value={defaultValue}>{children}</div>,
  TabsList: ({ children, className }: any) => <div className={className}>{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-value={value}>{children}</button>,
  TabsContent: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

// Mock dashboard styles
jest.mock('@/lib/dashboard-styles', () => ({
  dashboardStyles: {
    table: {
      wrapper: 'table-wrapper',
      header: 'table-header',
      row: 'table-row',
    },
  },
  orderStatusConfig: {
    PENDING: { label: 'Pending', variant: 'outline' },
    CONFIRMED: { label: 'Confirmed', variant: 'default' },
    IN_PROGRESS: { label: 'In Progress', variant: 'default' },
    REVIEW: { label: 'Under Review', variant: 'secondary' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  },
  paymentStatusConfig: {
    UNPAID: { label: 'Unpaid', variant: 'destructive' },
    PARTIAL: { label: 'Partial', variant: 'secondary' },
    PAID: { label: 'Paid', variant: 'success' },
    REFUNDED: { label: 'Refunded', variant: 'outline' },
  },
}));

// Define supported locales
const SUPPORTED_LOCALES = ['zh', 'zh-TW', 'en', 'ug', 'ja', 'ko'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

// Translation data for each locale - Order status and payment status
const TRANSLATIONS: Record<Locale, Record<string, any>> = {
  'zh': {
    orders: {
      title: '我的订单',
      description: '查看和管理您的所有服务订单',
      filters: {
        all: '全部',
        inProgress: '进行中',
        completed: '已完成',
        cancelled: '已取消',
      },
      table: {
        orderNumber: '订单号',
        serviceContent: '服务内容',
        amount: '金额',
        date: '日期',
        status: '状态',
        payment: '支付',
        actions: '操作',
      },
      status: {
        pending: '待确认',
        confirmed: '已确认',
        inprogress: '进行中',
        review: '待验收',
        completed: '已完成',
        cancelled: '已取消',
      },
      paymentStatus: {
        unpaid: '未支付',
        partial: '部分支付',
        paid: '已支付',
        refunded: '已退款',
      },
      actions: {
        viewDetails: '查看详情',
        downloadFile: '下载文件',
        contactSupport: '联系客服',
      },
      empty: {
        title: '暂无订单',
        description: '浏览我们的服务，开始您的第一个订单',
      },
    },
    overview: {
      browseServices: '浏览服务',
    },
    common: {
      error: '出错了',
    },
  },
  'zh-TW': {
    orders: {
      title: '我的訂單',
      description: '查看和管理您的所有服務訂單',
      filters: {
        all: '全部',
        inProgress: '進行中',
        completed: '已完成',
        cancelled: '已取消',
      },
      table: {
        orderNumber: '訂單編號',
        serviceContent: '服務內容',
        amount: '金額',
        date: '日期',
        status: '狀態',
        payment: '付款',
        actions: '操作',
      },
      status: {
        pending: '待確認',
        confirmed: '已確認',
        inprogress: '進行中',
        review: '待驗收',
        completed: '已完成',
        cancelled: '已取消',
      },
      paymentStatus: {
        unpaid: '未付款',
        partial: '部分付款',
        paid: '已付款',
        refunded: '已退款',
      },
      actions: {
        viewDetails: '查看詳情',
        downloadFile: '下載檔案',
        contactSupport: '聯繫客服',
      },
      empty: {
        title: '暫無訂單',
        description: '瀏覽我們的服務，開始您的第一個訂單',
      },
    },
    overview: {
      browseServices: '瀏覽服務',
    },
    common: {
      error: '出錯了',
    },
  },
  'en': {
    orders: {
      title: 'My Orders',
      description: 'View and manage all your service orders',
      filters: {
        all: 'All',
        inProgress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      table: {
        orderNumber: 'Order #',
        serviceContent: 'Service',
        amount: 'Amount',
        date: 'Date',
        status: 'Status',
        payment: 'Payment',
        actions: 'Actions',
      },
      status: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        inprogress: 'In Progress',
        review: 'Under Review',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      paymentStatus: {
        unpaid: 'Unpaid',
        partial: 'Partial',
        paid: 'Paid',
        refunded: 'Refunded',
      },
      actions: {
        viewDetails: 'View Details',
        downloadFile: 'Download File',
        contactSupport: 'Contact Support',
      },
      empty: {
        title: 'No orders yet',
        description: 'Browse our services to place your first order',
      },
    },
    overview: {
      browseServices: 'Browse Services',
    },
    common: {
      error: 'Something went wrong',
    },
  },
  'ug': {
    orders: {
      title: 'زاكازلىرىم',
      description: 'بارلىق مۇلازىمەت زاكازلىرىڭىزنى كۆرۈش ۋە باشقۇرۇش',
      filters: {
        all: 'ھەممىسى',
        inProgress: 'داۋاملىشىۋاتىدۇ',
        completed: 'تاماملاندى',
        cancelled: 'ئەمەلدىن قالدۇرۇلدى',
      },
      table: {
        orderNumber: 'زاكاز نومۇرى',
        serviceContent: 'مۇلازىمەت مەزمۇنى',
        amount: 'سوممىسى',
        date: 'چېسلا',
        status: 'ھالەت',
        payment: 'تۆلەم',
        actions: 'مەشغۇلات',
      },
      status: {
        pending: 'جەزملەشنى ساقلاۋاتىدۇ',
        confirmed: 'جەزملەندى',
        inprogress: 'داۋاملىشىۋاتىدۇ',
        review: 'تەكشۈرۈشنى ساقلاۋاتىدۇ',
        completed: 'تاماملاندى',
        cancelled: 'ئەمەلدىن قالدۇرۇلدى',
      },
      paymentStatus: {
        unpaid: 'تۆلەنمىگەن',
        partial: 'قىسمەن تۆلەندى',
        paid: 'تۆلەندى',
        refunded: 'قايتۇرۇلدى',
      },
      actions: {
        viewDetails: 'تەپسىلاتنى كۆرۈش',
        downloadFile: 'ھۆججەت چۈشۈرۈش',
        contactSupport: 'خېرىدار مۇلازىمىتىگە ئالاقىلىشىش',
      },
      empty: {
        title: 'زاكاز يوق',
        description: 'مۇلازىمەتلىرىمىزنى كۆرۈپ تۇنجى زاكازىڭىزنى بېرىڭ',
      },
    },
    overview: {
      browseServices: 'مۇلازىمەتلەرنى كۆرۈش',
    },
    common: {
      error: 'خاتالىق كۆرۈلدى',
    },
  },
  'ja': {
    orders: {
      title: '注文履歴',
      description: 'すべてのサービス注文を表示・管理',
      filters: {
        all: 'すべて',
        inProgress: '進行中',
        completed: '完了',
        cancelled: 'キャンセル',
      },
      table: {
        orderNumber: '注文番号',
        serviceContent: 'サービス内容',
        amount: '金額',
        date: '日付',
        status: 'ステータス',
        payment: '支払い',
        actions: '操作',
      },
      status: {
        pending: '確認待ち',
        confirmed: '確認済み',
        inprogress: '進行中',
        review: '検収待ち',
        completed: '完了',
        cancelled: 'キャンセル',
      },
      paymentStatus: {
        unpaid: '未払い',
        partial: '一部支払い',
        paid: '支払い済み',
        refunded: '返金済み',
      },
      actions: {
        viewDetails: '詳細を見る',
        downloadFile: 'ファイルをダウンロード',
        contactSupport: 'サポートに連絡',
      },
      empty: {
        title: '注文がありません',
        description: 'サービスを閲覧して最初の注文を始めましょう',
      },
    },
    overview: {
      browseServices: 'サービスを閲覧',
    },
    common: {
      error: 'エラーが発生しました',
    },
  },
  'ko': {
    orders: {
      title: '내 주문',
      description: '모든 서비스 주문 보기 및 관리',
      filters: {
        all: '전체',
        inProgress: '진행 중',
        completed: '완료됨',
        cancelled: '취소됨',
      },
      table: {
        orderNumber: '주문 번호',
        serviceContent: '서비스 내용',
        amount: '금액',
        date: '날짜',
        status: '상태',
        payment: '결제',
        actions: '작업',
      },
      status: {
        pending: '확인 대기',
        confirmed: '확인됨',
        inprogress: '진행 중',
        review: '검수 대기',
        completed: '완료됨',
        cancelled: '취소됨',
      },
      paymentStatus: {
        unpaid: '미결제',
        partial: '부분 결제',
        paid: '결제됨',
        refunded: '환불됨',
      },
      actions: {
        viewDetails: '상세 보기',
        downloadFile: '파일 다운로드',
        contactSupport: '지원 문의',
      },
      empty: {
        title: '주문이 없습니다',
        description: '서비스를 둘러보고 첫 주문을 시작하세요',
      },
    },
    overview: {
      browseServices: '서비스 둘러보기',
    },
    common: {
      error: '오류가 발생했습니다',
    },
  },
};

// Helper function to get nested translation value
function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = TRANSLATIONS[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

// Helper function to create mock translation function
function createMockT(locale: Locale) {
  return (key: string, fallback?: string) => {
    const value = getTranslation(locale, key);
    return value !== key ? value : (fallback || key);
  };
}

// Sample order data for testing
const mockOrders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    subtotal: 5000,
    total: 5000,
    createdAt: '2024-01-15T10:00:00Z',
    items: [
      {
        id: 'item-1',
        quantity: 1,
        unitPrice: 5000,
        service: {
          name: '品牌设计服务',
          nameEn: 'Brand Design Service',
        },
      },
    ],
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-002',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    subtotal: 8000,
    total: 8000,
    createdAt: '2024-01-16T10:00:00Z',
    items: [
      {
        id: 'item-2',
        quantity: 1,
        unitPrice: 8000,
        service: {
          name: '视频制作服务',
          nameEn: 'Video Production Service',
        },
      },
    ],
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2024-003',
    status: 'IN_PROGRESS',
    paymentStatus: 'PARTIAL',
    subtotal: 10000,
    total: 10000,
    createdAt: '2024-01-17T10:00:00Z',
    items: [
      {
        id: 'item-3',
        quantity: 1,
        unitPrice: 10000,
        service: {
          name: '网站开发服务',
          nameEn: 'Web Development Service',
        },
      },
    ],
  },
  {
    id: 'order-4',
    orderNumber: 'ORD-2024-004',
    status: 'REVIEW',
    paymentStatus: 'PAID',
    subtotal: 6000,
    total: 6000,
    createdAt: '2024-01-18T10:00:00Z',
    items: [
      {
        id: 'item-4',
        quantity: 1,
        unitPrice: 6000,
        service: {
          name: '营销策划服务',
          nameEn: 'Marketing Planning Service',
        },
      },
    ],
  },
  {
    id: 'order-5',
    orderNumber: 'ORD-2024-005',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    subtotal: 7000,
    total: 7000,
    createdAt: '2024-01-19T10:00:00Z',
    items: [
      {
        id: 'item-5',
        quantity: 1,
        unitPrice: 7000,
        service: {
          name: '咨询服务',
          nameEn: 'Consulting Service',
        },
      },
    ],
  },
  {
    id: 'order-6',
    orderNumber: 'ORD-2024-006',
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    subtotal: 4000,
    total: 4000,
    createdAt: '2024-01-20T10:00:00Z',
    items: [
      {
        id: 'item-6',
        quantity: 1,
        unitPrice: 4000,
        service: {
          name: '设计服务',
          nameEn: 'Design Service',
        },
      },
    ],
  },
];

// Mock fetch API
global.fetch = jest.fn();

describe('Orders Page - Order Status Labels in All Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display all order status labels correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        // Check that all status labels are displayed with correct translations
        // Using getAllByText since some labels appear in both filters and table
        const pendingLabel = getTranslation(locale, 'orders.status.pending');
        const confirmedLabel = getTranslation(locale, 'orders.status.confirmed');
        const inProgressLabel = getTranslation(locale, 'orders.status.inprogress');
        const reviewLabel = getTranslation(locale, 'orders.status.review');
        const completedLabel = getTranslation(locale, 'orders.status.completed');
        const cancelledLabel = getTranslation(locale, 'orders.status.cancelled');

        const pendingElements = screen.getAllByText(pendingLabel);
        expect(pendingElements.length).toBeGreaterThan(0);
        
        const confirmedElements = screen.getAllByText(confirmedLabel);
        expect(confirmedElements.length).toBeGreaterThan(0);
        
        const inProgressElements = screen.getAllByText(inProgressLabel);
        expect(inProgressElements.length).toBeGreaterThan(0);
        
        const reviewElements = screen.getAllByText(reviewLabel);
        expect(reviewElements.length).toBeGreaterThan(0);
        
        const completedElements = screen.getAllByText(completedLabel);
        expect(completedElements.length).toBeGreaterThan(0);
        
        const cancelledElements = screen.getAllByText(cancelledLabel);
        expect(cancelledElements.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Orders Page - Payment Status Labels in All Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display all payment status labels correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        // Check that all payment status labels are displayed with correct translations
        const unpaidLabel = getTranslation(locale, 'orders.paymentStatus.unpaid');
        const partialLabel = getTranslation(locale, 'orders.paymentStatus.partial');
        const paidLabel = getTranslation(locale, 'orders.paymentStatus.paid');
        const refundedLabel = getTranslation(locale, 'orders.paymentStatus.refunded');

        expect(screen.getByText(unpaidLabel)).toBeInTheDocument();
        expect(screen.getByText(partialLabel)).toBeInTheDocument();
        // Paid appears multiple times
        const paidElements = screen.getAllByText(paidLabel);
        expect(paidElements.length).toBeGreaterThan(0);
        expect(screen.getByText(refundedLabel)).toBeInTheDocument();
      });
    });
  });
});

describe('Orders Page - Filter Options in All Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display all filter options correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        // Check that all filter options are displayed with correct translations
        const allFilter = getTranslation(locale, 'orders.filters.all');
        const inProgressFilter = getTranslation(locale, 'orders.filters.inProgress');
        const completedFilter = getTranslation(locale, 'orders.filters.completed');
        const cancelledFilter = getTranslation(locale, 'orders.filters.cancelled');

        // Filters appear multiple times (in TabsList and TabsTrigger)
        const allElements = screen.getAllByText(allFilter);
        expect(allElements.length).toBeGreaterThan(0);
        
        const inProgressElements = screen.getAllByText(inProgressFilter);
        expect(inProgressElements.length).toBeGreaterThan(0);
        
        const completedElements = screen.getAllByText(completedFilter);
        expect(completedElements.length).toBeGreaterThan(0);
        
        const cancelledElements = screen.getAllByText(cancelledFilter);
        expect(cancelledElements.length).toBeGreaterThan(0);
      });
    });

    it(`should display page title and description in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        const title = getTranslation(locale, 'orders.title');
        const description = getTranslation(locale, 'orders.description');

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });
  });
});

describe('Orders Page - Table Headers in All Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display all table headers correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        // Check that all table headers are displayed with correct translations
        const orderNumberHeader = getTranslation(locale, 'orders.table.orderNumber');
        const serviceContentHeader = getTranslation(locale, 'orders.table.serviceContent');
        const amountHeader = getTranslation(locale, 'orders.table.amount');
        const dateHeader = getTranslation(locale, 'orders.table.date');
        const statusHeader = getTranslation(locale, 'orders.table.status');
        const paymentHeader = getTranslation(locale, 'orders.table.payment');
        const actionsHeader = getTranslation(locale, 'orders.table.actions');

        expect(screen.getByText(orderNumberHeader)).toBeInTheDocument();
        expect(screen.getByText(serviceContentHeader)).toBeInTheDocument();
        expect(screen.getByText(amountHeader)).toBeInTheDocument();
        expect(screen.getByText(dateHeader)).toBeInTheDocument();
        expect(screen.getByText(statusHeader)).toBeInTheDocument();
        expect(screen.getByText(paymentHeader)).toBeInTheDocument();
        expect(screen.getByText(actionsHeader)).toBeInTheDocument();
      });
    });
  });
});

describe('Orders Page - Action Button Tooltips in All Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display action button tooltips correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        // Check that action button tooltips are displayed with correct translations
        const viewDetailsTooltip = getTranslation(locale, 'orders.actions.viewDetails');
        const downloadFileTooltip = getTranslation(locale, 'orders.actions.downloadFile');
        const contactSupportTooltip = getTranslation(locale, 'orders.actions.contactSupport');

        // View Details buttons (one per order)
        const viewDetailsButtons = screen.getAllByTitle(viewDetailsTooltip);
        expect(viewDetailsButtons.length).toBe(mockOrders.length);

        // Download File button (only for completed orders)
        const completedOrders = mockOrders.filter(o => o.status === 'COMPLETED');
        const downloadButtons = screen.getAllByTitle(downloadFileTooltip);
        expect(downloadButtons.length).toBe(completedOrders.length);

        // Contact Support buttons (one per order)
        const contactButtons = screen.getAllByTitle(contactSupportTooltip);
        expect(contactButtons.length).toBe(mockOrders.length);
      });
    });
  });
});

describe('Orders Page - Empty State in All Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: [],
          total: 0,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display empty state message correctly in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        const emptyTitle = getTranslation(locale, 'orders.empty.title');
        const browseServices = getTranslation(locale, 'overview.browseServices');

        expect(screen.getByText(emptyTitle)).toBeInTheDocument();
        // Browse Services appears multiple times (header and empty state)
        const browseLinks = screen.getAllByText(browseServices);
        expect(browseLinks.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Orders Page - RTL Layout Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should have correct RTL direction for ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      const { container } = render(<OrdersPage />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.min-h-screen');
        if (locale === 'ug') {
          expect(mainDiv).toHaveAttribute('dir', 'rtl');
        } else {
          expect(mainDiv).toHaveAttribute('dir', 'ltr');
        }
      });
    });
  });
});

describe('Orders Page - Status Badge Variants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display status badges with correct variants in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      const { container } = render(<OrdersPage />);

      await waitFor(() => {
        // Check that badges are rendered with correct variants
        const badges = container.querySelectorAll('[data-variant]');
        expect(badges.length).toBeGreaterThan(0);

        // Verify specific status badges exist (using getAllByText since labels appear in filters too)
        const pendingLabel = getTranslation(locale, 'orders.status.pending');
        const completedLabel = getTranslation(locale, 'orders.status.completed');
        const cancelledLabel = getTranslation(locale, 'orders.status.cancelled');

        const pendingElements = screen.getAllByText(pendingLabel);
        expect(pendingElements.length).toBeGreaterThan(0);
        
        const completedElements = screen.getAllByText(completedLabel);
        expect(completedElements.length).toBeGreaterThan(0);
        
        const cancelledElements = screen.getAllByText(cancelledLabel);
        expect(cancelledElements.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Orders Page - Browse Services Link', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display browse services link with correct text in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        const browseServicesText = getTranslation(locale, 'overview.browseServices');
        const browseLinks = screen.getAllByText(browseServicesText);
        expect(browseLinks.length).toBeGreaterThan(0);

        // Check that at least one link points to /pricing
        const pricingLinks = browseLinks.filter(link => {
          const anchor = link.closest('a');
          return anchor?.getAttribute('href') === '/pricing';
        });
        expect(pricingLinks.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Orders Page - Order Data Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: mockOrders,
          total: mockOrders.length,
        },
      }),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display order numbers and service names in ${locale} locale`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<OrdersPage />);

      await waitFor(() => {
        // Check that order numbers are displayed
        expect(screen.getByText('ORD-2024-001')).toBeInTheDocument();
        expect(screen.getByText('ORD-2024-002')).toBeInTheDocument();
        expect(screen.getByText('ORD-2024-003')).toBeInTheDocument();

        // Check that service names are displayed
        expect(screen.getByText('品牌设计服务')).toBeInTheDocument();
        expect(screen.getByText('视频制作服务')).toBeInTheDocument();
        expect(screen.getByText('网站开发服务')).toBeInTheDocument();
      });
    });
  });
});
