# Pharmacy Portal Specification
**Version**: 1.0  
**Date**: 2025-08-31  
**Purpose**: Complete specification for pharmacy portal rebuild  

---

## 📋 Executive Summary

The Pharmacy Portal is a comprehensive web application that enables pharmacy staff to manage incoming prescriptions, verify prescription data, create quotations, and fulfill patient orders. The system integrates with an AI prescription scanning system and provides a competitive marketplace where multiple pharmacies can bid on prescriptions.

---

## 🏗️ System Architecture

### High-Level Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pharmacy      │    │   Prescription  │    │   Patient       │
│   Dashboard     │◄──►│   Processing    │◄──►│   Interface     │
│                 │    │   Engine        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Staff         │    │   Quote         │    │   Communication│
│   Management    │    │   Generator     │    │   System       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack Requirements
- **Frontend**: React/Next.js with TypeScript
- **Backend**: API routes with authentication middleware
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: WebSocket connections for live updates
- **File Storage**: Secure image storage with signed URLs
- **Authentication**: Role-based access control (Pharmacy vs Patient)

---

## 🎯 Core User Personas

### Primary Persona: Pharmacy Dispensing Technician
- **Role**: Reviews incoming prescriptions, verifies AI-extracted data
- **Goals**: Efficiently process prescriptions, ensure accuracy, minimize errors
- **Pain Points**: Illegible handwriting, incomplete patient information, stock checking

### Secondary Persona: Senior Pharmacist
- **Role**: Approves quotations, handles complex cases, manages staff
- **Goals**: Ensure compliance, maximize revenue, maintain quality standards
- **Pain Points**: Regulatory compliance, managing workload, staff training

### Tertiary Persona: Pharmacy Manager
- **Role**: Oversees operations, manages pharmacy profiles, reviews reports
- **Goals**: Optimize operations, track performance, manage multiple locations
- **Pain Points**: Multi-location management, staff coordination, inventory control

---

## 🖥️ User Interface Specification

### Main Dashboard Layout

#### Header Component
```
┌─────────────────────────────────────────────────────────────────┐
│ [🏥 Pharmacy Logo] [Pharmacy Name]           [👤 User] [⚙️ Menu] │
│                                                                 │
│ Managing: [Pharmacy Name 1, Pharmacy Name 2]                    │
└─────────────────────────────────────────────────────────────────┘
```

**Requirements**:
- Display current user name and role
- Show all pharmacies the user is assigned to
- Quick access to settings and logout
- Real-time notification badge for urgent items

#### Main Tile Grid (3x4 Grid Layout)
```
┌─────────────────────────────────────────────────────────────────┐
│  PRESCRIPTION MANAGEMENT                                        │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │[📥] Inbox   │  │[👁️] Reviewing │  │[✅] Verified │           │
│  │New: 12      │  │Active: 5    │  │Ready: 8     │           │
│  │Urgent: 3    │  │Overdue: 1   │  │Today: 15    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │[📤] Quoted  │  │[⏱️] Pending  │  │[✅] Accepted│           │
│  │Sent: 6      │  │Response: 4  │  │Payment: 3   │           │
│  │Modified: 2  │  │Expire: 2h   │  │Dispensing: 5│           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  PHARMACY OPERATIONS                                            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │[👥] Staff   │  │[📦] Inventory│  │[💰] POS     │           │
│  │Management   │  │Stock Levels │  │Daily Sales  │           │
│  │Active: 8    │  │Low: 15 items│  │R 12,450     │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │[🏷️] Deals   │  │[📊] Reports │  │[⚙️] Settings│           │
│  │Active: 5    │  │Analytics    │  │Configure    │           │
│  │Expiring: 2  │  │Performance  │  │Preferences  │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

**Tile Specifications**:
- Each tile: 200px × 150px minimum
- Hover effects with subtle elevation
- Badge overlays for counts and urgent items
- Color coding: Red (urgent), Amber (attention), Green (good), Blue (neutral)
- Click navigation to respective modules

---

## 📥 Prescription Inbox Module

### Inbox List View
```
┌─────────────────────────────────────────────────────────────────┐
│ INCOMING PRESCRIPTIONS                          [🔍] [📋] [⚙️]    │
├─────────────────────────────────────────────────────────────────┤
│ Filters: [All ▼] [Today] [Urgent] [Overdue]   Sort: [Time ▼]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚠️  HIGH PRIORITY                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [📄] Script #SC2025-001  👤 Jane Smith (ID: 8205050088083)  │ │
│ │      📅 Received: 2h ago  ⏱️  Due: 4h remaining           │ │
│ │      💊 3 medications    🏥 Dr. Adams (PR12345)            │ │
│ │      🎯 AI Confidence: 94% ✅ Ready for Review              │ │
│ │                                    [Accept] [View] [Defer] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 📋 NORMAL                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [📄] Script #SC2025-002  👤 John Doe (ID: 8001015009087)   │ │
│ │      📅 Received: 4h ago  ⏱️  Due: 2h remaining           │ │
│ │      💊 2 medications    🏥 Dr. Brown (PR54321)            │ │
│ │      🎯 AI Confidence: 87% ⚠️  Needs Attention             │ │
│ │                                    [Accept] [View] [Defer] │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Functional Requirements**:
- Real-time updates when new prescriptions arrive
- Priority sorting based on urgency and medical conditions
- AI confidence score display (Green: >90%, Amber: 70-90%, Red: <70%)
- Batch actions for multiple prescriptions
- Search functionality by patient name, script number, doctor
- Filter by date range, priority, confidence level
- Auto-refresh every 30 seconds

