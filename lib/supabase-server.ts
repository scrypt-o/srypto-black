import { createServerClient as _createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getServerClient() {
  const cookieStore = await cookies()
  
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // In RSC (pages/layouts), Next.js forbids mutating cookies.
        // Supabase may try to set refreshed auth cookies; swallow those here
        // and let Route Handlers perform writes when needed.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch (_err) {
                // Ignore mutation attempts outside Server Actions/Route Handlers
              }
            })
          } catch (_outer) {
            // No-op
          }
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserOrNull() {
  const user = await getUser()
  return user ?? null
}

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

// Backward compatibility alias
export async function getAuthenticatedServerClient() {
  const supabase = await getServerClient()
  const user = await requireUser()
  return { supabase, user }
}

export function getServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for service role operations')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
