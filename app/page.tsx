import { redirect } from 'next/navigation'

export default function HomePage() {
  // Land on Patient Home (tile grid)
  redirect('/patient')
}
