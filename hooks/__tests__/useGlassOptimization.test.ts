/**
 * Unit Tests for useGlassOptimization Hook
 * 
 * Tests the glass effect optimization hook's behavior with different
 * device capabilities and user preferences.
 * 
 * Validates Requirements: 7.1, 7.2, 7.3
 */

import { renderHook, act } from '@testing-library/react';
import {
  useGlassOptimization,
  resetBackdropFilterCount,
  getBackdropFilterCount,
} from '../useGlassOptimization';
import * as browserCapabilities from '@/lib/utils/browser-capabilities';

// Mock the browser capabilities module
jest.mock('@/lib/utils/browser-capabilities');

const mockDetectBrowserCapabilities = browserCapabilities.detectBrowserCapabilities as jest.MockedFunction<
  typeof browserCapabilities.detectBrowserCapabilities
>;
const mockShouldEnableGlassEffects = browserCapabilities.shouldEnableGlassEffects as jest.MockedFunction<
  typeof browserCapabilities.shouldEnableGlassEffects
>;
const mockWatchUserPreferences = browserCapabilities.watchUserPreferences as jest.MockedFunction<
  typeof browserCapabilities.watchUserPreferences
>;

describe('useGlassOptimization', () => {
  beforeEach(() => {
    // Reset global counter before each test
    resetBackdropFilterCount();

    // Default mock implementations
    mockDetectBrowserCapabilities.mockReturnValue({
      supportsBackdropFilter: true,
      isLowEndDevice: false,
      isMobile: false,
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersReducedTransparency: false,
    });

    mockShouldEnableGlassEffects.mockReturnValue(true);

    mockWatchUserPreferences.mockReturnValue(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return shouldUseGlass as true when browser supports glass effects', () => {
      const { result } = renderHook(() => useGlassOptimization());

      expect(result.current.shouldUseGlass).toBe(true);
      expect(result.current.capabilities.supportsBackdropFilter).toBe(true);
    });

    it('should return shouldUseGlass as false when browser does not support backdrop-filter', () => {
      mockDetectBrowserCapabilities.mockReturnValue({
        supportsBackdropFilter: false,
        isLowEndDevice: false,
        isMobile: false,
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersReducedTransparency: false,
      });
      mockShouldEnableGlassEffects.mockReturnValue(false);

      const { result } = renderHook(() => useGlassOptimization());

      expect(result.current.shouldUseGlass).toBe(false);
    });

    it('should detect browser capabilities on mount', () => {
      renderHook(() => useGlassOptimization());

      expect(mockDetectBrowserCapabilities).toHaveBeenCalled();
    });

    it('should set up user preference watcher on mount', () => {
      renderHook(() => useGlassOptimization());

      expect(mockWatchUserPreferences).toHaveBeenCalled();
    });
  });

  describe('Backdrop Filter Count Management (Requirement 7.2)', () => {
    it('should start with backdropFilterCount of 0', () => {
      const { result } = renderHook(() => useGlassOptimization());

      expect(result.current.backdropFilterCount).toBe(0);
      expect(result.current.isAtMaxCapacity).toBe(false);
    });

    it('should increment backdropFilterCount when registerBackdropFilter is called', () => {
      const { result } = renderHook(() => useGlassOptimization());

      act(() => {
        result.current.registerBackdropFilter();
      });

      expect(result.current.backdropFilterCount).toBe(1);
    });

    it('should decrement backdropFilterCount when unregisterBackdropFilter is called', () => {
      const { result } = renderHook(() => useGlassOptimization());

      act(() => {
        result.current.registerBackdropFilter();
        result.current.registerBackdropFilter();
      });

      expect(result.current.backdropFilterCount).toBe(2);

      act(() => {
        result.current.unregisterBackdropFilter();
      });

      expect(result.current.backdropFilterCount).toBe(1);
    });

    it('should not go below 0 when unregistering more than registered', () => {
      const { result } = renderHook(() => useGlassOptimization());

      act(() => {
        result.current.unregisterBackdropFilter();
        result.current.unregisterBackdropFilter();
      });

      expect(result.current.backdropFilterCount).toBe(0);
    });

    it('should share backdrop filter count across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useGlassOptimization());
      const { result: result2 } = renderHook(() => useGlassOptimization());

      act(() => {
        result1.current.registerBackdropFilter();
      });

      // Both instances should see the same count
      expect(result1.current.backdropFilterCount).toBe(1);
      expect(result2.current.backdropFilterCount).toBe(1);

      act(() => {
        result2.current.registerBackdropFilter();
      });

      expect(result1.current.backdropFilterCount).toBe(2);
      expect(result2.current.backdropFilterCount).toBe(2);
    });

    it('should set isAtMaxCapacity to true when reaching the limit', () => {
      const { result } = renderHook(() =>
        useGlassOptimization({ maxBackdropFilterElements: 3 })
      );

      expect(result.current.isAtMaxCapacity).toBe(false);

      act(() => {
        result.current.registerBackdropFilter();
        result.current.registerBackdropFilter();
        result.current.registerBackdropFilter();
      });

      expect(result.current.isAtMaxCapacity).toBe(true);
    });

    it('should disable glass effects when at maximum capacity', () => {
      const { result } = renderHook(() =>
        useGlassOptimization({ maxBackdropFilterElements: 2 })
      );

      act(() => {
        result.current.registerBackdropFilter();
        result.current.registerBackdropFilter();
      });

      expect(result.current.shouldUseGlass).toBe(false);
      expect(result.current.isAtMaxCapacity).toBe(true);
    });

    it('should use default max of 15 backdrop-filter elements', () => {
      const { result } = renderHook(() => useGlassOptimization());

      // Register 14 elements (should still be enabled)
      act(() => {
        for (let i = 0; i < 14; i++) {
          result.current.registerBackdropFilter();
        }
      });

      expect(result.current.shouldUseGlass).toBe(true);
      expect(result.current.isAtMaxCapacity).toBe(false);

      // Register 15th element (should reach capacity)
      act(() => {
        result.current.registerBackdropFilter();
      });

      expect(result.current.shouldUseGlass).toBe(false);
      expect(result.current.isAtMaxCapacity).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    it('should respect custom maxBackdropFilterElements', () => {
      const { result } = renderHook(() =>
        useGlassOptimization({ maxBackdropFilterElements: 5 })
      );

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.registerBackdropFilter();
        }
      });

      expect(result.current.isAtMaxCapacity).toBe(true);
    });

    it('should disable glass on low-end devices when enableOnLowEndDevices is false', () => {
      mockDetectBrowserCapabilities.mockReturnValue({
        supportsBackdropFilter: true,
        isLowEndDevice: true,
        isMobile: false,
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersReducedTransparency: false,
      });

      const { result } = renderHook(() =>
        useGlassOptimization({ enableOnLowEndDevices: false })
      );

      expect(result.current.shouldUseGlass).toBe(false);
    });

    it('should enable glass on low-end devices when enableOnLowEndDevices is true', () => {
      mockDetectBrowserCapabilities.mockReturnValue({
        supportsBackdropFilter: true,
        isLowEndDevice: true,
        isMobile: false,
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersReducedTransparency: false,
      });
      mockShouldEnableGlassEffects.mockReturnValue(true);

      const { result } = renderHook(() =>
        useGlassOptimization({ enableOnLowEndDevices: true })
      );

      expect(result.current.shouldUseGlass).toBe(true);
    });

    it('should disable glass on mobile when enableOnMobile is false', () => {
      mockDetectBrowserCapabilities.mockReturnValue({
        supportsBackdropFilter: true,
        isLowEndDevice: false,
        isMobile: true,
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersReducedTransparency: false,
      });

      const { result } = renderHook(() =>
        useGlassOptimization({ enableOnMobile: false })
      );

      expect(result.current.shouldUseGlass).toBe(false);
    });

    it('should ignore user preferences when respectUserPreferences is false', () => {
      mockDetectBrowserCapabilities.mockReturnValue({
        supportsBackdropFilter: true,
        isLowEndDevice: false,
        isMobile: false,
        prefersReducedMotion: true,
        prefersHighContrast: false,
        prefersReducedTransparency: false,
      });
      mockShouldEnableGlassEffects.mockReturnValue(false); // Would normally disable

      const { result } = renderHook(() =>
        useGlassOptimization({ respectUserPreferences: false })
      );

      // Should still enable because we're ignoring preferences
      expect(result.current.shouldUseGlass).toBe(true);
    });
  });

  describe('User Preferences', () => {
    it('should disable glass when user prefers reduced transparency', () => {
      mockDetectBrowserCapabilities.mockReturnValue({
        supportsBackdropFilter: true,
        isLowEndDevice: false,
        isMobile: false,
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersReducedTransparency: true,
      });
      mockShouldEnableGlassEffects.mockReturnValue(false);

      const { result } = renderHook(() => useGlassOptimization());

      expect(result.current.shouldUseGlass).toBe(false);
    });

    it('should disable glass when user prefers high contrast', () => {
      mockDetectBrowserCapabilities.mockReturnValue({
        supportsBackdropFilter: true,
        isLowEndDevice: false,
        isMobile: false,
        prefersReducedMotion: false,
        prefersHighContrast: true,
        prefersReducedTransparency: false,
      });
      mockShouldEnableGlassEffects.mockReturnValue(false);

      const { result } = renderHook(() => useGlassOptimization());

      expect(result.current.shouldUseGlass).toBe(false);
    });

    it('should update when user preferences change', () => {
      let preferenceCallback: ((capabilities: any) => void) | null = null;

      mockWatchUserPreferences.mockImplementation((callback) => {
        preferenceCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useGlassOptimization());

      expect(result.current.capabilities.prefersReducedMotion).toBe(false);

      // Simulate preference change
      act(() => {
        if (preferenceCallback) {
          preferenceCallback({
            supportsBackdropFilter: true,
            isLowEndDevice: false,
            isMobile: false,
            prefersReducedMotion: true,
            prefersHighContrast: false,
            prefersReducedTransparency: false,
          });
        }
      });

      expect(result.current.capabilities.prefersReducedMotion).toBe(true);
    });
  });

  describe('Refresh Capabilities', () => {
    it('should provide a refreshCapabilities function', () => {
      const { result } = renderHook(() => useGlassOptimization());

      expect(typeof result.current.refreshCapabilities).toBe('function');
    });

    it('should re-detect capabilities when refreshCapabilities is called', () => {
      const { result } = renderHook(() => useGlassOptimization());

      const initialCallCount = mockDetectBrowserCapabilities.mock.calls.length;

      act(() => {
        result.current.refreshCapabilities();
      });

      expect(mockDetectBrowserCapabilities).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });

  describe('Cleanup', () => {
    it('should clean up user preference watcher on unmount', () => {
      const cleanupMock = jest.fn();
      mockWatchUserPreferences.mockReturnValue(cleanupMock);

      const { unmount } = renderHook(() => useGlassOptimization());

      unmount();

      expect(cleanupMock).toHaveBeenCalled();
    });
  });

  describe('Global Counter Utilities', () => {
    it('should reset global counter with resetBackdropFilterCount', () => {
      const { result } = renderHook(() => useGlassOptimization());

      act(() => {
        result.current.registerBackdropFilter();
        result.current.registerBackdropFilter();
      });

      expect(getBackdropFilterCount()).toBe(2);

      resetBackdropFilterCount();

      expect(getBackdropFilterCount()).toBe(0);
    });

    it('should return current count with getBackdropFilterCount', () => {
      const { result } = renderHook(() => useGlassOptimization());

      expect(getBackdropFilterCount()).toBe(0);

      act(() => {
        result.current.registerBackdropFilter();
      });

      expect(getBackdropFilterCount()).toBe(1);
    });
  });
});
