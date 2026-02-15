/**
 * Website System Accessibility
 * Implements keyboard navigation, focus management, ARIA attributes, and screen reader support
 */

/**
 * ARIA roles
 */
export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  region: 'region',
  heading: 'heading',
  list: 'list',
  listitem: 'listitem',
  menuitem: 'menuitem',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  dialog: 'dialog',
  alert: 'alert',
  alertdialog: 'alertdialog',
  progressbar: 'progressbar',
  slider: 'slider',
  spinbutton: 'spinbutton',
  switch: 'switch',
  checkbox: 'checkbox',
  radio: 'radio',
  radiogroup: 'radiogroup',
  combobox: 'combobox',
  listbox: 'listbox',
  option: 'option',
  tree: 'tree',
  treeitem: 'treeitem',
  grid: 'grid',
  gridcell: 'gridcell',
  row: 'row',
  rowheader: 'rowheader',
  columnheader: 'columnheader',
  img: 'img',
  presentation: 'presentation',
  none: 'none',
} as const;

/**
 * Keyboard event keys
 */
export const KEYBOARD_KEYS = {
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Tab: 'Tab',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
} as const;

/**
 * Check if a key is an activation key (Enter or Space)
 */
export function isActivationKey(key: string): boolean {
  return key === KEYBOARD_KEYS.Enter || key === KEYBOARD_KEYS.Space;
}

/**
 * Check if a key is a navigation key
 */
export function isNavigationKey(key: string): boolean {
  return [
    KEYBOARD_KEYS.ArrowUp,
    KEYBOARD_KEYS.ArrowDown,
    KEYBOARD_KEYS.ArrowLeft,
    KEYBOARD_KEYS.ArrowRight,
    KEYBOARD_KEYS.Home,
    KEYBOARD_KEYS.End,
    KEYBOARD_KEYS.PageUp,
    KEYBOARD_KEYS.PageDown,
  ].includes(key);
}

/**
 * Focus management utilities
 */
export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
}

/**
 * Get all focusable elements in a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll(focusableSelectors));
}

/**
 * Get the first focusable element in a container
 */
export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusable = getFocusableElements(container);
  return focusable.length > 0 ? focusable[0] : null;
}

/**
 * Get the last focusable element in a container
 */
export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusable = getFocusableElements(container);
  return focusable.length > 0 ? focusable[focusable.length - 1] : null;
}

/**
 * Focus trap - keep focus within a container
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== KEYBOARD_KEYS.Tab) return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const activeElement = document.activeElement as HTMLElement;
    const activeIndex = focusable.indexOf(activeElement);

    if (e.shiftKey) {
      // Shift + Tab
      if (activeIndex === 0) {
        e.preventDefault();
        focusable[focusable.length - 1].focus();
      }
    } else {
      // Tab
      if (activeIndex === focusable.length - 1) {
        e.preventDefault();
        focusable[0].focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Skip link for keyboard navigation
 */
export function createSkipLink(targetSelector: string): HTMLElement {
  const link = document.createElement('a');
  link.href = `#${targetSelector}`;
  link.textContent = 'Skip to main content';
  link.className = 'sr-only focus:not-sr-only';
  link.setAttribute('aria-label', 'Skip to main content');

  return link;
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReaders(element: HTMLElement): boolean {
  // Check if element has aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check if element is hidden with display: none or visibility: hidden
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Check if element is off-screen (sr-only)
  if (element.classList.contains('sr-only')) {
    return true; // sr-only is visible to screen readers
  }

  return true;
}

/**
 * ARIA attributes builder
 */
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  'aria-pressed'?: boolean;
  'aria-checked'?: boolean;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
  'aria-valuenow'?: number;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuetext'?: string;
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-flowto'?: string;
  'aria-haspopup'?: string;
  'aria-modal'?: boolean;
  'aria-level'?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  role?: string;
}

/**
 * Build ARIA attributes object
 */
export function buildAriaAttributes(attrs: Partial<AriaAttributes>): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};

  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * Validate heading hierarchy
 */
export function validateHeadingHierarchy(container: HTMLElement): boolean {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));

  if (headings.length === 0) return true;

  let previousLevel = 0;

  for (const heading of headings) {
    const level = parseInt(heading.tagName[1]);

    // Check if hierarchy is valid (no skipping levels)
    if (level > previousLevel + 1) {
      return false;
    }

    previousLevel = level;
  }

  return true;
}

