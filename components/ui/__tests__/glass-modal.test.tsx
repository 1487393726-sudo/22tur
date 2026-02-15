/**
 * Unit Tests for GlassModal Component
 * GlassModal组件的单元测试
 * 
 * Tests specific examples, edge cases, and error conditions for the glass modal.
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 5.6
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GlassModal,
  GlassModalHeader,
  GlassModalTitle,
  GlassModalBody,
  GlassModalFooter,
} from '../glass-modal';

describe('GlassModal', () => {
  // Helper to restore body overflow after tests
  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Basic Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Modal Content</div>
        </GlassModal>
      );

      expect(screen.getByText('Modal Content')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <GlassModal isOpen={false} onClose={() => {}} ariaLabel="Test Modal">
          <div>Modal Content</div>
        </GlassModal>
      );

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render with aria-label for accessibility', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Test Modal');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Glass Effect Styles (Req 5.1, 5.2, 5.3, 5.4)', () => {
    it('should apply glass-heavy class to modal container', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(modalContainer).toHaveClass('glass-heavy');
    });

    it('should apply backdrop-blur to modal container (Req 5.2)', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(modalContainer).toHaveClass('backdrop-blur-[16px]');
    });

    it('should apply backdrop-blur to overlay (Req 5.3)', () => {
      const { container } = render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const overlay = container.querySelector('.backdrop-blur-\\[6px\\]');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('bg-black/40');
    });

    it('should apply gradient border (Req 5.4)', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(modalContainer).toHaveClass('border-2');
      expect(modalContainer).toHaveClass('border-white/20');
    });

    it('should apply layered shadows (Req 5.4)', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      // Check for shadow class (contains multiple shadow layers)
      const className = modalContainer?.className || '';
      expect(className).toContain('shadow-');
    });

    it('should apply will-change for performance optimization', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(modalContainer).toHaveClass('will-change-[backdrop-filter,transform]');
    });
  });

  describe('Animations (Req 5.6)', () => {
    it('should apply fade-in animation to dialog', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('animate-in');
      expect(dialog).toHaveClass('fade-in');
      expect(dialog).toHaveClass('duration-300');
    });

    it('should apply zoom-in animation to modal container', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(modalContainer).toHaveClass('animate-in');
      expect(modalContainer).toHaveClass('zoom-in-95');
      expect(modalContainer).toHaveClass('duration-300');
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when Escape key is pressed', () => {
      const onClose = jest.fn();
      render(
        <GlassModal isOpen={true} onClose={onClose} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when Escape is pressed if closeOnEscape is false', () => {
      const onClose = jest.fn();
      render(
        <GlassModal
          isOpen={true}
          onClose={onClose}
          closeOnEscape={false}
          ariaLabel="Test Modal"
        >
          <div>Content</div>
        </GlassModal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', () => {
      const onClose = jest.fn();
      render(
        <GlassModal isOpen={true} onClose={onClose} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', () => {
      const onClose = jest.fn();
      render(
        <GlassModal isOpen={true} onClose={onClose} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      const content = screen.getByText('Content');
      fireEvent.click(content);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when overlay is clicked if closeOnOverlayClick is false', () => {
      const onClose = jest.fn();
      render(
        <GlassModal
          isOpen={true}
          onClose={onClose}
          closeOnOverlayClick={false}
          ariaLabel="Test Modal"
        >
          <div>Content</div>
        </GlassModal>
      );

      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should prevent body scroll when modal is open', () => {
      const { rerender } = render(
        <GlassModal isOpen={false} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      expect(document.body.style.overflow).toBe('');

      rerender(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <GlassModal isOpen={false} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom className to modal container', () => {
      render(
        <GlassModal
          isOpen={true}
          onClose={() => {}}
          className="custom-modal-class"
          ariaLabel="Test Modal"
        >
          <div>Content</div>
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(modalContainer).toHaveClass('custom-modal-class');
    });

    it('should apply custom overlayClassName to overlay', () => {
      const { container } = render(
        <GlassModal
          isOpen={true}
          onClose={() => {}}
          overlayClassName="custom-overlay-class"
          ariaLabel="Test Modal"
        >
          <div>Content</div>
        </GlassModal>
      );

      const overlay = container.querySelector('.custom-overlay-class');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Subcomponents', () => {
    it('should render GlassModalHeader with border', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <GlassModalHeader>
            <div>Header Content</div>
          </GlassModalHeader>
        </GlassModal>
      );

      const header = screen.getByText('Header Content').parentElement;
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('border-white/10');
    });

    it('should render GlassModalTitle with proper styling', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <GlassModalTitle>Modal Title</GlassModalTitle>
        </GlassModal>
      );

      const title = screen.getByText('Modal Title');
      expect(title.tagName).toBe('H2');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-semibold');
    });

    it('should render GlassModalBody with content', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <GlassModalBody>
            <p>Body content</p>
          </GlassModalBody>
        </GlassModal>
      );

      const body = screen.getByText('Body content').parentElement;
      expect(body).toHaveClass('text-foreground/90');
    });

    it('should render GlassModalFooter with flex layout', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <GlassModalFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </GlassModalFooter>
        </GlassModal>
      );

      const footer = screen.getByText('Cancel').parentElement;
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('justify-end');
      expect(footer).toHaveClass('border-t');
    });

    it('should render complete modal with all subcomponents', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Complete Modal">
          <GlassModalHeader>
            <GlassModalTitle>Test Title</GlassModalTitle>
          </GlassModalHeader>
          <GlassModalBody>
            <p>Test body content</p>
          </GlassModalBody>
          <GlassModalFooter>
            <button>Close</button>
          </GlassModalFooter>
        </GlassModal>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test body content')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close transitions', async () => {
      const { rerender } = render(
        <GlassModal isOpen={false} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );

      // Open
      rerender(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Close immediately
      rerender(
        <GlassModal isOpen={false} onClose={() => {}} ariaLabel="Test Modal">
          <div>Content</div>
        </GlassModal>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Empty Modal">
          {null}
        </GlassModal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle very long content with scrolling', () => {
      const longContent = Array(100)
        .fill(0)
        .map((_, i) => <p key={i}>Line {i}</p>);

      render(
        <GlassModal isOpen={true} onClose={() => {}} ariaLabel="Long Modal">
          {longContent}
        </GlassModal>
      );

      const modalContainer = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
      expect(modalContainer).toHaveClass('overflow-y-auto');
      expect(modalContainer).toHaveClass('max-h-[90vh]');
    });
  });
});
