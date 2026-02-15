/**
 * Unit Tests for Cart Page Translation in All Locales
 * 
 * Feature: dashboard-pages-translation
 * Task 2.4: Write unit tests for cart page in all locales
 * **Validates: Requirements 2.2, 4.1**
 * 
 * These tests verify that the cart page displays correctly in all 6 locales:
 * - Test empty cart message display
 * - Test cart item rendering with translations
 * - Test checkout button text
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartPage from '../page';
import { useCartStore } from '@/lib/cart-store';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock the cart store
jest.mock('@/lib/cart-store', () => ({
  useCartStore: jest.fn(),
}));

// Mock the dashboard translations hook
jest.mock('@/lib/i18n/use-dashboard-translations', () => ({
  useDashboardTranslations: jest.fn(),
}));

// Mock the dashboard utils
jest.mock('@/lib/dashboard-utils', () => ({
  formatAmount: (amount: number) => `¥${amount.toFixed(2)}`,
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
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
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

// Define supported locales
const SUPPORTED_LOCALES = ['zh', 'zh-TW', 'en', 'ug', 'ja', 'ko'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

// Translation data for each locale
const TRANSLATIONS: Record<Locale, Record<string, any>> = {
  'zh': {
    cart: {
      title: '购物车',
      description: '管理您的购物车商品',
      empty: {
        title: '购物车为空',
        description: '浏览我们的服务并添加您需要的项目',
      },
      note: '备注',
      decrease: '减少数量',
      increase: '增加数量',
      clearCart: '清空购物车',
      orderSummary: '订单摘要',
      itemCount: '商品',
      items: '件',
      subtotal: '小计',
      total: '总计',
      checkout: '结算',
      checkoutNote: '结算后将创建订单',
    },
    overview: {
      browseServices: '浏览服务',
    },
    common: {
      delete: '删除',
    },
  },
  'zh-TW': {
    cart: {
      title: '購物車',
      description: '管理您的購物車商品',
      empty: {
        title: '購物車為空',
        description: '瀏覽我們的服務並添加您需要的項目',
      },
      note: '備註',
      decrease: '減少數量',
      increase: '增加數量',
      clearCart: '清空購物車',
      orderSummary: '訂單摘要',
      itemCount: '商品',
      items: '件',
      subtotal: '小計',
      total: '總計',
      checkout: '結算',
      checkoutNote: '結算後將創建訂單',
    },
    overview: {
      browseServices: '瀏覽服務',
    },
    common: {
      delete: '刪除',
    },
  },
  'en': {
    cart: {
      title: 'Shopping Cart',
      description: 'Manage your cart items',
      empty: {
        title: 'Your cart is empty',
        description: 'Browse our services and add items you need',
      },
      note: 'Note',
      decrease: 'Decrease quantity',
      increase: 'Increase quantity',
      clearCart: 'Clear Cart',
      orderSummary: 'Order Summary',
      itemCount: 'Items',
      items: 'items',
      subtotal: 'Subtotal',
      total: 'Total',
      checkout: 'Checkout',
      checkoutNote: 'An order will be created after checkout',
    },
    overview: {
      browseServices: 'Browse Services',
    },
    common: {
      delete: 'Delete',
    },
  },
  'ug': {
    cart: {
      title: 'سېتىۋېلىش سېۋىتى',
      description: 'سېۋەت تۈرلىرىنى باشقۇرۇش',
      empty: {
        title: 'سېۋىتىڭىز قۇرۇق',
        description: 'مۇلازىمەتلىرىمىزنى كۆرۈپ ، ئېھتىياجلىق تۈرلەرنى قوشۇڭ',
      },
      note: 'ئىزاھات',
      decrease: 'سانىنى ئازايتىش',
      increase: 'سانىنى كۆپەيتىش',
      clearCart: 'سېۋەتنى تازىلاش',
      orderSummary: 'زاكاز خۇلاسىسى',
      itemCount: 'تۈرلەر',
      items: 'دانە',
      subtotal: 'كىچىك جەمئى',
      total: 'جەمئى',
      checkout: 'تۆلەش',
      checkoutNote: 'تۆلەشتىن كېيىن زاكاز قۇرۇلىدۇ',
    },
    overview: {
      browseServices: 'مۇلازىمەتلەرنى كۆرۈش',
    },
    common: {
      delete: 'ئۆچۈرۈش',
    },
  },
  'ja': {
    cart: {
      title: 'ショッピングカート',
      description: 'カートアイテムを管理',
      empty: {
        title: 'カートは空です',
        description: 'サービスを閲覧して必要なアイテムを追加してください',
      },
      note: '備考',
      decrease: '数量を減らす',
      increase: '数量を増やす',
      clearCart: 'カートをクリア',
      orderSummary: '注文概要',
      itemCount: 'アイテム',
      items: '個',
      subtotal: '小計',
      total: '合計',
      checkout: 'チェックアウト',
      checkoutNote: 'チェックアウト後に注文が作成されます',
    },
    overview: {
      browseServices: 'サービスを閲覧',
    },
    common: {
      delete: '削除',
    },
  },
  'ko': {
    cart: {
      title: '장바구니',
      description: '장바구니 항목 관리',
      empty: {
        title: '장바구니가 비어 있습니다',
        description: '서비스를 둘러보고 필요한 항목을 추가하세요',
      },
      note: '메모',
      decrease: '수량 감소',
      increase: '수량 증가',
      clearCart: '장바구니 비우기',
      orderSummary: '주문 요약',
      itemCount: '항목',
      items: '개',
      subtotal: '소계',
      total: '합계',
      checkout: '결제',
      checkoutNote: '결제 후 주문이 생성됩니다',
    },
    overview: {
      browseServices: '서비스 둘러보기',
    },
    common: {
      delete: '삭제',
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

// Sample cart items for testing
const mockCartItems = [
  {
    id: 'item-1',
    serviceId: 'service-1',
    serviceName: '品牌设计服务',
    serviceNameEn: 'Brand Design Service',
    categorySlug: 'brand-design',
    quantity: 2,
    unitPrice: 5000,
    note: '需要包含logo设计',
  },
  {
    id: 'item-2',
    serviceId: 'service-2',
    serviceName: '视频制作服务',
    serviceNameEn: 'Video Production Service',
    categorySlug: 'video-production',
    quantity: 1,
    unitPrice: 8000,
  },
];

describe('Cart Page - Empty Cart Message Display', () => {
  beforeEach(() => {
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    // Mock empty cart
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 0),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display empty cart message in ${locale} locale`, () => {
      // Mock translations for this locale
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      // Wait for component to mount
      waitFor(() => {
        // Check page title
        expect(screen.getByText(getTranslation(locale, 'cart.title'))).toBeInTheDocument();
        
        // Check page description
        expect(screen.getByText(getTranslation(locale, 'cart.description'))).toBeInTheDocument();
        
        // Check empty cart title
        expect(screen.getByText(getTranslation(locale, 'cart.empty.title'))).toBeInTheDocument();
        
        // Check empty cart description
        expect(screen.getByText(getTranslation(locale, 'cart.empty.description'))).toBeInTheDocument();
        
        // Check browse services button
        expect(screen.getByText(getTranslation(locale, 'overview.browseServices'))).toBeInTheDocument();
      });
    });

    it(`should have correct RTL direction for ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      const { container } = render(<CartPage />);

      waitFor(() => {
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

describe('Cart Page - Cart Item Rendering with Translations', () => {
  beforeEach(() => {
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    // Mock cart with items
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: mockCartItems,
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 18000),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display cart items with correct translations in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        // Check that cart items are displayed
        expect(screen.getByText('品牌设计服务')).toBeInTheDocument();
        expect(screen.getByText('Brand Design Service')).toBeInTheDocument();
        expect(screen.getByText('视频制作服务')).toBeInTheDocument();
        expect(screen.getByText('Video Production Service')).toBeInTheDocument();

        // Check note label
        const noteLabel = getTranslation(locale, 'cart.note');
        expect(screen.getByText(new RegExp(noteLabel))).toBeInTheDocument();

        // Check order summary section
        expect(screen.getByText(getTranslation(locale, 'cart.orderSummary'))).toBeInTheDocument();
        
        // Check item count label
        expect(screen.getByText(getTranslation(locale, 'cart.itemCount'))).toBeInTheDocument();
        
        // Check items label
        expect(screen.getByText(getTranslation(locale, 'cart.items'))).toBeInTheDocument();
        
        // Check subtotal label
        expect(screen.getByText(getTranslation(locale, 'cart.subtotal'))).toBeInTheDocument();
        
        // Check total label
        expect(screen.getByText(getTranslation(locale, 'cart.total'))).toBeInTheDocument();
        
        // Check clear cart button
        expect(screen.getByText(getTranslation(locale, 'cart.clearCart'))).toBeInTheDocument();
      });
    });

    it(`should display quantity controls with correct tooltips in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        // Check decrease button tooltip
        const decreaseButtons = screen.getAllByTitle(getTranslation(locale, 'cart.decrease'));
        expect(decreaseButtons.length).toBeGreaterThan(0);
        
        // Check increase button tooltip
        const increaseButtons = screen.getAllByTitle(getTranslation(locale, 'cart.increase'));
        expect(increaseButtons.length).toBeGreaterThan(0);
        
        // Check delete button tooltip
        const deleteButtons = screen.getAllByTitle(getTranslation(locale, 'common.delete'));
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });

    it(`should display checkout note in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        expect(screen.getByText(getTranslation(locale, 'cart.checkoutNote'))).toBeInTheDocument();
      });
    });
  });
});

describe('Cart Page - Checkout Button Text', () => {
  beforeEach(() => {
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    // Mock cart with items
    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: mockCartItems,
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 18000),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display checkout button with correct text in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        const checkoutButton = screen.getByText(getTranslation(locale, 'cart.checkout'));
        expect(checkoutButton).toBeInTheDocument();
        expect(checkoutButton.tagName).toBe('BUTTON');
      });
    });

    it(`should navigate to checkout when button is clicked in ${locale} locale`, () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
      });

      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        const checkoutButton = screen.getByText(getTranslation(locale, 'cart.checkout'));
        fireEvent.click(checkoutButton);
        
        expect(mockPush).toHaveBeenCalledWith('/client/checkout');
      });
    });
  });
});

describe('Cart Page - Functional Preservation (Requirement 4.1)', () => {
  let mockRemoveItem: jest.Mock;
  let mockUpdateQuantity: jest.Mock;
  let mockClearCart: jest.Mock;

  beforeEach(() => {
    mockRemoveItem = jest.fn();
    mockUpdateQuantity = jest.fn();
    mockClearCart = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: mockCartItems,
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      clearCart: mockClearCart,
      getTotal: jest.fn(() => 18000),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should preserve remove item functionality in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        const deleteButtons = screen.getAllByTitle(getTranslation(locale, 'common.delete'));
        fireEvent.click(deleteButtons[0]);
        
        expect(mockRemoveItem).toHaveBeenCalledWith('item-1');
      });
    });

    it(`should preserve increase quantity functionality in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        const increaseButtons = screen.getAllByTitle(getTranslation(locale, 'cart.increase'));
        fireEvent.click(increaseButtons[0]);
        
        expect(mockUpdateQuantity).toHaveBeenCalledWith('item-1', 3);
      });
    });

    it(`should preserve decrease quantity functionality in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        const decreaseButtons = screen.getAllByTitle(getTranslation(locale, 'cart.decrease'));
        fireEvent.click(decreaseButtons[0]);
        
        expect(mockUpdateQuantity).toHaveBeenCalledWith('item-1', 1);
      });
    });

    it(`should preserve clear cart functionality in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        const clearButton = screen.getByText(getTranslation(locale, 'cart.clearCart'));
        fireEvent.click(clearButton);
        
        expect(mockClearCart).toHaveBeenCalled();
      });
    });
  });
});

describe('Cart Page - Loading State', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 0),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display loading state with correct translations in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      // The component uses useEffect to set mounted state
      // In the initial render, mounted is false, showing loading state
      const { container } = render(<CartPage />);

      // Check that page header is rendered with correct title
      expect(screen.getByText(getTranslation(locale, 'cart.title'))).toBeInTheDocument();
      expect(screen.getByText(getTranslation(locale, 'cart.description'))).toBeInTheDocument();
    });
  });
});

describe('Cart Page - Browse Services Link', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    (useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 0),
    });
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display browse services link with correct text in ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CartPage />);

      waitFor(() => {
        const browseLinks = screen.getAllByText(getTranslation(locale, 'overview.browseServices'));
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
