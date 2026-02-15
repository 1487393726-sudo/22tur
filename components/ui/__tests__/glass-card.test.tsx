/**
 * GlassCard Component Unit Tests
 * 玻璃态卡片组件单元测试
 * 
 * Tests specific examples and edge cases for the GlassCard component.
 * Validates Requirements: 2.1, 2.2, 2.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassCard } from '../glass-card';

describe('GlassCard Component', () => {
  describe('Basic Rendering', () => {
    it('should render children content', () => {
      render(
        <GlassCard>
          <div>Test Content</div>
        </GlassCard>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply default medium intensity', () => {
      const { container } = render(
        <GlassCard>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('glass-medium');
    });

    it('should apply base structural classes', () => {
      const { container } = render(
        <GlassCard>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('overflow-hidden');
      expect(card.className).toContain('relative');
    });
  });

  describe('Intensity Variations', () => {
    it('should apply light intensity class', () => {
      const { container } = render(
        <GlassCard intensity="light">
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('glass-light');
      expect(card.className).not.toContain('glass-medium');
      expect(card.className).not.toContain('glass-heavy');
    });

    it('should apply medium intensity class', () => {
      const { container } = render(
        <GlassCard intensity="medium">
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('glass-medium');
      expect(card.className).not.toContain('glass-light');
      expect(card.className).not.toContain('glass-heavy');
    });

    it('should apply heavy intensity class', () => {
      const { container } = render(
        <GlassCard intensity="heavy">
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('glass-heavy');
      expect(card.className).not.toContain('glass-light');
      expect(card.className).not.toContain('glass-medium');
    });
  });

  describe('Interactive Mode', () => {
    it('should not apply interactive classes by default', () => {
      const { container } = render(
        <GlassCard>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain('glass-interactive');
      expect(card.className).not.toContain('cursor-pointer');
    });

    it('should apply interactive classes when interactive is true', () => {
      const { container } = render(
        <GlassCard interactive>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('glass-interactive');
      expect(card.className).toContain('cursor-pointer');
    });

    it('should have button role when interactive', () => {
      const { container } = render(
        <GlassCard interactive>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.getAttribute('role')).toBe('button');
      expect(card.getAttribute('tabIndex')).toBe('0');
    });

    it('should not have button role when not interactive', () => {
      const { container } = render(
        <GlassCard>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.getAttribute('role')).toBeNull();
      expect(card.getAttribute('tabIndex')).toBeNull();
    });

    it('should call onClick when interactive card is clicked', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <GlassCard interactive onClick={handleClick}>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when non-interactive card is clicked', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <GlassCard onClick={handleClick}>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should call onClick when Enter key is pressed on interactive card', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <GlassCard interactive onClick={handleClick}>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed on interactive card', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <GlassCard interactive onClick={handleClick}>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom ClassName', () => {
    it('should merge custom className with default classes', () => {
      const { container } = render(
        <GlassCard className="custom-class another-class">
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('custom-class');
      expect(card.className).toContain('another-class');
      expect(card.className).toContain('glass-medium');
      expect(card.className).toContain('rounded-xl');
    });

    it('should handle empty className', () => {
      const { container } = render(
        <GlassCard className="">
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('glass-medium');
      expect(card.className).not.toContain('  '); // No double spaces
    });
  });

  describe('Edge Cases', () => {
    it('should handle complex nested content', () => {
      render(
        <GlassCard>
          <div>
            <h2>Title</h2>
            <p>Description</p>
            <button>Action</button>
          </div>
        </GlassCard>
      );
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should handle interactive card with all intensity levels', () => {
      const intensities: Array<'light' | 'medium' | 'heavy'> = ['light', 'medium', 'heavy'];
      
      intensities.forEach(intensity => {
        const { container } = render(
          <GlassCard intensity={intensity} interactive>
            <div>Content</div>
          </GlassCard>
        );
        
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain(`glass-${intensity}`);
        expect(card.className).toContain('glass-interactive');
      });
    });

    it('should handle onClick without interactive prop gracefully', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <GlassCard onClick={handleClick}>
          <div>Content</div>
        </GlassCard>
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      
      // Should not call onClick when not interactive
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
