/**
 * Keyboard navigation utilities for User Portal System
 * Provides helpers for keyboard event handling and focus management
 */

/**
 * Keyboard event keys
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Check if key is Enter or Space
 */
export const isActivationKey = (key: string): boolean => {
  return key === KEYBOARD_KEYS.ENTER || key === KEYBOARD_KEYS.SPACE;
};

/**
 * Check if key is arrow key
 */
export const isArrowKey = (key: string): boolean => {
  return [
    KEYBOARD_KEYS.ARROW_UP,
    KEYBOARD_KEYS.ARROW_DOWN,
    KEYBOARD_KEYS.ARROW_LEFT,
    KEYBOARD_KEYS.ARROW_RIGHT,
  ].includes(key);
};

/**
 * Check if key is vertical arrow
 */
export const isVerticalArrow = (key: string): boolean => {
  return key === KEYBOARD_KEYS.ARROW_UP || key === KEYBOARD_KEYS.ARROW_DOWN;
};

/**
 * Check if key is horizontal arrow
 */
export const isHorizontalArrow = (key: string): boolean => {
  return key === KEYBOARD_KEYS.ARROW_LEFT || key === KEYBOARD_KEYS.ARROW_RIGHT;
};

/**
 * Get focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
};

/**
 * Get visible focusable elements
 */
export const getVisibleFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return getFocusableElements(container).filter((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  });
};

/**
 * Focus next element
 */
export const focusNextElement = (container: HTMLElement, currentElement?: HTMLElement): void => {
  const focusableElements = getVisibleFocusableElements(container);
  if (focusableElements.length === 0) return;

  let nextIndex = 0;
  if (currentElement) {
    const currentIndex = focusableElements.indexOf(currentElement);
    nextIndex = (currentIndex + 1) % focusableElements.length;
  }

  focusableElements[nextIndex]?.focus();
};

/**
 * Focus previous element
 */
export const focusPreviousElement = (container: HTMLElement, currentElement?: HTMLElement): void => {
  const focusableElements = getVisibleFocusableElements(container);
  if (focusableElements.length === 0) return;

  let prevIndex = focusableElements.length - 1;
  if (currentElement) {
    const currentIndex = focusableElements.indexOf(currentElement);
    prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
  }

  focusableElements[prevIndex]?.focus();
};

/**
 * Focus first element
 */
export const focusFirstElement = (container: HTMLElement): void => {
  const focusableElements = getVisibleFocusableElements(container);
  focusableElements[0]?.focus();
};

/**
 * Focus last element
 */
export const focusLastElement = (container: HTMLElement): void => {
  const focusableElements = getVisibleFocusableElements(container);
  focusableElements[focusableElements.length - 1]?.focus();
};

/**
 * Handle keyboard navigation in menu
 */
export const handleMenuKeyboard = (
  event: React.KeyboardEvent<HTMLElement>,
  container: HTMLElement,
  onClose?: () => void
): void => {
  const { key } = event;

  if (key === KEYBOARD_KEYS.ESCAPE) {
    event.preventDefault();
    onClose?.();
    return;
  }

  if (key === KEYBOARD_KEYS.ARROW_DOWN) {
    event.preventDefault();
    focusNextElement(container, document.activeElement as HTMLElement);
    return;
  }

  if (key === KEYBOARD_KEYS.ARROW_UP) {
    event.preventDefault();
    focusPreviousElement(container, document.activeElement as HTMLElement);
    return;
  }

  if (key === KEYBOARD_KEYS.HOME) {
    event.preventDefault();
    focusFirstElement(container);
    return;
  }

  if (key === KEYBOARD_KEYS.END) {
    event.preventDefault();
    focusLastElement(container);
    return;
  }
};

/**
 * Handle keyboard navigation in tabs
 */
export const handleTabsKeyboard = (
  event: React.KeyboardEvent<HTMLElement>,
  tabs: HTMLElement[],
  currentIndex: number,
  onTabChange: (index: number) => void
): void => {
  const { key } = event;

  if (key === KEYBOARD_KEYS.ARROW_RIGHT || key === KEYBOARD_KEYS.ARROW_DOWN) {
    event.preventDefault();
    const nextIndex = (currentIndex + 1) % tabs.length;
    onTabChange(nextIndex);
    tabs[nextIndex]?.focus();
    return;
  }

  if (key === KEYBOARD_KEYS.ARROW_LEFT || key === KEYBOARD_KEYS.ARROW_UP) {
    event.preventDefault();
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    onTabChange(prevIndex);
    tabs[prevIndex]?.focus();
    return;
  }

  if (key === KEYBOARD_KEYS.HOME) {
    event.preventDefault();
    onTabChange(0);
    tabs[0]?.focus();
    return;
  }

  if (key === KEYBOARD_KEYS.END) {
    event.preventDefault();
    const lastIndex = tabs.length - 1;
    onTabChange(lastIndex);
    tabs[lastIndex]?.focus();
    return;
  }
};

/**
 * Handle keyboard navigation in listbox
 */
