   /**
 * Property-Based Tests for Website Layout
 * 
 * Tests universal properties that should hold across all inputs:
 * - Property 10: Page Import Exclusion
 * - Property 21: RTL Layout Application
 * 
 * Requirements: 3.5, 6.5
 */

import fc from 'fast-check';
import { render } from '@testing-library/react';
import { WebsiteLayoutClient } from '../layout-client';
import { useLanguage } from '@/lib/i18n/context';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

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

describe('Website Layout - Property-Based Tests', () => {
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

  /**
   * Feature: website-3d-redesign, Property 10: Page Import Exclusion
   * 
   * **Validates: Requirements 3.5**
   * 
   * For any page component file in app/(website)/, the file content should not 
   * contain direct imports of Navbar or Footer components.
   * 
   * This ensures that the unified layout structure is properly used and pages
   * don't duplicate the Navbar/Footer imports.
   */
  test('Property 10: Page files do not import Navbar or Footer directly', () => {
    // Get all page files in app/(website)/ directory
    const websiteDir = path.join(process.cwd(), 'app', '(website)');
    const pageFiles = glob.sync('**/page.tsx', {
      cwd: websiteDir,
      absolute: true,
    });

    // Exclude the layout files themselves
    const filteredPageFiles = pageFiles.filter(
      (file) => !file.includes('layout.tsx') && !file.includes('layout-client.tsx')
    );

    expect(filteredPageFiles.length).toBeGreaterThan(0);

    // Check each page file
    filteredPageFiles.forEach((pageFile) => {
      const content = fs.readFileSync(pageFile, 'utf-8');

      // Check for Navbar imports
      const navbarImportPattern = /import\s+.*\bNavbar\b.*from/;
      expect(content).not.toMatch(navbarImportPattern);

      // Check for Footer imports
      const footerImportPattern = /import\s+.*\bFooter\b.*from/;
      expect(content).not.toMatch(footerImportPattern);

      // Additional check: ensure no direct usage without import
      // (which would be a different error but still problematic)
      const lines = content.split('\n');
      const importSection = lines.slice(0, 30); // Check first 30 lines for imports
      const hasNavbarImport = importSection.some(line => 
        line.includes('Navbar') && line.includes('import')
      );
      const hasFooterImport = importSection.some(line => 
        line.includes('Footer') && line.includes('import')
      );

      expect(hasNavbarImport).toBe(false);
      expect(hasFooterImport).toBe(false);
    });
  });

  /**
   * Feature: website-3d-redesign, Property 21: RTL Layout Application
   * 
   * **Validates: Requirements 6.5**
   * 
   * For any page, when the locale is set to 'ug' (Uyghur), the document dir 
   * attribute should be 'rtl' and layout should mirror appropriately.
   * 
   * This property tests that RTL layout is correctly applied across all possible
   * language configurations.
   */
  test('Property 21: RTL layout is applied when locale is Uyghur', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary locale values including the critical 'ug' case
        fc.constantFrom('zh', 'en', 'ug'),
        (locale) => {
          // Mock the language context with the generated locale
          mockUseLanguage.mockReturnValue({
            language: locale,
            locale: locale,
            setLanguage: jest.fn(),
            t: {} as any,
          });

          const { container } = render(
            <WebsiteLayoutClient>
              <div data-testid="test-content">Test Content</div>
            </WebsiteLayoutClient>
          );

          const mainDiv = container.firstChild as HTMLElement;

          // Property: RTL should be applied if and only if locale is 'ug'
          if (locale === 'ug') {
            expect(mainDiv).toHaveAttribute('dir', 'rtl');
            expect(document.documentElement.dir).toBe('rtl');
          } else {
            expect(mainDiv).toHaveAttribute('dir', 'ltr');
            expect(document.documentElement.dir).toBe('ltr');
          }

          // Additional invariant: dir attribute should always be set
          expect(mainDiv).toHaveAttribute('dir');
          expect(['ltr', 'rtl']).toContain(mainDiv.getAttribute('dir'));

          // Language attribute should match the locale
          expect(document.documentElement.lang).toBe(locale);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21 Extended: RTL layout consistency across re-renders
   * 
   * Tests that RTL layout remains consistent when the component re-renders
   * with the same locale, and changes correctly when locale changes.
   */
  test('Property 21 Extended: RTL layout consistency across locale changes', () => {
    fc.assert(
      fc.property(
        // Generate pairs of locales to test transitions
        fc.tuple(
          fc.constantFrom('zh', 'en', 'ug'),
          fc.constantFrom('zh', 'en', 'ug')
        ),
        ([initialLocale, newLocale]) => {
          // Set initial locale
          mockUseLanguage.mockReturnValue({
            language: initialLocale,
            locale: initialLocale,
            setLanguage: jest.fn(),
            t: {} as any,
          });

          const { container, rerender } = render(
            <WebsiteLayoutClient>
              <div data-testid="test-content">Test Content</div>
            </WebsiteLayoutClient>
          );

          // Verify initial state
          const mainDiv = container.firstChild as HTMLElement;
          const expectedInitialDir = initialLocale === 'ug' ? 'rtl' : 'ltr';
          expect(mainDiv).toHaveAttribute('dir', expectedInitialDir);

          // Change locale
          mockUseLanguage.mockReturnValue({
            language: newLocale,
            locale: newLocale,
            setLanguage: jest.fn(),
            t: {} as any,
          });

          rerender(
            <WebsiteLayoutClient>
              <div data-testid="test-content">Test Content</div>
            </WebsiteLayoutClient>
          );

          // Verify new state
          const expectedNewDir = newLocale === 'ug' ? 'rtl' : 'ltr';
          expect(mainDiv).toHaveAttribute('dir', expectedNewDir);
          expect(document.documentElement.dir).toBe(expectedNewDir);
          expect(document.documentElement.lang).toBe(newLocale);

          // Invariant: direction should always be either 'ltr' or 'rtl'
          expect(['ltr', 'rtl']).toContain(mainDiv.getAttribute('dir'));
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 21 Additional: RTL layout with arbitrary content
   * 
   * Tests that RTL layout works correctly regardless of the content
   * being rendered inside the layout.
   */
  test('Property 21 Additional: RTL layout works with arbitrary content', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ug', 'en', 'zh'),
        fc.string({ minLength: 0, maxLength: 100 }),
        (locale, contentText) => {
          mockUseLanguage.mockReturnValue({
            language: locale,
            locale: locale,
            setLanguage: jest.fn(),
            t: {} as any,
          });

          const { container } = render(
            <WebsiteLayoutClient>
              <div>{contentText}</div>
            </WebsiteLayoutClient>
          );

          const mainDiv = container.firstChild as HTMLElement;
          const expectedDir = locale === 'ug' ? 'rtl' : 'ltr';

          // Property: dir attribute should be set correctly regardless of content
          expect(mainDiv).toHaveAttribute('dir', expectedDir);
          expect(document.documentElement.dir).toBe(expectedDir);

          // Content should be rendered
          if (contentText) {
            expect(container.textContent).toContain(contentText);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
