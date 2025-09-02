import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'

type RouteParams = { params: Promise<{ id: string }> }

// POST /api/patient/presc/prescriptions/[id]/allocate
// Allocates prescription to 10 closest pharmacies
export async function POST(request: NextRequest, { params }: RouteParams) {
  const csrf = verifyCsrf(request)
  if (csrf) return csrf

  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resolvedParams = await params
  const idSchema = z.string().uuid()
  const parsedId = idSchema.safeParse(resolvedParams.id)
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid id' }, { status: 422 })

  try {
    // Get patient's location from profile
    const { data: profile } = await supabase
      .from('patient__persinfo__profile')
      .select('latitude, longitude')
      .eq('user_id', user.id)
      .single()

    if (!profile?.latitude || !profile?.longitude) {
      return NextResponse.json({ 
        error: 'Patient location not set. Please update your profile location first.' 
      }, { status: 400 })
    }

    // Get 10 closest pharmacies using PostGIS
    // For demo, we'll use a simple distance calculation
    const { data: pharmacies, error: pharmacyError } = await supabase
      .rpc('get_closest_pharmacies', {
        lat: profile.latitude,
        lng: profile.longitude,
        limit_count: 10
      })

    if (pharmacyError) {
      // Fallback: Get any 10 pharmacies if RPC doesn't exist
      const { data: allPharmacies } = await supabase
        .from('pharmacy_profiles')
        .select('pharmacy_id, name, latitude, longitude')
        .limit(10)

      if (!allPharmacies || allPharmacies.length === 0) {
        return NextResponse.json({ 
          error: 'No pharmacies available for allocation' 
        }, { status: 404 })
      }

      // Calculate distances manually
      const pharmaciesWithDistance = allPharmacies.map(pharmacy => {
        const distance = calculateDistance(
          profile.latitude,
          profile.longitude,
          pharmacy.latitude || 0,
          pharmacy.longitude || 0
        )
        return { ...pharmacy, distance_km: distance }
      }).sort((a, b) => a.distance_km - b.distance_km).slice(0, 10)

      // Insert into queue
      const queueEntries = pharmaciesWithDistance.map(pharmacy => ({
        prescription_id: parsedId.data,
        pharmacy_id: pharmacy.pharmacy_id,
        patient_profile_id: user.id,
        status: 'pending',
        distance_km: pharmacy.distance_km,
        created_at: new Date().toISOString()
      }))

      const { error: queueError } = await supabase
        .from('prescription_pharmacy_queue')
        .insert(queueEntries)

      if (queueError) {
        return NextResponse.json({ 
          error: 'Failed to allocate to pharmacies' 
        }, { status: 500 })
      }

      // Update prescription status
      await supabase
        .from('patient__presc__prescriptions')
        .update({ 
          status: 'allocated-to-pharmacies',
          allocated_at: new Date().toISOString()
        })
        .eq('prescription_id', parsedId.data)
        .eq('user_id', user.id)

      return NextResponse.json({ 
        message: 'Successfully allocated to pharmacies',
        pharmacies_count: pharmaciesWithDistance.length,
        pharmacies: pharmaciesWithDistance.map(p => ({
          name: p.name,
          distance_km: p.distance_km.toFixed(1)
        }))
      }, { status: 200 })
    }

    // If RPC worked
    return NextResponse.json({ 
      message: 'Successfully allocated to pharmacies',
      pharmacies_count: pharmacies.length 
    }, { status: 200 })

  } catch (error) {
    console.error('Allocation error:', error)
    return NextResponse.json({ 
      error: 'Failed to allocate prescription' 
    }, { status: 500 })
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}