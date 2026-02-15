/**
 * Website System Animations
 * Implements Framer Motion animations, page transitions, hover effects, scroll animations
 */

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number; // in milliseconds
  delay?: number;
  easing?: string;
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
}

/**
 * Predefined animation durations
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

/**
 * Predefined easing functions
 */
export const EASING_FUNCTIONS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
} as const;

/**
 * Check if prefers-reduced-motion is enabled
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration respecting prefers-reduced-motion
 */
export function getAnimationDuration(
  duration: number,
  respectPreference: boolean = true
): number {
  if (respectPreference && prefersReducedMotion()) {
    return 0;
  }
  return duration;
}

/**
 * Validate animation duration is within acceptable range (200-300ms for hover)
 */
export function isValidHoverAnimationDuration(duration: number): boolean {
  return duration >= 200 && duration <= 300;
}

/**
 * Validate animation duration is within acceptable range (0-1000ms)
 */
export function isValidAnimationDuration(duration: number): boolean {
  return duration >= 0 && duration <= 1000;
}

/**
 * Page transition animations
 */
export const PAGE_TRANSITIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideInFromLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideInFromRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideInFromTop: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideInFromBottom: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.3 },
  },
} as const;

/**
 * Hover animations
 */
export const HOVER_ANIMATIONS = {
  scale: {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.2 },
  },
  lift: {
    whileHover: { y: -4 },
    transition: { duration: 0.2 },
  },
  glow: {
    whileHover: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
    transition: { duration: 0.2 },
  },
  rotate: {
    whileHover: { rotate: 2 },
    transition: { duration: 0.2 },
  },
  brightness: {
    whileHover: { filter: 'brightness(1.1)' },
    transition: { duration: 0.2 },
  },
} as const;

/**
 * Scroll animation triggers
 */
export interface ScrollAnimationTrigger {
  threshold?: number;
  margin?: string;
  once?: boolean;
}

/**
 * Get scroll animation trigger configuration
 */
export function getScrollAnimationTrigger(
  options?: ScrollAnimationTrigger
): ScrollAnimationTrigger {
  return {
    threshold: options?.threshold ?? 0.2,
    margin: options?.margin ?? '0px 0px -100px 0px',
    once: options?.once ?? false,
  };
}

/**
 * Scroll animations
 */
export const SCROLL_ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.5 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.5 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -10 },
    whileInView: { opacity: 1, rotate: 0 },
    transition: { duration: 0.5 },
  },
} as const;

/**
 * Modal/Dialog animations
 */
export const MODAL_ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
} as const;

/**
 * Stagger animation for lists
 */
export interface StaggerConfig {
  staggerChildren?: number;
  delayChildren?: number;
}

/**
 * Get stagger animation configuration
 */
export function getStaggerConfig(options?: StaggerConfig): StaggerConfig {
  return {
    staggerChildren: options?.staggerChildren ?? 0.1,
    delayChildren: options?.delayChildren ?? 0,
  };
}

/**
 * Container animation for staggered children
 */
export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

/**
 * Item animation for staggered children
 */
export const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
} as const;

/**
 * Loading animations
 */
export const LOADING_ANIMATIONS = {
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, linear: true },
  },
  pulse: {
    animate: { opacity: [1, 0.5, 1] },
    transition: { duration: 2, repeat: Infinity },
  },
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 1, repeat: Infinity },
  },
  shimmer: {
    animate: { backgroundPosition: ['200% 0', '-200% 0'] },
    transition: { duration: 2, repeat: Infinity },
  },
} as const;

/**
 * Intersection Observer for scroll animations
 */
export function observeScrollAnimation(
  element: Element,
  callback: (isVisible: boolean) => void,
  options?: ScrollAnimationTrigger
): IntersectionObserver {
  const config = getScrollAnimationTrigger(options);

  const observer = new IntersectionObserver(
    ([entry]) => {
      callback(entry.isIntersecting);
    },
    {
      threshold: config.threshold,
      rootMargin: config.margin,
    }
  );

  observer.observe(element);
  return observer;
}

/**
 * Request animation frame wrapper
 */
export function requestAnimationFrameWrapper(callback: FrameRequestCallback): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  return window.requestAnimationFrame(callback);
}

/**
 * Cancel animation frame
 */
export function cancelAnimationFrameWrapper(id: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.cancelAnimationFrame(id);
}

/**
 * Animate value over time
 */
export async function animateValue(
  from: number,
  to: number,
  duration: number,
  callback: (value: number) => void
): Promise<void> {
  const startTime = Date.now();
  const endTime = startTime + duration;

  return new Promise((resolve) => {
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const value = from + (to - from) * progress;

      callback(value);

      if (progress < 1) {
        requestAnimationFrameWrapper(animate);
      } else {
        resolve();
      }
    };

    animate();
  });
}

/**
 * Debounce animation frame
 */
export function debounceAnimationFrame(callback: () => void): () => void {
  let frameId: number | null = null;

  return () => {
    if (frameId !== null) {
      cancelAnimationFrameWrapper(frameId);
    }

    frameId = requestAnimationFrameWrapper(() => {
      callback();
      frameId = null;
    });
  };
}

/**
 * Throttle animation frame
 */
export function throttleAnimationFrame(callback: () => void): () => void {
  let frameId: number | null = null;

  return () => {
    if (frameId === null) {
      frameId = requestAnimationFrameWrapper(() => {
        callback();
        frameId = null;
      });
    }
  };
}
