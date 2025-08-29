# Personal Information Storage & File Upload SSR Implementation Specification

**Feature**: `patient__persinfo__storage`  
**Date**: 2025-08-28  
**Status**: Implementation Ready  
**Domain**: Patient  
**Group**: Personal Information (persinfo)  
**Item**: Storage & File Uploads (Profile Pictures, Documents, Medical Records)  
**Legacy Reference**: `/_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/`

---

## Strategic Approach: Proven Centralized Storage + Modern SSR

This specification leverages the **excellent centralized file upload system** from the legacy codebase while adapting it to our current Next.js 15 SSR architecture and integrating with our patient home design system.

### What We're Keeping (Proven Excellence)
- **Centralized Upload System**: Single `/api/storage/upload` endpoint for all file types
- **Four-Bucket Strategy**: Purpose-specific storage buckets with tailored configurations
- **Security Model**: User isolation, signed URLs with 1-hour expiry, RLS protection
- **Upload Hook Architecture**: `useFileUpload` with validation, progress, drag & drop
- **File Type Intelligence**: Smart preview generation and type detection
- **Profile Picture Component**: Instagram-style UI with camera/upload options

### What We're Modernizing
- **SSR Integration**: Server component wrappers for profile and document pages
- **Design System Integration**: Adapt to our current TilePageLayout and DetailView patterns
- **Navigation Integration**: Proper integration with patient home persinfo tile
- **Next.js 15 Compliance**: Async params handling for document detail pages

---

## Legacy Code Analysis & Porting Strategy

### PROVEN: Centralized Storage Architecture (PORT EXACTLY)
```typescript
// ✅ WORKING PATTERN FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/app/api/storage/upload/route.ts
export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedServerClient()
  
  const formData = await request.formData()
  const file = formData.get('file') as File
  const bucket = formData.get('bucket') as string
  const path = formData.get('path') as string

  // ✅ PROVEN: Bucket validation system
  const validBuckets = ['personal-documents', 'profile-images', 'prescription-images', 'user-uploads']
  if (!validBuckets.includes(bucket)) {
    return Response.json({ error: 'Invalid bucket name' }, { status: 400 })
  }

  // ✅ PROVEN: User isolation pattern
  const userPath = `${user.id}/${path}`
  
  // ✅ PROVEN: Upload with upsert for profile pictures
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(userPath, buffer, {
      contentType: file.type,
      upsert: true  // Allows profile picture replacement
    })

  // ✅ PROVEN: Signed URL generation (1 hour expiry)
  const { data: signedUrlData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, 3600)

  return Response.json({ 
    url: signedUrlData.signedUrl,
    path: data.path,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  })
}
```

### PROVEN: Four-Bucket Configuration (PORT EXACTLY)
```typescript
// ✅ WORKING PATTERN FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/hooks/useFileUpload.ts
const DEFAULT_CONFIGS: Record<string, Partial<FileUploadConfig>> = {
  'personal-documents': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  'profile-images': {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  'prescription-images': {
    maxSize: 10 * 1024 * 1024, // 10MB  
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  },
  'user-uploads': {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
}
```

### PROVEN: Profile Picture Component (EXCELLENT UX)
```typescript
// ✅ WORKING PATTERN FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/components/features/personal-information/profile/ProfilePictureUpload.tsx

// Instagram-style profile picture component with:
// - 128x128 circular display with hover overlay
// - Camera icon overlay on hover
// - Edit pencil badge (always visible)  
// - Dropdown menu: "Take photo", "Upload photo", "Remove photo"
// - Loading states with spinner
// - Error handling and fallback
// - Automatic FormData upload to /api/storage/upload
```

---

## Database Integration (Apply Legacy Schema)

### Personal Information Tables (PORT Legacy Schema)
```sql
-- ✅ PROVEN SCHEMA FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/supabase/migrations/20250110_create_patient_profile.sql

-- Core profile table (adapt to our naming convention)
CREATE TABLE IF NOT EXISTS patient__persinfo__profile (
    profile_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    title TEXT,                        -- Dr, Mr, Mrs, Ms
    nick_name TEXT,
    
    -- Identity documents  
    id_number TEXT,                    -- South African ID number
    passport_number TEXT,
    citizenship TEXT DEFAULT 'South African',
    
    -- Personal details
    date_of_birth DATE,
    gender TEXT,
    marital_status TEXT,
    race_ethnicity TEXT,
    
    -- Contact information
    phone TEXT,
    email TEXT,                        -- User's preferred email (may differ from auth.email)
    
    -- Language preferences
    languages_spoken JSONB,            -- Array of languages
    primary_language TEXT DEFAULT 'English',
    
    -- Profile picture (FILE UPLOAD INTEGRATION)
    profile_picture_url TEXT,          -- Storage path (NOT signed URL)
    
    -- Status
    deceased BOOLEAN DEFAULT FALSE,
    deceased_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Documents table (NEW - based on legacy patterns)
CREATE TABLE IF NOT EXISTS patient__persinfo__documents (
    document_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Document metadata
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,       -- 'id_document', 'medical_aid_card', 'passport', 'driver_license', 'medical_record', 'other'
    description TEXT,
    
    -- File storage (FILE UPLOAD INTEGRATION)
    file_url TEXT NOT NULL,           -- Storage path in 'personal-documents' bucket
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,                   -- MIME type
    
    -- Organization
    category TEXT,                    -- User-defined category
    tags JSONB,                      -- Array of tags
    is_favorite BOOLEAN DEFAULT false,
    
    -- Security
    is_sensitive BOOLEAN DEFAULT false,  -- Extra security for sensitive docs
    access_level TEXT DEFAULT 'private', -- 'private', 'family', 'emergency'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ PORT: Exact RLS policies from legacy
ALTER TABLE patient__persinfo__profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" 
  ON patient__persinfo__profile FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE patient__persinfo__documents ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "Users can manage their own documents"
  ON patient__persinfo__documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## File Structure & Implementation Plan

### NEW: SSR Integration Structure  
```
app/patient/persinfo/
├── page.tsx                           # NEW: Personal information overview (tiles)
├── profile/
│   ├── page.tsx                       # NEW: SSR wrapper for profile management
│   ├── ProfileClient.tsx              # PORT: Profile form with picture upload
│   └── camera/
│       └── page.tsx                   # NEW: Camera interface for profile pictures
├── documents/
│   ├── page.tsx                       # NEW: SSR wrapper for documents list
│   ├── DocumentsClient.tsx            # NEW: ListView integration for documents
│   ├── new/
│   │   └── page.tsx                   # NEW: Upload new document
│   └── [id]/
│       └── page.tsx                   # NEW: Document detail view
├── addresses/
│   ├── page.tsx                       # NEW: Address management (if not exists)
│   └── [id]/page.tsx                  # NEW: Address detail
├── dependents/
│   ├── page.tsx                       # NEW: Dependents management  
│   └── [id]/page.tsx                  # NEW: Dependent profile
└── emergency-contacts/
    ├── page.tsx                       # NEW: Emergency contacts list
    └── [id]/page.tsx                  # NEW: Contact detail

lib/services/storage/
├── file-upload-service.ts             # PORT: From useFileUpload hook
├── profile-picture-service.ts         # PORT: From ProfilePictureUpload component
└── document-storage-service.ts        # NEW: Document management service

