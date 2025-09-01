# Google Services Integration - Centralized Architecture Specification

**Date**: 2025-09-01  
**Status**: Specification Complete  
**Purpose**: Unified Google services layer for Maps, Places, and future AI integration

---

## 🎯 **CENTRALIZATION VISION**

### **Problem Statement**
Currently Google services are **scattered across the codebase**:
- Google Maps in `lib/google-maps.ts` for location services
- Google Places API calls in multiple components
- Potential future Google AI integration without coordination
- No unified error handling or usage monitoring

### **Solution: Unified Google Services Provider**
**Single service layer** that handles **all Google API interactions** with:
- **Centralized configuration** and API key management
- **Unified error handling** and rate limiting
- **Consistent API interface** across all Google services
- **Usage monitoring** and cost tracking
- **Fallback strategies** for service failures

---

## 🏗️ **ARCHITECTURE DESIGN**

### **Centralized Service Layer**
```typescript
// lib/services/google-services.ts
export class GoogleServicesProvider {
  private static instance: GoogleServicesProvider
  private mapsClient: any
  private placesService: any
  private aiClient: any // Future integration
  private usageTracker: UsageTracker
  
  // Singleton pattern for consistent service access
  public static getInstance(): GoogleServicesProvider {
    if (!GoogleServicesProvider.instance) {
      GoogleServicesProvider.instance = new GoogleServicesProvider()
    }
    return GoogleServicesProvider.instance
  }
  
  // Maps & Location Services
  async initializeMaps(): Promise<boolean>
  async findNearbyPharmacies(location: Coordinates, radius: number): Promise<Pharmacy[]>
  async calculateDistance(from: Coordinates, to: Coordinates): Promise<number>
  async getDirections(from: Coordinates, to: Coordinates): Promise<DirectionsResult>
  
  // Address & Places Services
  async autocompleteAddress(query: string, region?: string): Promise<AddressSuggestion[]>
  async validateAddress(address: AddressInput): Promise<AddressValidation>
  async geocodeAddress(address: string): Promise<GeocodeResult>
  async reverseGeocode(coordinates: Coordinates): Promise<AddressResult>
  
  // Future AI Services (Google AI Platform)
  async analyzeText(text: string, context: AnalysisContext): Promise<AIResponse>
  async generateContent(prompt: string, options: GenerationOptions): Promise<string>
  async extractStructuredData(text: string, schema: object): Promise<ExtractedData>
  
  // Service Management
  async checkServiceHealth(): Promise<ServiceStatus>
  async getUsageStatistics(): Promise<UsageStats>
  private handleServiceError(service: string, error: any): StandardError
  private trackAPIUsage(service: string, operation: string, cost: number): void
}
```

### **Configuration Management**
```typescript
// config/google-services-config.ts
export interface GoogleServicesConfig {
  // API Keys and Authentication
  apiKey: string
  clientId?: string
  
  // Service Configuration
  maps: {
    enabled: boolean
    libraries: ('places' | 'geometry' | 'drawing')[]
    defaultCenter: Coordinates
    defaultZoom: number
    styling: MapStyleConfig
  }
  
  places: {
    enabled: boolean
    region: string // 'ZA' for South Africa
    types: PlaceType[]
    fields: string[]
    autocompleteOptions: AutocompleteOptions
  }
  
  ai: {
    enabled: boolean
    model: string
    apiEndpoint: string
    rateLimits: RateLimitConfig
  }
  
  // Usage & Monitoring
  limits: {
    mapsLoads: number
    placesRequests: number
    aiQueries: number
    costThreshold: number
  }
  
  // Fallback Strategies
  fallbacks: {
    addressValidation: 'basic' | 'disabled'
    locationSearch: 'database' | 'disabled'
    aiServices: 'local' | 'disabled'
  }
}

// Environment-based configuration
export const googleServicesConfig: GoogleServicesConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  maps: {
    enabled: true,
    libraries: ['places', 'geometry'],
    defaultCenter: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
    defaultZoom: 11
  },
  places: {
    enabled: true,
    region: 'ZA',
    types: ['establishment', 'pharmacy', 'hospital'],
    fields: ['name', 'formatted_address', 'geometry', 'place_id']
  },
  ai: {
    enabled: false, // Future feature
    model: 'gemini-pro',
    apiEndpoint: 'https://generativelanguage.googleapis.com'
  }
}
```