/**
 * Check if all images have alt text
 */
export function checkImageAltText(container: HTMLElement): boolean {
  const images = Array.from(container.querySelectorAll('img'));

  return images.every((img) => {
    const alt = img.getAttribute('alt');
    return alt !== null && alt.trim().length > 0;
  });
}

/**
 * Check if all form inputs have labels
 */
export function checkFormLabels(container: HTMLElement): boolean {
  const inputs = Array.from(container.querySelectorAll('input, textarea, select'));

  return inputs.every((input) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    if (ariaLabel || ariaLabelledBy) {
      return true;
    }

    if (!id) {
      return false;
    }

    const label = container.querySelector(`label[for="${id}"]`);
    return label !== null;
  });
}

/**
 * Check if all interactive elements are keyboard accessible
 */
export function checkKeyboardAccessibility(container: HTMLElement): boolean {
  const interactiveElements = Array.from(
    container.querySelectorAll('button, a, input, select, textarea, [role="button"]')
  );

  return interactiveElements.every((element) => {
    const tabIndex = element.getAttribute('tabindex');
    const isNaturallyFocusable = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
      (element as HTMLElement).tagName
    );

    if (isNaturallyFocusable) {
      return true;
    }

    // Custom interactive elements should have tabindex >= 0
    return tabIndex !== null && parseInt(tabIndex) >= 0;
  });
}

/**
 * Check if all interactive elements have visible focus indicators
 */
export function checkFocusIndicators(container: HTMLElement): boolean {
  const interactiveElements = Array.from(
    container.querySelectorAll('button, a, input, select, textarea, [role="button"]')
  );

  return interactiveElements.every((element) => {
    const style = window.getComputedStyle(element);
    const focusStyle = window.getComputedStyle(element, ':focus');

    // Check if there's a visible focus indicator
    const hasFocusOutline =
      focusStyle.outline !== 'none' && focusStyle.outline !== '';
    const hasFocusBoxShadow =
      focusStyle.boxShadow !== 'none' && focusStyle.boxShadow !== '';
    const hasFocusBackground =
      focusStyle.backgroundColor !== style.backgroundColor;

    return hasFocusOutline || hasFocusBoxShadow || hasFocusBackground;
  });
}

/**
 * Check if color is not the only means of conveying information
 */
export function checkColorContrast(element: HTMLElement): boolean {
  // This is a simplified check - a full implementation would need to analyze
  // the actual color usage and ensure information is conveyed through other means
  const style = window.getComputedStyle(element);
  const color = style.color;
  const backgroundColor = style.backgroundColor;

  // Check if colors are different
  return color !== backgroundColor;
}

/**
 * Accessibility audit
 */
export interface AccessibilityAudit {
  headingHierarchy: boolean;
  imageAltText: boolean;
  formLabels: boolean;
  keyboardAccessibility: boolean;
  focusIndicators: boolean;
  colorContrast: boolean;
  issues: string[];
}

/**
 * Run accessibility audit on a container
 */
export function runAccessibilityAudit(container: HTMLElement): AccessibilityAudit {
  const issues: string[] = [];

  const headingHierarchy = validateHeadingHierarchy(container);
  if (!headingHierarchy) {
    issues.push('Heading hierarchy is invalid - levels are skipped');
  }

  const imageAltText = checkImageAltText(container);
  if (!imageAltText) {
    issues.push('Some images are missing alt text');
  }

  const formLabels = checkFormLabels(container);
  if (!formLabels) {
    issues.push('Some form inputs are missing labels');
  }

  const keyboardAccessibility = checkKeyboardAccessibility(container);
  if (!keyboardAccessibility) {
    issues.push('Some interactive elements are not keyboard accessible');
  }

  const focusIndicators = checkFocusIndicators(container);
  if (!focusIndicators) {
    issues.push('Some interactive elements lack visible focus indicators');
  }

  const colorContrast = checkColorContrast(container);
  if (!colorContrast) {
    issues.push('Color contrast may be insufficient');
  }

  return {
    headingHierarchy,
    imageAltText,
    formLabels,
    keyboardAccessibility,
    focusIndicators,
    colorContrast,
    issues,
  };
}
