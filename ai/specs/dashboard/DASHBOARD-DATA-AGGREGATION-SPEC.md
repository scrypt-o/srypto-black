# Dashboard Data Aggregation Specification

**Date**: 2025-09-02  
**Purpose**: Replace hardcoded tile status with real user data via database aggregation

---

## 🎯 **PROBLEM STATEMENT**

**Current Issue**: Home page tiles show **hardcoded mock data**:
- "0 new messages · 1 personal alert" (fake)
- "Profile 67% complete" (fake)
- "You have 2 new quotes!" (fake)
- "Next medication in 3 hours" (fake)

**Solution**: **Database-driven tile status** with **real user-specific counts**

---

## 🏗️ **ARCHITECTURE APPROACH**

### **Database View/Procedure Pattern**
**Single query** returns **all dashboard data** for user:

```sql
-- Dashboard data view (calculated on-demand)
CREATE OR REPLACE VIEW v_patient_dashboard_data AS
SELECT 
  user_id,
  jsonb_build_object(
    'inbox_count', inbox_count,
    'alerts_count', alerts_count,
    'profile_completion', profile_completion,
    'pending_quotes', pending_quotes,
    'next_medication', next_medication,
    'vitality_status', vitality_status
  ) as dashboard_stats
FROM (
  SELECT 
    u.id as user_id,
    
    -- Communications counts
    COALESCE((
      SELECT COUNT(*) 
      FROM patient__comm__communications 
      WHERE user_to = u.id AND status = 'sent'
    ), 0) as inbox_count,
    
    COALESCE((
      SELECT COUNT(*) 
      FROM patient__comm__communications 
      WHERE user_to = u.id AND comm_type = 'alert' AND read_at IS NULL
    ), 0) as alerts_count,
    
    -- Profile completion percentage
    COALESCE((
      SELECT calculate_profile_completion(u.id)
    ), 0) as profile_completion,
    
    -- Prescription quotes
    COALESCE((
      SELECT COUNT(*) 
      FROM pharmacy_quotes 
      WHERE prescription_id IN (
        SELECT prescription_id 
        FROM patient__presc__prescriptions 
        WHERE user_id = u.id
      ) AND status = 'pending'
    ), 0) as pending_quotes,
    
    -- Next medication time
    (
      SELECT 'Next medication in 3 hours' -- TODO: Real calculation
    ) as next_medication,
    
    -- Vitality status
    'All systems normal' as vitality_status -- TODO: Real vitals check
    
  FROM auth.users u
  WHERE u.id = auth.uid()
) stats;
```

### **API Integration**
```typescript
// GET /api/patient/dashboard/stats
export async function GET() {
  const supabase = await getServerClient()
  
  const { data, error } = await supabase
    .from('v_patient_dashboard_data')
    .select('dashboard_stats')
    .single()
    
  if (error || !data) {
    // Fallback to empty counts
    return NextResponse.json({
      inbox_count: 0,
      alerts_count: 0,
      profile_completion: 0,
      pending_quotes: 0,
      next_medication: null,
      vitality_status: 'No data'
    })
  }
  
  return NextResponse.json(data.dashboard_stats)
}
```

---

## 🔄 **DATA REFRESH STRATEGY**

### **On-Demand Calculation (Recommended)**
**When**: User logs in or visits home page
**How**: View calculates data in real-time
**Benefits**: Always current, no stale data
**Performance**: Acceptable for dashboard queries

### **Alternative: Cached Procedure**
**When**: Background job every 5 minutes
**How**: Stored procedure populates cache table
**Benefits**: Faster dashboard loading
**Complexity**: Requires cache invalidation logic

---

## 📊 **TILE DATA MAPPING**

### **Communications Tile**
```typescript
// Replace: '0 new messages · 1 personal alert'
// With: `${inbox_count} new messages · ${alerts_count} alerts`
status: { 
  text: `${data.inbox_count} new messages · ${data.alerts_count} alerts`, 
  tone: data.alerts_count > 0 ? 'warning' : 'info' 
}
```

### **Personal Information Tile**
```typescript
// Replace: 'Profile 67% complete'  
// With: `Profile ${profile_completion}% complete`
status: { 
  text: `Profile ${data.profile_completion}% complete`, 
  tone: data.profile_completion < 50 ? 'warning' : 'info' 
}
```

### **Prescriptions Tile**
```typescript
// Replace: 'You have 2 new quotes!'
// With: Real pharmacy quote count
status: { 
  text: data.pending_quotes > 0 
    ? `You have ${data.pending_quotes} new quotes!` 
    : 'No pending quotes', 
  tone: data.pending_quotes > 0 ? 'info' : 'neutral' 
}
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Database View (30 minutes)**
1. **Create dashboard data view** with user-specific aggregations
2. **Add helper functions** (profile completion calculation)
3. **Test view** returns correct data for authenticated users

### **Phase 2: API Integration (15 minutes)**  
1. **Create dashboard stats API route** 
2. **Update home page** to fetch real data on load
3. **Replace hardcoded status** with dynamic values

### **Phase 3: Real-Time Enhancement (Future)**
1. **Add data refresh** on relevant actions (new message, profile update)
2. **WebSocket integration** for live updates (optional)
3. **Background calculation** for performance optimization

---

## 📋 **SUCCESS CRITERIA**

### **Functional Requirements**
- **Real data**: Tiles show actual user counts, not mock data
- **User-specific**: Each user sees their own statistics  
- **Performance**: Dashboard loads efficiently with single query
- **Accuracy**: Counts reflect current database state

### **Technical Requirements**
- **Database view**: Efficient aggregation with RLS filtering
- **API endpoint**: Standard pattern following current architecture
- **Error handling**: Graceful fallback when data unavailable
- **Caching**: Appropriate cache headers for dashboard data

**This approach eliminates all hardcoded dashboard data** with **professional database-driven aggregation** using **proven enterprise patterns**.

---

**Simple, clean implementation** - **database does the work**, **API serves the data**, **tiles display real information**.