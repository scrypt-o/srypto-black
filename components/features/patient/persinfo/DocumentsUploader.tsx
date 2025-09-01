"use client"
import * as React from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'

export default function DocumentsUploader() {
  const { uploadFile, isUploading } = useFileUpload({ bucket: 'personal-documents' })
  const [error, setError] = React.useState<string | null>(null)
  const [desc, setDesc] = React.useState('')
  const [category, setCategory] = React.useState('other')

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return
    const uploaded = await uploadFile(file)
    if (!uploaded) { setError('Upload failed'); return }
    try {
      const res = await fetch('/api/patient/personal-info/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: uploaded.fileName,
          file_type: uploaded.fileType,
          file_url: uploaded.path, // store path, not signed URL
          file_size: uploaded.fileSize,
          description: desc || undefined,
          category,
        })
      })
      if (!res.ok) throw new Error('Create failed')
      // refresh page to show new row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).location?.reload()
    } catch (e) {
      setError('Failed to save document metadata')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select className="border rounded px-2 py-1 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="id-document">ID Document</option>
        <option value="medical-record">Medical Record</option>
        <option value="insurance">Insurance</option>
        <option value="prescription">Prescription</option>
        <option value="lab-result">Lab Result</option>
        <option value="imaging">Imaging</option>
        <option value="consent-form">Consent Form</option>
        <option value="other">Other</option>
      </select>
      <input
        className="border rounded px-2 py-1 text-sm flex-1"
        placeholder="Description (optional)"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">
        <input type="file" className="hidden" onChange={onSelect} disabled={isUploading} />
        {isUploading ? 'Uploading…' : 'Upload'}
      </label>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}

