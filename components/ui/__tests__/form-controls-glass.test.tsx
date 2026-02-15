/**
 * Unit Tests: Form Controls Glass Effects
 * 表单控件玻璃效果单元测试
 * 
 * Tests glass effect application to select and textarea components
 * Validates Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { render } from '@testing-library/react';
import { Textarea } from '../textarea';
import { Select, SelectTrigger, SelectContent, SelectValue } from '../select';

describe('Form Controls Glass Effects', () => {
  describe('Textarea Component', () => {
    it('should apply glass-light class for semi-transparent background (Req 4.1)', () => {
      const { container } = render(<Textarea placeholder="Test" />);
      const textarea = container.querySelector('textarea');
      
      expect(textarea).toHaveClass('glass-light');
    });

    it('should apply backdrop-blur for glass effect (Req 4.2)', () => {
      const { container } = render(<Textarea placeholder="Test" />);
      const textarea = container.querySelector('textarea');
      
      expect(textarea?.className).toMatch(/backdrop-blur-\[10px\]/);
    });

    it('should have border with low opacity (Req 4.1)', () => {
      const { container } = render(<Textarea placeholder="Test" />);
      const textarea = container.querySelector('textarea');
      
      expect(textarea?.className).toMatch(/border-white\/10/);
    });

    it('should have enhanced focus state styles (Req 4.3)', () => {
      const { container } = render(<Textarea placeholder="Test" />);
      const textarea = container.querySelector('textarea');
      
      expect(textarea?.className).toMatch(/focus-visible:border-white\/30/);
      expect(textarea?.className).toMatch(/focus-visible:ring-\[3px\]/);
      expect(textarea?.className).toMatch(/focus-visible:backdrop-blur-\[12px\]/);
    });

    it('should have will-change property for performance optimization', () => {
      const { container } = render(<Textarea placeholder="Test" />);
      const textarea = container.querySelector('textarea');
      
      expect(textarea?.className).toMatch(/will-change-\[backdrop-filter,border-color\]/);
    });

    it('should have transition for smooth state changes', () => {
      const { container } = render(<Textarea placeholder="Test" />);
      const textarea = container.querySelector('textarea');
      
      expect(textarea?.className).toMatch(/transition-all/);
      expect(textarea?.className).toMatch(/duration-200/);
    });
  });

  describe('Select Component', () => {
    it('should apply glass-light class to SelectTrigger (Req 4.1, 4.4)', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[data-slot="select-trigger"]');
      
      expect(trigger).toHaveClass('glass-light');
    });

    it('should apply backdrop-blur to SelectTrigger (Req 4.2, 4.4)', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[data-slot="select-trigger"]');
      
      expect(trigger?.className).toMatch(/backdrop-blur-\[10px\]/);
    });

    it('should have border with low opacity on SelectTrigger (Req 4.1)', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[data-slot="select-trigger"]');
      
      expect(trigger?.className).toMatch(/border-white\/10/);
    });

    it('should have enhanced focus state on SelectTrigger (Req 4.3)', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[data-slot="select-trigger"]');
      
      expect(trigger?.className).toMatch(/focus-visible:border-white\/30/);
      expect(trigger?.className).toMatch(/focus-visible:ring-\[3px\]/);
      expect(trigger?.className).toMatch(/focus-visible:backdrop-blur-\[12px\]/);
    });

    it('should have will-change property on SelectTrigger for performance', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[data-slot="select-trigger"]');
      
      expect(trigger?.className).toMatch(/will-change-\[backdrop-filter,border-color\]/);
    });

    it('should have transition on SelectTrigger for smooth state changes', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[data-slot="select-trigger"]');
      
      expect(trigger?.className).toMatch(/transition-all/);
      expect(trigger?.className).toMatch(/duration-200/);
    });
  });

  describe('Consistency with Input Component', () => {
    it('should use same glass effect pattern across all form controls (Req 4.4)', () => {
      const { container: textareaContainer } = render(<Textarea />);
      const { container: selectContainer } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const textarea = textareaContainer.querySelector('textarea');
      const selectTrigger = selectContainer.querySelector('[data-slot="select-trigger"]');

      // All should have glass-light class
      expect(textarea).toHaveClass('glass-light');
      expect(selectTrigger).toHaveClass('glass-light');

      // All should have backdrop-blur-[10px]
      expect(textarea?.className).toMatch(/backdrop-blur-\[10px\]/);
      expect(selectTrigger?.className).toMatch(/backdrop-blur-\[10px\]/);

      // All should have border-white/10
      expect(textarea?.className).toMatch(/border-white\/10/);
      expect(selectTrigger?.className).toMatch(/border-white\/10/);

      // All should have focus-visible:backdrop-blur-[12px]
      expect(textarea?.className).toMatch(/focus-visible:backdrop-blur-\[12px\]/);
      expect(selectTrigger?.className).toMatch(/focus-visible:backdrop-blur-\[12px\]/);
    });
  });
});