---

## 🔍 Prescription Review Interface

### Split-Screen Review Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ PRESCRIPTION REVIEW - Script #SC2025-001                        │
│ Patient: Jane Smith | Dr: Adams | Status: Reviewing             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────┐ │ ┌─────────────────────────────────────┐ │
│ │  ORIGINAL IMAGE     │ │ │  EXTRACTED DATA                     │ │
│ │                     │ │ │                                     │ │
│ │  [📷 Prescription   │ │ │  👤 PATIENT INFORMATION             │ │
│ │   Image with        │ │ │  Name: Jane Smith ✅               │ │
│ │   zoom controls]    │ │ │  ID: 8205050088083 ✅              │ │
│ │                     │ │ │  Medical Aid: Discovery Health ⚠️   │ │
│ │  🔍 [Zoom In]       │ │ │  Number: 1234567890 [Edit]         │ │
│ │  🔍 [Zoom Out]      │ │ │                                     │ │
│ │  🖱️ [Pan Tool]      │ │ │  🏥 PRESCRIBER                      │ │
│ │  🔄 [Rotate]        │ │ │  Dr: Adams ✅                      │ │
│ │                     │ │ │  Practice: PR12345 ✅              │ │
│ │                     │ │ │  Phone: [Not detected] [Add]       │ │
│ │                     │ │ │                                     │ │
│ │                     │ │ │  💊 MEDICATIONS                     │ │
│ │                     │ │ │  ┌─────────────────────────────────┐ │ │
│ │                     │ │ │  │Med 1: Atorvastatin 20mg    ✅ │ │ │
│ │                     │ │ │  │Qty: 28    Days: 28        ✅ │ │ │
│ │                     │ │ │  │Instructions: 1 daily after ✅ │ │ │
│ │                     │ │ │  │Generic Available: Yes [⚙️]     │ │ │
│ │                     │ │ │  │Stock Status: In Stock [🟢]    │ │ │
│ │                     │ │ │  └─────────────────────────────────┘ │ │
│ └─────────────────────┘ │ └─────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💬 NOTES & COMMUNICATION                                    │ │
│ │ [Text area for pharmacy notes]                              │ │
│ │                                                            │ │
│ │ 📤 Message to Patient: [Dropdown: Template Messages ▼]     │ │
│ │ [Save Draft] [Confirm All] [Request Clarification] [Reject]│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Technical Requirements**:
- Image viewer with zoom, pan, rotate functionality
- Side-by-side comparison with extracted data
- Real-time validation against pharmacy database
- Stock level checking integration
- Generic substitution suggestions
- Confidence indicators for each field
- Inline editing capabilities
- Auto-save draft functionality

---

## 💰 Quotation Generation System

