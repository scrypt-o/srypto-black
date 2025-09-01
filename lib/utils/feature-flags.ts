/**
 * Feature flags for Google services and other functionality
 * Addresses audit finding: "No feature flag: GOOGLE_PLACES_API_ENABLED not used"
 */

export const featureFlags = {
  // Google Services
  googleMaps: process.env.GOOGLE_MAPS_ENABLED === 'true' && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  googlePlaces: process.env.GOOGLE_PLACES_API_ENABLED === 'true' && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  googleAI: process.env.GOOGLE_AI_ENABLED === 'true',
  
  // Location Services
  geolocation: process.env.GEOLOCATION_ENABLED !== 'false', // Default enabled
  locationAutoRequest: process.env.LOCATION_AUTO_REQUEST === 'true', // Default disabled (privacy)
  
  // Future Features
  realTimeUpdates: process.env.REAL_TIME_UPDATES_ENABLED === 'true',
  advancedAnalytics: process.env.ADVANCED_ANALYTICS_ENABLED === 'true',
} as const

export type FeatureFlag = keyof typeof featureFlags

// Check if feature is enabled
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return featureFlags[feature]
}

// Feature gate function for conditional rendering
export function renderWithFeatureFlag<T>(
  feature: FeatureFlag,
  renderFn: () => T,
  fallbackFn?: () => T
): T | null {
  if (isFeatureEnabled(feature)) {
    return renderFn()
  }
  
  if (fallbackFn) {
    return fallbackFn()
  }
  
  return null
}