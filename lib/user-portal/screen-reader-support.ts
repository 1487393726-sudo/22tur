/**
 * Screen Reader Support utilities for User Portal System
 * Provides helpers for screen reader compatibility and announcements
 */

/**
 * Screen reader announcement types
 */
export type AnnouncementType = 'polite' | 'assertive' | 'off';

/**
 * Screen reader announcement priority
 */
export type AnnouncementPriority = 'low' | 'medium' | 'high';

/**
 * Announcement queue for managing multiple announcements
 */
let announcementQueue: Array<{
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  timestamp: number;
}> = [];

/**
 * Create a live region for screen reader announcements
 */
export const createLiveRegion = (
  id: string,
  type: AnnouncementType = 'polite',
  atomic: boolean = true
): HTMLElement => {
  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', type);
  region.setAttribute('aria-atomic', atomic.toString());
  region.className = 'sr-only';
  region.style.position = 'absolute';
  region.style.left = '-10000px';
  region.style.width = '1px';
  region.style.height = '1px';
  region.style.overflow = 'hidden';

  return region;
};

/**
 * Get or create a live region
 */
export const getOrCreateLiveRegion = (
  id: string,
  type: AnnouncementType = 'polite'
): HTMLElement => {
  let region = document.getElementById(id);

  if (!region) {
    region = createLiveRegion(id, type);
    document.body.appendChild(region);
  }

  return region;
};

/**
 * Announce message to screen reader
 */
export const announceToScreenReader = (
  message: string,
  type: AnnouncementType = 'polite',
  regionId: string = 'sr-announcements'
): void => {
  const region = getOrCreateLiveRegion(regionId, type);
  region.textContent = message;
};

/**
 * Announce message with delay
 */
export const announceWithDelay = (
  message: string,
  delay: number = 100,
  type: AnnouncementType = 'polite',
  regionId: string = 'sr-announcements'
): void => {
  setTimeout(() => {
    announceToScreenReader(message, type, regionId);
  }, delay);
};

/**
 * Queue announcement
 */
export const queueAnnouncement = (
  message: string,
  priority: AnnouncementPriority = 'medium',
  type: AnnouncementType = 'polite'
): void => {
  announcementQueue.push({
    message,
    type,
    priority,
    timestamp: Date.now(),
  });

  processAnnouncementQueue();
};

/**
 * Process announcement queue
 */
export const processAnnouncementQueue = (): void => {
  if (announcementQueue.length === 0) return;

  // Sort by priority (high > medium > low) and timestamp
  announcementQueue.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.timestamp - b.timestamp;
  });

  const announcement = announcementQueue.shift();
  if (announcement) {
    announceToScreenReader(announcement.message, announcement.type);
  }
};

/**
 * Clear announcement queue
 */
export const clearAnnouncementQueue = (): void => {
  announcementQueue = [];
};

/**
 * Get announcement queue
 */
export const getAnnouncementQueue = (): typeof announcementQueue => {
  return [...announcementQueue];
};

/**
 * Create screen reader only text
 */
export const createScreenReaderText = (text: string): HTMLElement => {
  const element = document.createElement('span');
  element.className = 'sr-only';
  element.textContent = text;
  element.style.position = 'absolute';
  element.style.left = '-10000px';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.overflow = 'hidden';

  return element;
};

/**
 * Add screen reader text to element
 */
export const addScreenReaderText = (element: HTMLElement, text: string): void => {
  const srText = createScreenReaderText(text);
  element.appendChild(srText);
};

/**
 * Get screen reader text from element
 */
export const getScreenReaderText = (element: HTMLElement): string => {
  const srText = element.querySelector('.sr-only');
  return srText?.textContent || '';
};

/**
 * Remove screen reader text from element
 */
export const removeScreenReaderText = (element: HTMLElement): void => {
  const srText = element.querySelector('.sr-only');
  if (srText) {
    srText.remove();
  }
};

/**
 * Set aria-label
 */
export const setAriaLabel = (element: HTMLElement, label: string): void => {
  element.setAttribute('aria-label', label);
};

/**
 * Get aria-label
 */
export const getAriaLabel = (element: HTMLElement): string => {
  return element.getAttribute('aria-label') || '';
};

/**
 * Set aria-labelledby
 */
export const setAriaLabelledBy = (element: HTMLElement, id: string): void => {
  element.setAttribute('aria-labelledby', id);
};

/**
 * Set aria-describedby
 */
export const setAriaDescribedBy = (element: HTMLElement, id: string): void => {
  element.setAttribute('aria-describedby', id);
};

/**
 * Set aria-live
 */
export const setAriaLive = (element: HTMLElement, type: AnnouncementType): void => {
  element.setAttribute('aria-live', type);
};

/**
 * Set aria-atomic
 */
export const setAriaAtomic = (element: HTMLElement, atomic: boolean): void => {
  element.setAttribute('aria-atomic', atomic.toString());
};

