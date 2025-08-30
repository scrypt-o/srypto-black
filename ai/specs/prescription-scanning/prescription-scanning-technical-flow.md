# Prescription Scanning - Technical Flow Deep Dive

## Complete Data Flow with Code References

### 1. Navigation to Scan Page

**User Path:**
```
Home (/home) 
→ Click "Prescriptions" tile
→ Prescriptions overview (/prescriptions) 
→ Click "Scan Script" tile
→ Scan page (/prescriptions/scan)
```

**Components Involved:**
- `/app/(authenticated)/home/page.tsx` - Home tiles
- `/components/features/HomeSection.tsx` - Tiles layout
- `/app/(authenticated)/prescriptions/page.tsx` - Prescriptions overview
- `/components/features/prescriptions/PrescriptionsTiles.tsx` - Scan/View tiles
- `/app/(authenticated)/prescriptions/scan/page.tsx` - Scan page wrapper

### 2. Camera Initialization Flow

**Page Load Sequence:**

```typescript
// /app/(authenticated)/prescriptions/scan/page.tsx
export default function ScanPage() {
  return <ScanCapture />
}

// /components/features/scanning/ScanCapture.tsx
useEffect(() => {
  startCamera() // Immediate camera start
  return () => {
    stopCamera()
  }
}, [])
```

**Camera Hook Flow:**

```typescript
// /hooks/useCamera.ts
const startCamera = async () => {
  // 1. Check browser support
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraError(ERROR_MESSAGES.CAMERA_NOT_SUPPORTED)
    return
  }

  // 2. Request camera stream
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: false
  })

  // 3. Attach to video element
  if (videoRef.current) {
    videoRef.current.srcObject = stream
  }
}
```

### 3. Image Capture Flow

**Capture from Camera:**

```typescript
// User clicks capture button
handleCapture() {
  // 1. Use canvas to capture frame
  const canvas = canvasRef.current
  const video = videoRef.current
  
  // 2. Draw video frame to canvas
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // 3. Convert to base64
  const imageData = canvas.toDataURL('image/jpeg', 0.9)
  
  // 4. Update state
  setCapturedImage(imageData)
  stopCamera()
}
```

**Upload from File:**

```typescript
// User selects file
handleFileUpload(file: File) {
  // 1. Read file
  const reader = new FileReader()
  reader.readAsDataURL(file)
  
  // 2. Process when loaded
  reader.onload = () => {
    const imageData = reader.result as string
    setCapturedImage(imageData)
  }
}
```

### 4. Image Upload to Storage

**Upload Flow:**

```typescript
// User clicks "Submit for Processing"
handleSubmitForProcessing() {
  // 1. Convert base64 to file
  const file = dataURLToFile(capturedImage, 'prescription.jpg')
  
  // 2. Upload to storage
  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    body: JSON.stringify({
      file: capturedImage,
      fileName: `prescription_${Date.now()}.jpg`,
      fileType: 'image/jpeg',
      bucket: 'prescription-images'
    })
  })
  
  // 3. Get storage path
  const { data } = await response.json()
  setUploadedPath(data.path) // e.g., "user_id/timestamp_filename.jpg"
}
```

**Storage API Handler:**

```typescript
// /app/api/storage/upload/route.ts
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const { supabase, user } = await getAuthenticatedServerClient()
  
  // 2. Parse request
  const { file, fileName, fileType, bucket } = await request.json()
  
  // 3. Convert base64 to buffer
  const base64Data = file.split(',')[1]
  const buffer = Buffer.from(base64Data, 'base64')
  
  // 4. Upload to Supabase
  const storagePath = `${user.id}/${Date.now()}_${fileName}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: fileType,
      upsert: false
    })
  
  // 5. Create signed URL (optional)
  const { data: signedUrl } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 3600)
  
  return NextResponse.json({ data: { path: storagePath, url: signedUrl } })
}
```

### 5. AI Analysis Flow

**Analysis Request:**

```typescript
// Continue from handleSubmitForProcessing
const analysisResponse = await fetch('/api/prescriptions/analyze', {
  method: 'POST',
  body: JSON.stringify({
    uploadedPath: uploadedPath,
    save: false // Just analyze, don't save yet
  })
})

