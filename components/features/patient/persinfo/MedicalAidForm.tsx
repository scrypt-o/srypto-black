"use client"
import * as React from 'react'

type MedicalAidForm = {
  medical_aid_name: string
  member_number: string
  plan_type?: string
  is_primary_member?: boolean
  policy_holder_first_name?: string
  policy_holder_last_name?: string
  policy_holder_email?: string
  policy_holder_phone?: string
  policy_holder_id?: string
  dependent_code?: string
  number_of_dependents?: number
}

export default function MedicalAidForm({ initial }: { initial?: Partial<MedicalAidForm> }) {
  const [form, setForm] = React.useState<MedicalAidForm>({
    medical_aid_name: initial?.medical_aid_name || '',
    member_number: initial?.member_number || '',
    plan_type: initial?.plan_type,
    is_primary_member: initial?.is_primary_member ?? true,
    policy_holder_first_name: initial?.policy_holder_first_name,
    policy_holder_last_name: initial?.policy_holder_last_name,
    policy_holder_email: initial?.policy_holder_email,
    policy_holder_phone: initial?.policy_holder_phone,
    policy_holder_id: initial?.policy_holder_id,
    dependent_code: initial?.dependent_code,
    number_of_dependents: initial?.number_of_dependents,
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onChange = (k: keyof MedicalAidForm, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v as any }))

  const onSave = async () => {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/patient/persinfo/medical-aid', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Save failed')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).location?.reload()
    } catch (e) { setError('Failed to save medical aid') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3 bg-white border rounded p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Scheme Name" value={form.medical_aid_name} onChange={v => onChange('medical_aid_name', v)} required />
        <Field label="Member Number" value={form.member_number} onChange={v => onChange('member_number', v)} required />
        <Field label="Plan Type" value={form.plan_type || ''} onChange={v => onChange('plan_type', v)} />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!form.is_primary_member} onChange={(e) => onChange('is_primary_member', e.target.checked)} />
          Primary Member
        </label>
        <Field label="Policy Holder First Name" value={form.policy_holder_first_name || ''} onChange={v => onChange('policy_holder_first_name', v)} />
        <Field label="Policy Holder Last Name" value={form.policy_holder_last_name || ''} onChange={v => onChange('policy_holder_last_name', v)} />
        <Field type="email" label="Policy Holder Email" value={form.policy_holder_email || ''} onChange={v => onChange('policy_holder_email', v)} />
        <Field label="Policy Holder Phone" value={form.policy_holder_phone || ''} onChange={v => onChange('policy_holder_phone', v)} />
        <Field label="Policy Holder ID" value={form.policy_holder_id || ''} onChange={v => onChange('policy_holder_id', v)} />
        <Field label="Dependent Code" value={form.dependent_code || ''} onChange={v => onChange('dependent_code', v)} />
        <Field type="number" label="Number of Dependents" value={String(form.number_of_dependents ?? '')} onChange={v => onChange('number_of_dependents', v)} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="text-right">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
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