### Quote Builder Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ CREATE QUOTATION - Script #SC2025-001                          │
│ Patient: Jane Smith | Total Items: 3 | Est. Value: R 623.10    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📋 PRESCRIPTION ITEMS                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Item 1: Atorvastatin 20mg × 28                             │ │
│ │ ├─ Original: R 123.45                                      │ │
│ │ ├─ Generic: Atorsave 20mg × 28 [R 89.95] [Select] 💰      │ │
│ │ ├─ Medical Aid: R 23.45 | Co-pay: R 100.00               │ │
│ │ └─ Your Price: [R 89.95] Margin: 15% [Adjust ▼]          │ │
│ │                                                            │ │
│ │ Item 2: Metformin 500mg × 28                              │ │
│ │ ├─ Stock: ✅ Available (142 units)                        │ │
│ │ ├─ Medical Aid: R 150.50 | Co-pay: R 150.25             │ │
│ │ └─ Your Price: [R 300.75] Margin: 12% [Adjust ▼]        │ │
│ │                                                            │ │
│ │ Item 3: Lisinopril 10mg × 14                             │ │
│ │ ├─ Cash Sale Only (No Medical Aid Benefit)                │ │
│ │ └─ Your Price: [R 199.90] Margin: 20% [Adjust ▼]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 🎁 VALUE-ADDED SERVICES                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑️ Free Home Delivery (within 5km)        + R 0.00        │ │
│ │ ☐ Express Delivery (within 2 hours)       + R 45.00       │ │
│ │ ☑️ Medication Adherence Pack               + R 25.00       │ │
│ │ ☐ Blood Pressure Check                    + R 15.00       │ │
│ │ ☐ Diabetic Counseling Session             + R 50.00       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💳 PAYMENT & DELIVERY                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Payment Methods: ☑️ Medical Aid ☑️ Cash ☑️ Card ☐ EFT      │ │
│ │ Collection Time: [Today 4PM ▼] [Tomorrow 9AM ▼]           │ │
│ │ Delivery Option: [Same Day R45] [Next Day Free] [Collect]  │ │
│ │ Special Instructions: [Text area]                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ QUOTATION SUMMARY                                          │ │
│ │ ├─ Subtotal: R 590.60                                     │ │
│ │ ├─ Services: R 25.00                                      │ │
│ │ ├─ Delivery: R 0.00                                       │ │
│ │ ├─ VAT (15%): R 92.34                                     │ │
│ │ └─ TOTAL: R 707.94                                        │ │
│ │                                                            │ │
│ │ [Save Draft] [Send to Patient] [Print] [Email Copy]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Business Logic Requirements**:
- Dynamic pricing with configurable margins
- Automatic generic substitution suggestions
- Medical aid benefit calculation
- Real-time stock checking
- Value-added service catalog
- Delivery zone calculation
- Tax calculation (configurable by region)
- Profit margin analysis

---

## 📊 Status Tracking System

### Prescription Lifecycle States
```
┌─────────────────────────────────────────────────────────────────┐
│ PRESCRIPTION STATUS PIPELINE                                    │
│                                                                 │
│ [📥] → [👁️] → [✅] → [💰] → [📤] → [⏱️] → [✅] → [💳] → [🚚] → [✅] │
│ Inbox Review Verify Quote  Send  Wait Accept Pay  Ship Complete │
│                                                                 │
│ Status Descriptions:                                            │
│ • received: New prescription in inbox                           │
│ • reviewing: Pharmacist actively checking                       │
│ • verified: All data confirmed, ready for quote                │
│ • quoted: Price sent to patient                                │
│ • sent_to_patient: Quote delivered, awaiting response          │
│ • patient_query: Patient asked questions                       │
│ • accepted: Patient selected this pharmacy                     │
│ • payment_received: Ready for dispensing                       │
│ • dispensing: Preparing medications                            │
│ • ready_collection: Awaiting pickup                            │
│ • out_for_delivery: Driver assigned                            │
│ • completed: Transaction finished                              │
│ • rejected: Patient chose different pharmacy                   │
│ • expired: Quote timeout exceeded                              │
└─────────────────────────────────────────────────────────────────┘
```

