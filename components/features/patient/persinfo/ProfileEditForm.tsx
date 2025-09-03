"use client"
import * as React from 'react'

type ProfileForm = {
  first_name: string
  last_name: string
  title?: string
  middle_name?: string
  nick_name?: string
  id_number?: string
  passport_number?: string
  citizenship?: string
  date_of_birth?: string
  gender?: string
  marital_status?: string
  phone?: string
  email?: string
  primary_language?: string
}

export default function ProfileEditForm({ initial, formId }: { initial: Partial<ProfileForm> & { first_name?: string; last_name?: string }; formId?: string }) {
  const [form, setForm] = React.useState<ProfileForm>(() => ({
    first_name: initial.first_name || '',
    last_name: initial.last_name || '',
    ...(initial.title ? { title: initial.title } : {}),
    ...(initial.middle_name ? { middle_name: initial.middle_name } : {}),
    ...(initial.nick_name ? { nick_name: initial.nick_name } : {}),
    ...(initial.id_number ? { id_number: initial.id_number } : {}),
    ...(initial.passport_number ? { passport_number: initial.passport_number } : {}),
    ...(initial.citizenship ? { citizenship: initial.citizenship } : {}),
    ...(initial.date_of_birth ? { date_of_birth: initial.date_of_birth } : {}),
    ...(initial.gender ? { gender: initial.gender } : {}),
    ...(initial.marital_status ? { marital_status: initial.marital_status } : {}),
    ...(initial.phone ? { phone: initial.phone } : {}),
    ...(initial.email ? { email: initial.email } : {}),
    ...(initial.primary_language ? { primary_language: initial.primary_language } : {}),
  }))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onChange = (k: keyof ProfileForm, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const onSave = async () => {
    setSaving(true); setError(null)
    try {
      // Clean up the form data before sending - remove empty strings for optional fields
      const cleanedForm = Object.entries(form).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          acc[key as keyof ProfileForm] = value
        }
        return acc
      }, {} as Partial<ProfileForm>)
      
      // Ensure required fields are present
      cleanedForm.first_name = form.first_name || ''
      cleanedForm.last_name = form.last_name || ''
      
      const res = await fetch('/api/patient/persinfo/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleanedForm)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Save failed' }))
        throw new Error(errorData.error || 'Save failed')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).location?.reload()
    } catch (e: any) {
      setError(e.message || 'Failed to save profile')
    } finally { setSaving(false) }
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    await onSave()
  }

  return (
    <form className="space-y-3 bg-white border rounded p-4" {...(formId ? { id: formId, onSubmit } : {})}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="First name" value={form.first_name} onChange={v => onChange('first_name', v)} required />
        <Field label="Last name" value={form.last_name} onChange={v => onChange('last_name', v)} required />
        <Field label="Title" value={form.title || ''} onChange={v => onChange('title', v)} />
        <Field label="Nickname" value={form.nick_name || ''} onChange={v => onChange('nick_name', v)} />
        <Field label="Middle name" value={form.middle_name || ''} onChange={v => onChange('middle_name', v)} />
        <Field label="ID number" value={form.id_number || ''} onChange={v => onChange('id_number', v)} />
        <Field label="Passport number" value={form.passport_number || ''} onChange={v => onChange('passport_number', v)} />
        <Field label="Citizenship" value={form.citizenship || ''} onChange={v => onChange('citizenship', v)} />
        <Field type="date" label="Date of birth" value={form.date_of_birth || ''} onChange={v => onChange('date_of_birth', v)} />
        <SelectField 
          label="Gender" 
          value={form.gender || ''} 
          onChange={v => onChange('gender', v)}
          options={[
            { value: '', label: 'Select...' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'non-binary', label: 'Non-binary' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' }
          ]}
        />
        <SelectField 
          label="Marital status" 
          value={form.marital_status || ''} 
          onChange={v => onChange('marital_status', v)}
          options={[
            { value: '', label: 'Select...' },
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'widowed', label: 'Widowed' },
            { value: 'separated', label: 'Separated' }
          ]}
        />
        <Field label="Phone" value={form.phone || ''} onChange={v => onChange('phone', v)} />
        <Field type="email" label="Email" value={form.email || ''} onChange={v => onChange('email', v)} />
        <Field label="Primary language" value={form.primary_language || ''} onChange={v => onChange('primary_language', v)} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!formId && (
        <div className="text-right">
          <button onClick={onSave} type="button" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      )}
    </form>
  )
}

function Field({ label, value, onChange, type, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="text-sm">
      <div className="text-gray-600 mb-1">{label}{required && <span className="text-red-600"> *</span>}</div>
      <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded px-3 py-2" />
    </label>
  )
}

function SelectField({ label, value, onChange, options, required }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  options: { value: string; label: string }[];
  required?: boolean 
}) {
  return (
    <label className="text-sm">
      <div className="text-gray-600 mb-1">{label}{required && <span className="text-red-600"> *</span>}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded px-3 py-2">
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}