const result = await analysisResponse.json()
setAnalysisResult(result)
```

**Analysis API Handler:**

```typescript
// /app/api/prescriptions/analyze/route.ts
export async function POST(request: NextRequest) {
  // 1. Get uploaded image path
  const { uploadedPath, save, analysisResult } = await request.json()
  
  if (!save) {
    // 2. Fetch image from storage
    const { data: imageData } = await supabase.storage
      .from('prescription-images')
      .download(uploadedPath)
    
    // 3. Convert to base64 for OpenAI
    const base64 = Buffer.from(await imageData.arrayBuffer()).toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64}`
    
    // 4. Call OpenAI Vision API
    const analysis = await analyzePrescriptionWithOpenAI({
      imageBase64: dataUrl,
      userContext: { userId: user.id }
    })
    
    // 5. Return analysis
    return NextResponse.json(analysis)
  }
}
```

**OpenAI Integration:**

```typescript
// /lib/services/medical-analysis-service.ts
export async function analyzePrescriptionWithOpenAI({
  imageBase64,
  userContext
}: AnalyzeParams) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: MEDICAL_ANALYSIS_CONFIG.prescriptionAnalysis.systemPrompt
        },
        {
          type: "image_url",
          image_url: {
            url: imageBase64,
            detail: "high"
          }
        }
      ]
    }],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1000
  })
  
  return JSON.parse(response.choices[0].message.content)
}
```

### 6. Save to Database Flow

**Save Request:**

```typescript
// User clicks "Save"
handleSave() {
  const saveResponse = await fetch('/api/prescriptions/analyze', {
    method: 'POST',
    body: JSON.stringify({
      uploadedPath: uploadedPath,
      save: true,
      analysisResult: analysisResult
    })
  })
  
  // Redirect to list view
  router.push('/prescriptions/view')
}
```

**Database Save:**

```typescript
// In analyze API when save=true
if (save && analysisResult) {
  // Transform AI result to database format
  const prescriptionData = {
    user_id: user.id,
    image_url: uploadedPath,
    patient_name: analysisResult.patientName,
    patient_surname: analysisResult.patientSurname,
    dr_name: analysisResult.doctorName?.split(' ')[0] || 'Dr.',
    dr_surname: analysisResult.doctorName?.split(' ').slice(1).join(' ') || '',
    practice_number: analysisResult.practiceNumber,
    prescription_date: analysisResult.issueDate,
    condition_diagnosed: analysisResult.diagnosis,
    medications_prescribed: analysisResult.medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      strength: med.dosage,
      frequency: med.frequency,
      timesPerDay: med.timesPerDay,
      duration: med.duration,
      instructions: med.instructions,
      repeats: med.repeats || 0,
      confidence: 95
    })),
    extracted_text: `Scanned on ${new Date().toISOString()}`,
    status: 'active',
    is_active: true
  }
  
  // Insert to database
  const { data: prescription, error } = await supabase
    .from('patient_prescriptions')
    .insert(prescriptionData)
    .select()
    .single()
  
  return NextResponse.json({ prescription })
}
```

### 7. View Prescriptions List

**List Component:**

```typescript
// /components/features/scanning/ScanHistory.tsx
const fetchScans = async () => {
  // 1. Build query
  const url = `/api/prescriptions?has_scan=true`
  
  // 2. Fetch data
  const response = await fetch(url)
  const { data } = await response.json()
  
  // 3. Transform for display
  const scanItems = data
    .filter(p => p.image_url)
    .map(p => ({
      id: p.prescription_id,
      patient_name: p.patient_name,
      doctor_name: `${p.dr_name} ${p.dr_surname}`,
      thumbnail_url: p.image_url,
      created_at: p.created_at
    }))
  
  setScans(scanItems)
}
```

**List API:**

```typescript
// /app/api/prescriptions/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hasScan = searchParams.get('has_scan')
  
  let query = supabase
    .from('patient_prescriptions')
    .select('*')
    .eq('user_id', user.id)
  
  if (hasScan === 'true') {
    query = query.not('image_url', 'is', null)
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
  
  return NextResponse.json({ data })
}
```

### 8. View Single Prescription

**Detail View:**

```typescript
// /app/(authenticated)/prescriptions/[id]/page.tsx
const prescription = await fetch(`/api/prescriptions/${params.id}`)

// Display using PrescriptionDetail component
<PrescriptionDetail prescription={prescription} />
```

**Image Display:**

```typescript
// Image served through secure API
<img 
  src={`/api/files/prescriptions/${prescription.prescription_id}`}
  alt="Prescription scan"
/>

// API route handles authentication and serves image
// /app/api/files/prescriptions/[id]/route.ts
```

---

## State Management Flow

### Component State Timeline

```
1. Initial Load
   - capturedImage: null
   - isProcessing: false
   - analysisResult: null
   - uploadedPath: null

2. After Capture/Upload
   - capturedImage: "data:image/jpeg;base64,..."
   - isProcessing: false
   - analysisResult: null
   - uploadedPath: null

3. During Upload
   - capturedImage: "data:image/jpeg;base64,..."
   - isProcessing: true
   - analysisResult: null
   - uploadedPath: null

4. After Upload
   - capturedImage: "data:image/jpeg;base64,..."
   - isProcessing: true
   - analysisResult: null
   - uploadedPath: "user_id/timestamp_filename.jpg"

5. During Analysis
   - capturedImage: "data:image/jpeg;base64,..."
   - isProcessing: true
   - analysisResult: null
   - uploadedPath: "user_id/timestamp_filename.jpg"

6. After Analysis
   - capturedImage: "data:image/jpeg;base64,..."
   - isProcessing: false
   - analysisResult: { isPrescription: true, ... }
   - uploadedPath: "user_id/timestamp_filename.jpg"

7. After Save
   - Redirect to /prescriptions/view
```

---

## Error Handling Chain

### Camera Errors
```
getUserMedia fails
→ Error mapped to user-friendly message
→ Show file upload fallback
→ Continue with upload flow
```

### Upload Errors
```
Storage upload fails
→ Show error toast
→ Allow retry
→ Keep captured image in state
```

### Analysis Errors
```
OpenAI API fails
→ Show error message
→ Allow re-scan
→ Don't lose uploaded image
```

### Save Errors
```
Database insert fails
→ Show error
→ Keep analysis result
→ Allow retry save
```

---

## Performance Considerations

### Image Compression
- Capture at 0.9 JPEG quality
- Resize to max 1920x1080 before upload
- Compress further if > 5MB

### API Optimization
- Stream image data where possible
- Use signed URLs with expiry
- Cache analysis results temporarily

### State Management
- Clear large image data after upload
- Use refs for video/canvas elements
- Cleanup streams on unmount

---

## Security Flow

### Authentication
1. Middleware checks auth on page load
2. API routes verify user session
3. Database RLS policies enforce ownership

### Data Protection
1. Images uploaded to user-specific paths
2. Signed URLs expire after 1 hour
3. API routes validate user ownership before serving

### Fraud Prevention
1. No manual editing of extracted data
2. All changes require new scan
3. Audit trail of all scans maintained

---

## Debugging Guide

### Common Issues

**Camera Not Starting**
```javascript
// Check console for:
navigator.mediaDevices // Should exist
// If undefined, not on HTTPS

// Check permissions
navigator.permissions.query({ name: 'camera' })
  .then(result => console.log(result.state))
```

**Upload Failing**
```javascript
// Check network tab for:
// - Request payload size
// - Response status code
// - CORS headers

// Verify storage bucket
supabase.storage.from('prescription-images').list()
```

**Analysis Not Working**
```javascript
// Check OpenAI response
console.log('OpenAI Response:', response)

// Verify API key
console.log('API Key exists:', !!process.env.OPENAI_API_KEY)

// Check image format
console.log('Image size:', imageBase64.length)
```

**Save Failing**
```javascript
// Check database permissions
SELECT * FROM patient_prescriptions 
WHERE user_id = 'current_user_id';

// Verify RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'patient_prescriptions';
```

---

## Testing Scripts

### Camera Permission Test
```javascript
// Run in browser console
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Camera access granted')
    stream.getTracks().forEach(track => track.stop())
  })
  .catch(err => console.error('Camera error:', err))
```

### Storage Upload Test
```javascript
// Test file upload
const testUpload = async () => {
  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: 'data:image/jpeg;base64,/9j/4AAQ...',
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      bucket: 'prescription-images'
    })
  })
  console.log(await response.json())
}
```

### Analysis Test
```javascript
// Test AI analysis
const testAnalysis = async () => {
  const response = await fetch('/api/prescriptions/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uploadedPath: 'test/image.jpg',
      save: false
    })
  })
  console.log(await response.json())
}
```