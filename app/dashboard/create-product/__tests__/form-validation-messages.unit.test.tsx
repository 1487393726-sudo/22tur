/**
 * Unit Tests for Create Product Form Validation Messages
 * 
 * Feature: dashboard-pages-translation
 * Task 7.4: Write unit tests for form validation messages
 * **Validates: Requirements 4.3, 6.4**
 * 
 * These tests verify that form validation error messages display correctly in all 6 locales:
 * - Test validation errors display in all locales (zh, zh-TW, en, ug, ja, ko)
 * - Test required field messages
 * - Test that error messages are contextually appropriate
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateProductPage from '../page';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';
import { toast } from 'sonner';

// Mock the dashboard translations hook
jest.mock('@/lib/i18n/use-dashboard-translations');

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Define supported locales
const SUPPORTED_LOCALES = ['zh', 'zh-TW', 'en', 'ug', 'ja', 'ko'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

// Validation messages for each locale
const VALIDATION_MESSAGES: Record<Locale, { requiredFields: string; specificationRequired: string; success: string; error: string }> = {
  'zh': {
    requiredFields: '请填写必填字段',
    specificationRequired: '请填写规格名称和值',
    success: '产品创建成功',
    error: '产品创建失败',
  },
  'zh-TW': {
    requiredFields: '請填寫必填字段',
    specificationRequired: '請填寫規格名稱和值',
    success: '產品創建成功',
    error: '產品創建失敗',
  },
  'en': {
    requiredFields: 'Please fill in required fields',
    specificationRequired: 'Please fill in specification name and value',
    success: 'Product created successfully',
    error: 'Failed to create product',
  },
  'ug': {
    requiredFields: 'تەلەپ قىلىنغان سۆز بۆلىكىنى تولدۇرۇڭ',
    specificationRequired: 'ئۆلچەم نامى ۋە قىممىتىنى تولدۇرۇڭ',
    success: 'مەھسۇلات مۇۋەپپەقىيەتلىك ياسالدى',
    error: 'مەھسۇلات ياساش مەغلۇپ بولدى',
  },
  'ja': {
    requiredFields: '必須フィールドを入力してください',
    specificationRequired: '仕様名と値を入力してください',
    success: '製品が正常に作成されました',
    error: '製品の作成に失敗しました',
  },
  'ko': {
    requiredFields: '필수 필드를 입력하세요',
    specificationRequired: '사양 이름과 값을 입력하세요',
    success: '제품이 성공적으로 생성되었습니다',
    error: '제품 생성에 실패했습니다',
  },
};

// Helper to create mock t function
function createMockT(locale: Locale) {
  return (key: string) => {
    if (key === 'createProduct.validation.requiredFields') return VALIDATION_MESSAGES[locale].requiredFields;
    if (key === 'createProduct.validation.specificationRequired') return VALIDATION_MESSAGES[locale].specificationRequired;
    if (key === 'createProduct.success') return VALIDATION_MESSAGES[locale].success;
    if (key === 'createProduct.error') return VALIDATION_MESSAGES[locale].error;
    return key; // Return key as fallback
  };
}

describe('Create Product Form - Required Fields Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display required fields error message in ${locale} locale when submitting empty form`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      render(<CreateProductPage />);

      // Submit form directly (bypasses HTML5 validation)
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Wait for validation error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(VALIDATION_MESSAGES[locale].requiredFields);
      });
    });
  });
});

describe('Create Product Form - Specification Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display specification required error when adding empty specification in ${locale} locale`, async () => {
      const mockT = jest.fn((key: string) => {
        if (key === 'createProduct.validation.requiredFields') return VALIDATION_MESSAGES[locale].requiredFields;
        if (key === 'createProduct.validation.specificationRequired') return VALIDATION_MESSAGES[locale].specificationRequired;
        if (key === 'createProduct.success') return VALIDATION_MESSAGES[locale].success;
        if (key === 'createProduct.error') return VALIDATION_MESSAGES[locale].error;
        if (key === 'createProduct.form.addSpecification') return 'Add Specification Button';
        return key;
      });

      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: mockT,
        isRTL: locale === 'ug',
        locale,
      });

      render(<CreateProductPage />);

      // Find the add specification button by its text
      const addSpecButton = screen.getByText('Add Specification Button');
      
      fireEvent.click(addSpecButton);

      // Wait for validation error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(VALIDATION_MESSAGES[locale].specificationRequired);
      });
    });
  });
});

describe('Create Product Form - Success and Error Messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should display success message in ${locale} locale when product is created successfully`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { container } = render(<CreateProductPage />);

      // Fill in required fields
      const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      }

      const categorySelect = container.querySelector('select') as HTMLSelectElement;
      if (categorySelect) {
        fireEvent.change(categorySelect, { target: { value: 'electronics' } });
      }

      const priceInput = container.querySelector('input[name="price"]') as HTMLInputElement;
      if (priceInput) {
        fireEvent.change(priceInput, { target: { value: '100' } });
      }

      // Submit form
      const form = container.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(VALIDATION_MESSAGES[locale].success);
      });
    });

    it(`should display error message in ${locale} locale when product creation fails`, async () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to create product' }),
      });

      const { container } = render(<CreateProductPage />);

      // Fill in required fields
      const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      }

      const categorySelect = container.querySelector('select') as HTMLSelectElement;
      if (categorySelect) {
        fireEvent.change(categorySelect, { target: { value: 'electronics' } });
      }

      const priceInput = container.querySelector('input[name="price"]') as HTMLInputElement;
      if (priceInput) {
        fireEvent.change(priceInput, { target: { value: '100' } });
      }

      // Submit form
      const form = container.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(VALIDATION_MESSAGES[locale].error);
      });
    });
  });
});

describe('Create Product Form - Contextual Appropriateness', () => {
  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should verify all validation messages exist and are unique in ${locale} locale`, () => {
      const messages = VALIDATION_MESSAGES[locale];
      
      // Verify all messages exist and are not empty
      expect(messages.requiredFields).toBeTruthy();
      expect(messages.specificationRequired).toBeTruthy();
      expect(messages.success).toBeTruthy();
      expect(messages.error).toBeTruthy();
      
      // Verify all messages are unique
      expect(messages.requiredFields).not.toBe(messages.specificationRequired);
      expect(messages.requiredFields).not.toBe(messages.success);
      expect(messages.requiredFields).not.toBe(messages.error);
      expect(messages.specificationRequired).not.toBe(messages.success);
      expect(messages.specificationRequired).not.toBe(messages.error);
      expect(messages.success).not.toBe(messages.error);
    });
  });
});

describe('Create Product Form - RTL Layout', () => {
  SUPPORTED_LOCALES.forEach((locale) => {
    it(`should have correct RTL direction for ${locale} locale`, () => {
      (useDashboardTranslations as jest.Mock).mockReturnValue({
        t: createMockT(locale),
        isRTL: locale === 'ug',
        locale,
      });

      const { container } = render(<CreateProductPage />);

      const mainDiv = container.querySelector('.min-h-screen');
      if (locale === 'ug') {
        expect(mainDiv).toHaveAttribute('dir', 'rtl');
      } else {
        expect(mainDiv).toHaveAttribute('dir', 'ltr');
      }
    });
  });
});
