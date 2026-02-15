/**
 * Accessibility utilities for User Portal System
 * Provides helpers for ARIA labels, semantic HTML, and keyboard navigation
 */

/**
 * Generate ARIA label for navigation items
 */
export const getNavAriaLabel = (label: string, badge?: number): string => {
  if (badge && badge > 0) {
    return `${label}, ${badge} unread`;
  }
  return label;
};

/**
 * Generate ARIA label for notification badge
 */
export const getNotificationAriaLabel = (count: number): string => {
  if (count === 0) return 'No unread notifications';
  if (count === 1) return '1 unread notification';
  return `${count} unread notifications`;
};

/**
 * Generate ARIA label for user menu button
 */
export const getUserMenuAriaLabel = (isOpen: boolean): string => {
  return isOpen ? 'Close user menu' : 'Open user menu';
};

/**
 * Generate ARIA label for mobile menu toggle
 */
export const getMobileMenuAriaLabel = (isOpen: boolean): string => {
  return isOpen ? 'Close navigation menu' : 'Open navigation menu';
};

/**
 * Generate ARIA label for section toggle
 */
export const getSectionToggleAriaLabel = (section: string, isExpanded: boolean): string => {
  return `${isExpanded ? 'Collapse' : 'Expand'} ${section}`;
};

/**
 * Generate ARIA label for search input
 */
export const getSearchAriaLabel = (): string => {
  return 'Search user portal';
};

/**
 * Generate ARIA label for theme switcher
 */
export const getThemeSwitcherAriaLabel = (currentTheme: string): string => {
  return `Switch theme, currently ${currentTheme}`;
};

/**
 * Generate ARIA label for form input
 */
export const getFormInputAriaLabel = (label: string, required?: boolean): string => {
  if (required) {
    return `${label}, required`;
  }
  return label;
};

/**
 * Generate ARIA label for form error
 */
export const getFormErrorAriaLabel = (fieldName: string, error: string): string => {
  return `${fieldName} error: ${error}`;
};

/**
 * Generate ARIA label for loading state
 */
export const getLoadingAriaLabel = (context: string): string => {
  return `Loading ${context}`;
};

/**
 * Generate ARIA label for status badge
 */
export const getStatusBadgeAriaLabel = (status: string): string => {
  return `Status: ${status}`;
};

/**
 * Generate ARIA label for action button
 */
export const getActionButtonAriaLabel = (action: string, context?: string): string => {
  if (context) {
    return `${action} ${context}`;
  }
  return action;
};

/**
 * Generate ARIA label for modal dialog
 */
export const getModalAriaLabel = (title: string): string => {
  return `Dialog: ${title}`;
};

/**
 * Generate ARIA label for tab
 */
export const getTabAriaLabel = (label: string, isSelected: boolean): string => {
  return `${label}${isSelected ? ', selected' : ''}`;
};

/**
 * Generate ARIA label for pagination
 */
export const getPaginationAriaLabel = (currentPage: number, totalPages: number): string => {
  return `Page ${currentPage} of ${totalPages}`;
};

/**
 * Generate ARIA label for sort button
 */
export const getSortAriaLabel = (field: string, direction: 'asc' | 'desc' | 'none'): string => {
  if (direction === 'none') {
    return `Sort by ${field}`;
  }
  return `Sort by ${field}, ${direction === 'asc' ? 'ascending' : 'descending'}`;
};

/**
 * Generate ARIA label for filter button
 */
export const getFilterAriaLabel = (filterName: string, isActive: boolean): string => {
  return `${filterName} filter${isActive ? ', active' : ''}`;
};

/**
 * Generate ARIA label for expandable section
 */
export const getExpandableSectionAriaLabel = (title: string, isExpanded: boolean): string => {
  return `${title}${isExpanded ? ', expanded' : ', collapsed'}`;
};

/**
 * Generate ARIA label for close button
 */
export const getCloseButtonAriaLabel = (context?: string): string => {
  if (context) {
    return `Close ${context}`;
  }
  return 'Close';
};

/**
 * Generate ARIA label for link with external indicator
 */
export const getExternalLinkAriaLabel = (label: string): string => {
  return `${label}, opens in new window`;
};

/**
 * Generate ARIA label for download link
 */
export const getDownloadLinkAriaLabel = (fileName: string): string => {
  return `Download ${fileName}`;
};

/**
 * Generate ARIA label for rating
 */
export const getRatingAriaLabel = (rating: number, maxRating: number = 5): string => {
  return `Rating: ${rating} out of ${maxRating}`;
};

/**
 * Generate ARIA label for progress indicator
 */
export const getProgressAriaLabel = (current: number, total: number, label?: string): string => {
  const percentage = Math.round((current / total) * 100);
  if (label) {
    return `${label}: ${percentage}% complete`;
  }
  return `${percentage}% complete`;
};

/**
 * Generate ARIA label for list
 */
export const getListAriaLabel = (itemCount: number, label?: string): string => {
  if (label) {
    return `${label}, ${itemCount} items`;
  }
  return `List with ${itemCount} items`;
};

/**
 * Generate ARIA label for table
 */
export const getTableAriaLabel = (title: string, rowCount: number): string => {
  return `${title}, ${rowCount} rows`;
};

