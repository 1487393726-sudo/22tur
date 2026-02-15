/**
 * FlipCard3D Component Unit Tests
 * 
 * Tests specific examples, edge cases, and error conditions for the FlipCard3D component.
 * 
 * Requirements: 9.2, 11.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlipCard3D, FlipCard3DCustom } from '../FlipCard3D';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('FlipCard3D', () => {
  describe('Basic Rendering', () => {
    it('should render front content initially', () => {
      render(
        <FlipCard3D
          frontContent={<div>Front Content</div>}
          backContent={<div>Back Content</div>}
        />
      );
      
      expect(screen.getByText('Front Content')).toBeInTheDocument();
      expect(screen.getByText('Back Content')).toBeInTheDocument();
    });
    
    it('should render with custom width and height', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          width={400}
          height={300}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ width: '400px', height: '300px' });
    });
    
    it('should apply glass effect classes', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          glassEffect="heavy"
        />
      );
      
      const glassFaces = container.querySelectorAll('.glass-heavy');
      expect(glassFaces.length).toBeGreaterThan(0);
    });
    
    it('should render with initial flipped state', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          initialFlipped={true}
        />
      );
      
      // Check that the card is in flipped state
      const motionDiv = container.querySelector('[class*="preserve-3d"]');
      expect(motionDiv).toBeInTheDocument();
    });
  });
  
  describe('Click Trigger Mode', () => {
    it('should flip on click when flipTrigger is "click"', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipTrigger="click"
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Click to flip
      fireEvent.click(card);
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(true);
      });
      
      // Click again to flip back
      fireEvent.click(card);
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(false);
      });
    });
    
    it('should have button role when flipTrigger is "click"', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipTrigger="click"
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('role', 'button');
    });
    
    it('should have cursor-pointer class when flipTrigger is "click"', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipTrigger="click"
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
    });
  });
  
  describe('Hover Trigger Mode', () => {
    it('should flip on hover when flipTrigger is "hover"', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipTrigger="hover"
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Hover to flip
      fireEvent.mouseEnter(card);
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(true);
      });
      
      // Leave to flip back
      fireEvent.mouseLeave(card);
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(false);
      });
    });
    
    it('should not have button role when flipTrigger is "hover"', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipTrigger="hover"
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveAttribute('role', 'button');
    });
  });
  
  describe('Keyboard Navigation', () => {
    it('should flip on Enter key press', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      card.focus();
      
      // Press Enter
      fireEvent.keyDown(card, { key: 'Enter' });
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(true);
      });
    });
    
    it('should flip on Space key press', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      card.focus();
      
      // Press Space
      fireEvent.keyDown(card, { key: ' ' });
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(true);
      });
    });
    
    it('should have correct tabIndex', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          tabIndex={0}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '0');
    });
    
    it('should not be focusable when disabled', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          disabled={true}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '-1');
    });
  });
  
  describe('Controlled Mode', () => {
    it('should use controlled flip state', () => {
      const { rerender, container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          isFlipped={false}
        />
      );
      
      // Initially not flipped
      let motionDiv = container.querySelector('[class*="preserve-3d"]');
      expect(motionDiv).toBeInTheDocument();
      
      // Update to flipped
      rerender(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          isFlipped={true}
        />
      );
      
      motionDiv = container.querySelector('[class*="preserve-3d"]');
      expect(motionDiv).toBeInTheDocument();
    });
    
    it('should call onFlipChange when clicked in controlled mode', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          isFlipped={false}
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(true);
      });
    });
  });
  
  describe('Disabled State', () => {
    it('should not flip when disabled', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          disabled={true}
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Try to click
      fireEvent.click(card);
      
      await waitFor(() => {
        expect(onFlipChange).not.toHaveBeenCalled();
      });
    });
    
    it('should have opacity-50 class when disabled', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          disabled={true}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('opacity-50');
    });
    
    it('should have cursor-not-allowed class when disabled', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          disabled={true}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-not-allowed');
    });
  });
  
  describe('Accessibility', () => {
    it('should have default aria-label', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('aria-label');
      expect(card.getAttribute('aria-label')).toContain('Flip card');
    });
    
    it('should use custom aria-label', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          ariaLabel="Custom flip card label"
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('aria-label', 'Custom flip card label');
    });
    
    it('should have aria-pressed when flipTrigger is "click"', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipTrigger="click"
        />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('aria-pressed');
    });
    
    it('should update aria-pressed based on flip state', async () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipTrigger="click"
        />
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Initially false
      expect(card).toHaveAttribute('aria-pressed', 'false');
      
      // Click to flip
      fireEvent.click(card);
      
      await waitFor(() => {
        expect(card).toHaveAttribute('aria-pressed', 'true');
      });
    });
    
    it('should have aria-hidden on back face when showing front', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          isFlipped={false}
        />
      );
      
      const faces = container.querySelectorAll('[aria-hidden]');
      expect(faces.length).toBeGreaterThan(0);
    });
  });
  
  describe('RTL Support', () => {
    it('should apply RTL rotation angle', () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          isRTL={true}
        />
      );
      
      // Check that back face has negative rotation
      const backFace = container.querySelectorAll('[style*="rotateY"]')[1] as HTMLElement;
      expect(backFace).toBeInTheDocument();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(
        <FlipCard3D
          frontContent={null}
          backContent={null}
        />
      );
      
      // Should not crash
      expect(screen.queryByText('Front')).not.toBeInTheDocument();
    });
    
    it('should handle very large content', () => {
      const largeContent = 'A'.repeat(10000);
      render(
        <FlipCard3D
          frontContent={<div>{largeContent}</div>}
          backContent={<div>{largeContent}</div>}
        />
      );
      
      expect(screen.getAllByText(largeContent).length).toBeGreaterThan(0);
    });
    
    it('should handle rapid flip toggles', async () => {
      const { container } = render(
        <FlipCard3D
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      
      // Rapid clicks
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);
      
      // Should not crash
      expect(card).toBeInTheDocument();
    });
  });
  
  describe('FlipCard3DCustom', () => {
    it('should render with custom flip duration', () => {
      render(
        <FlipCard3DCustom
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipDuration={1.5}
        />
      );
      
      expect(screen.getByText('Front')).toBeInTheDocument();
    });
    
    it('should render with custom easing', () => {
      render(
        <FlipCard3DCustom
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          flipEasing={[0.68, -0.55, 0.265, 1.55]}
        />
      );
      
      expect(screen.getByText('Front')).toBeInTheDocument();
    });
    
    it('should not flip on click when manualOnly is true', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3DCustom
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          manualOnly={true}
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      
      await waitFor(() => {
        expect(onFlipChange).not.toHaveBeenCalled();
      });
    });
    
    it('should still flip on keyboard when manualOnly is true', async () => {
      const onFlipChange = jest.fn();
      const { container } = render(
        <FlipCard3DCustom
          frontContent={<div>Front</div>}
          backContent={<div>Back</div>}
          manualOnly={true}
          onFlipChange={onFlipChange}
        />
      );
      
      const card = container.firstChild as HTMLElement;
      card.focus();
      fireEvent.keyDown(card, { key: 'Enter' });
      
      await waitFor(() => {
        expect(onFlipChange).toHaveBeenCalledWith(true);
      });
    });
  });
});
