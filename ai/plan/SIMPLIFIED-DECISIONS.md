# SIMPLIFIED DECISIONS - The Simplest Path

## Database Decisions (Use What Exists)

### 1. Soft Delete
- **USE**: `is_active` boolean (already in database)
- **Don't use**: deleted_at timestamp
- **Delete logic**: UPDATE SET is_active = false

### 2. Database Access
- **USE**: Direct table writes (INSERT/UPDATE/DELETE)
- **Don't use**: Stored procedures
- **Action**: Delete any existing stored procedures if they cause confusion

### 3. Field Names (Exact from DDL)
```sql
allergy_id          -- UUID primary key
user_id             -- UUID foreign key
allergen            -- text (main field)
allergen_type       -- text (enum)
severity            -- text (enum)
reaction            -- text (NOT reaction_type)
first_observed      -- date
notes               -- text
is_active           -- boolean (soft delete)
trigger_factors     -- text
emergency_action_plan -- text
created_at          -- timestamp
updated_at          -- timestamp
```

### 4. Enum Values (Exact from database)
```typescript
allergen_type: 'food' | 'medication' | 'environmental' | 'other'
severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'  // underscore!
```

### 5. Required Fields (Minimal for safety)
```typescript
// CreateInput required fields:
- allergen: string (required)
- severity: enum (required)
- allergen_type: enum (optional - can determine later)
- everything else: optional

// Database auto-fills:
- allergy_id: auto-generated
- user_id: from auth
- is_active: defaults to true
- created_at/updated_at: auto timestamps
```

## Updated API Pattern

### List (GET)
```sql
SELECT * FROM v_patient__medhist__allergies 
WHERE user_id = auth.uid() AND is_active = true
```

### Create (POST)
```sql
INSERT INTO patient__medhist__allergies 
(user_id, allergen, severity, ...) 
VALUES (auth.uid(), ...)
```

### Update (PUT)
```sql
UPDATE patient__medhist__allergies 
SET allergen = ..., updated_at = now()
WHERE allergy_id = ? AND user_id = auth.uid()
```

### Delete (DELETE)
```sql
UPDATE patient__medhist__allergies 
SET is_active = false, updated_at = now()
WHERE allergy_id = ? AND user_id = auth.uid()
```

## The Rule Going Forward

**"Use what's in the database, don't create new complexity"**

- If database has `is_active`, use it
- If database has `reaction` not `reaction_type`, use reaction
- If database has underscores, use underscores
- Don't add columns unless absolutely necessary
- Don't create procedures unless absolutely necessary

This is the simplest path with least chance for fuck-ups.