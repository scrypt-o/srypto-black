"use client"
import * as React from 'react'

export default function ProfileImage({ path, size = 96 }: { path?: string | null; size?: number }) {
  const [url, setUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      if (!path) { setUrl(null); return }
      // If it looks like a full URL, use as-is
      if (/^https?:\/\//i.test(path)) { setUrl(path); return }
      try {
        const res = await fetch('/api/storage/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucket: 'profile-images', path }),
        })
        if (!res.ok) { setUrl(null); return }
        const json = await res.json()
        if (!cancelled) setUrl(json.signedUrl || null)
      } catch { if (!cancelled) setUrl(null) }
    }
    run()
    return () => { cancelled = true }
  }, [path])

  if (!url) {
    return <div className="rounded-full bg-gray-200" style={{ width: size, height: size }} />
  }
  return (
    <img
      src={url}
      alt="Profile"
      width={size}
      height={size}
      className="rounded-full object-cover border"
    />
  )
}