### Status Dashboard Widget
```
┌─────────────────────────────────────────────────────────────────┐
│ TODAY'S WORKFLOW STATUS                    📅 2025-08-31       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚡ URGENT ACTIONS REQUIRED                                      │
│ • 3 prescriptions overdue for review (>4 hours)                │
│ • 2 quotes expiring in next hour                               │
│ • 1 stock shortage affecting active quote                      │
│                                                                 │
│ 📈 DAILY METRICS                                               │
│ • Received: 47 | Processed: 31 | Pending: 16                  │
│ • Quotes Sent: 28 | Accepted: 12 | Rejected: 8               │
│ • Revenue: R 15,234 | Profit Margin: 18.5%                    │
│                                                                 │
│ ⏱️ AVERAGE PROCESSING TIMES                                     │
│ • Review to Quote: 24 minutes (Target: 30min)                 │
│ • Quote to Response: 3.2 hours (Target: 4hrs)                 │
│ • Payment to Dispatch: 45 minutes (Target: 60min)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 Staff Management Module

### Staff Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ STAFF MANAGEMENT                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 👤 ACTIVE STAFF (8 online)                     [+ Add Staff]    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟢 Dr. Sarah Wilson (Senior Pharmacist)                     │ │
│ │    📊 Today: 12 reviews, 8 approvals | Shift: 08:00-17:00  │ │
│ │    🎯 Efficiency: 94% | Quality Score: 98%                 │ │
│ │    [View Performance] [Assign Tasks] [Message]              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟡 Mike Johnson (Dispensing Technician)                     │ │
│ │    📊 Today: 18 processed, 2 pending | Shift: 09:00-18:00  │ │
│ │    🎯 Efficiency: 87% | Quality Score: 92%                 │ │
│ │    ⚠️ Assigned: 5 urgent prescriptions                      │ │
│ │    [View Performance] [Assign Tasks] [Message]              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 📋 ROLE ASSIGNMENTS                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Prescription Review: Dr. Wilson, Lisa Chen                  │ │
│ │ Quote Generation: Mike Johnson, Tom Brown                   │ │
│ │ Dispensing: All qualified staff                             │ │
│ │ Customer Service: Reception team                            │ │
│ │ [Edit Assignments] [View Schedule] [Performance Report]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Staff Management Features**:
- Role-based permissions (Senior Pharmacist, Technician, Assistant)
- Performance tracking and analytics
- Task assignment and workload balancing
- Real-time status monitoring
- Shift management and scheduling
- Training progress tracking
- Quality assurance scoring

---

## 💬 Communication System

### Patient-Pharmacy Messaging
```
┌─────────────────────────────────────────────────────────────────┐
│ MESSAGE THREAD - Script #SC2025-001 | Jane Smith               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 👤 Jane Smith                                    📅 10:30 AM    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Hi, I have a question about the generic substitute for      │ │
│ │ my cholesterol medication. Is it as effective?             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💊 Clicks Pavilion Pharmacy                     📅 10:45 AM    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Good morning Jane! Yes, the generic version (Atorsave)     │ │
│ │ contains the same active ingredient as the original brand.  │ │
│ │ It's equally effective and will save you R33.50.           │ │
│ │                                                            │ │
│ │ Would you like me to update your quote with the generic?   │ │
│ │ [Update Quote v2] [Keep Original] [Call Me]               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 👤 Jane Smith                                    📅 10:47 AM    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Yes please, update with the generic option.                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📝 Quick Responses:                                        │ │
│ │ [Thank you message] [Quote updated] [Call to discuss]     │ │
│ │                                                            │ │
│ │ 💬 Type your message: [Text area]                         │ │
│ │ 📎 [Attach File] [Send Quote v2] [Schedule Call] [Send]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Communication Features**:
- Real-time messaging with typing indicators
- Template responses for common questions
- File attachment support (images, documents)
- Quote versioning and inline updates
- Call scheduling integration
- Message read receipts
- Auto-responses for after hours
- Escalation to senior pharmacist

---

## 🔒 Security & Compliance

### Authentication & Authorization
```typescript
// Role-based access control specification
interface PharmacyRole {
  name: 'senior_pharmacist' | 'pharmacist' | 'technician' | 'assistant';
  permissions: Permission[];
  restrictions: Restriction[];
}

interface Permission {
  action: 'read' | 'write' | 'approve' | 'delete';
  resource: 'prescriptions' | 'quotes' | 'staff' | 'reports';
  conditions?: string[];
}

// Example role definitions
SeniorPharmacist: {
  permissions: ['all_prescriptions:read', 'all_quotes:approve', 'staff:manage'],
  restrictions: ['financial_reports:owner_only']
}

Technician: {
  permissions: ['assigned_prescriptions:read', 'quotes:create'],
  restrictions: ['controlled_substances:senior_approval_required']
}
```

### Data Privacy Requirements
- **HIPAA Compliance**: All patient data encrypted at rest and in transit
- **Audit Logging**: Complete activity trail for all user actions
- **Data Retention**: Configurable retention periods by data type
- **Access Controls**: Role-based permissions with principle of least privilege
- **Session Management**: Automatic timeout, secure token handling
- **File Security**: Prescription images in private buckets with signed URLs

