/**
 * Services Page Flip Cards Integration Test
 * 
 * Tests the FlipCard3D implementation on the services page
 * Validates Requirements 9.2, 9.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlipCard3D } from '@/components/website/3d/FlipCard3D';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
}));

describe('Services Page - Flip Cards Integration', () => {
  const mockFrontContent = (
    <div className="p-8 bg-white h-full flex flex-col items-center">
      <div className="w-20 h-20 bg-blue-500 rounded-xl mb-6 flex items-center justify-center">
        <span className="text-white text-4xl">💻</span>
      </div>
      <h3 className="text-2xl font-bold mb-4">Web Development</h3>
      <p className="text-gray-600 mb-6">Build high-performance websites</p>
      <p className="text-sm text-gray-500">🔄 Click to see details</p>
    </div>
  );

  const mockBackContent = (
    <div className="p-8 bg-white h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl">💻</span>
        </div>
        <h3 className="text-xl font-bold">Web Development</h3>
      </div>
      <div className="space-y-2 mb-6 flex-grow">
        <p className="text-sm font-semibold mb-3">Includes:</p>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Responsive Design</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>SEO Optimization</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>High Performance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Secure & Reliable</span>
          </li>
        </ul>
      </div>
      <a href="/contact" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
        Learn More →
      </a>
      <p className="text-xs text-gray-500 text-center mt-4">🔄 Click to go back</p>
    </div>
  );

  it('should render flip card with front content', () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    // Check front content is visible (use getAllByText since text appears on both sides)
    const webDevTitles = screen.getAllByText('Web Development');
    expect(webDevTitles.length).toBeGreaterThan(0);
    expect(screen.getByText('Build high-performance websites')).toBeInTheDocument();
    expect(screen.getByText('🔄 Click to see details')).toBeInTheDocument();
  });

  it('should have button role for click trigger', () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const flipCard = screen.getByRole('button');
    expect(flipCard).toBeInTheDocument();
    expect(flipCard.getAttribute('aria-pressed')).toBe('false');
  });

  it('should flip card on click', async () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const flipCard = screen.getByRole('button');
    
    // Initial state
    expect(flipCard.getAttribute('aria-pressed')).toBe('false');
    
    // Click to flip
    fireEvent.click(flipCard);
    
    // Wait for state change
    await waitFor(() => {
      expect(flipCard.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('should support keyboard navigation with Enter key', async () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const flipCard = screen.getByRole('button');
    
    // Press Enter to flip
    fireEvent.keyDown(flipCard, { key: 'Enter' });
    
    await waitFor(() => {
      expect(flipCard.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('should support keyboard navigation with Space key', async () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const flipCard = screen.getByRole('button');
    
    // Press Space to flip
    fireEvent.keyDown(flipCard, { key: ' ' });
    
    await waitFor(() => {
      expect(flipCard.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('should display back content with features', () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    // Back content should be in DOM (even if hidden)
    expect(screen.getByText('Includes:')).toBeInTheDocument();
    expect(screen.getByText('Responsive Design')).toBeInTheDocument();
    expect(screen.getByText('SEO Optimization')).toBeInTheDocument();
    expect(screen.getByText('High Performance')).toBeInTheDocument();
    expect(screen.getByText('Secure & Reliable')).toBeInTheDocument();
  });

  it('should have Learn More link on back', () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const learnMoreLink = screen.getByText(/Learn More/);
    expect(learnMoreLink.closest('a')).toHaveAttribute('href', '/contact');
  });

  it('should apply glass effect', () => {
    const { container } = render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        glassEffect="light"
        height="400px"
      />
    );
    
    const glassElements = container.querySelectorAll('.glass-light');
    expect(glassElements.length).toBeGreaterThan(0);
  });

  it('should set proper height', () => {
    const { container } = render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const cardContainer = container.querySelector('[style*="perspective"]');
    expect(cardContainer).toHaveStyle({ height: '400px' });
  });

  it('should have proper aria-label', () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
        ariaLabel="Web Development Service"
      />
    );
    
    const flipCard = screen.getByRole('button');
    expect(flipCard).toHaveAttribute('aria-label', 'Web Development Service');
  });

  it('should be focusable with proper tabindex', () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const flipCard = screen.getByRole('button');
    expect(flipCard.getAttribute('tabindex')).toBe('0');
  });

  it('should flip back on second click', async () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    const flipCard = screen.getByRole('button');
    
    // First click - flip to back
    fireEvent.click(flipCard);
    await waitFor(() => {
      expect(flipCard.getAttribute('aria-pressed')).toBe('true');
    });
    
    // Second click - flip back to front
    fireEvent.click(flipCard);
    await waitFor(() => {
      expect(flipCard.getAttribute('aria-pressed')).toBe('false');
    });
  });

  it('should display flip hints on both sides', () => {
    render(
      <FlipCard3D
        frontContent={mockFrontContent}
        backContent={mockBackContent}
        flipTrigger="click"
        height="400px"
      />
    );
    
    // Front hint
    expect(screen.getByText('🔄 Click to see details')).toBeInTheDocument();
    
    // Back hint
    expect(screen.getByText('🔄 Click to go back')).toBeInTheDocument();
  });
});
