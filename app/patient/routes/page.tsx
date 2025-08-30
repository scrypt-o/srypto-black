import Link from 'next/link'

export const dynamic = 'force-dynamic'

const links = [
  { label: 'Caregivers', href: '/patient/care-network/caregivers' },
  { label: 'Dependents', href: '/patient/persinfo/dependents' },
  { label: 'Emergency Contacts', href: '/patient/persinfo/emergency-contacts' },
  { label: 'Allergies', href: '/patient/medhist/allergies' },
  { label: 'Conditions', href: '/patient/medhist/conditions' },
  { label: 'Immunizations', href: '/patient/medhist/immunizations' },
  { label: 'Surgeries', href: '/patient/medhist/surgeries' },
  { label: 'Family History', href: '/patient/medhist/family-history' },
  { label: 'Vital Signs', href: '/patient/vitality/vital-signs' },
]

export default function PatientRoutesIndex() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Patient Feature Routes</h1>
        <p className="text-sm text-gray-600 mb-6">Quick links to implemented pages for verification.</p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link className="block rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50" href={l.href}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