---

## 📱 Mobile Responsiveness

### Mobile Dashboard Layout
```
┌─────────────────┐
│ 🏥 [Menu] [User]│
├─────────────────┤
│                 │
│ 📊 Quick Stats  │
│ Inbox: 12       │
│ Urgent: 3       │
│ Today: R15,234  │
│                 │
├─────────────────┤
│                 │
│ 🔥 URGENT       │
│ ┌─────────────┐ │
│ │ Script #001 │ │
│ │ Jane Smith  │ │
│ │ 2h overdue  │ │
│ │ [View] [Accept]│ │
│ └─────────────┘ │
│                 │
│ 📋 TODAY        │
│ ┌─────────────┐ │
│ │ Script #002 │ │
│ │ John Doe    │ │
│ │ 30min ago   │ │
│ │ [View] [Accept]│ │
│ └─────────────┘ │
│                 │
└─────────────────┘
```

**Mobile-Specific Requirements**:
- Touch-optimized interfaces with minimum 44px touch targets
- Swipe gestures for common actions (accept, defer, view)
- Progressive Web App (PWA) capabilities
- Offline support for viewing cached prescriptions
- Push notifications for urgent prescriptions
- Voice-to-text for notes and messages
- Barcode scanning for medication verification

---

## 🔔 Notification System

### Real-Time Notifications
```
┌─────────────────────────────────────────────────────────────────┐
│ NOTIFICATION CENTER                                    [🔕 All]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🚨 HIGH PRIORITY (3)                                           │
│ • Prescription #SC2025-001 overdue for review (4h)             │
│ • Stock shortage: Metformin 500mg (2 units remaining)          │
│ • Quote #Q2025-045 expires in 30 minutes                      │
│                                                                 │
│ 💬 MESSAGES (2)                                                │
│ • Jane Smith replied to prescription query                     │
│ • Dr. Adams sent prescription amendment                        │
│                                                                 │
│ ✅ UPDATES (5)                                                 │
│ • Quote #Q2025-044 accepted by patient                        │
│ • Payment received for Script #SC2025-040                     │
│ • Delivery completed for Script #SC2025-038                   │
│                                                                 │
│ ⚙️ SYSTEM (1)                                                  │
│ • Daily backup completed successfully                          │
└─────────────────────────────────────────────────────────────────┘
```

**Notification Types & Triggers**:
- **Urgent**: Overdue prescriptions, stock shortages, system errors
- **Important**: New prescriptions, quote responses, payment confirmations  
- **Informational**: Status updates, completion notifications, system maintenance
- **Personal**: Direct messages, task assignments, performance updates

---

## 📊 Reporting & Analytics

### Performance Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ PHARMACY PERFORMANCE ANALYTICS                   📅 This Month   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📈 KEY METRICS                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│ │ Total Scripts   │ │ Revenue         │ │ Win Rate        │   │
│ │ 1,247          │ │ R 456,890       │ │ 67%            │   │
│ │ ↗️ +12% vs last │ │ ↗️ +8% vs last  │ │ ↗️ +3% vs last │   │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│ 📊 PROCESSING TIMES                                            │
│ • Average Review Time: 18 minutes (↓ 2min vs target)          │
│ • Quote Generation: 8 minutes (↑ 1min vs target)              │
│ • Patient Response: 2.8 hours (↓ 0.4hrs vs last month)        │
│                                                                 │
│ 💰 FINANCIAL PERFORMANCE                                       │
│ • Gross Margin: 22.5% (Target: 20%)                          │
│ • Average Order Value: R 367                                  │
│ • Generic Substitution Rate: 78%                              │
│                                                                 │
│ 🎯 QUALITY METRICS                                             │
│ • Customer Satisfaction: 4.6/5.0                              │
│ • Error Rate: 0.8% (Target: <1%)                             │
│ • First-Time Resolution: 94%                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Report Types**:
- Daily Operations Summary
- Weekly Performance Review  
- Monthly Financial Analysis
- Staff Productivity Reports
- Customer Satisfaction Surveys
- Inventory Turn Analysis
- Compliance Audit Reports

---

## 🔧 Technical Implementation Notes

