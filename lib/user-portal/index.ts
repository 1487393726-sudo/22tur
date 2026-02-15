/**
 * User Portal System
 * Main entry point for the user portal system
 */

// Export types
export * from './types'

// Export services
export * from './services'

// Export utilities
export { dataCacheService } from './data-cache'
export { offlineServiceWorker } from './offline-service-worker'
export { skeletonScreens } from './skeleton-screens'
export { performanceOptimizer } from './performance-optimization'
export { screenReaderSupport } from './screen-reader-support'
export { highContrastMode } from './high-contrast-mode'
export { keyboardNavigation } from './keyboard-navigation'
export { darkModeOptimization } from './dark-mode-optimization'
export { themeTypes } from './theme-types'
export { helpTypes } from './help-types'
export { pushNotifications } from './push-notifications'

// Export middleware
export { userPortalMiddleware } from './middleware'