/**
 * Set aria-relevant
 */
export const setAriaRelevant = (element: HTMLElement, relevant: string): void => {
  element.setAttribute('aria-relevant', relevant);
};

/**
 * Set aria-busy
 */
export const setAriaBusy = (element: HTMLElement, busy: boolean): void => {
  element.setAttribute('aria-busy', busy.toString());
};

/**
 * Set aria-disabled
 */
export const setAriaDisabled = (element: HTMLElement, disabled: boolean): void => {
  element.setAttribute('aria-disabled', disabled.toString());
};

/**
 * Set aria-hidden
 */
export const setAriaHidden = (element: HTMLElement, hidden: boolean): void => {
  element.setAttribute('aria-hidden', hidden.toString());
};

/**
 * Set aria-expanded
 */
export const setAriaExpanded = (element: HTMLElement, expanded: boolean): void => {
  element.setAttribute('aria-expanded', expanded.toString());
};

/**
 * Set aria-selected
 */
export const setAriaSelected = (element: HTMLElement, selected: boolean): void => {
  element.setAttribute('aria-selected', selected.toString());
};

/**
 * Set aria-checked
 */
export const setAriaChecked = (element: HTMLElement, checked: boolean | 'mixed'): void => {
  element.setAttribute('aria-checked', checked.toString());
};

/**
 * Set aria-pressed
 */
export const setAriaPressed = (element: HTMLElement, pressed: boolean | 'mixed'): void => {
  element.setAttribute('aria-pressed', pressed.toString());
};

/**
 * Set aria-current
 */
export const setAriaCurrent = (element: HTMLElement, current: string | boolean): void => {
  element.setAttribute('aria-current', current.toString());
};

/**
 * Set aria-haspopup
 */
export const setAriaHasPopup = (element: HTMLElement, hasPopup: string | boolean): void => {
  element.setAttribute('aria-haspopup', hasPopup.toString());
};

/**
 * Set aria-controls
 */
export const setAriaControls = (element: HTMLElement, id: string): void => {
  element.setAttribute('aria-controls', id);
};

/**
 * Set aria-owns
 */
export const setAriaOwns = (element: HTMLElement, id: string): void => {
  element.setAttribute('aria-owns', id);
};

/**
 * Set aria-flowto
 */
export const setAriaFlowTo = (element: HTMLElement, id: string): void => {
  element.setAttribute('aria-flowto', id);
};

/**
 * Set aria-level
 */
export const setAriaLevel = (element: HTMLElement, level: number): void => {
  element.setAttribute('aria-level', level.toString());
};

/**
 * Set aria-posinset
 */
export const setAriaPosInSet = (element: HTMLElement, position: number): void => {
  element.setAttribute('aria-posinset', position.toString());
};

/**
 * Set aria-setsize
 */
export const setAriaSetSize = (element: HTMLElement, size: number): void => {
  element.setAttribute('aria-setsize', size.toString());
};

/**
 * Set aria-valuemin
 */
export const setAriaValueMin = (element: HTMLElement, min: number): void => {
  element.setAttribute('aria-valuemin', min.toString());
};

/**
 * Set aria-valuemax
 */
export const setAriaValueMax = (element: HTMLElement, max: number): void => {
  element.setAttribute('aria-valuemax', max.toString());
};

/**
 * Set aria-valuenow
 */
export const setAriaValueNow = (element: HTMLElement, value: number): void => {
  element.setAttribute('aria-valuenow', value.toString());
};

/**
 * Set aria-valuetext
 */
export const setAriaValueText = (element: HTMLElement, text: string): void => {
  element.setAttribute('aria-valuetext', text);
};

/**
 * Set aria-required
 */
export const setAriaRequired = (element: HTMLElement, required: boolean): void => {
  element.setAttribute('aria-required', required.toString());
};

/**
 * Set aria-invalid
 */
export const setAriaInvalid = (element: HTMLElement, invalid: boolean | string): void => {
  element.setAttribute('aria-invalid', invalid.toString());
};

/**
 * Set aria-errormessage
 */
export const setAriaErrorMessage = (element: HTMLElement, id: string): void => {
  element.setAttribute('aria-errormessage', id);
};

/**
 * Set aria-readonly
 */
export const setAriaReadOnly = (element: HTMLElement, readOnly: boolean): void => {
  element.setAttribute('aria-readonly', readOnly.toString());
};

/**
 * Set aria-multiline
 */
export const setAriaMultiLine = (element: HTMLElement, multiline: boolean): void => {
  element.setAttribute('aria-multiline', multiline.toString());
};

/**
 * Set aria-multiselectable
 */
export const setAriaMultiSelectable = (element: HTMLElement, multiselectable: boolean): void => {
  element.setAttribute('aria-multiselectable', multiselectable.toString());
};

/**
 * Set aria-orientation
 */