### Database Schema Requirements
```sql
-- Core tables specification
tables_required = [
  'pharmacy_profiles',           -- Pharmacy information
  'pharmacy_staff',             -- Staff management
  'pharmacy_staff_roles',       -- Role definitions
  'prescriptions',              -- Main prescription records
  'prescription_medications',    -- Individual medication items
  'prescription_status_history', -- Status change tracking
  'prescription_quotes',        -- Quote versions
  'prescription_messages',      -- Patient-pharmacy communication
  'stock_levels',               -- Inventory management
  'medication_catalog',         -- Master medication list
  'generic_substitutes',        -- Generic alternatives
  'medical_aid_schemes',        -- Insurance coverage
  'delivery_zones',             -- Geographic coverage
  'value_added_services',       -- Additional services catalog
  'performance_metrics'         -- Analytics and KPIs
]
```

### API Endpoint Structure
```
/api/pharmacy/
├── dashboard/                 # GET - Main dashboard data
├── prescriptions/
│   ├── inbox/                # GET - Incoming prescriptions
│   ├── [id]/
│   │   ├── review/           # GET/POST - Review interface
│   │   ├── quote/            # GET/POST - Quote generation
│   │   ├── accept/           # POST - Accept prescription
│   │   └── messages/         # GET/POST - Communication
│   └── by-status/[status]/   # GET - Status-filtered lists
├── staff/
│   ├── assignments/          # GET/POST - Staff assignments
│   ├── performance/          # GET - Performance metrics
│   └── schedule/             # GET/POST - Shift management
├── inventory/
│   ├── stock-levels/         # GET - Current inventory
│   ├── low-stock/            # GET - Items needing reorder
│   └── substitutes/          # GET - Generic alternatives
├── reports/
│   ├── daily/                # GET - Daily summaries
│   ├── performance/          # GET - KPI reports
│   └── financial/            # GET - Revenue analysis
└── settings/
    ├── profile/              # GET/POST - Pharmacy settings
    ├── notifications/        # GET/POST - Alert preferences
    └── integrations/         # GET/POST - Third-party APIs
```

### Real-Time Updates
```typescript
// WebSocket event types
interface WebSocketEvent {
  type: 'new_prescription' | 'status_change' | 'message_received' | 
        'stock_alert' | 'quote_expired' | 'payment_received';
  payload: any;
  pharmacy_id: string;
  user_id?: string;
  timestamp: string;
}

// Real-time update scenarios
scenarios = {
  new_prescription: 'Update inbox count, show notification',
  status_change: 'Update prescription card, refresh metrics',
  message_received: 'Show chat notification, update message count',
  stock_alert: 'Display low stock warning, update inventory',
  quote_expired: 'Move to expired section, update statistics',
  payment_received: 'Move to dispensing queue, update revenue'
}
```

---

## 🎯 Success Criteria

### Functional Requirements
✅ **Prescription Processing**
- Process 100+ prescriptions per day per pharmacy
- <30 minute average review time
- >95% data accuracy from AI extraction
- <2% error rate in final dispensing

✅ **User Experience**  
- <3 second page load times
- Mobile-responsive design
- Intuitive navigation with <5 clicks to any function
- 24/7 uptime with <1% downtime

✅ **Business Metrics**
- 20%+ profit margins
- >60% quote acceptance rate
- <4 hour quote response time
- >90% customer satisfaction

### Performance Requirements
- Support 50+ concurrent users per pharmacy
- Handle 1000+ prescriptions per pharmacy per month
- Real-time notifications with <5 second delay
- Secure data handling with encryption at rest/transit
- Automated backups with 99.9% data integrity

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
- Authentication and role management
- Basic prescription inbox
- Simple review interface
- Essential API endpoints

### Phase 2: Advanced Features (Weeks 3-4)
- Quote generation system
- Real-time notifications
- Staff management module
- Mobile optimization

### Phase 3: Integration & Polish (Weeks 5-6)
- Third-party integrations (payment, delivery)
- Advanced analytics and reporting  
- Performance optimization
- Security hardening

### Phase 4: Testing & Deployment (Weeks 7-8)
- End-to-end testing
- User acceptance testing
- Performance testing
- Production deployment

---

**End of Specification**

`★ Implementation Insight ─────────────────────────────────────`
This specification provides a complete blueprint for building a modern, scalable pharmacy portal. The design emphasizes user experience, real-time functionality, and business efficiency while maintaining strict security and compliance standards. The modular architecture allows for incremental development and easy maintenance.
`─────────────────────────────────────────────────────────────`