/**
 * Generate ARIA label for card
 */
export const getCardAriaLabel = (title: string, description?: string): string => {
  if (description) {
    return `${title}: ${description}`;
  }
  return title;
};

/**
 * Generate ARIA label for tooltip
 */
export const getTooltipAriaLabel = (content: string): string => {
  return `Tooltip: ${content}`;
};

/**
 * Generate ARIA label for popover
 */
export const getPopoverAriaLabel = (title: string): string => {
  return `Popover: ${title}`;
};

/**
 * Generate ARIA label for dropdown
 */
export const getDropdownAriaLabel = (label: string, isOpen: boolean): string => {
  return `${label} dropdown${isOpen ? ', open' : ', closed'}`;
};

/**
 * Generate ARIA label for combobox
 */
export const getComboboxAriaLabel = (label: string, isOpen: boolean): string => {
  return `${label} combobox${isOpen ? ', open' : ', closed'}`;
};

/**
 * Generate ARIA label for checkbox
 */
export const getCheckboxAriaLabel = (label: string, isChecked: boolean): string => {
  return `${label}${isChecked ? ', checked' : ', unchecked'}`;
};

/**
 * Generate ARIA label for radio button
 */
export const getRadioButtonAriaLabel = (label: string, isSelected: boolean): string => {
  return `${label}${isSelected ? ', selected' : ''}`;
};

/**
 * Generate ARIA label for switch
 */
export const getSwitchAriaLabel = (label: string, isOn: boolean): string => {
  return `${label}${isOn ? ', on' : ', off'}`;
};

/**
 * Generate ARIA label for slider
 */
export const getSliderAriaLabel = (label: string, value: number, min: number, max: number): string => {
  return `${label}, ${value} out of ${max}`;
};

/**
 * Generate ARIA label for spinner/loader
 */
export const getSpinnerAriaLabel = (context: string): string => {
  return `Loading ${context}`;
};

/**
 * Generate ARIA label for alert
 */
export const getAlertAriaLabel = (type: 'success' | 'error' | 'warning' | 'info', message: string): string => {
  return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${message}`;
};

/**
 * Generate ARIA label for toast notification
 */
export const getToastAriaLabel = (message: string, type?: string): string => {
  if (type) {
    return `${type} notification: ${message}`;
  }
  return `Notification: ${message}`;
};

/**
 * Generate ARIA label for breadcrumb
 */
export const getBreadcrumbAriaLabel = (): string => {
  return 'Breadcrumb navigation';
};

/**
 * Generate ARIA label for breadcrumb item
 */
export const getBreadcrumbItemAriaLabel = (label: string, isCurrent: boolean): string => {
  return `${label}${isCurrent ? ', current page' : ''}`;
};

/**
 * Generate ARIA label for skip link
 */
export const getSkipLinkAriaLabel = (target: string): string => {
  return `Skip to ${target}`;
};

/**
 * Generate ARIA label for landmark
 */
export const getLandmarkAriaLabel = (type: 'main' | 'navigation' | 'complementary' | 'contentinfo', label?: string): string => {
  const typeLabel = {
    main: 'Main content',
    navigation: 'Navigation',
    complementary: 'Complementary content',
    contentinfo: 'Footer',
  }[type];

  if (label) {
    return `${typeLabel}: ${label}`;
  }
  return typeLabel;
};

/**
 * Check if element should have aria-live
 */
export const shouldHaveAriaLive = (type: 'polite' | 'assertive' | 'off'): boolean => {
  return type !== 'off';
};

/**
 * Get aria-live value for dynamic content
 */
export const getAriaLiveValue = (isUrgent: boolean): 'polite' | 'assertive' => {
  return isUrgent ? 'assertive' : 'polite';
};

/**
 * Get aria-atomic value for dynamic content
 */
export const getAriaAtomicValue = (shouldAnnounceAll: boolean): boolean => {
  return shouldAnnounceAll;
};

/**
 * Get aria-relevant value for dynamic content
 */
export const getAriaRelevantValue = (type: 'additions' | 'removals' | 'text' | 'all'): string => {
  return type;
};

/**
 * Generate ARIA label for live region
 */
export const getLiveRegionAriaLabel = (context: string): string => {
  return `Live region: ${context}`;
};

/**
 * Generate ARIA label for screen reader only content
 */
export const getScreenReaderOnlyAriaLabel = (content: string): string => {
  return content;
};

/**
 * Check if element is keyboard accessible
 */
export const isKeyboardAccessible = (element: HTMLElement): boolean => {
  const tabindex = element.getAttribute('tabindex');
  const isNaturallyFocusable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
  
  return isNaturallyFocusable || (tabindex !== null && parseInt(tabindex) >= 0);
};

/**
 * Get keyboard shortcut description
 */
export const getKeyboardShortcutDescription = (keys: string[]): string => {
  return keys.join(' + ');
};

/**
 * Generate ARIA label for keyboard shortcut
 */
export const getKeyboardShortcutAriaLabel = (action: string, keys: string[]): string => {
  return `${action}, keyboard shortcut: ${getKeyboardShortcutDescription(keys)}`;
};
