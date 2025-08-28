import React from 'react'
import { requireUser } from '@/lib/supabase-server'

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated before rendering patient pages
  await requireUser()
  
  return (
    <>{children}</>
  )
}