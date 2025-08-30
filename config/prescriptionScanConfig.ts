// Prescription scanning configuration - all settings in one place

export const cameraConfig = {
  // Camera constraints for optimal document scanning
  videoConstraints: {
    facingMode: 'environment', // Start with back camera for documents
    width: { ideal: 1920, min: 1280 },
    height: { ideal: 1080, min: 720 }
  },
  
  // Image capture settings
  captureFormat: 'image/jpeg' as const,
  captureQuality: 0.9, // High quality for AI analysis
  
  // UI settings
  documentGuide: {
    width: 320, // w-80
    height: 240, // h-60  
    mdWidth: 384, // md:w-96
    mdHeight: 288 // md:h-72
  },
  
  // Flash support
  enableFlash: true,
  
  // Error messages
  errorMessages: {
    notSupported: 'Camera not supported on this device',
    permissionDenied: 'Camera permission denied. Please enable camera access to scan prescriptions.',
    notFound: 'No camera found on this device.',
    inUse: 'Camera is already in use by another application.',
    captureFailure: 'Failed to capture image. Please try again.'
  }
}

export const aiConfig = {
  // API settings
  analysisEndpoint: '/api/patient/prescriptions/analyze',
  timeout: 30000, // 30 second timeout
  retryAttempts: 3,
  
  // Quality thresholds
  confidenceThreshold: 75, // Minimum confidence to consider valid
  qualityThreshold: 60, // Minimum scan quality
  
  // Cost control
  dailyRequestLimit: 20,
  dailyCostLimit: 5.00,
  
  // Model settings (for admin configuration)
  model: 'gpt-4o',
  temperature: 0.1,
  maxTokens: 2000,
  
  // Progress simulation (for better UX)
  progressUpdateInterval: 200, // ms
  progressIncrement: 10, // percentage points
  
  // OpenAI pricing (for cost calculation)
  pricing: {
    inputCostPer1000: 0.005,
    outputCostPer1000: 0.015
  }
}

export const uiConfig = {
  // Theme colors
  colors: {
    success: 'green',
    error: 'red', 
    warning: 'yellow',
    info: 'blue',
    processing: 'blue'
  },
  
  // Animation settings
  transitionDuration: 300, // ms
  progressBarDuration: 500, // ms
  
  // Layout
  maxContentWidth: '2xl', // max-w-2xl
  fullScreenZIndex: 50,
  
  // Button styles
  primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondaryButton: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  successButton: 'bg-green-600 hover:bg-green-700 text-white',
  dangerButton: 'bg-red-600 hover:bg-red-700 text-white'
}

// Export combined config for easy import
export const prescriptionScanConfig = {
  camera: cameraConfig,
  ai: aiConfig,
  ui: uiConfig
}