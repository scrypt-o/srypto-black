import React from 'react'
 

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is enforced via middleware; no page-level guard
  
  return (
    <>{children}</>
  )
}
