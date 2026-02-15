/**
 * Unit tests for Website Layout
 * 
 * Tests the unified website layout implementation including:
 * - Navbar and Footer integration
 * - RTL layout support
 * - Page transition animations
 * 
 * Requirements: 3.4, 6.5
 */

import { render, screen } from '@testing-library/react';
import { WebsiteLayoutClient } from '../layout-client';
import { useLanguage } from '@/lib/i18n/context';

// Mock dependencies
jest.mock('@/lib/i18n/context');
jest.mock('@/components/layout/navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));
jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('WebsiteLayoutClient', () => {
  beforeEach(() => {
    mockUseLanguage.mockReturnValue({
      language: 'en',
      locale: 'en',
      setLanguage: jest.fn(),
      t: {} as any,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Navbar component', () => {
    render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders Footer component', () => {
    render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies LTR direction for English language', () => {
    mockUseLanguage.mockReturnValue({
      language: 'en',
      locale: 'en',
      setLanguage: jest.fn(),
      t: {} as any,
    });

    const { container } = render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveAttribute('dir', 'ltr');
  });

  it('applies RTL direction for Uyghur language', () => {
    mockUseLanguage.mockReturnValue({
      language: 'ug',
      locale: 'ug',
      setLanguage: jest.fn(),
      t: {} as any,
    });

    const { container } = render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveAttribute('dir', 'rtl');
  });

  it('applies LTR direction for Chinese language', () => {
    mockUseLanguage.mockReturnValue({
      language: 'zh',
      locale: 'zh',
      setLanguage: jest.fn(),
      t: {} as any,
    });

    const { container } = render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveAttribute('dir', 'ltr');
  });

  it('has proper structure with main element', () => {
    render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('min-h-screen', 'relative');
  });

  it('sets document direction on mount for RTL', () => {
    mockUseLanguage.mockReturnValue({
      language: 'ug',
      locale: 'ug',
      setLanguage: jest.fn(),
      t: {} as any,
    });

    render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    // The useEffect should set document.documentElement.dir
    // This is tested indirectly through the component's dir attribute
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('sets document language attribute', () => {
    mockUseLanguage.mockReturnValue({
      language: 'en',
      locale: 'en',
      setLanguage: jest.fn(),
      t: {} as any,
    });

    render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    expect(document.documentElement.lang).toBe('en');
  });

  it('updates direction when language changes', () => {
    const { rerender } = render(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    // Change to Uyghur
    mockUseLanguage.mockReturnValue({
      language: 'ug',
      locale: 'ug',
      setLanguage: jest.fn(),
      t: {} as any,
    });

    rerender(
      <WebsiteLayoutClient>
        <div>Test Content</div>
      </WebsiteLayoutClient>
    );

    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ug');
  });
});
