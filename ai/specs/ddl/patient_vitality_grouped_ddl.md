# Patient Vitality Tables Group - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for comprehensive health tracking tables

---

## 📊 OVERVIEW

### Tables Covered (7 tables)
- Physical activity and exercise tracking
- Body measurements and anthropometrics  
- Mental health and wellbeing
- Nutritional intake and dietary habits
- Reproductive health monitoring
- Sleep patterns and quality
- Vital signs and clinical measurements

### Common Pattern
All vitality tables follow user-scoped security:
- `user_id` → auth.users(id) (RLS enforced)
- Timestamp tracking (created_at, updated_at)
- Soft deletes via `is_active`
- Mixed data types for comprehensive health data

---

## 🏃‍♂️ PHYSICAL ACTIVITY

### 1. patient__vitality__activity (19 columns)
**Purpose**: Physical activity, exercise, and movement tracking
- Daily activity levels and patterns
- Exercise sessions and duration
- Calorie burn and fitness metrics
- Activity type classification
- Heart rate during exercise
- GPS tracking for outdoor activities

**Key Fields Expected**:
- `activity_type`, `duration_minutes`, `calories_burned`
- `heart_rate_avg`, `heart_rate_max`
- `distance_km`, `steps_count`
- `intensity_level`, `activity_date`

---

## ⚖️ BODY MEASUREMENTS

### 2. patient__vitality__body_measure (20 columns)
**Purpose**: Anthropometric measurements and body composition
- Weight and BMI tracking over time
- Body composition (fat %, muscle mass)
- Circumference measurements
- Height tracking (especially for children)
- Body temperature recordings

**Key Fields Expected**:
- `weight_kg`, `height_cm`, `bmi`
- `body_fat_percentage`, `muscle_mass_kg`
- `waist_circumference_cm`, `hip_circumference_cm`
- `body_temperature_celsius`
- `measurement_date`, `measurement_context`

---

## 🧠 MENTAL HEALTH

### 3. patient__vitality__mental (18 columns)  
**Purpose**: Mental health assessments and mood tracking
- Daily mood ratings and trends
- Stress level monitoring
- Mental health questionnaire responses
- Anxiety and depression screening
- Cognitive function assessments

**Key Fields Expected**:
- `mood_rating`, `stress_level`, `anxiety_level`
- `depression_score`, `energy_level`
- `sleep_quality_rating`, `social_interaction_level`
- `assessment_date`, `questionnaire_type`
- `notes`, `severity_flags`

---

## 🍎 NUTRITION

### 4. patient__vitality__nutrition (21 columns)
**Purpose**: Dietary intake and nutritional analysis  
- Daily caloric intake tracking
- Macronutrient breakdown (carbs, protein, fat)
- Micronutrient monitoring
- Meal timing and frequency
- Water intake and hydration

**Key Fields Expected**:
- `total_calories`, `carbs_grams`, `protein_grams`, `fat_grams`
- `fiber_grams`, `sugar_grams`, `sodium_mg`
- `water_intake_liters`, `meal_count`
- `food_items` (JSONB), `nutritional_goals`
- `intake_date`, `dietary_restrictions`

---

## 🤱 REPRODUCTIVE HEALTH

### 5. patient__vitality__reproductive (21 columns)
**Purpose**: Reproductive health and fertility tracking
- Menstrual cycle monitoring
- Fertility indicators and ovulation
- Contraceptive usage tracking
- Pregnancy-related measurements
- Reproductive health assessments

**Key Fields Expected**:
- `cycle_day`, `flow_intensity`, `cycle_length`
- `ovulation_date`, `fertility_signs`
- `contraceptive_method`, `contraceptive_effectiveness`
- `pregnancy_week`, `prenatal_vitamins`
- `symptoms` (JSONB), `tracking_date`

---

## 😴 SLEEP

### 6. patient__vitality__sleep (18 columns)
**Purpose**: Sleep pattern analysis and quality assessment
- Sleep duration and efficiency
- Sleep stages (REM, deep, light)
- Sleep quality ratings
- Sleep disturbances and interruptions
- Sleep environment factors

**Key Fields Expected**:
- `sleep_duration_hours`, `bedtime`, `wake_time`
- `sleep_efficiency_percentage`, `sleep_quality_rating`
- `rem_minutes`, `deep_sleep_minutes`, `light_sleep_minutes`
- `interruptions_count`, `sleep_environment_rating`
- `sleep_date`, `sleep_aids_used`

---

