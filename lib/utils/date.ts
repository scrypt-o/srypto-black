export function formatDate(input?: string | null, locale?: string) {
  if (!input) return '-'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '-'
  try {
    return d.toLocaleDateString(locale || 'en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
    } as Intl.DateTimeFormatOptions)
  } catch {
    return d.toLocaleDateString('en-US')
  }
}

export function formatDateTime(input?: string | null, locale?: string) {
  if (!input) return '-'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '-'
  try {
    return d.toLocaleString(locale || 'en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    } as Intl.DateTimeFormatOptions)
  } catch {
    return d.toLocaleString('en-US')
  }
}