### **Usage Tracking & Monitoring**
```typescript
// lib/services/google-usage-tracker.ts
export class GoogleUsageTracker {
  async logAPICall(service: string, operation: string, cost: number): Promise<void>
  async getUsageStats(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<UsageStats>
  async checkRateLimits(service: string): Promise<RateLimitStatus>
  async alertOnHighUsage(threshold: number): Promise<void>
  
  // Cost tracking for different Google services
  private calculateCost(service: string, operation: string): number {
    const costs = {
      'maps.load': 0.007,           // Per map load
      'places.autocomplete': 0.00283, // Per autocomplete request  
      'places.details': 0.017,      // Per place details request
      'geocoding': 0.005,           // Per geocoding request
      'ai.query': 0.002             // Future AI cost per query
    }
    return costs[`${service}.${operation}`] || 0
  }
}
```

---

## 🔌 **API INTEGRATION PATTERNS**

### **Centralized Service Access**
```typescript
// All Google functionality accessed through single service
import { GoogleServicesProvider } from '@/lib/services/google-services'

// Components use the centralized service
export default function AddressAutocompleteInput({ onAddressSelect }) {
  const googleServices = GoogleServicesProvider.getInstance()
  
  const handleAddressQuery = async (query: string) => {
    try {
      const suggestions = await googleServices.autocompleteAddress(query, 'ZA')
      setSuggestions(suggestions)
    } catch (error) {
      // Centralized error handling
      console.error('Address autocomplete failed:', error)
      // Fallback to manual entry
    }
  }
  
  const handleAddressSelect = async (suggestion: AddressSuggestion) => {
    try {
      const validation = await googleServices.validateAddress(suggestion)
      onAddressSelect(validation.standardizedAddress)
    } catch (error) {
      // Graceful degradation
      onAddressSelect(suggestion.rawAddress)
    }
  }
}
```

### **Error Handling & Fallbacks**
```typescript
// Graceful degradation when Google services fail
export class GoogleServicesFallback {
  // Address autocomplete fallback
  static getBasicAddressSuggestions(query: string): BasicAddressSuggestion[] {
    // Local South African city/province database lookup
    return southAfricanLocations.filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase())
    )
  }
  
  // Location search fallback  
  static findPharmaciesInDatabase(location: string): Pharmacy[] {
    // Database-only pharmacy search when Google Places fails
    return supabase.from('pharmacies_directory')
      .select('*')
      .ilike('city', `%${location}%`)
  }
  
  // Manual address validation
  static validateAddressBasic(address: AddressInput): AddressValidation {
    // Basic field validation without Google API
    return {
      isValid: !!address.street && !!address.city,
      suggestions: [],
      confidence: 'low'
    }
  }
}
```

---

## 🎯 **SERVICE INTEGRATION POINTS**

### **Current Implementations Using Google Services**
1. **Location Services**: `components/features/location/LocationServicesFeature.tsx`
   - **Update to use**: `googleServices.findNearbyPharmacies()`
   - **Benefit**: Centralized error handling and usage tracking

2. **Address Management**: `app/patient/persinfo/addresses/*`
   - **Add autocomplete**: `googleServices.autocompleteAddress()`
   - **Add validation**: `googleServices.validateAddress()`

3. **Pharmacy Proximity**: Future prescription fulfillment
   - **Distance calculation**: `googleServices.calculateDistance()`
   - **Route optimization**: `googleServices.getDirections()`

