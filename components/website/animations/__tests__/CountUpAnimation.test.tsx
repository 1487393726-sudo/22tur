/**
 * CountUpAnimation Component Tests
 * Tests the counting animation functionality
 * Requirements: 7.3
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CountUpAnimation } from '../CountUpAnimation';

// Mock Framer Motion's useInView hook
jest.mock('framer-motion', () => ({
  useInView: jest.fn(() => true), // Always return true for testing
}));

// Mock matchMedia for prefers-reduced-motion
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock requestAnimationFrame
const mockRAF = () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;
  let currentTime = 0;

  global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    rafCallbacks.push(callback);
    return ++rafId;
  });

  global.cancelAnimationFrame = jest.fn((id: number) => {
    // Simple mock, doesn't actually cancel
  });

  const tick = (deltaTime: number = 16) => {
    currentTime += deltaTime;
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach((callback) => callback(currentTime));
  };

  const tickAll = (duration: number, step: number = 16) => {
    const steps = Math.ceil(duration / step);
    for (let i = 0; i < steps; i++) {
      tick(step);
    }
  };

  return { tick, tickAll };
};

describe('CountUpAnimation', () => {
  beforeEach(() => {
    mockMatchMedia(false); // User does not prefer reduced motion
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with initial value', () => {
      render(<CountUpAnimation end={100} />);
      const element = screen.getByText(/\d+/);
      expect(element).toBeInTheDocument();
    });

    it('should render with prefix', () => {
      render(<CountUpAnimation end={100} prefix="$" />);
      expect(screen.getByText(/^\$/)).toBeInTheDocument();
    });

    it('should render with suffix', () => {
      render(<CountUpAnimation end={100} suffix="%" />);
      expect(screen.getByText(/%$/)).toBeInTheDocument();
    });

    it('should render with both prefix and suffix', () => {
      render(<CountUpAnimation end={100} prefix="$" suffix="+" />);
      const text = screen.getByText(/^\$.*\+$/);
      expect(text).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CountUpAnimation end={100} className="custom-class" />
      );
      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format with thousand separators by default', async () => {
      const { tick, tickAll } = mockRAF();
      render(<CountUpAnimation end={1000} duration={0.1} />);
      
      // Complete the animation
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/1,000/)).toBeInTheDocument();
      });
    });

    it('should format without separators when disabled', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={1000} separator={false} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        const text = screen.getByText(/1000/);
        expect(text.textContent).not.toContain(',');
      });
    });

    it('should format with custom separator character', async () => {
      const { tickAll } = mockRAF();
      render(
        <CountUpAnimation 
          end={1000} 
          separatorChar=" " 
          duration={0.1}
        />
      );
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/1\s000/)).toBeInTheDocument();
      });
    });

    it('should format with decimal places', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={99.9} decimals={1} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/99\.9/)).toBeInTheDocument();
      });
    });

    it('should format with custom decimal character', async () => {
      const { tickAll } = mockRAF();
      render(
        <CountUpAnimation 
          end={99.9} 
          decimals={1} 
          decimalChar="," 
          duration={0.1}
        />
      );
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/99,9/)).toBeInTheDocument();
      });
    });

    it('should handle multiple decimal places', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={3.14159} decimals={2} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/3\.14/)).toBeInTheDocument();
      });
    });
  });

  describe('Animation Behavior', () => {
    it('should animate from start to end', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={100} duration={0.1} />);
      
      // Complete animation
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/100/)).toBeInTheDocument();
      });
    });

    it('should animate from custom start value', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation start={50} end={100} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/100/)).toBeInTheDocument();
      });
    });

    it('should respect custom duration', () => {
      const { tick } = mockRAF();
      const duration = 2; // 2 seconds
      render(<CountUpAnimation end={100} duration={duration} />);
      
      // After half the duration, should not be complete
      tick(1000);
      const midValue = parseInt(screen.getByText(/\d+/).textContent || '0');
      expect(midValue).toBeLessThan(100);
    });
  });

  describe('Reduced Motion Support', () => {
    it('should skip animation when user prefers reduced motion', () => {
      mockMatchMedia(true); // User prefers reduced motion
      
      render(<CountUpAnimation end={100} />);
      
      // Should immediately show final value
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });

    it('should not call requestAnimationFrame when reduced motion is preferred', () => {
      mockMatchMedia(true);
      mockRAF();
      
      render(<CountUpAnimation end={100} />);
      
      expect(global.requestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero as end value', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={0} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/^0$/)).toBeInTheDocument();
      });
    });

    it('should handle negative numbers', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={-100} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/-100/)).toBeInTheDocument();
      });
    });

    it('should handle very large numbers', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={1000000} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
      });
    });

    it('should handle very small decimal numbers', async () => {
      const { tickAll } = mockRAF();
      render(<CountUpAnimation end={0.001} decimals={3} duration={0.1} />);
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/0\.001/)).toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    it('should cancel animation frame on unmount', () => {
      mockRAF();
      const { unmount } = render(<CountUpAnimation end={100} />);
      
      unmount();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Real-world Use Cases', () => {
    it('should render percentage correctly', async () => {
      const { tickAll } = mockRAF();
      render(
        <CountUpAnimation 
          end={99.9} 
          decimals={1} 
          suffix="%" 
          duration={0.1}
        />
      );
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/99\.9%/)).toBeInTheDocument();
      });
    });

    it('should render currency correctly', async () => {
      const { tickAll } = mockRAF();
      render(
        <CountUpAnimation 
          end={5000} 
          prefix="$" 
          separator={true}
          duration={0.1}
        />
      );
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
      });
    });

    it('should render count with plus suffix', async () => {
      const { tickAll } = mockRAF();
      render(
        <CountUpAnimation 
          end={1000} 
          suffix="+" 
          separator={true}
          duration={0.1}
        />
      );
      
      tickAll(200);
      
      await waitFor(() => {
        expect(screen.getByText(/1,000\+/)).toBeInTheDocument();
      });
    });
  });
});
