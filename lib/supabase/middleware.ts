import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest): Promise<{ response: NextResponse; setCookies: { name: string; value: string; options?: any }[] }> {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const setCookies: { name: string; value: string; options?: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Reflect cookies on the request for downstream auth checks
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Recreate response and accumulate cookies (to be forwarded by middleware)
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
            setCookies.push({ name, value, options })
          })
        },
      },
    }
  )

  // CRITICAL: Refresh expired auth tokens
  await supabase.auth.getUser()

  return { response: supabaseResponse, setCookies }
}
