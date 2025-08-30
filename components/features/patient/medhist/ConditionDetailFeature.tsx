'use client'

// Temporary stub - will be replaced with generic pattern later
interface ConditionDetailFeatureProps {
  condition: any
}

export default function ConditionDetailFeature({ condition }: ConditionDetailFeatureProps) {
  return <div>Condition Detail: {condition?.condition_name} - TODO: Implement generic detail pattern</div>
}