components/features/patient/persinfo/
├── ProfileForm.tsx                    # PORT: Profile management with file upload
├── ProfilePictureUpload.tsx           # PORT: Instagram-style profile picture component
├── DocumentsList.tsx                  # NEW: ListView integration for documents
├── DocumentUpload.tsx                 # PORT: FileUploadFormTemplate adaptation  
└── PersonalInfoOverview.tsx           # NEW: Tiles overview component

hooks/storage/
├── useFileUpload.ts                   # PORT: From legacy (check if exists)
└── useProfilePicture.ts               # NEW: Facade pattern for profile pictures

lib/query/patient/persinfo/
├── profile.ts                         # NEW: Facade pattern hooks for profile
├── documents.ts                       # NEW: Facade pattern hooks for documents  
└── storage.ts                         # NEW: Facade pattern hooks for file operations

schemas/patient/persinfo/
├── profile.ts                         # NEW: Zod schemas for profile validation
├── documents.ts                       # NEW: Zod schemas for document validation
└── storage.ts                         # NEW: Zod schemas for file upload validation
```

---

## Component Architecture (Port Legacy Excellence)

### Profile Picture Component (PORT Legacy Success)
```typescript
// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/components/features/personal-information/profile/ProfilePictureUpload.tsx
// components/features/patient/persinfo/ProfilePictureUpload.tsx

'use client'

interface ProfilePictureUploadProps {
  currentImageUrl?: string
  onImageChange: (result: FileUploadResult) => void
  className?: string
}

