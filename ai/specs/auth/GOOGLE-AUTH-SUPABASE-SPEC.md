# Google Auth with Supabase Implementation Specification

**Date**: 2025-09-01  
**Status**: Specification Complete  
**Purpose**: Google OAuth integration with Supabase for medical portal authentication

---

## 🎯 **GOOGLE AUTH REQUIREMENTS**

### **Current Status Analysis**
**✅ UI Components Ready**:
- Login form has "Continue with Google" button (currently disabled)
- Google icon and styling implemented
- Placeholder OAuth buttons for Apple and Facebook also present

**❌ Backend Integration Missing**:
- Google OAuth not configured in Supabase
- No OAuth callback handling
- Social login buttons disabled
- No Google Cloud Console setup

### **User Experience Goals**
- **One-click login**: Users authenticate with Google account
- **No password required**: Eliminate password fatigue for medical app
- **Quick access**: Faster login for medical emergencies
- **Trusted authentication**: Google's security for healthcare data

---

## 🔧 **TECHNICAL IMPLEMENTATION REQUIREMENTS**

### **1. Google Cloud Console Setup**

#### **OAuth 2.0 Client Configuration**
**Required Steps**:
1. **Create OAuth Client ID** in Google Cloud Console
2. **Set authorized origins**: `http://localhost:4569`, `https://qa.scrypto.online`  
3. **Set redirect URIs**: `https://PROJECT_ID.supabase.co/auth/v1/callback`
4. **Enable Google+ API** for user profile access
5. **Configure consent screen** with medical app branding

**Credentials Needed**:
```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCPXxx-xxxxxxxxx
```

#### **Medical App Consent Screen**
```yaml
Application Name: "Scrypto Medical Portal"
Application Type: "Web Application"  
Authorized Domains: ["scrypto.online", "localhost:4569"]
Scopes Requested:
  - email (user identification)
  - profile (basic user info)
  - openid (authentication)
Privacy Policy: "https://scrypto.online/privacy"
Terms of Service: "https://scrypto.online/terms"
App Logo: Medical portal branding
```

### **2. Supabase Auth Provider Configuration**

#### **Dashboard Settings**
**Auth → Settings → Auth Providers → Google**:
```yaml
Enable Google Provider: true
Client ID: [Google Cloud Console Client ID]
Client Secret: [Google Cloud Console Client Secret]  
Redirect URL: https://PROJECT_ID.supabase.co/auth/v1/callback
Additional Settings:
  - Skip nonce verification: false
  - Request refresh token: true (for long-term sessions)
```

#### **Supabase RLS Policies**
```sql
-- Ensure Google OAuth users can access their medical data
CREATE POLICY "google_auth_users_own_data" ON patient__persinfo__profile
FOR ALL USING (auth.uid() = user_id);

-- Google OAuth users have same permissions as email/password users
CREATE POLICY "google_auth_medical_access" ON patient__medhist__allergies  
FOR ALL USING (auth.uid() = user_id);
```

### **3. Next.js Application Integration**

#### **Supabase Client Configuration**
```typescript
// lib/supabase-browser.ts (update)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Handle OAuth redirects
      flowType: 'pkce'         // Secure OAuth flow
    }
  }
)
```

#### **OAuth Login Implementation**
```typescript
// components/auth/GoogleAuthButton.tsx
'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Google login failed:', error)
      // Handle error UI
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {/* Google Icon SVG */}
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        {/* Google icon paths */}
      </svg>
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </button>
  )
}
```

#### **OAuth Callback Handler**
```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/patient'

  if (code) {
    const supabase = getServerClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
```

---

## 🏥 **MEDICAL APP COMPLIANCE**

### **HIPAA Considerations for Google OAuth**

#### **Business Associate Agreement (BAA)**
**Google Cloud Requirements**:
- **Sign BAA with Google**: Required for HIPAA compliance  
- **Use Google Cloud Identity**: Standard consumer Google accounts not HIPAA-compliant
- **Google Workspace Enterprise**: Higher compliance tier for healthcare
- **Audit logging**: Complete OAuth activity tracking required

#### **Data Protection Requirements**
```yaml
PHI Data Handling:
  - Google OAuth for authentication only (no medical data to Google)
  - Medical records stay in Supabase (HIPAA-compliant infrastructure)
  - No Google Analytics on authenticated medical pages
  - No Google Ads or tracking on healthcare workflows

Security Requirements:
  - Multi-factor authentication encouraged
  - Session management with automatic timeout
  - Encrypted data transmission (HTTPS only)
  - Audit trails for all authentication events
```