export const handleListboxKeyboard = (
  event: React.KeyboardEvent<HTMLElement>,
  items: HTMLElement[],
  currentIndex: number,
  onItemSelect: (index: number) => void
): void => {
  const { key } = event;

  if (key === KEYBOARD_KEYS.ARROW_DOWN) {
    event.preventDefault();
    const nextIndex = Math.min(currentIndex + 1, items.length - 1);
    onItemSelect(nextIndex);
    items[nextIndex]?.focus();
    return;
  }

  if (key === KEYBOARD_KEYS.ARROW_UP) {
    event.preventDefault();
    const prevIndex = Math.max(currentIndex - 1, 0);
    onItemSelect(prevIndex);
    items[prevIndex]?.focus();
    return;
  }

  if (key === KEYBOARD_KEYS.HOME) {
    event.preventDefault();
    onItemSelect(0);
    items[0]?.focus();
    return;
  }

  if (key === KEYBOARD_KEYS.END) {
    event.preventDefault();
    const lastIndex = items.length - 1;
    onItemSelect(lastIndex);
    items[lastIndex]?.focus();
    return;
  }

  if (key === KEYBOARD_KEYS.ENTER || key === KEYBOARD_KEYS.SPACE) {
    event.preventDefault();
    const item = items[currentIndex];
    if (item instanceof HTMLButtonElement || item instanceof HTMLAnchorElement) {
      item.click();
    }
    return;
  }
};

/**
 * Handle keyboard navigation in combobox
 */
export const handleComboboxKeyboard = (
  event: React.KeyboardEvent<HTMLElement>,
  options: HTMLElement[],
  currentIndex: number,
  isOpen: boolean,
  onOpen: () => void,
  onClose: () => void,
  onSelect: (index: number) => void
): void => {
  const { key } = event;

  if (key === KEYBOARD_KEYS.ARROW_DOWN) {
    event.preventDefault();
    if (!isOpen) {
      onOpen();
    } else {
      const nextIndex = Math.min(currentIndex + 1, options.length - 1);
      onSelect(nextIndex);
      options[nextIndex]?.focus();
    }
    return;
  }

  if (key === KEYBOARD_KEYS.ARROW_UP) {
    event.preventDefault();
    if (isOpen) {
      const prevIndex = Math.max(currentIndex - 1, 0);
      onSelect(prevIndex);
      options[prevIndex]?.focus();
    }
    return;
  }

  if (key === KEYBOARD_KEYS.ESCAPE) {
    event.preventDefault();
    onClose();
    return;
  }

  if (key === KEYBOARD_KEYS.ENTER) {
    event.preventDefault();
    if (isOpen) {
      const option = options[currentIndex];
      if (option instanceof HTMLButtonElement || option instanceof HTMLAnchorElement) {
        option.click();
      }
    }
    return;
  }
};

/**
 * Handle keyboard navigation in dialog
 */
export const handleDialogKeyboard = (
  event: React.KeyboardEvent<HTMLElement>,
  container: HTMLElement,
  onClose: () => void
): void => {
  const { key } = event;

  if (key === KEYBOARD_KEYS.ESCAPE) {
    event.preventDefault();
    onClose();
    return;
  }

  if (key === KEYBOARD_KEYS.TAB) {
    const focusableElements = getVisibleFocusableElements(container);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
};

/**
 * Trap focus within element
 */
export const trapFocus = (container: HTMLElement, event: KeyboardEvent): void => {
  if (event.key !== KEYBOARD_KEYS.TAB) return;

  const focusableElements = getVisibleFocusableElements(container);
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey) {
    if (activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    if (activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

/**
 * Get tab index for element
 */
export const getTabIndex = (element: HTMLElement): number => {
  const tabindex = element.getAttribute('tabindex');
  if (tabindex === null) return -1;
  return parseInt(tabindex, 10);
};

/**
 * Set tab index for element
 */
export const setTabIndex = (element: HTMLElement, index: number): void => {
  if (index < 0) {
    element.removeAttribute('tabindex');
  } else {
    element.setAttribute('tabindex', index.toString());
  }
};

/**
 * Make element focusable
 */
export const makeFocusable = (element: HTMLElement): void => {
  if (getTabIndex(element) < 0) {
    setTabIndex(element, 0);
  }
};

/**
 * Make element not focusable
 */
export const makeNotFocusable = (element: HTMLElement): void => {
  setTabIndex(element, -1);
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return element.matches(focusableSelectors);
};

/**
 * Get focus order
 */
export const getFocusOrder = (container: HTMLElement): HTMLElement[] => {
  const focusableElements = getFocusableElements(container);
  
  return focusableElements.sort((a, b) => {
    const aTabIndex = getTabIndex(a);
    const bTabIndex = getTabIndex(b);

    if (aTabIndex > 0 && bTabIndex > 0) {
      return aTabIndex - bTabIndex;
    }
    if (aTabIndex > 0) return -1;
    if (bTabIndex > 0) return 1;

    return 0;
  });
};

/**
 * Announce to screen reader
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Get screen reader only class
 */
export const getScreenReaderOnlyClass = (): string => {
  return 'sr-only';
};

/**
 * Create screen reader only element
 */
export const createScreenReaderElement = (text: string): HTMLElement => {
  const element = document.createElement('span');
  element.className = getScreenReaderOnlyClass();
  element.textContent = text;
  return element;
};
