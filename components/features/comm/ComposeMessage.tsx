'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Recipient = { id: string; name: string; email?: string | null }

export default function ComposeMessage() {
  const router = useRouter()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [to, setTo] = useState('')
  const [type, setType] = useState<'message' | 'alert' | 'notification'>('message')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // live suggestions when typing at least 2 chars and not a UUID
  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!to || to.length < 2 || uuidRegex.test(to)) {
      setRecipients([])
      return
    }
    let cancelled = false
    const ctrl = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/patient/comm/recipients?q=${encodeURIComponent(to)}`, { cache: 'no-store', signal: ctrl.signal })
        if (!res.ok) return
        const json = await res.json()
        const items: any[] = json.items || json.users || []
        if (!cancelled) {
          const mapped: Recipient[] = items.map((it: any) => ({
            id: it.user_id || it.id,
            name: [it.first_name, it.last_name].filter(Boolean).join(' ') || it.nickname || it.email || it.user_id || 'Unknown',
            email: it.email ?? null,
          }))
          setRecipients(mapped)
        }
      } catch {}
    })()
    return () => { cancelled = true; ctrl.abort() }
  }, [to])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload: any = { to: to.trim(), type }
      if (subject.trim()) payload.subject = subject.trim()
      if (body.trim()) payload.body = body.trim()
      const res = await fetch('/api/patient/comm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to send')
      }
      router.push('/patient/comm/inbox')
    } catch (e: any) {
      setError(e?.message || 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To (email or user id)</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Type at least 2 characters to search"
        />
        {recipients.length > 0 && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Suggestions</label>
            <select
              className="w-full border rounded px-3 py-2"
              onChange={(e) => setTo(e.target.value)}
              value=""
            >
              <option value="" disabled>Choose a recipient</option>
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}{r.email ? ` <${r.email}>` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">Paste email or user UUID, or pick from suggestions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="message">Message</option>
            <option value="alert">Alert</option>
            <option value="notification">Notification</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[140px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push('/patient/comm/inbox')}
          className="px-4 py-2 rounded border"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