### **Compliance Implementation**
```typescript
// Medical-specific OAuth configuration
const medicalOAuthConfig = {
  provider: 'google',
  options: {
    scopes: 'openid email profile', // Minimal scopes for HIPAA
    redirectTo: '/auth/callback',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',        // Always request fresh consent
      include_granted_scopes: 'false', // Don't expand scopes
      hd: 'healthcare-domain.com' // Restrict to healthcare org (optional)
    }
  }
}
```

---

## 🔐 **SECURITY ARCHITECTURE**

### **OAuth Security Flow**
1. **User clicks Google button** → Redirect to Google OAuth consent screen
2. **User grants permission** → Google redirects with authorization code
3. **Supabase exchanges code** → Gets user profile and creates session
4. **User redirected to app** → Authenticated session established
5. **Subsequent requests** → Use Supabase session tokens

### **Session Management**
```typescript
// Enhanced session handling for medical app
const sessionConfig = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours for medical workflows
  refreshTokenRotation: true,          // Security best practice
  debug: process.env.NODE_ENV === 'development'
}
```

### **Medical Data Protection**
- **OAuth for auth only**: Google never receives medical data
- **Local session storage**: Medical records cached securely client-side
- **Session encryption**: All medical data encrypted in browser storage
- **Automatic logout**: Session timeout for unattended devices

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Google Cloud Console Setup**
- [ ] **Create OAuth 2.0 Client ID** with web application type
- [ ] **Configure authorized origins** for all deployment environments
- [ ] **Set redirect URIs** to Supabase callback endpoints  
- [ ] **Enable Google+ API** for profile information access
- [ ] **Configure consent screen** with medical app branding and privacy policy
- [ ] **Test OAuth flow** in Google OAuth playground

### **Supabase Configuration**  
- [ ] **Enable Google provider** in Supabase Auth settings
- [ ] **Add Google credentials** (Client ID and Secret)
- [ ] **Configure redirect URL** with proper Supabase project endpoint
- [ ] **Test OAuth callback** using Supabase Auth UI
- [ ] **Update RLS policies** for Google OAuth users
- [ ] **Configure session settings** for medical app requirements

### **Next.js Application Updates**
- [ ] **Update LoginForm component** to enable Google Auth button
- [ ] **Add OAuth callback handler** at `/auth/callback/route.ts`
- [ ] **Implement Google Auth service** with proper error handling
- [ ] **Update middleware** to handle OAuth session cookies
- [ ] **Add logout functionality** that clears Google OAuth sessions
- [ ] **Test complete OAuth flow** from login to medical portal access

### **Medical Compliance Verification**
- [ ] **Verify no PHI to Google**: Medical data never leaves Supabase
- [ ] **Session security**: Proper encryption and timeout handling
- [ ] **Audit logging**: Track all authentication events
- [ ] **Privacy policy update**: Disclose Google OAuth usage
- [ ] **Terms of service**: Include OAuth provider terms
- [ ] **User consent**: Clear disclosure of Google authentication

---

## ⚠️ **MEDICAL APP CONSTRAINTS**

### **HIPAA Compliance Requirements**
1. **Limited OAuth scopes**: Only email, profile, openid (no expanded permissions)
2. **No Google services integration**: No Analytics, Ads, or tracking on medical pages
3. **Business Associate Agreement**: Required with Google for healthcare use
4. **Audit requirements**: Complete logging of authentication events
5. **Session management**: Proper timeout and encryption for medical data

### **Privacy Considerations**
- **Minimal data sharing**: Only authentication data to Google
- **User control**: Option to use email/password instead of OAuth
- **Data sovereignty**: Medical records remain in controlled infrastructure
- **Consent management**: Clear user understanding of OAuth data sharing

### **Security Requirements**
- **HTTPS only**: OAuth requires secure connections
- **PKCE flow**: Secure authorization code exchange
- **Token refresh**: Proper handling of expired sessions
- **Cross-site protection**: CSRF protection for OAuth callbacks

---

## 🚀 **SUCCESS CRITERIA**

### **Functional Requirements**
- **Google login works**: Users can authenticate with Google accounts
- **Session persistence**: Users stay logged in across browser sessions
- **Medical data access**: OAuth users have same permissions as email users
- **Logout functionality**: Proper session termination including Google logout

### **Security Requirements**  
- **No PHI leakage**: Medical data never sent to Google services
- **Session security**: Encrypted sessions with proper timeout
- **Audit compliance**: Complete authentication event logging
- **CSRF protection**: OAuth callbacks properly secured

### **User Experience Requirements**
- **One-click login**: Fast authentication for medical emergencies
- **Error handling**: Clear messaging for OAuth failures
- **Fallback option**: Email/password still available
- **Professional appearance**: Medical-grade OAuth consent screens

**This specification provides complete guidance** for implementing **secure Google OAuth authentication** with **Supabase integration** while maintaining **medical app compliance** and **healthcare data protection** requirements.