export const setAriaOrientation = (element: HTMLElement, orientation: 'horizontal' | 'vertical'): void => {
  element.setAttribute('aria-orientation', orientation);
};

/**
 * Set aria-sort
 */
export const setAriaSort = (element: HTMLElement, sort: 'ascending' | 'descending' | 'none' | 'other'): void => {
  element.setAttribute('aria-sort', sort);
};

/**
 * Set aria-colcount
 */
export const setAriaColCount = (element: HTMLElement, count: number): void => {
  element.setAttribute('aria-colcount', count.toString());
};

/**
 * Set aria-colindex
 */
export const setAriaColIndex = (element: HTMLElement, index: number): void => {
  element.setAttribute('aria-colindex', index.toString());
};

/**
 * Set aria-colspan
 */
export const setAriaColSpan = (element: HTMLElement, span: number): void => {
  element.setAttribute('aria-colspan', span.toString());
};

/**
 * Set aria-rowcount
 */
export const setAriaRowCount = (element: HTMLElement, count: number): void => {
  element.setAttribute('aria-rowcount', count.toString());
};

/**
 * Set aria-rowindex
 */
export const setAriaRowIndex = (element: HTMLElement, index: number): void => {
  element.setAttribute('aria-rowindex', index.toString());
};

/**
 * Set aria-rowspan
 */
export const setAriaRowSpan = (element: HTMLElement, span: number): void => {
  element.setAttribute('aria-rowspan', span.toString());
};

/**
 * Get all ARIA attributes from element
 */
export const getAriaAttributes = (element: HTMLElement): Record<string, string> => {
  const attributes: Record<string, string> = {};
  const attrs = element.attributes;

  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name.startsWith('aria-')) {
      attributes[attr.name] = attr.value;
    }
  }

  return attributes;
};

/**
 * Remove all ARIA attributes from element
 */
export const removeAriaAttributes = (element: HTMLElement): void => {
  const attrs = Array.from(element.attributes);
  attrs.forEach((attr) => {
    if (attr.name.startsWith('aria-')) {
      element.removeAttribute(attr.name);
    }
  });
};

/**
 * Copy ARIA attributes from one element to another
 */
export const copyAriaAttributes = (source: HTMLElement, target: HTMLElement): void => {
  const attributes = getAriaAttributes(source);
  Object.entries(attributes).forEach(([key, value]) => {
    target.setAttribute(key, value);
  });
};

/**
 * Verify screen reader support
 */
export const verifyScreenReaderSupport = (): {
  supported: boolean;
  features: string[];
  issues: string[];
} => {
  const features: string[] = [];
  const issues: string[] = [];

  // Check for live region support
  const liveRegion = createLiveRegion('test-live-region');
  if (liveRegion.getAttribute('aria-live')) {
    features.push('Live regions');
  } else {
    issues.push('Live regions not supported');
  }

  // Check for ARIA support
  const testElement = document.createElement('div');
  testElement.setAttribute('aria-label', 'test');
  if (testElement.getAttribute('aria-label')) {
    features.push('ARIA attributes');
  } else {
    issues.push('ARIA attributes not supported');
  }

  // Check for semantic HTML support
  const semanticElement = document.createElement('nav');
  if (semanticElement.tagName === 'NAV') {
    features.push('Semantic HTML');
  } else {
    issues.push('Semantic HTML not supported');
  }

  return {
    supported: issues.length === 0,
    features,
    issues,
  };
};

/**
 * Get screen reader support report
 */
export const getScreenReaderSupportReport = (): {
  supported: boolean;
  features: string[];
  issues: string[];
  liveRegions: number;
  ariaAttributes: number;
} => {
  const verification = verifyScreenReaderSupport();
  const liveRegions = document.querySelectorAll('[aria-live]').length;
  const ariaAttributes = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]').length;

  return {
    ...verification,
    liveRegions,
    ariaAttributes,
  };
};

/**
 * Screen reader support guidelines
 */
export const SCREEN_READER_SUPPORT_GUIDELINES = {
  description: 'Screen reader support ensures users with visual impairments can access content',
  features: [
    'Live regions for dynamic content updates',
    'ARIA labels and descriptions',
    'Semantic HTML elements',
    'Proper heading hierarchy',
    'Form labels and error messages',
    'Image alt text',
    'Link text clarity',
    'Button labels',
  ],
  benefits: [
    'Accessible to users with visual impairments',
    'Better SEO and content structure',
    'Improved keyboard navigation',
    'Better mobile accessibility',
    'Compliance with accessibility standards',
  ],
  usage: [
    'Use semantic HTML elements (nav, main, article, etc.)',
    'Provide ARIA labels for interactive elements',
    'Use live regions for dynamic content',
    'Include alt text for images',
    'Use proper heading hierarchy',
    'Label form inputs clearly',
    'Provide error messages for form validation',
  ],
};