### **Future Google AI Integration**
```typescript
// Centralized AI service integration (when Google AI is added)
export class GoogleAIIntegration {
  // Medical text analysis
  async analyzePrescriptionText(text: string): Promise<MedicalAnalysis>
  
  // Health content generation  
  async generateHealthContent(prompt: string): Promise<HealthContent>
  
  // Drug interaction checking
  async checkDrugInteractions(medications: string[]): Promise<InteractionReport>
  
  // Symptom analysis
  async analyzeSymptoms(symptoms: string[]): Promise<SymptomAnalysis>
}
```

---

## 📊 **IMPLEMENTATION BENEFITS**

### **Centralization Advantages**
- **Single configuration point**: All Google services managed in one place
- **Unified error handling**: Consistent error responses and fallback strategies
- **Cost monitoring**: Track all Google API usage and costs together
- **Rate limiting**: Prevent quota exceeded across all Google services
- **Service coordination**: Maps + Places + AI working together efficiently

### **Development Benefits**
- **Consistent API**: Same patterns for all Google service calls
- **Error predictability**: Known error types and handling across services
- **Testing simplification**: Mock one service instead of multiple APIs
- **Maintenance efficiency**: Update Google integration in one location

### **Operational Benefits**
- **Usage monitoring**: Real-time tracking of Google API costs
- **Performance optimization**: Efficient batching and caching of requests
- **Failure resilience**: Graceful degradation when Google services unavailable
- **Cost control**: Prevent unexpected Google API charges

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Service Consolidation**
1. **Create centralized service**: `GoogleServicesProvider` class
2. **Migrate existing code**: Update location services to use centralized provider
3. **Add usage tracking**: Monitor API calls and costs
4. **Test integration**: Verify existing functionality works through new service

### **Phase 2: Address Enhancement** 
1. **Add autocomplete service**: Address suggestions through centralized provider
2. **Implement validation**: Address verification using Places API
3. **Update address forms**: Replace manual entry with autocomplete
4. **Add map integration**: Visual address confirmation

### **Phase 3: Advanced Features**
1. **Route optimization**: Directions and distance calculation
2. **Google AI integration**: Medical text analysis and content generation  
3. **Performance optimization**: Caching and batching for efficiency
4. **Analytics integration**: Usage statistics and cost optimization

---

## 🔒 **SECURITY & PRIVACY**

### **API Key Security**
- **Environment-based configuration**: API keys never in code
- **Service-level protection**: API key access controlled through service layer
- **Usage monitoring**: Alert on unexpected API usage patterns

### **Data Privacy**
- **No unnecessary data sharing**: Only required data sent to Google APIs
- **User consent**: Clear disclosure of Google service usage
- **Data retention**: Google API responses not permanently stored
- **Compliance**: GDPR/POPIA requirements for location data

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Service Layer Requirements**
- [ ] **GoogleServicesProvider**: Singleton service class with all Google APIs
- [ ] **Configuration management**: Centralized config with environment variables
- [ ] **Error handling**: Unified error responses and fallback strategies  
- [ ] **Usage tracking**: API call monitoring and cost calculation
- [ ] **Rate limiting**: Prevent quota exceeded across services

### **Integration Requirements**
- [ ] **Location services**: Migrate existing implementation to use centralized service
- [ ] **Address autocomplete**: Add Places API integration for address forms
- [ ] **Address validation**: Google-powered address verification
- [ ] **Pharmacy search**: Enhanced search using Places API
- [ ] **Future AI**: Framework for Google AI integration when needed

### **Quality Requirements**
- [ ] **Error resilience**: Graceful fallbacks when Google services fail
- [ ] **Performance**: Efficient API usage with caching where appropriate
- [ ] **Testing**: Comprehensive testing with mocked Google services
- [ ] **Documentation**: Clear usage examples for all service methods

**This specification provides a complete foundation** for **centralized Google services integration** following modern API design patterns and avoiding scattered Google API calls throughout the codebase.

**Ready for implementation when approved** - the centralized approach will significantly improve maintainability and cost control for all Google service usage.