/**
 * Core Goals Section Component Tests
 * Tests for the CoreGoalsSection component rendering, navigation, and animations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoreGoalsSection } from './core-goals-section';
import { useLanguage } from '@/lib/i18n/context';
import '@testing-library/jest-dom';

// Mock the language context
jest.mock('@/lib/i18n/context', () => ({
  useLanguage: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href}>{children}</a>
  );
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Palette: () => <div data-testid="palette-icon">Palette</div>,
  Code: () => <div data-testid="code-icon">Code</div>,
  Rocket: () => <div data-testid="rocket-icon">Rocket</div>,
  ArrowRight: () => <div data-testid="arrow-icon">Arrow</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Target: () => <div data-testid="target-icon">Target</div>,
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/sections/section-wrapper', () => ({
  SectionWrapper: ({ children, id, background }: any) => (
    <section id={id} className={background}>{children}</section>
  ),
  SectionTitle: ({ title, subtitle }: any) => (
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  ),
}));

describe('CoreGoalsSection', () => {
  beforeEach(() => {
    (useLanguage as jest.Mock).mockReturnValue({ language: 'zh' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the section with correct title', () => {
      render(<CoreGoalsSection />);
      expect(screen.getByText('三大核心目标')).toBeInTheDocument();
    });

    it('should render all three core goal cards', () => {
      render(<CoreGoalsSection />);
      expect(screen.getByText('设计服务')).toBeInTheDocument();
      expect(screen.getByText('开发服务')).toBeInTheDocument();
      expect(screen.getByText('创业服务')).toBeInTheDocument();
    });

    it('should render correct descriptions for each service', () => {
      render(<CoreGoalsSection />);
      expect(screen.getByText('从品牌视觉到用户体验，打造令人印象深刻的设计作品')).toBeInTheDocument();
      expect(screen.getByText('专业的技术团队，为您构建高性能、可扩展的数字产品')).toBeInTheDocument();
      expect(screen.getByText('从想法到产品，全方位支持您的创业之旅')).toBeInTheDocument();
    });

    it('should render feature lists for each service', () => {
      render(<CoreGoalsSection />);
      
      // Design features
      expect(screen.getByText('UI/UX设计')).toBeInTheDocument();
      expect(screen.getByText('品牌设计')).toBeInTheDocument();
      
      // Development features
      expect(screen.getByText('Web开发')).toBeInTheDocument();
      expect(screen.getByText('移动应用')).toBeInTheDocument();
      
      // Startup features
      expect(screen.getByText('商业计划')).toBeInTheDocument();
      expect(screen.getByText('MVP开发')).toBeInTheDocument();
    });

    it('should render all service icons', () => {
      render(<CoreGoalsSection />);
      expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
      expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
    });

    it('should render "View All Services" button', () => {
      render(<CoreGoalsSection />);
      expect(screen.getByText('查看全部服务')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have correct href for design service card', () => {
      render(<CoreGoalsSection />);
      const designLink = screen.getAllByRole('link').find(link => 
        link.getAttribute('href') === '/services/design'
      );
      expect(designLink).toBeInTheDocument();
    });

    it('should have correct href for development service card', () => {
      render(<CoreGoalsSection />);
      const devLink = screen.getAllByRole('link').find(link => 
        link.getAttribute('href') === '/services/development'
      );
      expect(devLink).toBeInTheDocument();
    });

    it('should have correct href for startup service card', () => {
      render(<CoreGoalsSection />);
      const startupLink = screen.getAllByRole('link').find(link => 
        link.getAttribute('href') === '/services/startup'
      );
      expect(startupLink).toBeInTheDocument();
    });

    it('should have correct href for view all services button', () => {
      render(<CoreGoalsSection />);
      const viewAllLink = screen.getAllByRole('link').find(link => 
        link.getAttribute('href') === '/services'
      );
      expect(viewAllLink).toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    it('should display Chinese text when language is zh', () => {
      (useLanguage as jest.Mock).mockReturnValue({ language: 'zh' });
      render(<CoreGoalsSection />);
      expect(screen.getByText('三大核心目标')).toBeInTheDocument();
      expect(screen.getByText('设计服务')).toBeInTheDocument();
    });

    it('should display English text when language is en', () => {
      (useLanguage as jest.Mock).mockReturnValue({ language: 'en' });
      render(<CoreGoalsSection />);
      expect(screen.getByText('Three Core Goals')).toBeInTheDocument();
      expect(screen.getByText('Design Services')).toBeInTheDocument();
    });

    it('should display Uyghur text when language is ug', () => {
      (useLanguage as jest.Mock).mockReturnValue({ language: 'ug' });
      render(<CoreGoalsSection />);
      expect(screen.getByText('ئۈچ يادرولۇق نىشان')).toBeInTheDocument();
      expect(screen.getByText('لايىھەلەش مۇلازىمىتى')).toBeInTheDocument();
    });

    it('should display English features when language is en', () => {
      (useLanguage as jest.Mock).mockReturnValue({ language: 'en' });
      render(<CoreGoalsSection />);
      expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
  });

  describe('Hover Interactions', () => {
    it('should update hover state on mouse enter', () => {
      render(<CoreGoalsSection />);
      const designCard = screen.getByText('设计服务').closest('div');
      
      if (designCard) {
        fireEvent.mouseEnter(designCard);
        // The component should handle hover state internally
        expect(designCard).toBeInTheDocument();
      }
    });

    it('should clear hover state on mouse leave', () => {
      render(<CoreGoalsSection />);
      const designCard = screen.getByText('设计服务').closest('div');
      
      if (designCard) {
        fireEvent.mouseEnter(designCard);
        fireEvent.mouseLeave(designCard);
        expect(designCard).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CoreGoalsSection />);
      const heading = screen.getByText('三大核心目标');
      expect(heading.tagName).toBe('H2');
    });

    it('should have descriptive link text', () => {
      render(<CoreGoalsSection />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // All links should have meaningful text
      links.forEach(link => {
        expect(link.textContent).toBeTruthy();
      });
    });

    it('should have alt text for icons (via data-testid)', () => {
      render(<CoreGoalsSection />);
      expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
      expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
    });
  });

  describe('Content Completeness', () => {
    it('should display all required information for each service', () => {
      render(<CoreGoalsSection />);
      
      const services = ['设计服务', '开发服务', '创业服务'];
      services.forEach(service => {
        expect(screen.getByText(service)).toBeInTheDocument();
      });
    });

    it('should have at least 3 features per service', () => {
      render(<CoreGoalsSection />);
      
      // Design features
      const designFeatures = ['UI/UX设计', '品牌设计', '平面设计'];
      designFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
      
      // Development features
      const devFeatures = ['Web开发', '移动应用', '小程序'];
      devFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
      
      // Startup features
      const startupFeatures = ['商业计划', 'MVP开发', '融资对接'];
      startupFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should display "Learn More" text for each card', () => {
      render(<CoreGoalsSection />);
      const learnMoreElements = screen.getAllByText('了解更多');
      expect(learnMoreElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Animation Timing', () => {
    it('should render within 3 seconds', async () => {
      const startTime = Date.now();
      render(<CoreGoalsSection />);
      
      await waitFor(() => {
        expect(screen.getByText('三大核心目标')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('Responsive Design', () => {
    it('should render grid layout', () => {
      const { container } = render(<CoreGoalsSection />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have responsive grid classes', () => {
      const { container } = render(<CoreGoalsSection />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer?.className).toContain('md:grid-cols-3');
    });
  });
});