export default function ProfilePictureUpload({ currentImageUrl, onImageChange }: ProfilePictureUploadProps) {
  // PORT: Exact state management from legacy
  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl)
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // PORT: Exact camera navigation from legacy  
  const handleTakePhoto = () => {
    setShowMenu(false)
    router.push('/patient/persinfo/profile/camera')  // Adapt to our routing
  }

  // PORT: Exact file upload pattern from legacy
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // PORT: Exact FormData upload pattern
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'profile-images')
      
      const timestamp = new Date().getTime()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `profile_${timestamp}_${sanitizedFileName}`
      formData.append('path', filePath)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await response.json()
      onImageChange(uploadResult)
      
      // PORT: Exact preview URL management
      URL.revokeObjectURL(previewUrl)
    } catch (error) {
      // PORT: Exact error handling pattern
    }
  }

  // PORT: Exact Instagram-style UI from legacy
  return (
    <div className="relative w-32 h-32">
      <button onClick={() => setShowMenu(true)} className="relative group cursor-pointer">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-100 hover:ring-gray-200">
          {imageUrl ? (
            <Image src={imageUrl} alt="Profile" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* PORT: Exact camera overlay on hover */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {loading ? <SpinnerIcon /> : <Camera className="w-8 h-8 text-white" />}
        </div>
        
        {/* PORT: Exact edit badge */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <Pencil className="w-4 h-4 text-white" />
        </div>
      </button>

      {/* PORT: Exact dropdown menu */}
      {showMenu && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl border overflow-hidden z-50 min-w-[200px]">
          <button onClick={handleTakePhoto} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
            <Camera className="w-4 h-4" /> Take photo
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
            <Upload className="w-4 h-4" /> Upload photo
          </button>
          {imageUrl && (
            <button onClick={handleRemovePhoto} className="w-full px-4 py-3 text-left hover:bg-gray-50 text-red-600 flex items-center gap-3">
              <Trash className="w-4 h-4" /> Remove photo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

### File Upload Hook System (PORT Legacy Excellence)
```typescript
// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/hooks/useFileUpload.ts
// hooks/storage/useFileUpload.ts

export interface FileUploadConfig {
  bucket: 'personal-documents' | 'profile-images' | 'prescription-images' | 'user-uploads'
  maxSize?: number
  allowedTypes?: string[]
  path?: string
}

export function useFileUpload(config: FileUploadConfig) {
  // PORT: Exact state management from legacy
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // PORT: Exact validation logic from legacy
  const validateFile = (file: File): string | null => {
    const bucketDefaults = DEFAULT_CONFIGS[config.bucket] || {}
    const finalConfig = { ...bucketDefaults, ...config }

    if (!finalConfig.allowedTypes?.includes(file.type)) {
      return `Invalid file type. Allowed: ${finalConfig.allowedTypes.join(', ')}`
    }

    if (finalConfig.maxSize && file.size > finalConfig.maxSize) {
      const maxSizeMB = Math.round(finalConfig.maxSize / (1024 * 1024))
      return `File too large (max ${maxSizeMB}MB)`
    }

    return null
  }

  // PORT: Exact upload function from legacy
  const uploadFile = async (file: File): Promise<FileUploadResult | null> => {
    const validationError = validateFile(file)
    if (validationError) return null

    setIsUploading(true)
    
    try {
      // PORT: Exact FormData pattern
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', config.bucket)
      
      const timestamp = new Date().getTime()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = config.path 
        ? `${config.path}/${timestamp}_${sanitizedFileName}`
        : `${timestamp}_${sanitizedFileName}`
      
      formData.append('path', filePath)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      })

      return await response.json()
    } catch (error) {
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // PORT: Exact drag & drop handlers
  return { dragActive, isUploading, uploadFile, validateFile, /* ... drag handlers */ }
}
```

---

## SSR Component Architecture

### Personal Information Overview (NEW)
```typescript
// app/patient/persinfo/page.tsx
import { requireUser } from '@/lib/auth/require-user'
import { patientNavItems } from '@/config/patientNav'

export default async function PersonalInformationPage() {
  const user = await requireUser()
  
  // Fetch profile completion status server-side
  const profile = await getProfileCompletion(user.id)
  
  const persinfoConfig = {
    title: 'Personal Information',
    subtitle: 'Profile, contacts, and documents',
    tiles: [
      {
        id: 'profile',
        title: 'Profile',
        description: 'Personal details and profile picture',
        status: { 
          text: profile ? `${profile.completionPercentage}% complete` : 'Not started', 
          tone: profile?.completionPercentage > 80 ? 'success' : 'warning' 
        },
        icon: 'User',
        href: '/patient/persinfo/profile',
        accent: 'emerald' as const
      },
      {
        id: 'documents', 
        title: 'Documents',
        description: 'ID, passport, medical records',
        status: { 
          text: `${profile?.documentCount || 0} documents uploaded`, 
          tone: 'info' 
        },
        icon: 'FileText',
        href: '/patient/persinfo/documents',
        accent: 'emerald' as const
      },
      {
        id: 'addresses',
        title: 'Addresses', 
        description: 'Home, work, and emergency addresses',
        icon: 'MapPin',
        href: '/patient/persinfo/addresses',
        accent: 'emerald' as const
      },
      {
        id: 'emergency-contacts',
        title: 'Emergency Contacts',
        description: 'Family and emergency contacts',
        status: { 
          text: `${profile?.emergencyContactCount || 0} contacts`, 
          tone: profile?.emergencyContactCount > 0 ? 'success' : 'warning' 
        },
        icon: 'Phone',
        href: '/patient/persinfo/emergency-contacts',
        accent: 'emerald' as const
      },
      {
        id: 'dependents',
        title: 'Dependents',
        description: 'Children and dependents',
        icon: 'Users',
        href: '/patient/persinfo/dependents', 
        accent: 'emerald' as const
      },
      {
        id: 'medical-aid',
        title: 'Medical Aid',
        description: 'Insurance and medical aid details',
        icon: 'Shield',
        href: '/patient/persinfo/medical-aid',
        accent: 'emerald' as const
      }
    ]
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Personal Information"
      tileConfig={persinfoConfig}
    />
  )
}
```

### Profile Management with File Upload (PORT + SSR)
```typescript
// app/patient/persinfo/profile/page.tsx
import { requireUser, getServerClient } from '@/lib/auth/require-user'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const user = await requireUser()
  const supabase = await getServerClient()
  
  // Fetch profile data server-side
  const { data: profile } = await supabase
    .from('patient__persinfo__profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Generate fresh signed URL for profile picture if exists
  let profileWithSignedURL = profile
  if (profile?.profile_picture_url) {
    const { data: signedUrl } = await supabase.storage
      .from('profile-images')
      .createSignedUrl(profile.profile_picture_url, 3600)
    
    if (signedUrl) {
      profileWithSignedURL = {
        ...profile,
        profile_picture_url: signedUrl.signedUrl
      }
    }
  }

  return (
    <DetailPageLayoutClient
      sidebarItems={patientNavItems}
      headerTitle="Profile"
    >
      <ProfileClient 
        userId={user.id}
        initialProfile={profileWithSignedURL}
        userEmail={user.email}
      />
    </DetailPageLayoutClient>
  )
}

// app/patient/persinfo/profile/ProfileClient.tsx
'use client'

// PORT: Combine ProfilePictureUpload + FileUploadFormTemplate patterns
export default function ProfileClient({ userId, initialProfile, userEmail }) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  
  // Use facade pattern hooks
  const { updateProfile, isLoading } = useProfileManagement()
  
  const profileFields: FieldConfig<ProfileData>[] = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'middle_name', label: 'Middle Name', type: 'text' },
    { key: 'title', label: 'Title', type: 'select', options: [
      { value: 'mr', label: 'Mr' },
      { value: 'mrs', label: 'Mrs' }, 
      { value: 'ms', label: 'Ms' },
      { value: 'dr', label: 'Dr' }
    ]},
    { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
    { key: 'gender', label: 'Gender', type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ]},
    { key: 'id_number', label: 'ID Number', type: 'text' },
    { key: 'phone', label: 'Phone Number', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' }
  ]

  const handleProfileSave = async (profileData: ProfileData, uploadResult?: FileUploadResult) => {
    try {
      // Include profile picture path if uploaded
      const dataToSave = {
        ...profileData,
        ...(uploadResult ? { profile_picture_url: uploadResult.path } : {})
      }
      
      await updateProfile(dataToSave)
      setProfile(dataToSave)
      setMode('view')
    } catch (error) {
      console.error('Profile save failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-center gap-4">
          <ProfilePictureUpload
            currentImageUrl={profile?.profile_picture_url}
            onImageChange={handleProfilePictureChange}
          />
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Add a profile picture to personalize your account
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, or GIF (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        {mode === 'view' ? (
          <ProfileView profile={profile} onEdit={() => setMode('edit')} />
        ) : (
          <ProfileEditForm
            profile={profile}
            fields={profileFields}
            onSave={handleProfileSave}
            onCancel={() => setMode('view')}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
```

### Documents Management (NEW - Based on Legacy Patterns)
```typescript
// app/patient/persinfo/documents/page.tsx
export default async function DocumentsPage() {
  const user = await requireUser()
  
  return (
    <ListPageLayoutClient
      sidebarItems={patientNavItems}
      headerTitle="Documents"
    >
      <DocumentsClient userId={user.id} />
    </ListPageLayoutClient>
  )
}

// app/patient/persinfo/documents/DocumentsClient.tsx
'use client'

export default function DocumentsClient({ userId }: { userId: string }) {
  const router = useRouter()
  const { documents, isLoading } = useDocumentsList({ page: 1, pageSize: 50, search: '' })

  // Transform documents for ListView
  const listItems = documents?.data.map(doc => ({
    id: doc.document_id,
    title: doc.document_name,
    letter: doc.document_type[0]?.toUpperCase(),
    severity: doc.is_sensitive ? 'warning' : undefined,
    thirdColumn: doc.created_at,
    data: doc
  })) || []

  const handleDocumentClick = (item) => {
    router.push(`/patient/persinfo/documents/${item.id}`)
  }

  const handleAddDocument = () => {
    router.push('/patient/persinfo/documents/new')
  }

  return (
    <ListView
      items={listItems}
      loading={isLoading}
      onItemClick={handleDocumentClick}
      onAdd={handleAddDocument}
      searchPlaceholder="Search documents..."
      pageTitle="Personal Documents"
      rightColumns={[
        { 
          key: 'document_type', 
          label: 'Type', 
          render: (item) => formatDocumentType((item.data as any).document_type)
        },
        { 
          key: 'file_size', 
          label: 'Size', 
          render: (item) => formatFileSize((item.data as any).file_size) 
        }
      ]}
      getThumbnail={(item) => {
        const doc = item.data as any
        return doc.file_type?.startsWith('image/') ? generateDocumentThumbnail(doc.file_url) : null
      }}
      density="comfortable"
      showChevron={true}
    />
  )
}
```

### Document Upload (NEW - Based on FileUploadFormTemplate)
```typescript
// app/patient/persinfo/documents/new/page.tsx
export default async function NewDocumentPage() {
  const user = await requireUser()
  
  return (
    <DetailPageLayoutClient
      sidebarItems={patientNavItems}
      headerTitle="Upload Document"
    >
      <DocumentUploadClient userId={user.id} />
    </DetailPageLayoutClient>
  )
}

// app/patient/persinfo/documents/new/DocumentUploadClient.tsx
'use client'

// PORT: FileUploadFormTemplate pattern for documents
export default function DocumentUploadClient({ userId }: { userId: string }) {
  const router = useRouter()
  const { createDocument } = useDocumentManagement()

  const documentFields: FieldConfig<DocumentData>[] = [
    { key: 'document_name', label: 'Document Name', type: 'text', required: true },
    { key: 'document_type', label: 'Document Type', type: 'select', required: true, options: [
      { value: 'id_document', label: 'ID Document' },
      { value: 'passport', label: 'Passport' },
      { value: 'driver_license', label: 'Driver License' },
      { value: 'medical_aid_card', label: 'Medical Aid Card' },
      { value: 'medical_record', label: 'Medical Record' },
      { value: 'other', label: 'Other' }
    ]},
    { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { key: 'is_sensitive', label: 'Sensitive Document', type: 'checkbox' }
  ]

  const fileUploadConfig: FileUploadFormConfig = {
    uploadConfig: {
      bucket: 'personal-documents',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword']
    },
    uploadPosition: 'top',
    requiredForSubmit: true,
    uploadLabel: 'Upload Document',
    uploadDescription: 'Upload your document file (PDF, image, or Word document)',
    autoFillFromFile: true  // Auto-fill document name from file name
  }

  const handleSave = async (documentData: DocumentData, uploadResult?: FileUploadResult) => {
    if (!uploadResult) return
    
    const fullDocumentData = {
      ...documentData,
      user_id: userId,
      file_url: uploadResult.path,  // Store path, not signed URL
      file_name: uploadResult.fileName,
      file_size: uploadResult.fileSize,
      file_type: uploadResult.fileType
    }
    
    await createDocument(fullDocumentData)
    router.push('/patient/persinfo/documents')
  }

  return (
    <FileUploadFormTemplate
      data={null}
      fields={documentFields}
      fileUploadConfig={fileUploadConfig}
      onSave={handleSave}
      onCancel={() => router.push('/patient/persinfo/documents')}
      title="Upload New Document"
      mode="create"
    />
  )
}
```

---

## API Endpoints (Port Legacy Success + Add New)

### Storage Upload API (PORT EXACTLY)
```typescript
// app/api/storage/upload/route.ts
// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/app/api/storage/upload/route.ts

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedServerClient()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const path = formData.get('path') as string

    // PORT: Exact validation from legacy
    const validBuckets = ['personal-documents', 'profile-images', 'prescription-images', 'user-uploads']
    if (!validBuckets.includes(bucket)) {
      return Response.json({ error: 'Invalid bucket name' }, { status: 400 })
    }

    // PORT: Exact user isolation pattern
    const userPath = `${user.id}/${path}`
    
    // PORT: Exact upload pattern
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(userPath, buffer, {
        contentType: file.type,
        upsert: true  // Allow overwriting for profile pictures
      })

    if (error) return Response.json({ error: 'Upload failed' }, { status: 500 })

    // PORT: Exact signed URL generation
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 3600) // 1 hour

    return Response.json({ 
      url: signedUrlData.signedUrl,
      path: data.path,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Profile API (PORT + Enhance)
```typescript
// app/api/patient/persinfo/profile/route.ts
// PORT BASE FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/app/api/personal-information/profile/route.ts

export async function GET() {
  const { supabase, user } = await getAuthenticatedServerClient()

  const { data: profile } = await supabase
    .from('patient__persinfo__profile')  // Use our naming convention
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profile) {
    // PORT: Exact signed URL regeneration from legacy
    profile.registered_email = user.email
    if (!profile.email) profile.email = user.email
    
    if (profile.profile_picture_url) {
      const { data: signedUrl } = await supabase.storage
        .from('profile-images')
        .createSignedUrl(profile.profile_picture_url, 3600)
      
      if (signedUrl) {
        profile.profile_picture_url = signedUrl.signedUrl
      }
    }
  }

  return Response.json({ data: profile })
}

export async function PUT(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedServerClient()
  const body = await request.json()

  // PORT: Exact profile picture URL handling from legacy
  if (body.profile_picture_url && body.profile_picture_url.startsWith('http')) {
    // Extract path from signed URL to store in database
    const pathMatch = body.profile_picture_url.match(/\/storage\/v1\/object\/sign\/([^?]+)/)
    if (pathMatch) {
      const fullPath = pathMatch[1]
      const pathParts = fullPath.split('/')
      body.profile_picture_url = pathParts.slice(1).join('/') // Remove bucket name
    }
  }

  // Upsert pattern (update or create)
  const { data, error } = await supabase
    .from('patient__persinfo__profile')
    .upsert({
      ...body,
      user_id: user.id,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return Response.json({ data, success: true })
}
```

### Documents API (NEW)
```typescript
// app/api/patient/persinfo/documents/route.ts
export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedServerClient()
  
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search') || ''
  const documentType = searchParams.get('document_type')

  let query = supabase
    .from('patient__persinfo__documents')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (search) {
    query = query.or(`document_name.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  if (documentType) {
    query = query.eq('document_type', documentType)
  }

  const from = (page - 1) * pageSize
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) return Response.json({ error: 'Failed to fetch documents' }, { status: 500 })

  // Generate signed URLs for document previews
  const documentsWithUrls = await Promise.all(
    (data || []).map(async (doc) => {
      if (doc.file_type?.startsWith('image/') || doc.file_type === 'application/pdf') {
        const { data: signedUrl } = await supabase.storage
          .from('personal-documents')
          .createSignedUrl(doc.file_url, 3600)
        
        return {
          ...doc,
          file_preview_url: signedUrl?.signedUrl
        }
      }
      return doc
    })
  )

  return Response.json({ 
    data: documentsWithUrls, 
    total: count || 0, 
    page, 
    pageSize 
  })
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedServerClient()
  const documentData = await request.json()

  const { data, error } = await supabase
    .from('patient__persinfo__documents')
    .insert({
      ...documentData,
      user_id: user.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return Response.json({ error: 'Failed to create document' }, { status: 500 })

  return Response.json({ data })
}
```

---

## Facade Pattern Hooks (Adapt Legacy Patterns)

### Profile Management Hooks
```typescript
// lib/query/patient/persinfo/profile.ts
import { useState, useEffect, useCallback } from 'react'

const queryCache = new Map<string, any>()

export function useProfileData() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/patient/persinfo/profile')
        const data = await response.json()
        setProfile(data.data)
        queryCache.set('profile', data.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (queryCache.has('profile')) {
      setProfile(queryCache.get('profile'))
      setIsLoading(false)
    } else {
      fetchProfile()
    }
  }, [])

  return { profile, isLoading, error }
}

export function useProfileManagement() {
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = useCallback(async (profileData: any) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/patient/persinfo/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) throw new Error('Profile update failed')

      const result = await response.json()
      
      // Invalidate cache
      queryCache.delete('profile')
      
      return result.data
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { updateProfile, isLoading }
}
```

### Document Management Hooks
```typescript
// lib/query/patient/persinfo/documents.ts
export function useDocumentsList(query: DocumentsListQuery) {
  const [documents, setDocuments] = useState<DocumentsListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const params = new URLSearchParams({
          page: query.page.toString(),
          pageSize: query.pageSize.toString(),
          search: query.search
        })
        
        const response = await fetch(`/api/patient/persinfo/documents?${params}`)
        const data = await response.json()
        setDocuments(data)
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [query])

  return { documents, isLoading }
}

export function useDocumentManagement() {
  const createDocument = useCallback(async (documentData: DocumentCreateInput) => {
    const response = await fetch('/api/patient/persinfo/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(documentData)
    })
    
    if (!response.ok) throw new Error('Document creation failed')
    
    // Invalidate documents cache
    queryCache.delete('documents-list')
    
    return await response.json()
  }, [])

  const deleteDocument = useCallback(async (documentId: string) => {
    const response = await fetch(`/api/patient/persinfo/documents/${documentId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Document deletion failed')
    
    queryCache.delete('documents-list')
    return true
  }, [])

  return { createDocument, deleteDocument }
}
```

---

## Zod Schemas (Based on Legacy Data Structure)

### File: `/schemas/patient/persinfo/profile.ts`
```typescript
import { z } from 'zod'

// Profile data schema
export const ProfileData = z.object({
  profile_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  
  // Basic information
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  middle_name: z.string().max(100).optional(),
  title: z.enum(['mr', 'mrs', 'ms', 'dr', 'prof']).optional(),
  nick_name: z.string().max(50).optional(),
  
  // Identity documents
  id_number: z.string().regex(/^\d{13}$/, 'Invalid South African ID number').optional(),
  passport_number: z.string().max(20).optional(),
  citizenship: z.string().max(100).default('South African'),
  
  // Personal details  
  date_of_birth: z.string().date(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed', 'other']).optional(),
  race_ethnicity: z.string().max(100).optional(),
  
  // Contact information
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]+$/, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email address').optional(),
  
  // Language preferences
  languages_spoken: z.array(z.string()).default(['English']),
  primary_language: z.string().default('English'),
  
  // Profile picture
  profile_picture_url: z.string().optional(), // Storage path
  
  // Status
  deceased: z.boolean().default(false),
  deceased_date: z.string().date().optional(),
  is_active: z.boolean().default(true),
  
  // Computed fields (not stored)
  registered_email: z.string().email().optional(), // From auth.users
})

export const ProfileUpdateInput = ProfileData.omit({ 
  profile_id: true, 
  user_id: true, 
  created_at: true, 
  updated_at: true 
})

export type ProfileData = z.infer<typeof ProfileData>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInput>
```

### Document Schemas
```typescript
// schemas/patient/persinfo/documents.ts
export const DocumentData = z.object({
  document_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  
  // Document metadata
  document_name: z.string().min(1, 'Document name is required').max(255),
  document_type: z.enum([
    'id_document',
    'passport', 
    'driver_license',
    'medical_aid_card',
    'medical_record',
    'birth_certificate',
    'marriage_certificate',
    'other'
  ]),
  description: z.string().max(1000).optional(),
  
  // File information
  file_url: z.string().min(1, 'File is required'), // Storage path
  file_name: z.string().min(1),
  file_size: z.number().positive(),
  file_type: z.string().min(1),
  
  // Organization
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  is_favorite: z.boolean().default(false),
  
  // Security
  is_sensitive: z.boolean().default(false),
  access_level: z.enum(['private', 'family', 'emergency']).default('private'),
  
  // Status
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

export const DocumentCreateInput = DocumentData.omit({ 
  document_id: true, 
  created_at: true, 
  updated_at: true 
})

export type DocumentData = z.infer<typeof DocumentData>
export type DocumentCreateInput = z.infer<typeof DocumentCreateInput>
```

---

## Navigation Integration

### Update Patient Home Config (Enable Persinfo Tile)
```typescript
// app/patient/config.ts - UPDATE personal-info tile (currently present but basic)
{
  id: 'personal-info',
  title: 'Personal Information', 
  description: 'Profile, contacts, documents',
  status: { text: 'Profile 67% complete', tone: 'warning' as const }, // Dynamic from server
  icon: 'User',
  href: '/patient/persinfo',
  variant: 'default' as const,
  color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
}
```

### Mobile Footer Integration
```typescript
// components/layouts/MobileFooter.tsx - ADD to custom quick menu
{
  id: 'profile',
  icon: User,
  label: 'Profile',
  href: '/patient/persinfo/profile',
  color: 'emerald'
}
```

---

## Security & Privacy Implementation

### File Security Service (NEW - Enhanced from Legacy)
```typescript
// lib/services/storage/file-security-service.ts
export class FileSecurityService {
  // Enhanced security for personal information files
  private readonly SENSITIVE_DOCUMENT_TYPES = ['id_document', 'passport', 'medical_record']
  
  async validateFileUpload(
    file: File, 
    bucket: string, 
    userId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    
    // File size validation
    const maxSizes = {
      'profile-images': 5 * 1024 * 1024,     // 5MB
      'personal-documents': 10 * 1024 * 1024, // 10MB
      'prescription-images': 10 * 1024 * 1024, // 10MB
      'user-uploads': 20 * 1024 * 1024        // 20MB
    }
    
    if (file.size > maxSizes[bucket]) {
      errors.push(`File too large for ${bucket}`)
    }
    
    // MIME type validation
    const allowedTypes = {
      'profile-images': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'personal-documents': ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'],
      'prescription-images': ['image/jpeg', 'image/png', 'application/pdf'],
      'user-uploads': ['*'] // Most permissive
    }
    
    if (!allowedTypes[bucket].includes('*') && !allowedTypes[bucket].includes(file.type)) {
      errors.push(`File type ${file.type} not allowed for ${bucket}`)
    }
    
    // Malware scanning (basic)
    if (await this.containsSuspiciousContent(file)) {
      errors.push('File contains suspicious content')
    }
    
    // Rate limiting
    const userUploads = await this.getUserDailyUploads(userId)
    if (userUploads > 100) { // 100 uploads per day limit
      errors.push('Daily upload limit exceeded')
    }

    return { valid: errors.length === 0, errors }
  }

  async generateSecureSignedUrl(
    bucket: string, 
    path: string, 
    userId: string, 
    expirySeconds: number = 3600
  ): Promise<string | null> {
    // Verify user owns the file
    if (!path.startsWith(userId)) {
      throw new Error('Access denied - not file owner')
    }
    
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expirySeconds)
    
    if (error) return null
    
    // Log access for audit trail
    await this.logFileAccess(userId, bucket, path)
    
    return data.signedUrl
  }

  private async containsSuspiciousContent(file: File): Promise<boolean> {
    // Basic suspicious content detection
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs']
    return suspiciousExtensions.some(ext => file.name.toLowerCase().includes(ext))
  }

  private async logFileAccess(userId: string, bucket: string, path: string): Promise<void> {
    // Audit trail for file access (especially sensitive documents)
    // TODO: Implement audit logging
  }
}
```

### Privacy Controls (NEW)
```typescript
// lib/services/storage/privacy-control-service.ts
export class PrivacyControlService {
  async setDocumentAccessLevel(
    documentId: string, 
    accessLevel: 'private' | 'family' | 'emergency',
    userId: string
  ): Promise<void> {
    const supabase = createServiceRoleClient()
    
    await supabase
      .from('patient__persinfo__documents')
      .update({ 
        access_level: accessLevel,
        updated_at: new Date().toISOString()
      })
      .eq('document_id', documentId)
      .eq('user_id', userId) // Ensure user owns document
  }

  async shareDocumentWithFamily(
    documentId: string, 
    familyMemberIds: string[],
    permissions: 'view' | 'download',
    expiresAt?: Date
  ): Promise<void> {
    // Create temporary sharing tokens for family access
    // Implement family sharing with expiry and permissions
  }

  async revokeDocumentAccess(documentId: string, targetUserId: string): Promise<void> {
    // Remove family sharing access
    // Invalidate any existing sharing tokens
  }
}
```

---

## Comprehensive Automatic Test Suites

### 1. File Upload Security Testing
```typescript
// tests/automatic/personal-info/file-upload-security-tests.spec.ts
test.describe('Personal Info - File Upload Security', () => {
  test('Profile picture upload validation and security', async ({ page }) => {
    const securityTests = [
      {
        fileName: 'malicious.exe.jpg',
        expectedBehavior: 'reject_suspicious_extension',
        shouldUpload: false
      },
      {
        fileName: 'huge_file.jpg', 
        fileSize: 15 * 1024 * 1024, // 15MB (exceeds 5MB limit)
        expectedBehavior: 'reject_oversized_file',
        shouldUpload: false
      },
      {
        fileName: 'valid_profile.jpg',
        fileSize: 2 * 1024 * 1024, // 2MB
        expectedBehavior: 'accept_valid_file',
        shouldUpload: true
      },
      {
        fileName: 'script.js',
        fileType: 'application/javascript',
        expectedBehavior: 'reject_invalid_mime_type', 
        shouldUpload: false
      }
    ]

    for (const securityTest of securityTests) {
      await page.goto('/patient/persinfo/profile')
      await page.click('[data-testid="edit-profile"]')
      
      // Generate test file based on scenario
      const testFile = await generateTestFile(securityTest)
      await page.setInputFiles('[data-testid="profile-picture-input"]', testFile.path)
      
      if (securityTest.shouldUpload) {
        await expect(page.locator('[data-testid="upload-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="profile-picture-preview"]')).toBeVisible()
      } else {
        await expect(page.locator('[data-testid="upload-error"]')).toBeVisible()
        await expect(page.locator('[data-testid="error-message"]')).toContainText('not allowed')
      }
    }
  })

  test('User file isolation - cannot access other users files', async ({ page, context }) => {
    // Upload file as user 1
    await loginAs(page, 'user1@test.com', 'password')
    await page.goto('/patient/persinfo/documents/new')
    await uploadTestDocument(page, 'confidential.pdf')
    
    const documentPath = await page.getAttribute('[data-testid="document-path"]', 'value')
    
    // Login as user 2
    const page2 = await context.newPage()
    await loginAs(page2, 'user2@test.com', 'password')
    
    // Attempt to access user 1's file directly
    await page2.goto(`/api/files/personal-documents/${documentPath}`)
    await expect(page2.locator('text=Unauthorized')).toBeVisible()
    
    // Attempt to access through signed URL manipulation
    const response = await page2.request.get(`/api/storage/signed-url?bucket=personal-documents&path=${documentPath}`)
    expect(response.status()).toBe(403)
  })
})
```

### 2. Profile Picture Workflow Testing  
```typescript
// tests/automatic/personal-info/profile-picture-tests.spec.ts
test.describe('Personal Info - Profile Picture Workflow', () => {
  test('Complete profile picture management workflow', async ({ page }) => {
    await page.goto('/patient/persinfo/profile')
    await page.click('[data-testid="edit-profile"]')
    
    // Test Instagram-style profile picture interface
    await expect(page.locator('[data-testid="profile-picture-container"]')).toBeVisible()
    await page.click('[data-testid="profile-picture-container"]')
    
    // Test dropdown menu options
    await expect(page.locator('[data-testid="take-photo-option"]')).toBeVisible()
    await expect(page.locator('[data-testid="upload-photo-option"]')).toBeVisible()
    
    // Test file upload path
    await page.click('[data-testid="upload-photo-option"]')
    await page.setInputFiles('[data-testid="profile-picture-input"]', 'tests/assets/valid-profile.jpg')
    
    // Verify upload progress and completion
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible()
    await page.waitForSelector('[data-testid="upload-complete"]')
    await expect(page.locator('[data-testid="profile-picture-preview"]')).toBeVisible()
    
    // Test save profile with new picture
    await page.click('[data-testid="save-profile"]')
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible()
    
    // Verify picture persists after page reload
    await page.reload()
    await expect(page.locator('[data-testid="profile-picture-display"]')).toHaveAttribute('src', /profile_\d+/)
  })

  test('Profile picture camera capture workflow', async ({ page }) => {
    await page.goto('/patient/persinfo/profile')
    await page.click('[data-testid="profile-picture-container"]')
    await page.click('[data-testid="take-photo-option"]')
    
    // Should navigate to camera interface
    await expect(page).toHaveURL(/\/patient\/persinfo\/profile\/camera/)
    await expect(page.locator('[data-testid="camera-interface"]')).toBeVisible()
    
    // Test camera permission handling
    await page.grantPermissions(['camera'])
    await expect(page.locator('[data-testid="camera-preview"]')).toBeVisible()
    
    // Test capture and save workflow
    await page.click('[data-testid="capture-button"]')
    await expect(page.locator('[data-testid="captured-image"]')).toBeVisible()
    
    await page.click('[data-testid="use-photo"]')
    
    // Should return to profile with new picture
    await expect(page).toHaveURL(/\/patient\/persinfo\/profile/)
    await expect(page.locator('[data-testid="profile-picture-updated"]')).toBeVisible()
  })
})
```

### 3. Document Management Testing
```typescript  
// tests/automatic/personal-info/document-management-tests.spec.ts
test.describe('Personal Info - Document Management', () => {
  test('Document upload and categorization workflow', async ({ page }) => {
    await page.goto('/patient/persinfo/documents')
    await page.click('[data-testid="add-document"]')
    
    // Test FileUploadFormTemplate integration
    await expect(page.locator('[data-testid="file-upload-area"]')).toBeVisible()
    
    // Upload document
    await page.setInputFiles('[data-testid="file-input"]', 'tests/assets/sample-id-document.pdf')
    await expect(page.locator('[data-testid="file-uploaded"]')).toBeVisible()
    
    // Test auto-fill from filename
    await expect(page.locator('[data-testid="document-name"]')).toHaveValue('sample-id-document')
    
    // Complete document metadata
    await page.selectOption('[data-testid="document-type"]', 'id_document')
    await page.fill('[data-testid="description"]', 'South African ID Document')
    await page.check('[data-testid="is-sensitive"]')
    
    // Save document
    await page.click('[data-testid="save-document"]')
    await expect(page.locator('[data-testid="document-saved"]')).toBeVisible()
    
    // Verify document appears in list
    await expect(page).toHaveURL(/\/patient\/persinfo\/documents$/)
    await expect(page.locator('[data-testid="document-list"]')).toContainText('sample-id-document')
    
    // Test sensitive document indicators
    const sensitiveDoc = page.locator('[data-testid="document-item"]').first()
    await expect(sensitiveDoc.locator('[data-testid="sensitive-badge"]')).toBeVisible()
  })

  test('Document search and filtering', async ({ page }) => {
    // Create test documents of different types
    const testDocuments = [
      { name: 'ID Document', type: 'id_document', content: 'identity' },
      { name: 'Medical Record', type: 'medical_record', content: 'health' },
      { name: 'Passport Copy', type: 'passport', content: 'travel' }
    ]
    
    for (const doc of testDocuments) {
      await createTestDocument(page, doc)
    }
    
    await page.goto('/patient/persinfo/documents')
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'medical')
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="document-item"]').first()).toContainText('Medical Record')
    
    // Test filter by document type
    await page.selectOption('[data-testid="type-filter"]', 'id_document')
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="document-item"]').first()).toContainText('ID Document')
    
    // Test clear filters
    await page.click('[data-testid="clear-filters"]')
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(3)
  })
})
```

### 4. Storage Performance Testing
```typescript
// tests/automatic/personal-info/storage-performance-tests.spec.ts
test.describe('Personal Info - Storage Performance', () => {
  test('Concurrent file upload handling', async ({ browser }) => {
    // Test multiple users uploading simultaneously
    const users = await Promise.all(
      Array.from({ length: 20 }, async (_, i) => {
        const page = await browser.newPage()
        await loginAs(page, `user${i}@test.com`, 'password')
        return page
      })
    )

    // All users upload profile pictures simultaneously
    const uploadPromises = users.map(async (page, index) => {
      await page.goto('/patient/persinfo/profile')
      await page.click('[data-testid="profile-picture-container"]')
      await page.click('[data-testid="upload-photo-option"]')
      
      const startTime = Date.now()
      await page.setInputFiles('[data-testid="profile-picture-input"]', `tests/assets/profile${index % 5}.jpg`)
      await page.waitForSelector('[data-testid="upload-complete"]')
      return Date.now() - startTime
    })

    const uploadTimes = await Promise.all(uploadPromises)
    
    // Verify performance under concurrent load
    const averageTime = uploadTimes.reduce((a, b) => a + b, 0) / uploadTimes.length
    const maxTime = Math.max(...uploadTimes)
    
    expect(averageTime).toBeLessThan(5000) // Average <5s
    expect(maxTime).toBeLessThan(15000)    // Max <15s
    
    // Verify all uploads succeeded
    const successCount = await Promise.all(users.map(async (page) => {
      return await page.locator('[data-testid="profile-picture-display"]').isVisible()
    }))
    
    expect(successCount.filter(Boolean)).toHaveLength(20) // All should succeed
  })

  test('Storage quota and cleanup management', async ({ page }) => {
    await loginAs(page, 'power-user@test.com', 'password')
    
    // Upload multiple large documents to approach quota
    for (let i = 0; i < 10; i++) {
      await page.goto('/patient/persinfo/documents/new')
      await page.setInputFiles('[data-testid="file-input"]', `tests/assets/large-document-${i}.pdf`)
      await page.fill('[data-testid="document-name"]', `Large Document ${i}`)
      await page.selectOption('[data-testid="document-type"]', 'other')
      await page.click('[data-testid="save-document"]')
      await page.waitForSelector('[data-testid="document-saved"]')
    }
    
    // Check storage usage
    const storageResponse = await page.request.get('/api/patient/persinfo/storage-usage')
    const storageData = await storageResponse.json()
    
    expect(storageData.totalSize).toBeLessThan(100 * 1024 * 1024) // <100MB per user
    
    // Test automatic cleanup suggestion
    if (storageData.totalSize > 80 * 1024 * 1024) { // >80MB
      await expect(page.locator('[data-testid="storage-cleanup-suggestion"]')).toBeVisible()
    }
  })
})
```

### 5. Privacy and Data Protection Testing
```typescript
// tests/automatic/personal-info/privacy-protection-tests.spec.ts  
test.describe('Personal Info - Privacy Protection', () => {
  test('Sensitive document handling and access controls', async ({ page }) => {
    await page.goto('/patient/persinfo/documents/new')
    
    // Upload sensitive ID document
    await page.setInputFiles('[data-testid="file-input"]', 'tests/assets/sa-id-document.pdf')
    await page.fill('[data-testid="document-name"]', 'South African ID')
    await page.selectOption('[data-testid="document-type"]', 'id_document')
    await page.check('[data-testid="is-sensitive"]') // Mark as sensitive
    await page.selectOption('[data-testid="access-level"]', 'private')
    await page.click('[data-testid="save-document"]')
    
    // Verify sensitive document indicators
    await page.goto('/patient/persinfo/documents')
    const sensitiveDoc = page.locator('[data-testid="document-item"]').first()
    await expect(sensitiveDoc.locator('[data-testid="sensitive-badge"]')).toBeVisible()
    await expect(sensitiveDoc.locator('[data-testid="lock-icon"]')).toBeVisible()
    
    // Test enhanced security for sensitive documents
    await sensitiveDoc.click()
    await expect(page.locator('[data-testid="sensitive-document-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="view-document"]')).toBeVisible()
    
    // Should require additional confirmation for sensitive documents
    await page.click('[data-testid="view-document"]')
    await expect(page.locator('[data-testid="sensitive-access-confirmation"]')).toBeVisible()
  })

  test('Data retention and automatic cleanup', async ({ page }) => {
    // Test automatic cleanup of old temporary files
    await createOldTemporaryFiles('user@test.com', 5) // Create 5 old temp files
    
    // Trigger cleanup job
    await page.request.post('/api/admin/cleanup-storage')
    
    // Verify cleanup occurred
    const cleanupResponse = await page.request.get('/api/admin/cleanup-report')
    const cleanupData = await cleanupResponse.json()
    
    expect(cleanupData.filesDeleted).toBeGreaterThan(0)
    expect(cleanupData.spaceRecovered).toBeGreaterThan(0)
    
    // Verify user documents were NOT affected
    await page.goto('/patient/persinfo/documents')
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(3) // User's real documents preserved
  })
})
```

### 6. Mobile and Responsive Testing
```typescript
// tests/automatic/personal-info/mobile-responsive-tests.spec.ts
test.describe('Personal Info - Mobile Responsive', () => {
  test('Profile picture upload on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile')
    
    await page.goto('/patient/persinfo/profile')
    
    // Test mobile-specific profile picture interaction
    await page.tap('[data-testid="profile-picture-container"]')
    await expect(page.locator('[data-testid="mobile-photo-menu"]')).toBeVisible()
    
    // Verify touch targets are appropriately sized (>44px)
    const menuButtons = page.locator('[data-testid="photo-menu-option"]')
    const buttonCount = await menuButtons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = menuButtons.nth(i)
      const boundingBox = await button.boundingBox()
      expect(boundingBox.height).toBeGreaterThan(44)
    }
    
    // Test camera option on mobile
    await page.tap('[data-testid="take-photo-option"]')
    await expect(page).toHaveURL(/\/camera$/)
    
    // Test mobile camera interface
    await page.grantPermissions(['camera'])
    await expect(page.locator('[data-testid="mobile-camera-preview"]')).toBeVisible()
    
    // Test mobile capture button (large touch target)
    const captureButton = page.locator('[data-testid="capture-button"]')
    const captureBox = await captureButton.boundingBox()
    expect(captureBox.width).toBeGreaterThan(64) // Large capture button
    expect(captureBox.height).toBeGreaterThan(64)
  })

  test('Document upload drag and drop on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'This test only runs on desktop')
    
    await page.goto('/patient/persinfo/documents/new')
    
    // Test drag and drop functionality
    const dropZone = page.locator('[data-testid="file-upload-drop-zone"]')
    await expect(dropZone).toBeVisible()
    
    // Simulate drag over
    await dropZone.hover()
    await expect(dropZone).toHaveClass(/drag-active/)
    
    // Test file drop (using page.setInputFiles as simulation)
    await page.setInputFiles('[data-testid="file-input"]', 'tests/assets/test-document.pdf')
    await expect(page.locator('[data-testid="file-dropped"]')).toBeVisible()
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible()
  })
})
```

### 7. Integration and Navigation Testing
```typescript
// tests/automatic/personal-info/integration-tests.spec.ts  
test.describe('Personal Info - Integration Tests', () => {
  test('Patient home to personal info navigation flow', async ({ page }) => {
    await page.goto('/patient')
    
    // Click personal information tile
    await page.click('[data-testid="tile-personal-info"]')
    await expect(page).toHaveURL('/patient/persinfo')
    
    // Test overview tiles navigation
    await expect(page.locator('[data-testid="persinfo-tiles"]')).toBeVisible()
    await expect(page.locator('[data-testid="tile-profile"]')).toBeVisible()
    await expect(page.locator('[data-testid="tile-documents"]')).toBeVisible()
    
    // Navigate to profile
    await page.click('[data-testid="tile-profile"]') 
    await expect(page).toHaveURL('/patient/persinfo/profile')
    
    // Navigate to documents  
    await page.goBack()
    await page.click('[data-testid="tile-documents"]')
    await expect(page).toHaveURL('/patient/persinfo/documents')
    
    // Test mobile footer integration
    if (await page.locator('[data-testid="mobile-footer"]').isVisible()) {
      await page.click('[data-testid="mobile-footer-custom"]')
      await expect(page.locator('[data-testid="quick-menu"]')).toContainText('Profile')
    }
  })

  test('Profile completion status updates', async ({ page }) => {
    // Test that profile completion percentage updates dynamically
    await page.goto('/patient/persinfo/profile')
    await page.click('[data-testid="edit-profile"]')
    
    // Fill required fields and verify completion updates
    await page.fill('[data-testid="first-name"]', 'John')
    await page.fill('[data-testid="last-name"]', 'Doe')
    await page.fill('[data-testid="date-of-birth"]', '1990-01-01')
    
    // Should show progress update
    await expect(page.locator('[data-testid="completion-indicator"]')).toContainText('60%')
    
    // Add more fields
    await page.fill('[data-testid="phone"]', '+27821234567')
    await page.fill('[data-testid="id-number"]', '9001010001087')
    
    await expect(page.locator('[data-testid="completion-indicator"]')).toContainText('90%')
    
    // Save and verify home tile updates
    await page.click('[data-testid="save-profile"]')
    await page.goto('/patient')
    
    const persinfoTile = page.locator('[data-testid="tile-personal-info"]')
    await expect(persinfoTile.locator('[data-testid="status-text"]')).toContainText('90% complete')
  })
})
```

### 8. File Storage Compliance Testing
```typescript
// tests/automatic/personal-info/storage-compliance-tests.spec.ts
test.describe('Personal Info - Storage Compliance', () => {
  test('File encryption and GDPR compliance', async ({ page }) => {
    await page.goto('/patient/persinfo/documents/new')
    
    // Upload sensitive document  
    await page.setInputFiles('[data-testid="file-input"]', 'tests/assets/sensitive-medical-record.pdf')
    await page.fill('[data-testid="document-name"]', 'Medical Record')
    await page.selectOption('[data-testid="document-type"]', 'medical_record')
    await page.check('[data-testid="is-sensitive"]')
    await page.click('[data-testid="save-document"]')
    
    // Verify file is encrypted in storage
    const encryptionResponse = await page.request.get('/api/admin/verify-file-encryption', {
      headers: { 'Authorization': 'Bearer admin_token' }
    })
    const encryptionData = await encryptionResponse.json()
    
    expect(encryptionData.filesEncrypted).toBeTruthy()
    expect(encryptionData.encryptionMethod).toBe('AES-256')
    
    // Test GDPR right to deletion
    await page.goto('/patient/persinfo/documents')
    await page.click('[data-testid="document-item"]')
    await page.click('[data-testid="delete-document"]')
    await page.click('[data-testid="confirm-delete"]')
    
    // Verify file is completely removed from storage
    const deletionResponse = await page.request.get('/api/admin/verify-file-deletion', {
      headers: { 'Authorization': 'Bearer admin_token' }
    })
    const deletionData = await deletionResponse.json()
    
    expect(deletionData.fileCompletelyDeleted).toBeTruthy()
    expect(deletionData.noOrphanedReferences).toBeTruthy()
  })

  test('Signed URL security and expiration', async ({ page }) => {
    await page.goto('/patient/persinfo/documents')
    const documentItem = page.locator('[data-testid="document-item"]').first()
    await documentItem.click()
    
    // Get document URL
    const documentUrl = await page.getAttribute('[data-testid="document-preview"]', 'src')
    expect(documentUrl).toContain('/storage/v1/object/sign/')
    
    // Extract expiration time from URL
    const urlParams = new URLSearchParams(documentUrl.split('?')[1])
    const expiresAt = parseInt(urlParams.get('Expires'))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Verify expiration is approximately 1 hour
    const timeUntilExpiry = expiresAt - currentTime
    expect(timeUntilExpiry).toBeLessThan(3700) // <1 hour 2 minutes
    expect(timeUntilExpiry).toBeGreaterThan(3500) // >58 minutes
    
    // Test that expired URLs are regenerated
    await page.waitForTimeout(100) // Small delay
    await page.reload()
    
    const newDocumentUrl = await page.getAttribute('[data-testid="document-preview"]', 'src')
    expect(newDocumentUrl).not.toBe(documentUrl) // Should be different (regenerated)
  })
})
```

### 9. Continuous Integration Pipeline
```yaml
# .github/workflows/personal-info-storage-tests.yml
name: Personal Information Storage Testing

on:
  push:
    branches: [main]
    paths: ['**/persinfo/**', '**/storage/**']
  pull_request:
    paths: ['**/persinfo/**', '**/storage/**']
  schedule:
    - cron: '0 3 * * *' # Daily at 3 AM

jobs:
  file-upload-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test file upload security
        run: |
          npm run test:persinfo:file-security
          npm run test:persinfo:malicious-uploads
          npm run test:persinfo:user-isolation
          
  profile-management:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test profile management workflows
        run: |
          npm run test:persinfo:profile-workflow
          npm run test:persinfo:profile-picture
          npm run test:persinfo:completion-tracking
          
  document-management:
    runs-on: ubuntu-latest  
    steps:
      - uses: actions/checkout@v4
      - name: Test document management
        run: |
          npm run test:persinfo:document-upload
          npm run test:persinfo:document-search
          npm run test:persinfo:document-categorization
          
  storage-performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test storage performance and limits
        run: |
          npm run test:persinfo:concurrent-uploads
          npm run test:persinfo:storage-quotas
          npm run test:persinfo:cleanup-automation
          
  privacy-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test privacy and compliance
        run: |
          npm run test:persinfo:data-encryption
          npm run test:persinfo:gdpr-deletion
          npm run test:persinfo:access-controls
          npm run test:persinfo:audit-trails
          
  mobile-responsive:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test mobile responsiveness
        run: |
          npm run test:persinfo:mobile-profile
          npm run test:persinfo:mobile-uploads  
          npm run test:persinfo:touch-interactions
```

---

## Implementation Priorities

### Phase 1: Core Storage Infrastructure (Week 1)
- [ ] **Port storage upload API**: Exact implementation from legacy `/api/storage/upload`
- [ ] **Port file upload hook**: `useFileUpload` with validation and progress
- [ ] **Apply database migrations**: Profile and documents tables
- [ ] **Create overview page**: Personal information tiles navigation
- [ ] **Port profile picture component**: Instagram-style ProfilePictureUpload

### Phase 2: Profile Management (Week 1-2) 
- [ ] **Create profile SSR page**: Server component wrapper with data fetching
- [ ] **Port profile form**: Integration with file upload for pictures
- [ ] **Add profile completion tracking**: Dynamic percentage calculation
- [ ] **Create camera interface**: Profile picture capture workflow
- [ ] **Test profile workflow**: End-to-end profile management

### Phase 3: Document Management (Week 2)
- [ ] **Create documents list**: ListView integration with search and filters
- [ ] **Create document upload**: FileUploadFormTemplate adaptation
- [ ] **Add document categorization**: Type-based organization and security
- [ ] **Implement document viewer**: Secure preview with signed URLs
- [ ] **Add sensitive document controls**: Enhanced security for ID docs

### Phase 4: Security and Compliance (Week 2-3)
- [ ] **Implement file security service**: Malware scanning and validation
- [ ] **Add privacy controls**: Document access levels and family sharing  
- [ ] **Create audit system**: File access logging and compliance
- [ ] **Implement storage quotas**: User limits and automatic cleanup
- [ ] **Add GDPR compliance**: Right to deletion and data export

---

## Success Criteria

### Technical Requirements
- ✅ Centralized file upload system works for all file types
- ✅ Profile pictures support camera capture and file upload  
- ✅ Documents can be categorized, searched, and previewed securely
- ✅ All file storage is user-isolated with proper RLS
- ✅ Signed URLs expire properly and regenerate automatically
- ✅ File validation prevents malicious uploads

### User Experience Goals  
- ✅ Instagram-style profile picture interface
- ✅ Drag and drop document uploads with preview
- ✅ Fast search and filtering of personal documents
- ✅ Clear completion tracking for profile setup
- ✅ Mobile-optimized file upload experience
- ✅ Intuitive document categorization and organization

### Security and Compliance
- ✅ User file isolation (cannot access other users' files)
- ✅ Sensitive document protection with enhanced security
- ✅ Automatic file cleanup and storage quota management
- ✅ GDPR compliance with right to deletion
- ✅ Comprehensive audit trail for file access
- ✅ Encrypted storage for sensitive documents

---

**IMPLEMENTATION READY**: This specification provides a complete roadmap to implement personal information storage and file uploads by adapting the proven centralized storage system from legacy code to our current SSR architecture. The legacy implementation provides excellent patterns for secure file handling, profile picture management, and document organization - we just need to modernize the presentation layer and integrate with our current design system.