## 🫀 VITAL SIGNS

### 7. patient__vitality__vital_signs (20 columns)
**Purpose**: Clinical vital signs and physiological measurements
- Blood pressure monitoring
- Heart rate and pulse patterns
- Respiratory rate tracking  
- Body temperature regulation
- Oxygen saturation levels

**Key Fields Expected**:
- `systolic_bp`, `diastolic_bp`, `pulse_pressure`
- `heart_rate_bpm`, `heart_rhythm`
- `respiratory_rate`, `oxygen_saturation_percent`
- `body_temperature_celsius`, `temperature_location`
- `measurement_datetime`, `measurement_device`
- `clinical_context`, `abnormal_flags`

---

## 🔍 BUSINESS LOGIC PATTERNS

### Time-Series Analysis
All tables support trend analysis over time:
```sql
-- Weekly averages
SELECT DATE_TRUNC('week', measurement_date), AVG(value)
FROM patient__vitality__[table]
WHERE user_id = auth.uid()
GROUP BY DATE_TRUNC('week', measurement_date);
```

### Health Ranges & Alerts
Many fields have normal ranges for health monitoring:
```sql
-- Abnormal vital signs
SELECT * FROM v_patient__vitality__vital_signs
WHERE user_id = auth.uid()
  AND (systolic_bp > 140 OR diastolic_bp > 90)
  AND measurement_datetime >= CURRENT_DATE - INTERVAL '30 days';
```

### Integration Points
- Activity data from wearables and fitness trackers
- Nutrition data from food diary apps  
- Sleep data from sleep tracking devices
- Vital signs from home monitoring equipment
- Mental health from mood tracking apps

---

## 🎯 API INTEGRATION

### Common Endpoint Patterns
```
/api/patient/vitality/activity → patient__vitality__activity
/api/patient/vitality/body-measure → patient__vitality__body_measure
/api/patient/vitality/mental → patient__vitality__mental
/api/patient/vitality/nutrition → patient__vitality__nutrition
/api/patient/vitality/reproductive → patient__vitality__reproductive
/api/patient/vitality/sleep → patient__vitality__sleep
/api/patient/vitality/vital-signs → patient__vitality__vital_signs
```

### Bulk Data Import
```
POST /api/patient/vitality/bulk-import
→ Import data from wearables, apps, and devices
```

### Trend Analysis
```
GET /api/patient/vitality/trends?type=weight&period=6months
→ Aggregate data analysis for health insights
```

---

## 🔐 SECURITY & PRIVACY

### Data Classification
- **HIGHLY SENSITIVE**: All vitality data is protected health information (PHI)
- **PERSONAL**: Body measurements, mental health assessments
- **CLINICAL**: Vital signs, reproductive health data
- **BEHAVIORAL**: Activity, nutrition, sleep patterns

### Access Controls
- **Owner**: Full read/write access to their vitality data
- **Healthcare Provider**: Read access with proper authorization
- **Fitness Apps**: Limited write access with user consent
- **Research**: Anonymized aggregate data only

### Data Retention
- **Active tracking**: Real-time data for health monitoring
- **Historical analysis**: Long-term trend identification
- **Clinical correlation**: Integration with medical history
- **Privacy controls**: User-controlled data sharing settings

---

## 📊 HEALTH ANALYTICS

### Correlation Analysis
- Activity vs sleep quality
- Nutrition vs energy levels  
- Mental health vs physical activity
- Vital signs vs lifestyle factors

### Predictive Health
- Early warning systems for health changes
- Trend-based health recommendations
- Risk factor identification
- Personalized health insights

### Goal Tracking
- Fitness and activity goals
- Weight management targets
- Sleep improvement objectives
- Nutritional balance goals

---

## 🚨 CRITICAL NOTES

1. **COMPREHENSIVE HEALTH PICTURE** - Complete vitality ecosystem
2. **TIME-SERIES DATA** - Optimized for trend analysis
3. **WEARABLE INTEGRATION** - IoT device data ingestion
4. **CLINICAL RELEVANCE** - Healthcare provider integration
5. **PRIVACY PARAMOUNT** - Sensitive personal health data
6. **PREDICTIVE ANALYTICS** - AI/ML health insights ready
7. **GOAL-ORIENTED** - Support for health improvement tracking

---

**CONCLUSION**: Comprehensive vitality tracking system enabling complete health monitoring through integrated data collection from multiple sources, advanced analytics for health insights, and personalized health management for optimal patient outcomes.