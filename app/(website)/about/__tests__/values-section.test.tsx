/**
 * Values Section Tests
 * 
 * Tests for the core values and mission display section on the About Us page.
 * 
 * Requirements: 8.3
 * Task: 7.3 实现价值观和使命展示
 */

import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutPage from '../page';
import enMessages from '@/messages/en/about.json';
import zhMessages from '@/messages/zh-TW/about.json';
import ugMessages from '@/messages/ug/about.json';

// Mock translations
const mockTranslations = {
  en: enMessages,
  'zh-TW': zhMessages,
  ug: ugMessages,
};

let currentLocale: 'en' | 'zh-TW' | 'ug' = 'en';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const keys = key.split('.');
    let value: any = mockTranslations[currentLocale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  },
  useLocale: () => currentLocale,
}));

// Mock the language context
jest.mock('@/lib/i18n/context', () => ({
  useLanguage: () => ({
    language: currentLocale,
    locale: currentLocale,
    setLanguage: (lang: string) => {
      currentLocale = lang as 'en' | 'zh-TW' | 'ug';
    },
  }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const mockMotionValue = (initialValue: any) => ({
    get: () => initialValue,
    set: jest.fn(),
    onChange: jest.fn(),
    destroy: jest.fn(),
  });

  const filterProps = (props: any) => {
    const { 
      initial, animate, exit, variants, transition, 
      whileHover, whileTap, whileFocus, whileInView,
      drag, dragConstraints, dragElastic, dragMomentum,
      layout, layoutId, ...rest 
    } = props;
    return rest;
  };

  return {
    motion: {
      div: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
      section: ({ children, ...props }: any) => <section {...filterProps(props)}>{children}</section>,
      h1: ({ children, ...props }: any) => <h1 {...filterProps(props)}>{children}</h1>,
      h2: ({ children, ...props }: any) => <h2 {...filterProps(props)}>{children}</h2>,
      h3: ({ children, ...props }: any) => <h3 {...filterProps(props)}>{children}</h3>,
      p: ({ children, ...props }: any) => <p {...filterProps(props)}>{children}</p>,
      a: ({ children, ...props }: any) => <a {...filterProps(props)}>{children}</a>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useInView: () => true,
    useAnimation: () => ({
      start: jest.fn(),
      set: jest.fn(),
    }),
    useMotionValue: (initialValue: any) => mockMotionValue(initialValue),
    useSpring: (value: any) => mockMotionValue(value),
  };
});

describe('About Page - Values Section', () => {
  beforeEach(() => {
    currentLocale = 'en';
    jest.clearAllMocks();
  });

  describe('Glass Effect Cards', () => {
    it('should use glass effect cards for displaying values', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Check that glass effect classes are applied to value cards
      const cards = container.querySelectorAll('[class*="glass-"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should apply glass-light effect to value cards', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Find value cards with glass effect
      const cards = container.querySelectorAll('[class*="glass-light"]');
      
      // Should have 3 value cards with glass effect
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Icons and Descriptions', () => {
    it('should display icons for each value', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Verify icons are present (🎯, ✨, 🚀)
      expect(container.textContent).toContain('🎯');
      expect(container.textContent).toContain('✨');
      expect(container.textContent).toContain('🚀');
    });

    it('should display title and description for each value', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Check for Goal-Oriented value
      expect(container.textContent).toContain(enMessages.values.target.title);
      expect(container.textContent).toContain(enMessages.values.target.desc);

      // Check for Quality Assurance value
      expect(container.textContent).toContain(enMessages.values.quality.title);
      expect(container.textContent).toContain(enMessages.values.quality.desc);

      // Check for Continuous Innovation value
      expect(container.textContent).toContain(enMessages.values.innovation.title);
      expect(container.textContent).toContain(enMessages.values.innovation.desc);
    });

    it('should display colored icon backgrounds', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Find icon containers with background colors
      const iconContainers = container.querySelectorAll('[style*="backgroundColor"]');
      
      // Should have 3 colored icon containers
      expect(iconContainers.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Hover Effects', () => {
    it('should have Card3D components with hover capability', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Card3D components should have motion div wrappers
      const motionDivs = container.querySelectorAll('div[style*="transform"]');
      expect(motionDivs.length).toBeGreaterThan(0);
    });

    it('should apply 3D card effects with proper styling', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Cards should have rounded corners and proper styling
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Multi-language Support', () => {
    it('should display values in English', async () => {
      currentLocale = 'en';
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      expect(container.textContent).toContain(enMessages.values.title);
      expect(container.textContent).toContain(enMessages.values.target.title);
    });

    it('should display values in Chinese', async () => {
      currentLocale = 'zh-TW';
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      expect(container.textContent).toContain(zhMessages.values.title);
      expect(container.textContent).toContain(zhMessages.values.target.title);
    });

    it('should display values in Uyghur', async () => {
      currentLocale = 'ug';
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      expect(container.textContent).toContain(ugMessages.values.title);
      expect(container.textContent).toContain(ugMessages.values.target.title);
    });
  });

  describe('Responsive Layout', () => {
    it('should use CardGrid3D for responsive layout', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Should have a grid container
      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have proper card structure with full height', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Cards should have full height for consistent layout
      const cards = container.querySelectorAll('[class*="h-full"]');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Section Structure', () => {
    it('should have section header with title and subtitle', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      expect(container.textContent).toContain(enMessages.values.title);
      expect(container.textContent).toContain(enMessages.values.subtitle);
    });

    it('should have proper semantic structure', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Should have section elements
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);

      // Should have h2 headings
      const h2Elements = container.querySelectorAll('h2');
      expect(h2Elements.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Design', () => {
    it('should apply proper spacing and padding', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Sections should have padding classes
      const sections = container.querySelectorAll('section');
      const hasPadding = Array.from(sections).some(section => 
        section.className.match(/py-\d+/)
      );
      expect(hasPadding).toBe(true);
    });

    it('should have proper background styling', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Sections should have background colors
      const sections = container.querySelectorAll('section');
      const hasBackground = Array.from(sections).some(section => 
        section.className.match(/bg-/)
      );
      expect(hasBackground).toBe(true);
    });

    it('should display cards with white background and border', async () => {
      const { container } = render(<AboutPage />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Cards should have white background
      const cards = container.querySelectorAll('[class*="bg-white"]');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });
});
